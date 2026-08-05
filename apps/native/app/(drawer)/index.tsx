import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation, useRouter } from "expo-router";
import type { ReactNode } from "react";
import { useMemo, useRef, useState } from "react";
import type { NativeScrollEvent, NativeSyntheticEvent } from "react-native";
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, View } from "react-native";

import { AsyncBoundary, SectionHeader, Skeleton } from "@/components/ui/async-boundary";
import { GLOW } from "@/components/ui/glow";
import { MenuIcon, MoonIcon, PauseIcon, PlayIcon } from "@/components/ui/icons";
import { NowPlayingBar } from "@/components/ui/now-playing-bar";
import { PlayPauseButton } from "@/components/ui/play-pause-button";
import { RadialOverlay } from "@/components/ui/radial-overlay";
import { Screen } from "@/components/ui/screen";
import { Eyebrow, Text } from "@/components/ui/text";
import { useAppColors } from "@/components/ui/theme";
import { Wordmark } from "@/components/ui/wordmark";
import { useStationPlayback, useSuggestedStations } from "@/hooks";
import {
  formatStationSubtitle,
  getGreeting,
  getStationAvatar,
  getStationInitials,
} from "@/lib/format";
import { useRecentlyPlayed, useSleepTimer } from "@/stores";
import type { RecentStation, Station } from "@static-wave/types";

/**
 * Dashboard — spec: systems/screen-specs.md §01.
 *
 * A drawer screen, not a tab screen. That's why it carries its own Now Playing
 * bar (the `dashboard` variant at `bottom 34`, height 66) instead of inheriting
 * the tabs layout's, and why there's no tab bar here.
 */

const SCREEN_GUTTER = 24;
const FEATURED_COUNT = 3;
/** Space between carousel cards. Must be folded into the snap interval below. */
const FEATURED_GAP = 14;

/* ------------------------------------------------------------------ */
/* Header                                                              */
/* ------------------------------------------------------------------ */

/** 42×42, radius 15, chip fill + border. */
function HeaderButton({
  onPress,
  accessibilityLabel,
  children,
  badge = false,
}: {
  onPress: () => void;
  accessibilityLabel: string;
  children: ReactNode;
  badge?: boolean;
}) {
  const { colors } = useAppColors();

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      style={({ pressed }) => ({
        width: 42,
        height: 42,
        borderRadius: 15,
        backgroundColor: colors.chipBg,
        borderWidth: 1,
        borderColor: colors.chipBorder,
        alignItems: "center",
        justifyContent: "center",
        opacity: pressed ? 0.7 : 1,
      })}
    >
      {children}
      {/* 7px cyan dot at top 9 / right 9. The design draws it unconditionally;
          here it means "a sleep timer is running" — an always-on dot would be
          decoration rather than information. */}
      {badge ? (
        <View
          style={{
            position: "absolute",
            top: 9,
            right: 9,
            width: 7,
            height: 7,
            borderRadius: 3.5,
            backgroundColor: "#22D3EE",
          }}
        />
      ) : null}
    </Pressable>
  );
}

/* ------------------------------------------------------------------ */
/* FEATURED card                                                       */
/* ------------------------------------------------------------------ */

