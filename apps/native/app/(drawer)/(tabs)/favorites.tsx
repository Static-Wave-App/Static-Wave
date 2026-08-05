import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, View } from "react-native";
import Svg, { Polygon, Rect } from "react-native-svg";

import { AsyncBoundary, SectionHeader, StateBlock } from "@/components/ui/async-boundary";
import { GLOW } from "@/components/ui/glow";
import { PlayPauseButton } from "@/components/ui/play-pause-button";
import { Screen } from "@/components/ui/screen";
import { ScreenBackButton } from "@/components/ui/screen-back-button";
import { StationArtwork } from "@/components/ui/station-artwork";
import { RowAction, StationRow } from "@/components/ui/station-row";
import { Eyebrow, Text } from "@/components/ui/text";
import { useAppColors } from "@/components/ui/theme";
import { formatCollectionSummary, formatStationSubtitle } from "@/lib/format";
import { useAudioPlayer, useFavorites } from "@/stores";
import type { FavoriteStation } from "@static-wave/types";

/**
 * Favorites — spec: systems/screen-specs.md §03.
 * Every measurement below is from the design file, not estimated.
 *
 * Purely local data: `useFavorites` hydrates at launch, so there is no
 * loading state to show.
 */

/** ON AIR card — 1px gradient border, radius 28 outer / 27 inner. */
function OnAirCard({ station }: { station: FavoriteStation }) {
  const { colors } = useAppColors();
  const router = useRouter();
  const togglePlayback = useAudioPlayer((s) => s.togglePlayback);
  const isPlaying = useAudioPlayer((s) => s.isPlaying);

  return (
    <LinearGradient
      colors={["#FF2FD6", "#8B3DFF", "#22D3EE"]}
      locations={[0, 0.55, 1]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ marginHorizontal: 24, marginTop: 22, borderRadius: 28, padding: 1 }}
    >
      <Pressable
        onPress={() => router.push(`/station/${station.stationuuid}`)}
        style={{
          borderRadius: 27,
          backgroundColor: colors.surface,
          padding: 14,
          flexDirection: "row",
          alignItems: "center",
          gap: 14,
        }}
      >
        {/* 64×64 radius 20. The design draws a gradient square with initials —
            that's the placeholder for station artwork, so the real favicon goes
            here when the station has one. */}
        <StationArtwork
          station={station}
          size={64}
          radius={20}
          palette="station"
          initialsSize={20}
          align="center"
          padding={0}
        />

        <View style={{ flex: 1, minWidth: 0 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 7 }}>
            <View
              style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: colors.onAir }}
            />
            <Eyebrow variant="mono-2xs" style={{ color: colors.onAir }}>
              ON AIR
            </Eyebrow>
          </View>
          <Text
            variant="display-xs"
            numberOfLines={1}
            style={{ marginTop: 5, color: colors.text }}
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

        <Pressable
          onPress={() => togglePlayback()}
          accessibilityRole="button"
          accessibilityLabel={isPlaying ? "Pause" : "Play"}
          hitSlop={8}
        >
          <LinearGradient
            colors={["#8B3DFF", "#2E7BFF"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              width: 48,
              height: 48,
              borderRadius: 24,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {isPlaying ? (
              <Svg width={18} height={18} viewBox="0 0 24 24">
                <Rect x={6} y={4} width={4} height={16} rx={1.5} fill="#FFFFFF" />
                <Rect x={14} y={4} width={4} height={16} rx={1.5} fill="#FFFFFF" />
              </Svg>
            ) : (
              <Svg width={18} height={18} viewBox="0 0 24 24">
                <Polygon points="7,4 20,12 7,20" fill="#FFFFFF" />
              </Svg>
            )}
          </LinearGradient>
        </Pressable>
      </Pressable>
    </LinearGradient>
  );
}

export default function FavoritesScreen() {
  const router = useRouter();
  const { colors } = useAppColors();

  const favorites = useFavorites((s) => s.favorites);
  const hydrated = useFavorites((s) => s.hydrated);
  const remove = useFavorites((s) => s.remove);
  const currentUuid = useAudioPlayer((s) => s.currentStation?.stationuuid);

  const [isEditing, setIsEditing] = useState(false);

  // The ON AIR card only appears when the playing station is a favorite.
  const onAir = favorites.find((f) => f.stationuuid === currentUuid) ?? null;
  const rest = onAir
    ? favorites.filter((f) => f.stationuuid !== onAir.stationuuid)
    : favorites;

  return (
    <Screen glow={GLOW.favorites}>
      <ScreenBackButton />

      <View
        style={{
          flexDirection: "row",
          alignItems: "flex-end",
          justifyContent: "space-between",
          paddingHorizontal: 24,
          paddingTop: 12,
        }}
      >
        <View>
          <Text variant="display-xl" style={{ fontSize: 31, color: colors.text }}>
            Favorites
          </Text>
          <Text weight="300" style={{ marginTop: 5, fontSize: 13.5, color: colors.muted }}>
            {formatCollectionSummary(favorites)}
          </Text>
        </View>

        {favorites.length > 0 ? (
          <Pressable
            onPress={() => setIsEditing((v) => !v)}
            accessibilityRole="button"
            style={({ pressed }) => ({
              height: 34,
              paddingHorizontal: 15,
              borderRadius: 17,
              backgroundColor: colors.chipBg,
              borderWidth: 1,
              borderColor: colors.chipBorder,
              alignItems: "center",
              justifyContent: "center",
              opacity: pressed ? 0.7 : 1,
            })}
          >
            <Text weight="400" style={{ fontSize: 13.5, color: colors.text }}>
              {isEditing ? "Done" : "Edit"}
            </Text>
          </Pressable>
        ) : null}
      </View>

      <AsyncBoundary
        isEmpty={hydrated && favorites.length === 0}
        empty={
          <StateBlock
            title="No favorites yet"
            body="Stations you save will live here."
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
          contentContainerStyle={{ paddingBottom: 180 }}
          showsVerticalScrollIndicator={false}
        >
          {onAir ? <OnAirCard station={onAir} /> : null}

          <SectionHeader
            title="ALL SAVED"
            eyebrow
            actionLabel="Recently added"
            withChevron={false}
            style={{ paddingHorizontal: 24, paddingTop: 26 }}
          />

          <View style={{ paddingHorizontal: 24, paddingTop: 12, gap: 9 }}>
            {rest.map((station) => (
              <StationRow
                key={station.stationuuid}
                station={station}
                size="sm"
                onPress={() => router.push(`/station/${station.stationuuid}`)}
                trailing={
                  isEditing ? (
                    <RowAction
                      size={36}
                      accessibilityLabel={`Remove ${station.name}`}
                      onPress={() => remove(station.stationuuid)}
                    >
                      <Svg width={16} height={16} viewBox="0 0 24 24">
                        <Rect x={5} y={11} width={14} height={2.5} rx={1.25} fill={colors.muted} />
                      </Svg>
                    </RowAction>
                  ) : (
                    // Pauses instead of restarting when this row is already the
                    // playing station.
                    <PlayPauseButton station={station} size={36} iconSize={14} />
                  )
                }
              />
            ))}
          </View>
        </ScrollView>
      </AsyncBoundary>
    </Screen>
  );
}
