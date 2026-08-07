import { LinearGradient } from "expo-linear-gradient";
import { useCallback, useEffect } from "react";
import { BackHandler, Linking, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Defs, RadialGradient, Rect, Stop } from "react-native-svg";

import { PrimaryCta } from "@/components/onboarding/chrome";
import { Text } from "@/components/ui/text";
import { ANDROID_PACKAGE, TARGET_VERSION } from "@/lib/incremental-update";

// Hardcoded, not read from useAppColors()/useOnboardingTheme() — see the
// component doc below for why. Values are the DARK row of both theme.ts and
// onboarding/chrome.tsx, copied verbatim, not approximated.
const BG = "#08080A";
const FG = "#FAFAFC";
const MUTED = "#9C9CA8";
const MARK_BAR = "rgba(10,10,12,0.82)";
const RING_OUTER = "rgba(139,61,255,0.16)";
const RING_INNER = "rgba(139,61,255,0.30)";
const BRAND_GRADIENT = ["#FF2FD6", "#8B3DFF", "#2E7BFF", "#22D3EE"] as const;

/**
 * Ambient background glow — identical treatment to Screen/OnboardingScreen's
 * GlowLayer (110% 50% at 50% 34%, rgba(139,61,255,0.30) — the "welcome" glow
 * from glow.ts), reimplemented here rather than imported since both existing
 * versions are unexported internals of files that also pull in theme context.
 */
function GlowLayer() {
  return (
    <View pointerEvents="none" style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}>
      <Svg width="100%" height="100%">
        <Defs>
          <RadialGradient id="wallGlow" cx="50%" cy="34%" rx="110%" ry="50%" gradientUnits="userSpaceOnUse">
            <Stop offset="0" stopColor="#8B3DFF" stopOpacity={0.3} />
            <Stop offset="0.7" stopColor="#8B3DFF" stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Rect x="0" y="0" width="100%" height="100%" fill="url(#wallGlow)" />
      </Svg>
    </View>
  );
}

/**
 * The real app mark — same five-bar geometry as onboarding/chrome.tsx's
 * WaveMark (180x180, radius 52, gradient 0/0.45/0.78/1, bar heights
 * 38/74/110/62/28) — reimplemented with a hardcoded bar colour instead of
 * `useOnboardingTheme()`, for the same reason as the palette above.
 */
function WallMark({ size = 120 }: { size?: number }) {
  const scale = size / 180;
  const heights = [38, 74, 110, 62, 28];

  return (
    <LinearGradient
      colors={BRAND_GRADIENT}
      locations={[0, 0.45, 0.78, 1]}
      start={{ x: 0, y: 0 }}
      end={{ x: 0.85, y: 1 }}
      style={{
        width: size,
        height: size,
        borderRadius: 52 * scale,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 9 * scale,
      }}
    >
      {heights.map((h, i) => (
        <View
          key={i}
          style={{
            width: 9 * scale,
            height: h * scale,
            borderRadius: 5 * scale,
            backgroundColor: MARK_BAR,
          }}
        />
      ))}
    </LinearGradient>
  );
}

type IncrementalUpdateWallProps = {
  title?: string;
  body?: string;
  ctaLabel?: string;
};

/**
 * A full-screen, unclosable "go update" wall — same glow, rings, mark, type
 * scale, and CTA styling as the onboarding welcome screen, so it reads as
 * part of the app rather than a bolted-on native alert.
 *
 * Reusable by design — every field is a prop with a default, so the next
 * forced update just needs new copy passed in from app/_layout.tsx, not a
 * new component. See lib/incremental-update.ts for the flag that toggles
 * this on and the release sequence for shipping it safely.
 *
 * Deliberately self-contained: no theme context, no store reads, hardcoded
 * dark palette regardless of the user's app theme setting. This has to
 * render correctly on its own — including on an old, already-shipped native
 * binary receiving this as an OTA update — so it doesn't lean on anything
 * (AppThemeProvider, a hydrated store) that could itself be mid-change.
 * `PrimaryCta` is imported directly rather than copied — it's already
 * hook-free, so it's exactly as safe as inlining it.
 *
 * There is no dismiss path anywhere in this file. app/_layout.tsx renders
 * ONLY this when the flag is on — no navigator underneath, nothing to
 * reveal. The Android hardware back button is swallowed too, so it can't be
 * used to back out from under it.
 */
export function IncrementalUpdateWall({
  title = "A quick update\nis waiting.",
  body = `We shipped a fix for some real playback issues — stations that wouldn't play, offline states that never cleared. Update to ${TARGET_VERSION} to keep listening.`,
  ctaLabel = "Update on Google Play",
}: IncrementalUpdateWallProps) {
  const insets = useSafeAreaInsets();

  useEffect(() => {
    const sub = BackHandler.addEventListener("hardwareBackPress", () => true);
    return () => sub.remove();
  }, []);

  const openStore = useCallback(() => {
    const marketUrl = `market://details?id=${ANDROID_PACKAGE}`;
    const webUrl = `https://play.google.com/store/apps/details?id=${ANDROID_PACKAGE}`;
    Linking.openURL(marketUrl).catch(() => {
      Linking.openURL(webUrl).catch(() => {});
    });
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: BG }}>
      <GlowLayer />

      <View style={{ flex: 1, paddingTop: insets.top }}>
        <View style={{ alignItems: "center", paddingTop: 52 }}>
          <View pointerEvents="none" style={{ position: "absolute", top: 8 }}>
            <View style={{ width: 240, height: 240, borderRadius: 120, borderWidth: 1, borderColor: RING_OUTER }} />
          </View>
          <View pointerEvents="none" style={{ position: "absolute", top: 34 }}>
            <View style={{ width: 188, height: 188, borderRadius: 94, borderWidth: 1, borderColor: RING_INNER }} />
          </View>
          <WallMark size={120} />
        </View>

        <View style={{ paddingHorizontal: 32, paddingTop: 44, alignItems: "center" }}>
          <Text variant="display-lg" style={{ textAlign: "center", color: FG }}>
            {title}
          </Text>

          <Text
            variant="body-lg"
            weight="300"
            style={{ marginTop: 16, textAlign: "center", color: MUTED }}
          >
            {body}
          </Text>
        </View>

        <PrimaryCta
          label={ctaLabel}
          onPress={openStore}
          style={{ position: "absolute", left: 24, right: 24, bottom: insets.bottom + 24 }}
        />
      </View>
    </View>
  );
}