/** Height 194, radius 30, `135deg #FF2FD6, #8B3DFF 52%, #2E7BFF`. */
function FeaturedCard({ station, width }: { station: Station; width: number }) {
  const router = useRouter();
  const { colors } = useAppColors();
  const { isPlaying, isLoading, toggle } = useStationPlayback(station);

  const avatar = getStationAvatar(station);
  const [artFailed, setArtFailed] = useState(false);
  const showArt = Boolean(avatar.uri) && !artFailed;

  const subtitle = formatStationSubtitle(station);
  const bitrate = station.bitrate > 0 ? `${station.bitrate} kbps` : null;

  return (
    <Pressable
      onPress={() => router.push(`/station/${station.stationuuid}`)}
      accessibilityRole="button"
      accessibilityLabel={`Featured: ${station.name}`}
      style={{ width }}
    >
      <LinearGradient
        colors={["#FF2FD6", "#8B3DFF", "#2E7BFF"]}
        locations={[0, 0.52, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ height: 194, borderRadius: 30, overflow: "hidden" }}
      >
        {/* The design has no artwork here, only the gradient. Showing the
            station's own art is more useful, so it goes UNDER a scrim rather
            than replacing the gradient — the pill and the glass bar both sit on
            top and have to stay legible over an arbitrary image. */}
        {showArt && avatar.uri ? (
          <>
            <Image
              source={{ uri: avatar.uri }}
              contentFit="cover"
              transition={200}
              onError={() => setArtFailed(true)}
              style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
            />
            <LinearGradient
              colors={["rgba(10,10,12,0.15)", "rgba(10,10,12,0.55)"]}
              pointerEvents="none"
              style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
            />
          </>
        ) : null}

        {/* radial-gradient(70% 90% at 85% 10%, rgba(34,211,238,0.55)) */}
        {showArt ? null : (
          <RadialOverlay
            color="#22D3EE"
            opacity={0.55}
            cx={0.85}
            cy={0.1}
            rx={0.7}
            ry={0.9}
          />
        )}

        <View
          style={{
            position: "absolute",
            top: 16,
            left: 16,
            height: 26,
            paddingHorizontal: 11,
            borderRadius: 13,
            backgroundColor: "rgba(10,10,12,0.35)",
            flexDirection: "row",
            alignItems: "center",
            gap: 6,
          }}
        >
          <View
            style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: "#22D3EE" }}
          />
          <Eyebrow
            variant="mono-2xs"
            weight="500"
            style={{ color: "rgba(255,255,255,0.96)" }}
          >
            FEATURED
          </Eyebrow>
        </View>

        {/* Glass bar: left/right 12, bottom 12, height 66, radius 22. */}
        <View
          style={{
            position: "absolute",
            left: 12,
            right: 12,
            bottom: 12,
            height: 66,
            borderRadius: 22,
            backgroundColor: colors.glass,
            flexDirection: "row",
            alignItems: "center",
            gap: 12,
            paddingHorizontal: 12,
          }}
        >
          <View style={{ flex: 1, minWidth: 0, paddingLeft: 4 }}>
            <Text
              weight="600"
              numberOfLines={1}
              style={{ fontSize: 16, letterSpacing: -0.32, color: colors.text }}
            >
              {station.name}
            </Text>
            <Text
              weight="300"
              numberOfLines={1}
              style={{ marginTop: 2, fontSize: 12.5, color: colors.muted }}
            >
              {[subtitle, bitrate].filter(Boolean).join(" · ")}
            </Text>
          </View>

          <Pressable
            onPress={toggle}
            accessibilityRole="button"
            accessibilityState={{ selected: isPlaying }}
            accessibilityLabel={
              isPlaying ? `Pause ${station.name}` : `Play ${station.name}`
            }
            hitSlop={8}
            style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}
          >
            <LinearGradient
              colors={["#FF2FD6", "#8B3DFF"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{
                width: 46,
                height: 46,
                borderRadius: 23,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : isPlaying ? (
                <PauseIcon size={16} />
              ) : (
                <PlayIcon size={16} />
              )}
            </LinearGradient>
          </Pressable>
        </View>
      </LinearGradient>
    </Pressable>
  );
}

/** Active dot 18×5 `#8B3DFF`; the rest 5×5. */
function CarouselDots({ count, active }: { count: number; active: number }) {
  const { colors } = useAppColors();

  return (
    <View
      style={{ flexDirection: "row", justifyContent: "center", gap: 6, marginTop: 12 }}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      {Array.from({ length: count }, (_, i) => (
        <View
          key={i}
          style={{
            width: i === active ? 18 : 5,
            height: 5,
            borderRadius: 3,
            backgroundColor: i === active ? "#8B3DFF" : colors.dotInactive,
          }}
        />
      ))}
    </View>
  );
}

/* ------------------------------------------------------------------ */
/* Recently played rail                                                */
/* ------------------------------------------------------------------ */

/** Card width 132, tile 132×132 radius 24, play button 34 at right 10 / bottom 10. */
function RecentCard({ station }: { station: RecentStation }) {
  const router = useRouter();

  const avatar = getStationAvatar(station);

  return (
    <Pressable
      onPress={() => router.push(`/station/${station.stationuuid}`)}
      accessibilityRole="button"
      accessibilityLabel={station.name}
      style={{ width: 132 }}
    >
      <View style={{ width: 132, height: 132, borderRadius: 24, overflow: "hidden" }}>
        <LinearGradient
          colors={avatar.colors as unknown as [string, string]}
          // The tiles rake at `140deg` in the design — steeper than the 135deg
          // used on avatars.
          start={{ x: 0, y: 0 }}
          end={{ x: 0.75, y: 1 }}
          style={{ width: "100%", height: "100%" }}
        >
          {avatar.uri ? (
            <Image
              source={{ uri: avatar.uri }}
              contentFit="cover"
              transition={150}
              style={{ width: "100%", height: "100%" }}
            />
          ) : null}
        </LinearGradient>

        <View style={{ position: "absolute", right: 10, bottom: 10 }}>
          <PlayPauseButton station={station} size={34} iconSize={12} surface="glass" />
        </View>
      </View>

      <Text
        weight="500"
        numberOfLines={1}
        style={{ marginTop: 10, fontSize: 14.5, letterSpacing: -0.22, color: colors.text }}
      >
        {station.name}
      </Text>
      <Text
        weight="300"
        numberOfLines={1}
        style={{ marginTop: 2, fontSize: 12, color: colors.muted }}
      >
        {formatStationSubtitle(station)}
      </Text>
    </Pressable>
  );
}

