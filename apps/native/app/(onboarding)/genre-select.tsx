import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Pressable, ScrollView, View } from "react-native";
import Svg, { Polyline } from "react-native-svg";

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

/** Exactly the 15 genres listed in the design, in order. */
const GENRES = [
  "Jazz",
  "Pop",
  "Rock",
  "Electronic",
  "Classical",
  "Hip-Hop",
  "News",
  "Ambient",
  "Talk",
  "Lounge",
  "Soul",
  "Reggae",
  "Metal",
  "Country",
  "Latin",
] as const;

/**
 * Selected chips in the design don't share one gradient — they cycle through
 * three, so a row of selections reads as varied rather than uniform.
 */
const SELECTED_GRADIENTS: [string, string][] = [
  ["#8B3DFF", "#2E7BFF"],
  ["#FF2FD6", "#8B3DFF"],
  ["#2E7BFF", "#22D3EE"],
];

function GenreChip({
  label,
  selected,
  gradientIndex,
  onPress,
}: {
  label: string;
  selected: boolean;
  gradientIndex: number;
  onPress: () => void;
}) {
  const { theme } = useOnboardingTheme();

  const inner = (
    <>
      <Text
        variant="body-lg"
        weight={selected ? "500" : "400"}
        style={{ color: selected ? "rgba(255,255,255,0.96)" : theme.text }}
      >
        {label}
      </Text>
      {selected ? (
        <Svg width={15} height={15} viewBox="0 0 24 24" fill="none">
          <Polyline
            points="20 6 9 17 4 12"
            stroke="rgba(255,255,255,0.96)"
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      ) : null}
    </>
  );

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}
    >
      {selected ? (
        <LinearGradient
          colors={SELECTED_GRADIENTS[gradientIndex % SELECTED_GRADIENTS.length]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0.6 }}
          style={{
            height: 44,
            paddingHorizontal: 20,
            borderRadius: 22,
            flexDirection: "row",
            alignItems: "center",
            gap: 8,
          }}
        >
          {inner}
        </LinearGradient>
      ) : (
        <View
          style={{
            height: 44,
            paddingHorizontal: 20,
            borderRadius: 22,
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: theme.chipBg,
            borderWidth: 1,
            borderColor: theme.chipBorder,
          }}
        >
          {inner}
        </View>
      )}
    </Pressable>
  );
}

export default function GenreSelectScreen() {
  const router = useRouter();
  const { theme } = useOnboardingTheme();
  const selectedGenres = useOnboarding((s) => s.selectedGenres);
  const toggleGenre = useOnboarding((s) => s.toggleGenre);
  const finish = useOnboarding((s) => s.finish);

  const count = selectedGenres.length;

  return (
    <OnboardingScreen
      glow={{ color: "#22D3EE", opacity: 0.16, cx: 0.2, cy: 0, rx: 1.2, ry: 0.45 }}
    >
      <OnboardingHeader onBack={() => router.back()} onSkip={finish} />

      <View style={{ paddingHorizontal: 24, paddingTop: 26 }}>
        <Text
          variant="display-xl"
          style={{ fontSize: 30, lineHeight: 34, color: theme.text }}
        >
          What do you{"\n"}listen to?
        </Text>
        <Text
          variant="body-lg"
          weight="300"
          style={{ marginTop: 10, color: theme.muted }}
        >
          Pick a few. We&apos;ll tune your suggestions around them.
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={{
          flexDirection: "row",
          flexWrap: "wrap",
          gap: 10,
          paddingHorizontal: 24,
          paddingTop: 26,
          paddingBottom: 200,
        }}
        showsVerticalScrollIndicator={false}
      >
        {GENRES.map((genre, i) => (
          <GenreChip
            key={genre}
            label={genre}
            selected={selectedGenres.includes(genre)}
            gradientIndex={i}
            onPress={() => toggleGenre(genre)}
          />
        ))}
      </ScrollView>

      <ProgressDots step={1} />

      <PrimaryCta
        label={count > 0 ? `Continue with ${count}` : "Continue"}
        disabled={count === 0}
        onPress={() => router.push("/(onboarding)/country-select")}
        style={{ position: "absolute", left: 24, right: 24, bottom: 40 }}
      />

      <HomeIndicator />
    </OnboardingScreen>
  );
}
