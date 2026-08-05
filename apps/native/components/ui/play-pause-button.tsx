import { ActivityIndicator, Pressable } from "react-native";

import { useStationPlayback } from "@/hooks/use-station-playback";
import type { Station } from "@static-wave/types";

import { PauseIcon, PlayIcon } from "./icons";
import { useAppColors } from "./theme";

/**
 * The circular play control used in every list and card.
 *
 * Wraps `useStationPlayback` so the glyph always matches reality: a station
 * that's already playing shows a pause icon and pauses, rather than showing
 * play and silently restarting the stream.
 *
 * Sizes come from the design — 34 on the dashboard rails and suggestion rows,
 * 36 on Favorites and Recently Played.
 */
export function PlayPauseButton({
  station,
  size = 34,
  iconSize,
  /** `chip` for list rows, `glass` for the tile overlay on the dashboard rail. */
  surface = "chip",
}: {
  station: Station;
  size?: number;
  iconSize?: number;
  surface?: "chip" | "glass";
}) {
  const { colors } = useAppColors();
  const { isPlaying, isLoading, toggle } = useStationPlayback(station);

  const glyph = iconSize ?? Math.round(size * 0.4);

  return (
    <Pressable
      onPress={toggle}
      accessibilityRole="button"
      accessibilityState={{ selected: isPlaying }}
      accessibilityLabel={
        isPlaying ? `Pause ${station.name}` : `Play ${station.name}`
      }
      hitSlop={8}
      style={({ pressed }) => ({
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: surface === "glass" ? colors.glass : colors.chipBg,
        alignItems: "center",
        justifyContent: "center",
        opacity: pressed ? 0.7 : 1,
      })}
    >
      {isLoading ? (
        <ActivityIndicator size="small" color={colors.muted} />
      ) : isPlaying ? (
        <PauseIcon size={glyph} color={colors.text} />
      ) : (
        <PlayIcon size={glyph} color={colors.muted} />
      )}
    </Pressable>
  );
}
