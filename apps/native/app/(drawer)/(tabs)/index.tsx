import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useMemo, useRef, useState } from "react";
import { FlatList, Pressable, ScrollView, TextInput, View } from "react-native";

import { FilterPickerSheet } from "@/components/search/filter-picker-sheet";
import type { FilterKind, FilterPickerRef } from "@/components/search/filter-picker-sheet";
import {
  AsyncBoundary,
  SectionHeader,
  StateBlock,
  StationRowSkeleton,
} from "@/components/ui/async-boundary";
import { GLOW } from "@/components/ui/glow";
import {
  ChevronDownIcon,
  CloseIcon,
  HeartIcon,
  SearchIcon,
  TuneIcon,
} from "@/components/ui/icons";
import { Screen } from "@/components/ui/screen";
import { ScreenBackButton } from "@/components/ui/screen-back-button";
import { StationRow } from "@/components/ui/station-row";
import { Eyebrow, Text } from "@/components/ui/text";
import { useAppColors } from "@/components/ui/theme";
import { useCatalogueSize, useStationSearch } from "@/hooks";
import type { SearchSort } from "@/lib/api";
import { SEARCH_SORTS } from "@/lib/api";
import { getFontFamily } from "@/lib/fonts";
import { PlayPauseButton } from "@/components/ui/play-pause-button";
import { useFavorites, useOnboarding, useRecentlyPlayed } from "@/stores";
import type { Station } from "@static-wave/types";

/**
 * Search — spec: systems/screen-specs.md §02.
 *
 * The tab bar and the Now Playing bar are NOT rendered here; they belong to
 * `(tabs)/_layout.tsx`. This screen only reserves room for them — 180px of
 * bottom padding covers the tab bar (bottom 34 + height 66) and the search
 * variant of the Now Playing bar (bottom 118 + height 62).
 */

const SORT_CYCLE: SearchSort[] = ["popularity", "trending", "name"];

/** Chips shown when onboarding produced no genres. */
const DEFAULT_GENRES = ["Jazz", "Electronic", "Ambient", "Rock", "Classical"];

type FilterChipProps = {
  label: string;
  selected: boolean;
  onPress: () => void;
  /** Selected chips get an X to clear; dropdown-style chips get a chevron. */
  affordance?: "clear" | "chevron" | "none";
};

/** Height 36, radius 18, `padding 0 15px`, 13.5px. Selected: `120deg` gradient. */
function FilterChip({ label, selected, onPress, affordance = "none" }: FilterChipProps) {
  const { colors } = useAppColors();

  const icon =
    selected && affordance !== "none" ? (
      <CloseIcon size={11} color="rgba(255,255,255,0.96)" />
    ) : !selected && affordance === "chevron" ? (
      <ChevronDownIcon size={12} color={colors.muted} />
    ) : null;

  const labelNode = (
    <Text
      weight={selected ? "500" : "400"}
      style={{
        fontSize: 13.5,
        color: selected ? "rgba(255,255,255,0.96)" : colors.text,
      }}
    >
      {label}
    </Text>
  );

  if (selected) {
    return (
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityState={{ selected: true }}
        style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}
      >
        <LinearGradient
          colors={["#8B3DFF", "#2E7BFF"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            height: 36,
            paddingHorizontal: 15,
            borderRadius: 18,
            flexDirection: "row",
            alignItems: "center",
            gap: 8,
          }}
        >
          {labelNode}
          {icon}
        </LinearGradient>
      </Pressable>
    );
  }

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: false }}
      style={({ pressed }) => ({
        height: 36,
        paddingHorizontal: 15,
        borderRadius: 18,
        backgroundColor: colors.chipBg,
        borderWidth: 1,
        borderColor: colors.chipBorder,
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        opacity: pressed ? 0.8 : 1,
      })}
    >
      {labelNode}
      {icon}
    </Pressable>
  );
}

/**
 * Search rows carry a bare heart, not a circular chip — see the trailing row
 * in the shared `StationRow` table (`md` has no trailing chip, `sm` does).
 */
function FavoriteToggle({ station }: { station: Station }) {
  const { colors } = useAppColors();
  const toggle = useFavorites((s) => s.toggle);
  const isFavorite = useFavorites((s) =>
    s.favorites.some((f) => f.stationuuid === station.stationuuid),
  );

  return (
    <Pressable
      onPress={() => toggle(station)}
      accessibilityRole="button"
      accessibilityState={{ selected: isFavorite }}
      accessibilityLabel={
        isFavorite ? `Remove ${station.name} from favorites` : `Save ${station.name}`
      }
      hitSlop={10}
      style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
    >
      <HeartIcon
        size={21}
        color={colors.dim}
        gradient={isFavorite}
        gradientId={`fav-${station.stationuuid}`}
      />
    </Pressable>
  );
}

