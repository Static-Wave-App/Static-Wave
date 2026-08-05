import * as Notifications from "expo-notifications";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { View } from "react-native";
import Svg, { Circle, Path } from "react-native-svg";

import {
  HomeIndicator,
  OnboardingHeader,
  OnboardingScreen,
  PrimaryCta,
  ProgressDots,
  useOnboardingTheme,
} from "@/components/onboarding/chrome";
import { Text } from "@/components/ui/text";
import { useOnboarding } from "@/stores";

function FeatureRow({
  gradient,
  title,
  subtitle,
  icon,
}: {
  gradient: [string, string];
  title: string;
  subtitle: string;
  icon: React.ReactNode;
}) {
  const { theme } = useOnboardingTheme();
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 14, paddingVertical: 14 }}>
      <LinearGradient
        colors={gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ width: 40, height: 40, borderRadius: 14, alignItems: "center", justifyContent: "center" }}
      >
        {icon}
      </LinearGradient>
      <View style={{ flex: 1 }}>
        <Text variant="body-lg" weight="500" style={{ color: theme.text }}>
          {title}
        </Text>
        <Text variant="body-sm" weight="300" style={{ marginTop: 2, fontSize: 12.5, color: theme.muted }}>
          {subtitle}
        </Text>
      </View>
    </View>
  );
}

export default function NotificationPermissionScreen() {
  const router = useRouter();
  const { theme } = useOnboardingTheme();
  const finish = useOnboarding((s) => s.finish);

  const next = () => router.push("/(onboarding)/background-permission");

  const request = async () => {
    try {
      await Notifications.requestPermissionsAsync();
    } catch {
      // Declining is a valid outcome — onboarding continues either way.
    }
    next();
  };

  return (
    <OnboardingScreen
      glow={{ color: "#8B3DFF", opacity: 0.22, cx: 0.5, cy: 0.22, rx: 1.1, ry: 0.45 }}
    >
      <OnboardingHeader onSkip={finish} />

      <View style={{ alignItems: "center", paddingTop: 38 }}>
        <LinearGradient
          colors={["#8B3DFF", "#2E7BFF"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0.8, y: 1 }}
          style={{ width: 96, height: 96, borderRadius: 30, alignItems: "center", justifyContent: "center" }}
        >
          <Svg width={40} height={40} viewBox="0 0 24 24" fill="none">
            <Path
              d="M18 8a6 6 0 1 0-12 0c0 7-3 8-3 8h18s-3-1-3-8"
              stroke="#FFFFFF"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <Path d="M13.7 21a2 2 0 0 1-3.4 0" stroke="#FFFFFF" strokeWidth={2} strokeLinecap="round" />
          </Svg>
        </LinearGradient>
      </View>

      <View style={{ paddingHorizontal: 36, paddingTop: 32, alignItems: "center" }}>
        <Text
          variant="display-lg"
          style={{ fontSize: 27, lineHeight: 32, textAlign: "center", color: theme.text }}
        >
          Never miss a good{"\n"}set again
        </Text>
        <Text
          variant="body-lg"
          weight="300"
          style={{ marginTop: 12, fontSize: 15.5, lineHeight: 25, textAlign: "center", color: theme.muted }}
        >
          We&apos;ll send a nudge when a station you love goes live, and when your sleep timer is about to end.
        </Text>
      </View>

      <View
        style={{
          marginHorizontal: 24,
          marginTop: 32,
          borderRadius: 26,
          backgroundColor: theme.surface,
          borderWidth: 1,
          borderColor: theme.chipBorder,
          paddingHorizontal: 16,
          paddingVertical: 6,
        }}
      >
        <FeatureRow
          gradient={["#FF2FD6", "#8B3DFF"]}
          title="Sleep timer alerts"
          subtitle="Before the audio fades out"
          icon={
            <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
              <Circle cx={12} cy={13} r={8} stroke="#FFFFFF" strokeWidth={2} />
              <Path d="M12 9v4l2.5 2" stroke="#FFFFFF" strokeWidth={2} strokeLinecap="round" />
            </Svg>
          }
        />
        <View style={{ height: 1, backgroundColor: theme.hairline }} />
        <FeatureRow
          gradient={["#2E7BFF", "#22D3EE"]}
          title="Station recommendations"
          subtitle="A handful a week, never more"
          icon={
            <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
              <Path
                d="M4 18V9a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2zM8 7l8-4"
                stroke="#FFFFFF"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
          }
        />
      </View>

      <ProgressDots step={4} />

      <PrimaryCta
        label="Turn on notifications"
        withArrow={false}
        onPress={request}
        style={{ position: "absolute", left: 24, right: 24, bottom: 40 }}
      />

      <HomeIndicator />
    </OnboardingScreen>
  );
}