/* ------------------------------------------------------------------ */
/* Suggested card                                                      */
/* ------------------------------------------------------------------ */

/**
 * One grouped card with hairline dividers — NOT the standalone `StationRow`
 * used on Search and Favorites. Avatar 46 radius 15, rows `padding 11px 0`,
 * card radius 26 with `padding 6px 14px`.
 */
function SuggestedRow({ station, isLast }: { station: Station; isLast: boolean }) {
  const router = useRouter();
  const { colors } = useAppColors();

  const avatar = getStationAvatar(station);

  return (
    <>
      <Pressable
        onPress={() => router.push(`/station/${station.stationuuid}`)}
        accessibilityRole="button"
        accessibilityLabel={station.name}
        style={({ pressed }) => ({
          flexDirection: "row",
          alignItems: "center",
          gap: 13,
          paddingVertical: 11,
          opacity: pressed ? 0.7 : 1,
        })}
      >
        <View style={{ width: 46, height: 46, borderRadius: 15, overflow: "hidden" }}>
          <LinearGradient
            colors={avatar.colors as unknown as [string, string]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              width: "100%",
              height: "100%",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {avatar.uri ? (
              <Image
                source={{ uri: avatar.uri }}
                contentFit="cover"
                transition={150}
                style={{ width: "100%", height: "100%" }}
              />
            ) : (
              <Text weight="600" style={{ fontSize: 15, color: "rgba(255,255,255,0.94)" }}>
                {getStationInitials(station.name)}
              </Text>
            )}
          </LinearGradient>
        </View>

        <View style={{ flex: 1, minWidth: 0 }}>
          <Text
            weight="500"
            numberOfLines={1}
            style={{ fontSize: 15, letterSpacing: -0.23, color: colors.text }}
          >
            {station.name}
          </Text>
          <Text
            weight="300"
            numberOfLines={1}
            style={{ marginTop: 2, fontSize: 12.5, color: colors.muted }}
          >
            {formatStationSubtitle(station)}
          </Text>
        </View>

        <PlayPauseButton station={station} size={34} iconSize={12} />
      </Pressable>

      {isLast ? null : <View style={{ height: 1, backgroundColor: colors.hairline }} />}
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Screen                                                              */
/* ------------------------------------------------------------------ */

export default function DashboardScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const { colors } = useAppColors();

  const [cardWidth, setCardWidth] = useState(0);
  const [featuredIndex, setFeaturedIndex] = useState(0);

  const recentlyPlayed = useRecentlyPlayed((s) => s.recentlyPlayed);
  const timerActive = useSleepTimer((s) => s.isActive);
  const suggestions = useSuggestedStations();

  // Featured takes the head of the suggestion set and the list below takes the
  // tail, so no station appears twice on the screen.
  const featured = useMemo(
    () => suggestions.stations.slice(0, FEATURED_COUNT),
    [suggestions.stations],
  );
  const suggested = useMemo(
    () => suggestions.stations.slice(FEATURED_COUNT),
    [suggestions.stations],
  );

  // Pinned at mount: re-deriving on every render would flip "Good evening" to
  // "Good morning" mid-session at midnight, which reads as a glitch.
  const greeting = useRef(getGreeting()).current;

  const onFeaturedScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (cardWidth === 0) return;
    const next = Math.round(
      e.nativeEvent.contentOffset.x / (cardWidth + FEATURED_GAP),
    );
    if (next !== featuredIndex) setFeaturedIndex(next);
  };

  const openDrawer = () => {
    // `@react-navigation/drawer` isn't resolvable from this package under
    // `node-linker=isolated`, so `DrawerActions` can't be imported. The drawer
    // navigation object exposes `openDrawer` directly.
    (navigation as unknown as { openDrawer?: () => void }).openDrawer?.();
  };

  return (
    <Screen glow={GLOW.dashboard}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: 22,
          paddingTop: 24,
        }}
      >
        <HeaderButton onPress={openDrawer} accessibilityLabel="Open menu">
          <MenuIcon size={20} color={colors.text} />
        </HeaderButton>

        <Wordmark />

        <HeaderButton
          onPress={() => router.push("/player")}
          accessibilityLabel={timerActive ? "Sleep timer running" : "Sleep timer"}
          badge={timerActive}
        >
          <MoonIcon size={19} color={colors.text} />
        </HeaderButton>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          // Suggestions are fetched once on mount and station availability
          // moves, so a pull is the only way to get a fresh set without
          // restarting the app.
          <RefreshControl
            refreshing={suggestions.isLoading}
            onRefresh={suggestions.refresh}
            tintColor={colors.muted}
            colors={["#8B3DFF"]}
          />
        }
      >
        <View style={{ paddingHorizontal: 24, paddingTop: 26 }}>
          <Text
            weight="300"
            style={{ fontSize: 14, letterSpacing: 0.14, color: colors.muted }}
          >
            {greeting}
          </Text>
          <Text
            variant="display-xl"
            style={{
              marginTop: 4,
              fontSize: 31,
              lineHeight: 34.7,
              letterSpacing: -1.09,
              color: colors.text,
            }}
          >
            {"Tune into\nsomething new"}
          </Text>
        </View>

        <View
          style={{ marginTop: 20 }}
          onLayout={(e) => setCardWidth(e.nativeEvent.layout.width - SCREEN_GUTTER * 2)}
        >
          {suggestions.isLoading ? (
            <View style={{ paddingHorizontal: 24 }}>
              <Skeleton height={194} radius={30} />
            </View>
          ) : featured.length > 0 && cardWidth > 0 ? (
            <>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                onMomentumScrollEnd={onFeaturedScroll}
                contentContainerStyle={{ paddingHorizontal: 24, gap: FEATURED_GAP }}
                // Snap by card + gap, not the screen width — `pagingEnabled`
                // would page by the full viewport and drift by the gutter on
                // every swipe, and omitting the gap here drifts by 14px.
                snapToInterval={cardWidth + FEATURED_GAP}
                decelerationRate="fast"
              >
                {featured.map((station) => (
                  <FeaturedCard
                    key={station.stationuuid}
                    station={station}
                    width={cardWidth}
                  />
                ))}
              </ScrollView>

              {featured.length > 1 ? (
                <CarouselDots count={featured.length} active={featuredIndex} />
              ) : null}
            </>
          ) : null}
        </View>

        {recentlyPlayed.length > 0 ? (
          <>
            <SectionHeader
              title="Recently played"
              actionLabel="See all"
              onAction={() => router.push("/recently-played")}
              style={{ paddingHorizontal: 24, paddingTop: 22 }}
            />

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 13, paddingLeft: 24, paddingRight: 24 }}
              style={{ paddingTop: 14 }}
            >
              {recentlyPlayed.slice(0, 10).map((station) => (
                <RecentCard key={station.stationuuid} station={station} />
              ))}
            </ScrollView>
          </>
        ) : null}

        <SectionHeader
          title="Suggested for you"
          actionLabel="See all"
          onAction={() => router.push("/suggested")}
          style={{ paddingHorizontal: 24, paddingTop: 24 }}
        />

        <AsyncBoundary
          isLoading={suggestions.isLoading}
          error={suggestions.error}
          onRetry={suggestions.refresh}
          isEmpty={!suggestions.isLoading && suggested.length === 0}
          loadingFallback={
            <View style={{ marginHorizontal: 24, marginTop: 12 }}>
              <Skeleton height={140} radius={26} />
            </View>
          }
        >
          <View
            style={{
              marginHorizontal: 24,
              marginTop: 12,
              borderRadius: 26,
              backgroundColor: colors.surface,
              borderWidth: 1,
              borderColor: colors.chipBorder,
              paddingVertical: 6,
              paddingHorizontal: 14,
            }}
          >
            {suggested.map((station, i) => (
              <SuggestedRow
                key={station.stationuuid}
                station={station}
                isLast={i === suggested.length - 1}
              />
            ))}
          </View>
        </AsyncBoundary>
      </ScrollView>

      <NowPlayingBar variant="dashboard" />
    </Screen>
  );
}
