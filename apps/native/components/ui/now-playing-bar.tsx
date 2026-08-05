import { useRouter } from "expo-router";
import { Pressable, View } from "react-native";

import { useAudioPlayer } from "@/stores";

import { Equaliser } from "./equaliser";
import { PauseIcon, PlayIcon } from "./icons";
import { StationArtwork } from "./station-artwork";
import { Text } from "./text";
import { useAppColors } from "./theme";

/**
 * The persistent Now Playing bar.
 *
 * This is TWO components in the design, not one bar in two positions — every
 * measurement differs:
 *
 * |            | `dashboard`      | `search`            |
 * |------------|------------------|---------------------|
 * | bottom     | 34               | 118 (above tab bar) |
 * | height     | 66               | 62                  |
 * | radius     | 24               | 22                  |
 * | avatar     | 44, radius 15    | 42, radius 14       |
 * | title      | 14.5px           | 14px                |
 * | trailing   | 40               | 38                  |
 *
 * Both share `left/right 14`, `padding 0 12` (11 on search), `gap 12`, glass
 * fill + 1px border.
 */

type Variant = "dashboard" | "search";

const VARIANTS = {
  dashboard: {
    bottom: 34,
    height: 66,
    radius: 24,
    avatar: 44,
    avatarRadius: 15,
    title: 14.5,
    trailing: 40,
    paddingHorizontal: 12,
    pauseIcon: 15,
  },
  search: {
    bottom: 118,
    height: 62,
    radius: 22,
    avatar: 42,
    avatarRadius: 14,
    title: 14,
    trailing: 38,
    paddingHorizontal: 11,
    pauseIcon: 15,
  },
} as const satisfies Record<Variant, object>;

export function NowPlayingBar({ variant = "dashboard" }: { variant?: Variant }) {
  const router = useRouter();
  const { colors } = useAppColors();
  const v = VARIANTS[variant];

  const station = useAudioPlayer((s) => s.currentStation);
  const isPlaying = useAudioPlayer((s) => s.isPlaying);
  const togglePlayback = useAudioPlayer((s) => s.togglePlayback);

  // Nothing playing — the design has no idle state for this bar, so it's absent
  // rather than empty. Screens reserve the space via their scroll padding.
  if (!station) return null;

  const subtitle = [station.state?.trim(), station.country?.trim()]
    .filter(Boolean)
    .join(", ");

  return (
    <Pressable
      onPress={() => router.push("/player")}
      accessibilityRole="button"
      accessibilityLabel={`Now playing: ${station.name}. Open player.`}
      style={({ pressed }) => ({
        position: "absolute",
        left: 14,
        right: 14,
        bottom: v.bottom,
        height: v.height,
        borderRadius: v.radius,
        backgroundColor: colors.glass,
        borderWidth: 1,
        borderColor: colors.glassBorder,
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        paddingHorizontal: v.paddingHorizontal,
        opacity: pressed ? 0.9 : 1,
      })}
    >
      {/* Falls back to initials rather than a bare gradient — an unlabelled
          colour block gave the bar no way to identify the station when the
          favicon was missing. */}
      <StationArtwork
        station={station}
        size={v.avatar}
        radius={v.avatarRadius}
        palette="station"
        initialsSize={v.avatar * 0.34}
        align="center"
        padding={0}
      />

      <View style={{ flex: 1, minWidth: 0 }}>
        <Text
          weight="500"
          numberOfLines={1}
          style={{ fontSize: v.title, letterSpacing: -0.22, color: colors.text }}
        >
          {station.name}
        </Text>
        {subtitle ? (
          <Text
            weight="300"
            numberOfLines={1}
            style={{ marginTop: 1, fontSize: 11.5, color: colors.muted }}
          >
            {subtitle}
          </Text>
        ) : null}
      </View>

      <Equaliser active={isPlaying} />

      <Pressable
        onPress={() => togglePlayback()}
        accessibilityRole="button"
        accessibilityLabel={isPlaying ? "Pause" : "Play"}
        hitSlop={8}
        style={({ pressed }) => ({
          width: v.trailing,
          height: v.trailing,
          borderRadius: v.trailing / 2,
          backgroundColor: colors.chipBg,
          alignItems: "center",
          justifyContent: "center",
          opacity: pressed ? 0.7 : 1,
        })}
      >
        {isPlaying ? (
          <PauseIcon size={v.pauseIcon} color={colors.text} />
        ) : (
          <PlayIcon size={v.pauseIcon} color={colors.text} />
        )}
      </Pressable>
    </Pressable>
  );
}
