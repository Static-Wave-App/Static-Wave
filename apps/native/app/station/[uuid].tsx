import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import type { ReactNode } from "react";
import { ActivityIndicator, Pressable, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AsyncBoundary, StateBlock } from "@/components/ui/async-boundary";
import {
  ChevronLeftIcon,
  HeartIcon,
  PauseIcon,
  PlayIcon,
  ShareIcon,
} from "@/components/ui/icons";
import { RadialOverlay } from "@/components/ui/radial-overlay";
import { StationArtwork } from "@/components/ui/station-artwork";
import { Eyebrow, Text } from "@/components/ui/text";
import { useAppColors } from "@/components/ui/theme";
import { useStation, useStationPlayback } from "@/hooks";
import {
  formatCodec,
  formatVotes,
  getStationStatus,
  getStationTags,
  getTrendLabel,
} from "@/lib/format";
import { shareStation } from "@/lib/share";
import { useFavorites } from "@/stores";
import type { Station } from "@static-wave/types";

/**
 * Station Details — spec: systems/screen-specs.md §04.
 *
 * Structurally unlike every other screen: NO glow. Instead a 330px gradient
 * hero (`160deg #FF2FD6, #8B3DFF 45%, #2E7BFF 85%` under a cyan radial) with
 * `border-radius: 0 0 40px 40px`. The nav row, artwork and tags all sit on top
 * of it, so they use white-on-gradient colours rather than theme colours.
 *
 * This screen also does NOT use `<Screen>`: that component owns the safe-area
 * top padding, and here the hero has to run under the status bar.
 */

const HERO_HEIGHT = 330;

/** Nav row buttons: 40×40, radius 14, `rgba(10,10,12,0.28)`. */
function HeroButton({
  onPress,
  accessibilityLabel,
  children,
}: {
  onPress: () => void;
  accessibilityLabel: string;
  children: ReactNode;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      style={({ pressed }) => ({
        width: 40,
        height: 40,
        borderRadius: 14,
        backgroundColor: "rgba(10,10,12,0.28)",
        alignItems: "center",
        justifyContent: "center",
        opacity: pressed ? 0.7 : 1,
      })}
    >
      {children}
    </Pressable>
  );
}

/**
 * Info card — radius 22, surface + border, `padding 14px 12px`, centred.
 *
 * TWO of these, not the design's three. The third card reads "UPTIME 99.6%",
 * and RadioBrowser has no uptime field — only `lastcheckok`, a 0/1 flag. See
 * §6 of the handover; the status it *can* support is shown in the meta row
 * instead, where it can be honest about being a single check rather than a
 * percentage.
 */
function InfoCard({
  label,
  value,
  unit,
}: {
  label: string;
  value: string;
  unit?: string | null;
}) {
  const { colors } = useAppColors();

  return (
    <View
      style={{
        flex: 1,
        borderRadius: 22,
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.chipBorder,
        paddingVertical: 14,
        paddingHorizontal: 12,
        alignItems: "center",
      }}
    >
      <Eyebrow variant="mono-2xs" style={{ letterSpacing: 1.14, color: colors.dim }}>
        {label}
      </Eyebrow>
      <Text
        weight="600"
        style={{ marginTop: 7, fontSize: 17, letterSpacing: -0.34, color: colors.text }}
      >
        {value}
        {unit ? (
          <Text weight="300" style={{ fontSize: 12, color: colors.muted }}>
            {unit}
          </Text>
        ) : null}
      </Text>
    </View>
  );
}

