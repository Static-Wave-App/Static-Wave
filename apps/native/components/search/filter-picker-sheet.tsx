import {
  BottomSheetBackdrop,
  BottomSheetFlatList,
  BottomSheetModal,
  BottomSheetTextInput,
} from "@gorhom/bottom-sheet";
import type { BottomSheetBackdropProps } from "@gorhom/bottom-sheet";
import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import { ActivityIndicator, Pressable, View } from "react-native";

import { CloseIcon, SearchIcon } from "@/components/ui/icons";
import { Eyebrow, Text } from "@/components/ui/text";
import { useAppColors } from "@/components/ui/theme";
import { getCountries, getLanguages } from "@/lib/api";
import { formatCompactNumber } from "@/lib/format";
import { getFontFamily } from "@/lib/fonts";

/**
 * The picker behind the Search screen's "Country" and "Language" chips.
 *
 * The design draws both as chips with a disclosure chevron but never draws the
 * disclosed state, so this is built from primitives that ARE specified — the
 * chip fill, the 50px search field, and the mono eyebrow — rather than inventing
 * a new visual language.
 *
 * Both lists come from `lib/api/metadata.ts`, which was written for exactly
 * this and had no caller until now. RadioBrowser returns ~250 countries and
 * ~400 languages ordered by station count, so the list is filtered client-side
 * rather than re-queried per keystroke.
 *
 * A `BottomSheetModal`, not a plain `BottomSheet`: the plain one renders inside
 * whatever container holds it, and this one lives inside a tab screen — so the
 * floating tab bar (a sibling of the navigator) would draw on top of it. The
 * modal portals to `BottomSheetModalProvider` at the root instead.
 */

export type FilterKind = "country" | "language";

export type FilterPickerRef = {
  open: (kind: FilterKind) => void;
  close: () => void;
};

type Option = { name: string; stationcount: number };

const TITLES: Record<FilterKind, { title: string; placeholder: string }> = {
  country: { title: "COUNTRY", placeholder: "Search countries" },
  language: { title: "LANGUAGE", placeholder: "Search languages" },
};

export const FilterPickerSheet = forwardRef<
  FilterPickerRef,
  {
    /** Current selections, so the active row can be marked. */
    selected: { country: string | null; language: string | null };
    onSelect: (kind: FilterKind, value: string | null) => void;
  }
>(function FilterPickerSheet({ selected, onSelect }, ref) {
  const { colors } = useAppColors();
  const bottomSheet = useRef<BottomSheetModal>(null);

  const [kind, setKind] = useState<FilterKind>("country");
  const [options, setOptions] = useState<Option[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  useImperativeHandle(
    ref,
    () => ({
      open: (next: FilterKind) => {
        setKind(next);
        setQuery("");
        bottomSheet.current?.present();
      },
      close: () => bottomSheet.current?.dismiss(),
    }),
    [],
  );

  useEffect(() => {
    let cancelled = false;

    setIsLoading(true);
    setError(null);

    const load = kind === "country" ? getCountries() : getLanguages();

    load
      .then((results) => {
        if (cancelled) return;
        // The API returns unnamed entries for stations with a blank field.
        setOptions(results.filter((o) => o.name?.trim()));
      })
      .catch(() => {
        if (cancelled) return;
        setError(`Couldn't load ${kind === "country" ? "countries" : "languages"}`);
        setOptions([]);
      })
      .finally(() => {
        if (cancelled) return;
        setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [kind]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return options;
    return options.filter((o) => o.name.toLowerCase().includes(needle));
  }, [options, query]);

  const snapPoints = useMemo(() => ["75%"], []);
  const current = kind === "country" ? selected.country : selected.language;

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        opacity={0.6}
        pressBehavior="close"
      />
    ),
    [],
  );

  const choose = (value: string | null) => {
    onSelect(kind, value);
    bottomSheet.current?.dismiss();
  };

  return (
    <BottomSheetModal
      ref={bottomSheet}
      snapPoints={snapPoints}
      enablePanDownToClose
      backdropComponent={renderBackdrop}
      backgroundStyle={{ backgroundColor: colors.surface }}
      handleIndicatorStyle={{ backgroundColor: colors.dim }}
    >
      <View style={{ paddingHorizontal: 24, paddingBottom: 12 }}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Eyebrow variant="mono-xs" style={{ fontSize: 10.5, color: colors.dim }}>
            {TITLES[kind].title}
          </Eyebrow>

          {current ? (
            <Pressable
              onPress={() => choose(null)}
              accessibilityRole="button"
              accessibilityLabel="Clear filter"
              hitSlop={8}
              style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
            >
              <Text weight="400" style={{ fontSize: 13, color: "#8B3DFF" }}>
                Clear
              </Text>
            </Pressable>
          ) : null}
        </View>

        {/* Same 50 / 18 field as the Search screen, so the two read as one system. */}
        <View
          style={{
            marginTop: 14,
            height: 50,
            borderRadius: 18,
            backgroundColor: colors.chipBg,
            borderWidth: 1,
            borderColor: colors.chipBorder,
            flexDirection: "row",
            alignItems: "center",
            gap: 10,
            paddingHorizontal: 15,
          }}
        >
          <SearchIcon size={18} color={colors.muted} />
          <BottomSheetTextInput
            value={query}
            onChangeText={setQuery}
            placeholder={TITLES[kind].placeholder}
            placeholderTextColor={colors.muted}
            autoCorrect={false}
            accessibilityLabel={TITLES[kind].placeholder}
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
              accessibilityLabel="Clear"
              hitSlop={10}
            >
              <CloseIcon size={11} color={colors.muted} />
            </Pressable>
          ) : null}
        </View>
      </View>

      {isLoading ? (
        <View style={{ paddingVertical: 48, alignItems: "center" }}>
          <ActivityIndicator color={colors.muted} />
        </View>
      ) : error ? (
        <View style={{ paddingVertical: 48, paddingHorizontal: 32 }}>
          <Text
            variant="body-md"
            weight="300"
            style={{ color: colors.muted, textAlign: "center" }}
          >
            {error}
          </Text>
        </View>
      ) : (
        <BottomSheetFlatList
          data={filtered}
          keyExtractor={(o: Option) => o.name}
          contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 40 }}
          keyboardShouldPersistTaps="handled"
          ListEmptyComponent={
            <Text
              variant="body-md"
              weight="300"
              style={{ paddingTop: 32, color: colors.muted, textAlign: "center" }}
            >
              No matches
            </Text>
          }
          renderItem={({ item }: { item: Option }) => {
            const isSelected = current === item.name;
            return (
              <Pressable
                onPress={() => choose(isSelected ? null : item.name)}
                accessibilityRole="button"
                accessibilityState={{ selected: isSelected }}
                style={({ pressed }) => ({
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  paddingVertical: 13,
                  borderBottomWidth: 1,
                  borderBottomColor: colors.hairline,
                  opacity: pressed ? 0.6 : 1,
                })}
              >
                <Text
                  weight={isSelected ? "500" : "400"}
                  numberOfLines={1}
                  style={{
                    flex: 1,
                    fontSize: 15,
                    color: isSelected ? "#8B3DFF" : colors.text,
                  }}
                >
                  {item.name}
                </Text>
                <Eyebrow variant="mono-2xs" style={{ color: colors.dim }}>
                  {formatCompactNumber(item.stationcount)}
                </Eyebrow>
              </Pressable>
            );
          }}
        />
      )}
    </BottomSheetModal>
  );
});
