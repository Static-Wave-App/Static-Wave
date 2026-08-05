import MaskedView from "@react-native-masked-view/masked-view";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { View } from "react-native";

import {
  HomeIndicator,
  OnboardingHeader,
  OnboardingScreen,
  PrimaryCta,
  ProgressDots,
  WaveMark,
  useOnboardingTheme,
} from "@/components/onboarding/chrome";
import { Text } from "@/components/ui/text";
import { useCatalogueSize } from "@/hooks";
import { useOnboarding } from "@/stores";

export default function WelcomeScreen() {
  const router = useRouter();
  const { theme } = useOnboardingTheme();
  const finish = useOnboarding((s) => s.finish);
  const { label: catalogueLabel } = useCatalogueSize();

  // The design reads "48,000 live stations, 200 countries". Both numbers come
  // from RadioBrowser's /json/stats (lib/api/stats.ts). Until that resolves the
  // copy falls back to a form that asserts no unverified figure.
  const subtitle = catalogueLabel
    ? `${catalogueLabel} live stations, 200 countries. No account, no ads, no waiting.`
    : "Every station, everywhere. No account, no ads, no waiting.";

  return (
    <OnboardingScreen
      glow={{ color: "#8B3DFF", opacity: 0.3, cx: 0.5, cy: 0.34, rx: 1.1, ry: 0.5 }}
    >
      <OnboardingHeader onSkip={finish} />

      <View style={{ alignItems: "center", paddingTop: 52 }}>
        <View pointerEvents="none" style={{ position: "absolute", top: 68 }}>
          <View
            style={{
              width: 360,
              height: 360,
              borderRadius: 180,
              borderWidth: 1,
              borderColor: theme.ringOuter,
            }}
          />
        </View>
        <View pointerEvents="none" style={{ position: "absolute", top: 108 }}>
          <View
            style={{
              width: 280,
              height: 280,
              borderRadius: 140,
              borderWidth: 1,
              borderColor: theme.ringInner,
            }}
          />
        </View>
        <WaveMark size={180} />
      </View>

      <View style={{ paddingHorizontal: 40, paddingTop: 64, alignItems: "center" }}>
        <Text
          variant="display-xl"
          style={{ fontSize: 34, lineHeight: 39, textAlign: "center", color: theme.text }}
        >
          Every radio station{"\n"}in the world.
        </Text>

        {/* "Instantly." is gradient-filled text in the design. */}
        <MaskedView
          style={{ height: 40, marginTop: 0 }}
          maskElement={
            <View style={{ backgroundColor: "transparent" }}>
              <Text
                variant="display-xl"
                style={{ fontSize: 34, lineHeight: 39, textAlign: "center" }}
              >
                Instantly.
              </Text>
            </View>
          }
        >
          <LinearGradient
            colors={["#FF2FD6", "#8B3DFF", "#22D3EE"]}
            locations={[0, 0.45, 1]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text
              variant="display-xl"
              style={{ fontSize: 34, lineHeight: 39, opacity: 0, textAlign: "center" }}
            >
              Instantly.
            </Text>
          </LinearGradient>
        </MaskedView>

        <Text
          variant="body-lg"
          weight="300"
          style={{
            marginTop: 16,
            fontSize: 15.5,
            lineHeight: 25,
            textAlign: "center",
            color: theme.muted,
          }}
        >
          {subtitle}
        </Text>
      </View>

      <ProgressDots step={0} />

      <PrimaryCta
        label="Get started"
        onPress={() => router.push("/(onboarding)/genre-select")}
        style={{ position: "absolute", left: 24, right: 24, bottom: 40 }}
      />

      <HomeIndicator />
    </OnboardingScreen>
  );
}