function StationDetails({ station }: { station: Station }) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useAppColors();

  const playback = useStationPlayback(station);
  const toggleFavorite = useFavorites((s) => s.toggle);
  const isFavorite = useFavorites((s) =>
    s.favorites.some((f) => f.stationuuid === station.stationuuid),
  );

  const tags = getStationTags(station, 3);
  const status = getStationStatus(station);
  const trend = getTrendLabel(station);
  const codec = formatCodec(station.codec);

  const subtitle = [
    [station.state?.trim(), station.country?.trim()].filter(Boolean).join(", "),
    station.language?.split(",")[0]?.trim(),
  ]
    .filter(Boolean)
    .join(" · ");

  // The design's body copy is a station bio. RadioBrowser has no description
  // field, so this is assembled from what it does return rather than invented.
  const about = [
    tags.length > 0 ? `${tags.join(", ")} from ${station.country || "an unknown location"}.` : null,
    status.checkedLabel
      ? `${status.label} — ${status.checkedLabel.toLowerCase()}.`
      : `${status.label}.`,
    station.homepage ? `More at ${station.homepage.replace(/^https?:\/\//, "")}` : null,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Hero: 330px, `border-radius 0 0 40px 40px`. Absolute, so the content
          below scrolls over it exactly as it does in the design. */}
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: HERO_HEIGHT,
          borderBottomLeftRadius: 40,
          borderBottomRightRadius: 40,
          overflow: "hidden",
        }}
      >
        <LinearGradient
          colors={["#FF2FD6", "#8B3DFF", "#2E7BFF"]}
          locations={[0, 0.45, 0.85]}
          // 160deg — nearly vertical, raked slightly right.
          start={{ x: 0.2, y: 0 }}
          end={{ x: 0.8, y: 1 }}
          style={{ flex: 1 }}
        />
        {/* radial-gradient(80% 70% at 90% 0%, rgba(34,211,238,0.5)) */}
        <RadialOverlay color="#22D3EE" opacity={0.5} cx={0.9} cy={0} rx={0.8} ry={0.7} />
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingTop: insets.top, paddingBottom: 160 }}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingHorizontal: 20,
            paddingTop: 22,
          }}
        >
          <HeroButton onPress={() => router.back()} accessibilityLabel="Back">
            <ChevronLeftIcon size={19} color="rgba(255,255,255,0.96)" />
          </HeroButton>

          <Text weight="400" style={{ fontSize: 13, color: "rgba(255,255,255,0.8)" }}>
            Station
          </Text>

          <HeroButton
            onPress={() => toggleFavorite(station)}
            accessibilityLabel={isFavorite ? "Remove from favorites" : "Save to favorites"}
          >
            <HeartIcon
              size={22}
              color="rgba(255,255,255,0.96)"
              filled={isFavorite}
            />
          </HeroButton>
        </View>

        {/* Artwork 132×132 radius 34, `135deg #0A0A0C → #1E1E25`, 1px white border. */}
        <View style={{ alignItems: "center", paddingHorizontal: 28, paddingTop: 20 }}>
          <StationArtwork
            station={station}
            size={132}
            radius={34}
            colors={isDark ? ["#0A0A0C", "#1E1E25"] : ["#0A0A0C", "#E4E4EA"]}
            locations={[0, 1]}
            initialsSize={40}
            align="center"
            padding={0}
            borderColor={isDark ? "rgba(255,255,255,0.14)" : "rgba(0,0,0,0.10)"}
          />

          <Text
            weight="600"
            numberOfLines={2}
            style={{
              marginTop: 20,
              // Extra breathing room under the name before the subtitle and
              // tags; the design's 6px was too tight once names wrap to two
              // lines, which is common.
              marginBottom: 16,
              fontSize: 27,
              lineHeight: 31,
              letterSpacing: -0.81,
              textAlign: "center",
              color: "rgba(255,255,255,0.98)",
            }}
          >
            {station.name}
          </Text>

          {subtitle ? (
            <Text
              weight="300"
              style={{ marginTop: 6, fontSize: 14, color: "rgba(255,255,255,0.72)" }}
            >
              {subtitle}
            </Text>
          ) : null}
        </View>

        {/* Tags: height 32, radius 16, `padding 0 14px`, `rgba(255,255,255,0.14)`. */}
        {tags.length > 0 ? (
          <View
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              gap: 8,
              justifyContent: "center",
              paddingHorizontal: 24,
              paddingTop: 18,
            }}
          >
            {tags.map((tag) => (
              <View
                key={tag}
                style={{
                  height: 32,
                  paddingHorizontal: 14,
                  borderRadius: 16,
                  backgroundColor: "rgba(255,255,255,0.14)",
                  justifyContent: "center",
                }}
              >
                <Text
                  weight="400"
                  style={{ fontSize: 13, color: "rgba(255,255,255,0.96)" }}
                >
                  {tag}
                </Text>
              </View>
            ))}
          </View>
        ) : null}

        <View
          style={{
            flexDirection: "row",
            gap: 10,
            marginHorizontal: 24,
            marginTop: 34,
          }}
        >
          <InfoCard
            label="BITRATE"
            value={station.bitrate > 0 ? String(station.bitrate) : "—"}
            unit={station.bitrate > 0 ? " kbps" : null}
          />
          <InfoCard label="CODEC" value={codec ?? "—"} />
        </View>

        <View style={{ paddingHorizontal: 24, paddingTop: 26 }}>
          <Text
            weight="600"
            style={{ fontSize: 16, letterSpacing: -0.32, color: colors.text }}
          >
            About this station
          </Text>
          <Text
            weight="300"
            style={{
              marginTop: 9,
              fontSize: 14.5,
              lineHeight: 23.9,
              color: colors.muted,
            }}
          >
            {about}
          </Text>

          {/* Meta row. `1,284 VOTES` is real; the design's neighbouring
              "TRENDING #6 IN FRANCE" is not derivable — RadioBrowser has no
              per-country rank — so `getTrendLabel` gives a direction, and
              renders nothing when the station isn't moving. */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 8,
              marginTop: 14,
            }}
          >
            <Eyebrow variant="mono-2xs" style={{ fontSize: 10, color: colors.dim }}>
              {formatVotes(station.votes).toUpperCase()}
            </Eyebrow>

            <View
              style={{ width: 3, height: 3, borderRadius: 1.5, backgroundColor: colors.dim }}
            />

            <Eyebrow variant="mono-2xs" style={{ fontSize: 10, color: colors.dim }}>
              {status.label.toUpperCase()}
              {status.checkedLabel ? ` · ${status.checkedLabel.toUpperCase()}` : ""}
            </Eyebrow>

            {trend ? (
              <>
                <View
                  style={{
                    width: 3,
                    height: 3,
                    borderRadius: 1.5,
                    backgroundColor: colors.dim,
                  }}
                />
                <Eyebrow variant="mono-2xs" style={{ fontSize: 10, color: colors.dim }}>
                  {trend.toUpperCase()}
                </Eyebrow>
              </>
            ) : null}
          </View>
        </View>
      </ScrollView>

      {/* Footer: `padding 22px 24px 40px` over a fade to the screen background. */}
      <View
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          paddingTop: 22,
          paddingHorizontal: 24,
          paddingBottom: 40,
          flexDirection: "row",
          gap: 12,
        }}
      >
        <LinearGradient
          colors={["rgba(12,12,16,0)", colors.background, colors.background]}
          locations={[0, 0.4, 1]}
          pointerEvents="none"
          style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
        />

        {/* Reflects real playback state. It used to read "Play station"
            unconditionally — including while that very station was audibly
            playing — and re-tore-down the stream on every tap. */}
        <Pressable
          onPress={playback.toggle}
          accessibilityRole="button"
          accessibilityState={{ selected: playback.isPlaying }}
          accessibilityLabel={`${playback.label}: ${station.name}`}
          style={({ pressed }) => ({ flex: 1, opacity: pressed ? 0.9 : 1 })}
        >
          {/* 58px tall, radius 20 — NOT a pill. See §5 of the handover. */}
          <LinearGradient
            colors={["#FF2FD6", "#8B3DFF", "#2E7BFF"]}
            locations={[0, 0.5, 1]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              height: 58,
              borderRadius: 20,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
            }}
          >
            {playback.isLoading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : playback.isPlaying ? (
              <PauseIcon size={17} />
            ) : (
              <PlayIcon size={17} />
            )}
            <Text weight="500" style={{ fontSize: 16, color: "rgba(255,255,255,0.96)" }}>
              {playback.label}
            </Text>
          </LinearGradient>
        </Pressable>

        <Pressable
          onPress={() => shareStation(station)}
          accessibilityRole="button"
          accessibilityLabel={`Share ${station.name}`}
          style={({ pressed }) => ({
            width: 58,
            height: 58,
            borderRadius: 20,
            backgroundColor: colors.surface,
            borderWidth: 1,
            borderColor: isDark ? "rgba(255,255,255,0.14)" : "rgba(0,0,0,0.10)",
            alignItems: "center",
            justifyContent: "center",
            opacity: pressed ? 0.8 : 1,
          })}
        >
          <ShareIcon size={18} color={colors.text} />
        </Pressable>
      </View>
    </View>
  );
}

export default function StationDetailsScreen() {
  const { uuid } = useLocalSearchParams<{ uuid: string }>();
  const { colors } = useAppColors();
  const { station, isLoading, error, retry } = useStation(uuid);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <AsyncBoundary
        isLoading={isLoading}
        error={error}
        isEmpty={!isLoading && !error && station === null}
        onRetry={retry}
        empty={<StateBlock title="Station not found" body="This station is no longer listed." />}
      >
        {station ? <StationDetails station={station} /> : null}
      </AsyncBoundary>
    </View>
  );
}
