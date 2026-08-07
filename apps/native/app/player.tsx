import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import type { ReactNode } from "react";
import { useRef } from "react";
import { ActivityIndicator, Pressable, View } from "react-native";

import { StateBlock } from "@/components/ui/async-boundary";
import { Waveform } from "@/components/ui/equaliser";
import { GLOW } from "@/components/ui/glow";
import {
  ChevronDownWideIcon,
  HeartIcon,
  MoonIcon,
  MoreIcon,
  PauseIcon,
  PlayIcon,
} from "@/components/ui/icons";
import { Screen } from "@/components/ui/screen";
import { StationArtwork } from "@/components/ui/station-artwork";
import { Eyebrow, Text } from "@/components/ui/text";
import { useAppColors } from "@/components/ui/theme";
import { SleepTimerSheet } from "@/components/player/sleep-timer-sheet";
import type { SleepTimerSheetRef } from "@/components/player/sleep-timer-sheet";
import { formatCountdown } from "@/lib/format";
import { shareStation } from "@/lib/share";
import { useAudioPlayer, useFavorites, useSleepTimer } from "@/stores";

/**
 * Player — spec: systems/screen-specs.md §05.
 *
 * Two deviations from the design file, both deliberate (handover §8):
 *
 *  - The volume slider is not built. expo-audio exposes no system volume
 *    control, and a slider that moved without changing anything would be a lie.
 *  - There are no next/previous transport buttons. Radio has no queue; the
 *    design's two side buttons are favourite and sleep timer, which is what
 *    they are here.
 *
 * The 26-bar waveform IS in the design file but was missing from screen-specs;
 * its heights and per-bar colours are in `components/ui/equaliser.tsx`.
 */

/** Nav row: 40×40, radius 14, chip fill + border. */
function NavButton({
  onPress,
  accessibilityLabel,
  children,
}: {
  onPress: () => void;
  accessibilityLabel: string;
  children: ReactNode;
}) {
  const { colors } = useAppColors();

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
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
      {children}
    </Pressable>
  );
}

/** Transport side button: 52×52, radius 19, chip fill + border. */
function TransportButton({
  onPress,
  accessibilityLabel,
  selected = false,
  children,
}: {
  onPress: () => void;
  accessibilityLabel: string;
  selected?: boolean;
  children: ReactNode;
}) {
  const { colors } = useAppColors();

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ selected }}
      style={({ pressed }) => ({
        width: 52,
        height: 52,
        borderRadius: 19,
        backgroundColor: colors.chipBg,
        borderWidth: 1,
        borderColor: colors.chipBorder,
        alignItems: "center",
        justifyContent: "center",
        opacity: pressed ? 0.7 : 1,
      })}
    >
      {children}
    </Pressable>
  );
}