export default function SearchScreen() {
  const router = useRouter();
  const { colors } = useAppColors();

  const [query, setQuery] = useState("");
  const [tag, setTag] = useState<string | null>(null);
  const [country, setCountry] = useState<string | null>(null);
  const [language, setLanguage] = useState<string | null>(null);
  const [hdOnly, setHdOnly] = useState(false);
  const [sort, setSort] = useState<SearchSort>("popularity");

  const pickerRef = useRef<FilterPickerRef | null>(null);

  const onboardingGenres = useOnboarding((s) => s.selectedGenres);
  const recentlyPlayed = useRecentlyPlayed((s) => s.recentlyPlayed);

  const catalogue = useCatalogueSize();

  const genres = onboardingGenres.length > 0 ? onboardingGenres : DEFAULT_GENRES;

  // The active chip is hoisted to the front, matching the design's left-most
  // "Jazz" pill.
  const genreChips = useMemo(() => {
    if (!tag) return genres;
    return [tag, ...genres.filter((g) => g.toLowerCase() !== tag.toLowerCase())];
  }, [genres, tag]);

  const search = useStationSearch(query, {
    tag: tag ?? undefined,
    country: country ?? undefined,
    language: language ?? undefined,
    hdOnly,
    sort,
  });

  const hasCriteria = Boolean(query.trim() || tag || country || language);

  const onPickerSelect = (picked: FilterKind, value: string | null) => {
    if (picked === "country") setCountry(value);
    else setLanguage(value);
  };

  return (
    <Screen glow={GLOW.search}>
      <ScreenBackButton />

      <View style={{ paddingHorizontal: 24, paddingTop: 12 }}>
        <Text
          variant="display-xl"
          style={{ fontSize: 31, lineHeight: 34, color: colors.text }}
        >
          Discover
        </Text>
        <Text weight="300" style={{ marginTop: 5, fontSize: 13.5, color: colors.muted }}>
          {catalogue.label
            ? `Search ${catalogue.label} stations worldwide`
            : "Search stations worldwide"}
        </Text>
      </View>

      <View
        style={{ flexDirection: "row", gap: 10, paddingHorizontal: 24, paddingTop: 18 }}
      >
        <View
          style={{
            flex: 1,
            height: 50,
            borderRadius: 18,
            backgroundColor: colors.surface,
            borderWidth: 1,
            borderColor: colors.chipBorder,
            flexDirection: "row",
            alignItems: "center",
            gap: 10,
            paddingHorizontal: 15,
          }}
        >
          <SearchIcon size={18} color={colors.muted} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Stations, genres, countries"
            placeholderTextColor={colors.muted}
            returnKeyType="search"
            autoCorrect={false}
            accessibilityLabel="Search stations"
            // The family must be resolved explicitly — React Native won't pick
            // a weight from a custom family (see lib/fonts.ts).
            style={{
              flex: 1,
              fontFamily: getFontFamily("display", "300"),
              fontSize: 15,
              color: colors.text,
              padding: 0,
            }}
          />
          {query.length > 0 ? (
            <Pressable
              onPress={() => setQuery("")}
              accessibilityRole="button"
              accessibilityLabel="Clear search"
              hitSlop={10}
            >
              <CloseIcon size={11} color={colors.muted} />
            </Pressable>
          ) : null}
        </View>

        {/* 50×50, radius 18, `135deg #8B3DFF→#2E7BFF`. The design gives this
            button no defined action; it drives the HD filter, which is the one
            control in the chip row RadioBrowser can honour server-side. */}
        <Pressable
          onPress={() => setHdOnly((v) => !v)}
          accessibilityRole="button"
          accessibilityState={{ selected: hdOnly }}
          accessibilityLabel={hdOnly ? "Turn off HD only" : "Show HD stations only"}
          style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}
        >
          <LinearGradient
            colors={hdOnly ? ["#FF2FD6", "#8B3DFF"] : ["#8B3DFF", "#2E7BFF"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              width: 50,
              height: 50,
              borderRadius: 18,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <TuneIcon size={19} />
          </LinearGradient>
        </Pressable>
      </View>

      <FlatList
        horizontal
        data={genreChips}
        keyExtractor={(g) => g}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 8, paddingLeft: 24, paddingRight: 24 }}
        style={{ flexGrow: 0, paddingTop: 16 }}
        ListHeaderComponent={
          <View style={{ flexDirection: "row", gap: 8 }}>
            {/* Tapping a selected chip clears it; tapping an unselected one
                opens the picker, which is what the chevron promises. */}
            <FilterChip
              label={country ?? "Country"}
              selected={country !== null}
              affordance={country !== null ? "clear" : "chevron"}
              onPress={() =>
                country !== null ? setCountry(null) : pickerRef.current?.open("country")
              }
            />
            <FilterChip
              label={language ?? "Language"}
              selected={language !== null}
              affordance={language !== null ? "clear" : "chevron"}
              onPress={() =>
                language !== null ? setLanguage(null) : pickerRef.current?.open("language")
              }
            />
          </View>
        }
        // No margin on the header/footer: `gap` in contentContainerStyle
        // already spaces them from the items, and adding a margin double-spaces.
        renderItem={({ item }) => (
          <FilterChip
            label={item}
            selected={tag?.toLowerCase() === item.toLowerCase()}
            affordance="clear"
            onPress={() =>
              setTag((current) =>
                current?.toLowerCase() === item.toLowerCase() ? null : item,
              )
            }
          />
        )}
        ListFooterComponent={
          <FilterChip label="HD" selected={hdOnly} onPress={() => setHdOnly((v) => !v)} />
        }
      />

      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: 24,
          paddingTop: 24,
        }}
      >
        {/* The design reads "248 RESULTS". RadioBrowser returns a page with no
            total, so this is `resultLabel` — "30+ results" — see §6 of the
            handover and `formatResultCount`. */}
        <Eyebrow variant="mono-xs" style={{ fontSize: 10.5, color: colors.dim }}>
          {hasCriteria ? search.resultLabel.toUpperCase() : "START TYPING"}
        </Eyebrow>

        <Pressable
          onPress={() =>
            setSort(
              (current) =>
                SORT_CYCLE[(SORT_CYCLE.indexOf(current) + 1) % SORT_CYCLE.length],
            )
          }
          accessibilityRole="button"
          accessibilityLabel={`Sorted by ${SEARCH_SORTS[sort].label}. Tap to change.`}
          hitSlop={8}
          style={({ pressed }) => ({
            flexDirection: "row",
            alignItems: "center",
            gap: 6,
            opacity: pressed ? 0.6 : 1,
          })}
        >
          <Text weight="400" style={{ fontSize: 13, color: colors.muted }}>
            {SEARCH_SORTS[sort].label}
          </Text>
          <ChevronDownIcon size={12} color={colors.muted} />
        </Pressable>
      </View>

      <AsyncBoundary
        isLoading={search.isLoading}
        error={search.error}
        isEmpty={hasCriteria && !search.isLoading && search.stations.length === 0}
        onRetry={search.retry}
        loadingFallback={
          <View style={{ paddingHorizontal: 24, paddingTop: 12 }}>
            <StationRowSkeleton count={6} gap={10} />
          </View>
        }
        empty={
          <StateBlock
            title="No stations found"
            body="Try a different name, genre, or country."
          />
        }
      >
        {hasCriteria ? (
          <FlatList
            data={search.stations}
            keyExtractor={(s) => s.stationuuid}
            // Explicit flex: a ScrollView in a flex-column parent doesn't grow
            // on its own, and without this the list overflows instead of
            // scrolling.
            style={{ flex: 1 }}
            contentContainerStyle={{
              paddingHorizontal: 24,
              paddingTop: 12,
              paddingBottom: 180,
              gap: 10,
            }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            onEndReached={search.loadMore}
            onEndReachedThreshold={0.6}
            renderItem={({ item }) => (
              <StationRow
                station={item}
                size="md"
                onPress={() => router.push(`/station/${item.stationuuid}`)}
                trailing={<FavoriteToggle station={item} />}
              />
            )}
            ListFooterComponent={
              search.isLoadingMore ? (
                <View style={{ paddingTop: 10 }}>
                  <StationRowSkeleton count={2} gap={10} />
                </View>
              ) : null
            }
          />
        ) : recentlyPlayed.length > 0 ? (
          // flows/05: with no search criteria, this space shows history rather
          // than an empty state — it's the fastest route back to a station the
          // user already likes.
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{ paddingBottom: 180 }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <SectionHeader
              title="Recently played"
              actionLabel="See all"
              onAction={() => router.push("/recently-played")}
              style={{ paddingHorizontal: 24, paddingTop: 10 }}
            />

            <View style={{ paddingHorizontal: 24, paddingTop: 12, gap: 10 }}>
              {recentlyPlayed.slice(0, 8).map((station) => (
                <StationRow
                  key={station.stationuuid}
                  station={station}
                  size="md"
                  onPress={() => router.push(`/station/${station.stationuuid}`)}
                  trailing={<PlayPauseButton station={station} size={36} iconSize={14} />}
                />
              ))}
            </View>
          </ScrollView>
        ) : (
          <StateBlock
            title="Find your station"
            body="Search by name, or pick a genre above."
          />
        )}
      </AsyncBoundary>

      <FilterPickerSheet
        ref={pickerRef}
        selected={{ country, language }}
        onSelect={onPickerSelect}
      />
    </Screen>
  );
}
