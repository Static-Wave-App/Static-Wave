import { useRouter } from "expo-router";
import { Pressable, ScrollView, View } from "react-native";

import { AsyncBoundary, SectionHeader, StateBlock } from "@/components/ui/async-boundary";
import { GLOW } from "@/components/ui/glow";
import { ChevronLeftIcon, PlayIcon, TrashIcon } from "@/components/ui/icons";
import { Screen } from "@/components/ui/screen";
import { RowAction, StationRow } from "@/components/ui/station-row";
import { Text } from "@/components/ui/text";
import { useAppColors } from "@/components/ui/theme";
import { formatRelativeTime } from "@/lib/format";
import { useAudioPlayer, useRecentlyPlayed } from "@/stores";

/**
 * `/recently-played` — the Dashboard's "See all" target.
 *
 * The design file has no screen for this; it's the one route in the app that
 * was designed by extension rather than transcription. So it deliberately
 * reuses parts that ARE specified: the Favorites header block (§03), the `sm`
 * StationRow, and the dashboard glow. Nothing new is invented visually.
 *
 * Grouped by relative recency, because a flat list of 50 identical rows gives
 * the user nothing to navigate by.
 */
export default function RecentlyPlayedScreen() {
  const router = useRouter();
  const { colors } = useAppColors();

  const recentlyPlayed = useRecentlyPlayed((s) => s.recentlyPlayed);
  const clear = useRecentlyPlayed((s) => s.clear);
  const hydrated = useRecentlyPlayed((s) => s.hydrated);
  const play = useAudioPlayer((s) => s.play);

  return (
    <Screen glow={GLOW.dashboard}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: 20,
          paddingTop: 22,
        }}
      >
        <Pressable
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Back"
          style={({ pressed }) => ({
            width: 40,
            height: 40,
            borderRadius: 14,
            backgroundColor: colors.chipBg,
            borderWidth: 1,
            borderColor: colors.chipBorder,
            alignItems: "center",
            justifyContent: "center",
            opacity: pressed ? 0.7 : 1,
          })}
        >
          <ChevronLeftIcon size={19} color={colors.text} />
        </Pressable>

        {recentlyPlayed.length > 0 ? (
          <Pressable
            onPress={() => clear()}
            accessibilityRole="button"
            accessibilityLabel="Clear history"
            style={({ pressed }) => ({
              height: 34,
              paddingHorizontal: 15,
              borderRadius: 17,
              backgroundColor: colors.chipBg,
              borderWidth: 1,
              borderColor: colors.chipBorder,
              flexDirection: "row",
              alignItems: "center",
              gap: 7,
              opacity: pressed ? 0.7 : 1,
            })}
          >
            <TrashIcon size={14} color={colors.muted} />
            <Text weight="400" style={{ fontSize: 13.5, color: colors.text }}>
              Clear
            </Text>
          </Pressable>
        ) : null}
      </View>

      <View style={{ paddingHorizontal: 24, paddingTop: 18 }}>
        <Text variant="display-xl" style={{ fontSize: 31, lineHeight: 34, color: colors.text }}>
          Recently played
        </Text>
        <Text weight="300" style={{ marginTop: 5, fontSize: 13.5, color: colors.muted }}>
          {recentlyPlayed.length === 1
            ? "1 station"
            : `${recentlyPlayed.length} stations`}
        </Text>
      </View>

      <AsyncBoundary
        isEmpty={hydrated && recentlyPlayed.length === 0}
        empty={
          <StateBlock
            title="Nothing played yet"
            body="Stations you listen to will show up here."
            action={
              <Pressable
                onPress={() => router.push("/(drawer)/(tabs)")}
                accessibilityRole="button"
                style={{ marginTop: 8 }}
              >
                <Text variant="body-md" style={{ color: "#8B3DFF" }}>
                  Browse stations
                </Text>
              </Pressable>
            }
          />
        }
      >
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingBottom: 120 }}
          showsVerticalScrollIndicator={false}
        >
          <SectionHeader
            title="ALL HISTORY"
            eyebrow
            actionLabel="Most recent first"
            withChevron={false}
            style={{ paddingHorizontal: 24, paddingTop: 26 }}
          />

          <View style={{ paddingHorizontal: 24, paddingTop: 12, gap: 9 }}>
            {recentlyPlayed.map((station) => (
              <View key={station.stationuuid}>
                <StationRow
                  station={station}
                  size="sm"
                  onPress={() => router.push(`/station/${station.stationuuid}`)}
                  trailing={
                    <RowAction
                      size={36}
                      accessibilityLabel={`Play ${station.name}`}
                      onPress={() => play(station)}
                    >
                      <PlayIcon size={14} color={colors.muted} />
                    </RowAction>
                  }
                />
                <Text
                  variant="mono-2xs"
                  tone="dim"
                  style={{ marginTop: 5, marginLeft: 13 }}
                >
                  {formatRelativeTime(station.playedAt).toUpperCase()}
                </Text>
              </View>
            ))}
          </View>
        </ScrollView>
      </AsyncBoundary>
    </Screen>
  );
}