export default function PlayerScreen() {
  const router = useRouter();
  const { colors } = useAppColors();
  const sheetRef = useRef<SleepTimerSheetRef | null>(null);

  const station = useAudioPlayer((s) => s.currentStation);
  const isPlaying = useAudioPlayer((s) => s.isPlaying);
  const isLoading = useAudioPlayer((s) => s.isLoading);
  const error = useAudioPlayer((s) => s.error);
  const isOffline = useAudioPlayer((s) => s.isOffline);
  const togglePlayback = useAudioPlayer((s) => s.togglePlayback);
  const play = useAudioPlayer((s) => s.play);

  const toggleFavorite = useFavorites((s) => s.toggle);
  const isFavorite = useFavorites((s) =>
    station ? s.favorites.some((f) => f.stationuuid === station.stationuuid) : false,
  );

  const timerActive = useSleepTimer((s) => s.isActive);
  const remainingSeconds = useSleepTimer((s) => s.remainingSeconds);

  if (!station) {
    return (
      <Screen glow={GLOW.player}>
        <View style={{ flexDirection: "row", paddingHorizontal: 20, paddingTop: 22 }}>
          <NavButton onPress={() => router.back()} accessibilityLabel="Close player">
            <ChevronDownWideIcon size={19} color={colors.text} />
          </NavButton>
        </View>
        <StateBlock
          title="Nothing playing"
          body="Pick a station and it'll show up here."
        />
      </Screen>
    );
  }

  const subtitle = [
    [station.state?.trim(), station.country?.trim()].filter(Boolean).join(", "),
    station.bitrate > 0 ? `${station.bitrate} kbps` : null,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <Screen glow={GLOW.player}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: 20,
          paddingTop: 22,
        }}
      >
        <NavButton onPress={() => router.back()} accessibilityLabel="Close player">
          <ChevronDownWideIcon size={19} color={colors.text} />
        </NavButton>

        <Eyebrow variant="mono-2xs" style={{ fontSize: 10, letterSpacing: 1.8, color: colors.muted }}>
          NOW PLAYING
        </Eyebrow>

        <NavButton
          onPress={() => shareStation(station)}
          accessibilityLabel={`Share ${station.name}`}
        >
          <MoreIcon size={18} color={colors.text} />
        </NavButton>
      </View>

      {/* Artwork 298×298, radius 44, `140deg #FF2FD6, #8B3DFF 45%, #2E7BFF 74%,
          #22D3EE`. Initials sit bottom-left with 26px padding — not centred.
          Renders the station favicon when there is one; this screen used to
          show initials only, which is why art visible in the now-playing dock
          vanished the moment you opened the Player. */}
      <View style={{ alignItems: "center", paddingTop: 32 }}>
        <StationArtwork
          station={station}
          size={298}
          radius={44}
          initialsSize={60}
          padding={26}
          isLoading={isLoading}
        />
      </View>

      <View style={{ alignItems: "center", paddingHorizontal: 32, paddingTop: 32 }}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 7,
            height: 26,
            paddingHorizontal: 12,
            borderRadius: 13,
            backgroundColor: colors.chipBg,
            borderWidth: 1,
            borderColor: colors.chipBorder,
          }}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color={colors.onAir} />
          ) : (
            <View
              style={{
                width: 6,
                height: 6,
                borderRadius: 3,
                backgroundColor: error ? colors.dim : colors.onAir,
              }}
            />
          )}
          <Eyebrow variant="mono-2xs" style={{ letterSpacing: 1.52, color: colors.text }}>
            {/* Was `error ? "OFFLINE" : ...` — labelled EVERY playback failure
                "offline" regardless of cause, telling users their internet
                was down when the actual problem was often a dead stream
                connection with a perfectly fine network underneath. */}
            {error
              ? isOffline
                ? "OFFLINE"
                : "STREAM ERROR"
              : isLoading
                ? "CONNECTING"
                : "LIVE"}
          </Eyebrow>
        </View>

        <Text
          weight="600"
          numberOfLines={2}
          style={{
            marginTop: 14,
            fontSize: 28,
            lineHeight: 32,
            letterSpacing: -0.84,
            textAlign: "center",
            color: colors.text,
          }}
        >
          {station.name}
        </Text>

        {subtitle ? (
          <Text
            weight="300"
            style={{ marginTop: 5, fontSize: 14.5, color: colors.muted }}
          >
            {subtitle}
          </Text>
        ) : null}

        {error ? (
          <Pressable
            onPress={() => play(station)}
            accessibilityRole="button"
            style={({ pressed }) => ({ marginTop: 10, opacity: pressed ? 0.6 : 1 })}
          >
            <Text variant="body-md" style={{ color: "#8B3DFF" }}>
              {error} · Try again
            </Text>
          </Pressable>
        ) : null}
      </View>

      <Waveform active={isPlaying} />

      {/* Sleep timer countdown. The design has a volume slider in this slot;
          it's excluded (expo-audio has no volume control to bind it to), and
          the timer is the state the user actually needs to see here. */}
      {timerActive ? (
        <View style={{ alignItems: "center", paddingTop: 18 }}>
          <Eyebrow variant="mono-2xs" style={{ color: colors.muted }}>
            {`SLEEPS IN ${formatCountdown(remainingSeconds)}`}
          </Eyebrow>
        </View>
      ) : null}

      {/* Transport: `bottom 52`, gap 36, centred. */}
      <View
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 52,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          gap: 36,
        }}
      >
        <TransportButton
          onPress={() => toggleFavorite(station)}
          accessibilityLabel={isFavorite ? "Remove from favorites" : "Save to favorites"}
          selected={isFavorite}
        >
          <HeartIcon
            size={21}
            color={colors.muted}
            gradient={isFavorite}
            gradientId="player-heart"
          />
        </TransportButton>

        {/* Play / pause: 84×84 circle, `135deg #FF2FD6, #8B3DFF 50%, #2E7BFF`. */}
        <Pressable
          onPress={() => togglePlayback()}
          accessibilityRole="button"
          accessibilityLabel={isPlaying ? "Pause" : "Play"}
          style={({ pressed }) => ({ opacity: pressed ? 0.9 : 1 })}
        >
          <LinearGradient
            colors={["#FF2FD6", "#8B3DFF", "#2E7BFF"]}
            locations={[0, 0.5, 1]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              width: 84,
              height: 84,
              borderRadius: 42,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : isPlaying ? (
              <PauseIcon size={26} />
            ) : (
              <PlayIcon size={26} />
            )}
          </LinearGradient>
        </Pressable>

        <TransportButton
          onPress={() => sheetRef.current?.open()}
          accessibilityLabel={timerActive ? "Sleep timer running" : "Set sleep timer"}
          selected={timerActive}
        >
          <MoonIcon size={21} color={timerActive ? colors.onAir : colors.muted} />
        </TransportButton>
      </View>

      <SleepTimerSheet ref={sheetRef} />
    </Screen>
  );
}
