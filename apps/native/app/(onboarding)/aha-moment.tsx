import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Pressable, View } from "react-native";
import Svg, { Path, Polyline } from "react-native-svg";

import {
  HomeIndicator,
  OnboardingScreen,
  PrimaryCta,
  useOnboardingTheme,
} from "@/components/onboarding/chrome";
import { Eyebrow, Text } from "@/components/ui/text";
import { getStationsByCountry, getStationsByTag } from "@/lib/api";
import { formatBitrate, getStationInitials, getStationTags } from "@/lib/format";
import { useAudioPlayer, useOnboarding } from "@/stores";
import type { Station } from "@static-wave/types";

export default function AhaMomentScreen() {
  const router = useRouter();
  const { theme } = useOnboardingTheme();

  const genres = useOnboarding((s) => s.selectedGenres);
  const country = useOnboarding((s) => s.selectedCountry);
  const play = useAudioPlayer((s) => s.play);
  const isPlaying = useAudioPlayer((s) => s.isPlaying);

  const [station, setStation] = useState<Station | null>(null);
  const [pool, setPool] = useState<Station[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch a handful matching the user's picks, then auto-play the first —
  // this is the AHA moment from plans/onboarding.md.
  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      const primary = genres[0];
      try {
        const results = primary
          ? await getStationsByTag(primary, { limit: 12 })
          : country
            ? await getStationsByCountry(country, { limit: 12 })
            : [];
        if (cancelled) return;
        const playable = results.filter((s) => s.urlResolved || s.url);
        setPool(playable);
        setStation(playable[0] ?? null);
      } catch {
        if (!cancelled) setStation(null);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [genres, country]);

  useEffect(() => {
    if (station) play(station);
  }, [station, play]);

  const tryAnother = useCallback(() => {
    if (pool.length < 2 || !station) return;
    const idx = pool.findIndex((s) => s.stationuuid === station.stationuuid);
    setStation(pool[(idx + 1) % pool.length]);
  }, [pool, station]);

  const subtitle = station
    ? [
        getStationTags(station, 1)[0],
        [station.state?.trim(), station.country?.trim()].filter(Boolean).join(", "),
        formatBitrate(station.bitrate),
      ]
        .filter(Boolean)
        .join(" · ")
    : "";

  return (
    <OnboardingScreen
      glow={{ color: "#FF2FD6", opacity: 0.24, cx: 0.5, cy: 0.36, rx: 0.95, ry: 0.42 }}
    >
      <View style={{ paddingHorizontal: 40, paddingTop: 56, alignItems: "center" }}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 7,
            height: 28,
            paddingHorizontal: 13,
            borderRadius: 14,
            backgroundColor: theme.chipBg,
            borderWidth: 1,
            borderColor: theme.chipBorder,
          }}
        >
          <View
            style={{
              width: 6,
              height: 6,
              borderRadius: 3,
              backgroundColor: isPlaying ? "#22D3EE" : theme.muted,
            }}
          />
          <Eyebrow variant="mono-2xs" style={{ color: theme.text }}>
            NOW PLAYING
          </Eyebrow>
        </View>

        <Text
          variant="display-lg"
          style={{ marginTop: 18, fontSize: 28, lineHeight: 32, textAlign: "center", color: theme.text }}
        >
          We found this{"\n"}for you
        </Text>
      </View>

      {/* 246x246 artwork tile, radius 40, initials bottom-left at 52px */}
      <View style={{ alignItems: "center", paddingTop: 34 }}>
        <LinearGradient
          colors={["#FF2FD6", "#8B3DFF", "#2E7BFF", "#22D3EE"]}
          locations={[0, 0.48, 0.8, 1]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0.85, y: 1 }}
          style={{
            width: 246,
            height: 246,
            borderRadius: 40,
            justifyContent: "flex-end",
            padding: 24,
          }}
        >
          {isLoading ? (
            <ActivityIndicator color="rgba(255,255,255,0.94)" />
          ) : (
            <Text
              variant="display-2xl"
              style={{
                fontSize: 52,
                lineHeight: 47,
                letterSpacing: -2.6,
                color: "rgba(255,255,255,0.94)",
              }}
            >
              {station ? getStationInitials(station.name) : "?"}
            </Text>
          )}
        </LinearGradient>
      </View>

      <View style={{ paddingHorizontal: 40, paddingTop: 26, alignItems: "center" }}>
        <Text
          variant="display-md"
          style={{ fontSize: 24, textAlign: "center", color: theme.text }}
          numberOfLines={1}
        >
          {station ? station.name : isLoading ? "Finding a station…" : "No station found"}
        </Text>
        <Text
          variant="body-md"
          weight="300"
          style={{ marginTop: 6, fontSize: 14.5, textAlign: "center", color: theme.muted }}
        >
          {subtitle}
        </Text>
      </View>

      <View
        style={{
          position: "absolute",
          left: 24,
          right: 24,
          bottom: 40,
          gap: 14,
        }}
      >
        <PrimaryCta
          label="Sounds good — let's go"
          withArrow={false}
          // Deliberately does NOT call finish() — that flips the gate in
          // (onboarding)/_layout.tsx and would skip the two permission screens.
          onPress={() => router.push("/(onboarding)/notification-permission")}
        />

        <Pressable
          onPress={tryAnother}
          disabled={pool.length < 2}
          accessibilityRole="button"
          style={({ pressed }) => ({
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            opacity: pool.length < 2 ? 0.4 : pressed ? 0.7 : 1,
          })}
        >
          <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
            <Path
              d="M20 12a8 8 0 1 1-2.3-5.6"
              stroke={theme.muted}
              strokeWidth={2}
              strokeLinecap="round"
            />
            <Polyline
              points="20 4 20 9 15 9"
              stroke={theme.muted}
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
          <Text variant="body-md" style={{ fontSize: 14.5, color: theme.muted }}>
            Try another station
          </Text>
        </Pressable>
      </View>

      <HomeIndicator />
    </OnboardingScreen>
  );
}
