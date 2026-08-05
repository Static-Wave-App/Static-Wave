import type { Station } from "@static-wave/types";
import { LinearGradient } from "expo-linear-gradient";
import { Image } from "expo-image";
import type { ReactNode } from "react";
import { Pressable, View } from "react-native";

import {
  formatBitrateBadge,
  formatStationSubtitle,
  getStationAvatar,
} from "@/lib/format";
import { useAudioPlayer } from "@/stores";

import { Eyebrow, Text } from "./text";
import { useAppColors } from "./theme";

/**
 * The station row used by Search, Favorites, Recently Played and Dashboard
 * suggestions — four of the five content screens.
 *
 * Every measurement is taken from systems/screen-specs.md, which was extracted
 * verbatim from StaticWave Screens.html. The two sizes are the two the design
 * actually uses; there is no third.
 */

type Size = "md" | "sm";

const SIZES = {
  // Search results
  md: { avatar: 52, avatarRadius: 17, initials: 16, title: 15.5, subtitleGap: 4 },
  // Favorites / suggestions
  sm: { avatar: 50, avatarRadius: 16, initials: 15, title: 15, subtitleGap: 3 },
} as const satisfies Record<Size, object>;

export type StationRowProps = {
  station: Station;
  size?: Size;
  onPress?: () => void;
  /** Rendered at the row's trailing edge — a play or favorite control. */
  trailing?: ReactNode;
  /** Search shows the bitrate chip; Favorites doesn't. */
  showBitrate?: boolean;
};

export function StationRow({
  station,
  size = "md",
  onPress,
  trailing,
  showBitrate = size === "md",
}: StationRowProps) {
  const { colors } = useAppColors();
  const s = SIZES[size];

  const avatar = getStationAvatar(station);
  const subtitle = formatStationSubtitle(station);
  const bitrate = formatBitrateBadge(station.bitrate);

  // Narrow subscription: this row re-renders when *its* station starts or stops
  // playing, not when any playback state changes anywhere.
  const isCurrent = useAudioPlayer(
    (state) => state.currentStation?.stationuuid === station.stationuuid,
  );

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${station.name}${subtitle ? `, ${subtitle}` : ""}`}
      style={({ pressed }) => ({
        flexDirection: "row",
        alignItems: "center",
        gap: 13,
        paddingVertical: 11,
        paddingHorizontal: 13,
        borderRadius: 22,
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: isCurrent ? "#8B3DFF" : colors.chipBorder,
        opacity: pressed ? 0.85 : 1,
      })}
    >
      <View
        style={{
          width: s.avatar,
          height: s.avatar,
          borderRadius: s.avatarRadius,
          overflow: "hidden",
        }}
      >
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
            <Text
              weight="600"
              style={{
                fontSize: s.initials,
                color: "rgba(255,255,255,0.94)",
              }}
            >
              {avatar.initials}
            </Text>
          )}
        </LinearGradient>
      </View>

      <View style={{ flex: 1, minWidth: 0 }}>
        <Text
          weight="500"
          numberOfLines={1}
          style={{ fontSize: s.title, letterSpacing: -0.23, color: colors.text }}
        >
          {station.name}
        </Text>

        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 7,
            marginTop: s.subtitleGap,
          }}
        >
          <Text
            weight="300"
            numberOfLines={1}
            style={{ fontSize: 12, color: colors.muted, flexShrink: 1 }}
          >
            {subtitle}
          </Text>

          {showBitrate && bitrate ? (
            <Eyebrow
              variant="mono-2xs"
              style={{
                color: colors.dim,
                paddingVertical: 2,
                paddingHorizontal: 6,
                borderRadius: 6,
                backgroundColor: colors.chipBg,
                overflow: "hidden",
              }}
            >
              {bitrate}
            </Eyebrow>
          ) : null}
        </View>
      </View>

      {trailing}
    </Pressable>
  );
}

/** Circular trailing control — 36×36 in Favorites, 34×34 in Dashboard rows. */
export function RowAction({
  size = 36,
  onPress,
  accessibilityLabel,
  children,
}: {
  size?: number;
  onPress?: () => void;
  accessibilityLabel: string;
  children: ReactNode;
}) {
  const { colors } = useAppColors();

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      hitSlop={8}
      style={({ pressed }) => ({
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: colors.chipBg,
        alignItems: "center",
        justifyContent: "center",
        opacity: pressed ? 0.7 : 1,
      })}
    >
      {children}
    </Pressable>
  );
}
