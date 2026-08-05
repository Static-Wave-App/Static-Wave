import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { View } from "react-native";
import Svg, { Path, Rect } from "react-native-svg";

import {
  HomeIndicator,
  OnboardingHeader,
  OnboardingScreen,
  PrimaryCta,
  ProgressDots,
  useOnboardingTheme,
} from "@/components/onboarding/chrome";
import { Eyebrow, Text } from "@/components/ui/text";
import { useAudioPlayer, useOnboarding } from "@/stores";

export default function BackgroundPermissionScreen() {
  const router = useRouter();
  const { theme } = useOnboardingTheme();
  const finish = useOnboarding((s) => s.finish);
  const currentStation = useAudioPlayer((s) => s.currentStation);

  // Last screen — completing here releases the gate in (onboarding)/_layout.tsx
  // and the drawer takes over.
  const complete = () => {
    finish();
    router.replace("/(drawer)");
  };

  // The mock preview uses whatever is actually playing from the AHA step.
  const previewTitle = currentStation?.name ?? "Rive Gauche FM";
  const previewSubtitle = currentStation
    ? [currentStation.tags.split(",")[0]?.trim(), currentStation.country]
        .filter(Boolean)
        .join(" · ")
    : "Jazz · Paris";

  return (
    <OnboardingScreen
      glow={{ color: "#22D3EE", opacity: 0.2, cx: 0.5, cy: 0.22, rx: 1.1, ry: 0.45 }}
    >
      <OnboardingHeader onSkip={complete} />

      <View style={{ alignItems: "center", paddingTop: 38 }}>
        <LinearGradient
          colors={["#2E7BFF", "#22D3EE"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0.8, y: 1 }}
          style={{ width: 96, height: 96, borderRadius: 30, alignItems: "center", justifyContent: "center" }}
        >
          <Svg width={40} height={40} viewBox="0 0 24 24" fill="none">
            <Path d="M9 18V5l10-2v13" stroke="#FFFFFF" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
            <Rect x={3} y={15} width={6} height={6} rx={3} stroke="#FFFFFF" strokeWidth={2} />
            <Rect x={13} y={13} width={6} height={6} rx={3} stroke="#FFFFFF" strokeWidth={2} />
          </Svg>
        </LinearGradient>
      </View>

      <View style={{ paddingHorizontal: 36, paddingTop: 32, alignItems: "center" }}>
        <Text
          variant="display-lg"
          style={{ fontSize: 27, lineHeight: 32, textAlign: "center", color: theme.text }}
        >
          Keep playing while{"\n"}you do other things
        </Text>
        <Text
          variant="body-lg"
          weight="300"
          style={{ marginTop: 12, fontSize: 15.5, lineHeight: 25, textAlign: "center", color: theme.muted }}
        >
          Audio continues when you lock the screen or switch apps, with controls on the lock screen.
        </Text>
      </View>

      {/* Lock screen preview card */}
      <View
        style={{
          marginHorizontal: 24,
          marginTop: 34,
          borderRadius: 26,
          backgroundColor: theme.surface,
          borderWidth: 1,
          borderColor: theme.chipBorder,
          padding: 16,
        }}
      >
        <Eyebrow variant="mono-2xs" style={{ color: theme.dim, paddingLeft: 4, paddingBottom: 12 }}>
          LOCK SCREEN
        </Eyebrow>

        <View
          style={{
            borderRadius: 20,
            backgroundColor: theme.chipBg,
            padding: 14,
            flexDirection: "row",
            alignItems: "center",
            gap: 13,
          }}
        >
          <LinearGradient
            colors={["#FF2FD6", "#8B3DFF"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ width: 48, height: 48, borderRadius: 15 }}
          />
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text variant="body-md" weight="500" style={{ fontSize: 14.5, color: theme.text }} numberOfLines={1}>
              {previewTitle}
            </Text>
            <Text variant="body-xs" weight="300" style={{ marginTop: 2, color: theme.muted }} numberOfLines={1}>
              {previewSubtitle}
            </Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 14 }}>
            <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
              <Rect x={6} y={4} width={4} height={16} rx={1.5} fill={theme.muted} />
              <Rect x={14} y={4} width={4} height={16} rx={1.5} fill={theme.muted} />
            </Svg>
            <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
              <Rect x={5} y={5} width={14} height={14} rx={2} fill={theme.muted} />
            </Svg>
          </View>
        </View>
      </View>

      <ProgressDots step={5} />

      <PrimaryCta
        label="Allow background audio"
        withArrow={false}
        onPress={complete}
        style={{ position: "absolute", left: 24, right: 24, bottom: 40 }}
      />

      <HomeIndicator />
    </OnboardingScreen>
  );
}
