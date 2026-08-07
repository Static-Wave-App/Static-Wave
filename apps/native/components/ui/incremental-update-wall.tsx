import { LinearGradient } from "expo-linear-gradient";
import { useCallback, useEffect } from "react";
import { BackHandler, Linking, Pressable, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Text } from "@/components/ui/text";
import { ANDROID_PACKAGE, TARGET_VERSION } from "@/lib/incremental-update";

const BG = "#08080A";
const FG = "#FAFAFC";
const MUTED = "#9C9CA8";
const GRADIENT = ["#FF2FD6", "#8B3DFF", "#2E7BFF"] as const;

type IncrementalUpdateWallProps = {
  title?: string;
  body?: string;
  ctaLabel?: string;
};

/**
 * A full-screen, unclosable "go update" wall.
 *
 * Reusable by design — every field is a prop with a default, so the next
 * forced update just needs new copy passed in from app/_layout.tsx, not a
 * new component. See lib/incremental-update.ts for the flag that toggles
 * this on and the release sequence for shipping it safely.
 *
 * Deliberately self-contained: no theme context, no store reads, hardcoded
 * dark palette regardless of the user's app theme. This has to render
 * correctly on its own — including on an old, already-shipped native binary
 * receiving this as an OTA update — so it doesn't lean on anything that
 * could itself be mid-change.
 *
 * There is no dismiss path anywhere in this file. app/_layout.tsx renders
 * ONLY this when the flag is on — no navigator underneath, nothing to
 * reveal. The Android hardware back button is swallowed too, so it can't be
 * used to back out from under it.
 */
export function IncrementalUpdateWall({
  title = "A quick update is waiting",
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
    <View
      style={{
        flex: 1,
        backgroundColor: BG,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 32,
        paddingTop: insets.top,
        paddingBottom: insets.bottom + 24,
      }}
    >
      <View style={{ width: 64, height: 64, borderRadius: 22, marginBottom: 28, overflow: "hidden" }}>
        <LinearGradient
          colors={GRADIENT}
          locations={[0, 0.5, 1]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ flex: 1 }}
        />
      </View>

      <Text
        weight="600"
        style={{
          fontSize: 22,
          lineHeight: 28,
          color: FG,
          textAlign: "center",
          marginBottom: 12,
        }}
      >
        {title}
      </Text>

      <Text
        weight="300"
        style={{
          fontSize: 15,
          lineHeight: 21,
          color: MUTED,
          textAlign: "center",
          marginBottom: 36,
        }}
      >
        {body}
      </Text>

      <Pressable
        onPress={openStore}
        accessibilityRole="button"
        accessibilityLabel={ctaLabel}
        style={({ pressed }) => ({ width: "100%", opacity: pressed ? 0.9 : 1 })}
      >
        <LinearGradient
          colors={GRADIENT}
          locations={[0, 0.5, 1]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            height: 54,
            borderRadius: 18,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text weight="600" style={{ fontSize: 16, color: "#FFFFFF" }}>
            {ctaLabel}
          </Text>
        </LinearGradient>
      </Pressable>
    </View>
  );
}
