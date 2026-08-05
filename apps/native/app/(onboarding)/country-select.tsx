import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import * as Localization from "expo-localization";
import { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, TextInput, View } from "react-native";
import Svg, { Circle, Path, Polyline } from "react-native-svg";

import {
  HomeIndicator,
  OnboardingHeader,
  OnboardingScreen,
  PrimaryCta,
  ProgressDots,
  useOnboardingTheme,
} from "@/components/onboarding/chrome";
import { Eyebrow, Text } from "@/components/ui/text";
import { getCountries } from "@/lib/api";
import { useOnboarding } from "@/stores";

type CountryRow = { name: string; stationcount: number };

export default function CountrySelectScreen() {
  const router = useRouter();
  const { theme } = useOnboardingTheme();
  const selectedCountry = useOnboarding((s) => s.selectedCountry);
  const setCountry = useOnboarding((s) => s.setCountry);
  const finish = useOnboarding((s) => s.finish);

  const [countries, setCountries] = useState<CountryRow[]>([]);
  const [query, setQuery] = useState("");
  const [detected, setDetected] = useState<string | null>(null);

  // Device locale → country name. The design shows "DETECTED / France".
  useEffect(() => {
    const region = Localization.getLocales()[0]?.regionCode ?? null;
    if (!region) return;
    try {
      const name = new Intl.DisplayNames(["en"], { type: "region" }).of(region);
      if (name) setDetected(name);
    } catch {
      setDetected(region);
    }
  }, []);

  useEffect(() => {
    getCountries()
      .then((result) => setCountries(result as CountryRow[]))
      .catch(() => setCountries([]));
  }, []);

  // The design lists five under "POPULAR" — RadioBrowser already returns
  // countries ordered by station count, so this is the real top five.
  const popular = useMemo(() => {
    const q = query.trim().toLowerCase();
    const source = q
      ? countries.filter((c) => c.name.toLowerCase().includes(q))
      : countries;
    return source.slice(0, q ? 12 : 5);
  }, [countries, query]);

  const chosen = selectedCountry ?? detected;

  return (
    <OnboardingScreen
      glow={{ color: "#2E7BFF", opacity: 0.18, cx: 0.8, cy: 0, rx: 1.2, ry: 0.45 }}
    >
      <OnboardingHeader onBack={() => router.back()} onSkip={finish} />

      <View style={{ paddingHorizontal: 24, paddingTop: 26 }}>
        <Text variant="display-xl" style={{ fontSize: 30, lineHeight: 34, color: theme.text }}>
          Where are you{"\n"}listening from?
        </Text>
        <Text variant="body-lg" weight="300" style={{ marginTop: 10, color: theme.muted }}>
          Local stations first. You can always change this.
        </Text>
      </View>

      {/* Detected card — 1px gradient border via padding trick, radius 26/25 */}
      {detected ? (
        <Pressable onPress={() => setCountry(detected)} style={{ marginHorizontal: 24, marginTop: 24 }}>
          <LinearGradient
            colors={["#8B3DFF", "#22D3EE"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ borderRadius: 26, padding: 1 }}
          >
            <View
              style={{
                borderRadius: 25,
                backgroundColor: theme.surface,
                paddingVertical: 16,
                paddingHorizontal: 18,
                flexDirection: "row",
                alignItems: "center",
                gap: 14,
              }}
            >
              <LinearGradient
                colors={["#8B3DFF", "#2E7BFF"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{
                  width: 46,
                  height: 46,
                  borderRadius: 16,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
                  <Path
                    d="M12 21s7-6.5 7-11a7 7 0 1 0-14 0c0 4.5 7 11 7 11z"
                    stroke="#FFFFFF"
                    strokeWidth={2}
                    strokeLinejoin="round"
                  />
                  <Circle cx={12} cy={10} r={2.5} stroke="#FFFFFF" strokeWidth={2} />
                </Svg>
              </LinearGradient>

              <View style={{ flex: 1, minWidth: 0 }}>
                <Eyebrow variant="mono-2xs" style={{ color: "#22D3EE" }}>
                  DETECTED
                </Eyebrow>
                <Text
                  variant="display-xs"
                  style={{ marginTop: 5, color: theme.text }}
                >
                  {detected}
                </Text>
              </View>

              <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
                <Polyline
                  points="9 18 15 12 9 6"
                  stroke={theme.muted}
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </Svg>
            </View>
          </LinearGradient>
        </Pressable>
      ) : null}

      {/* Search field — 48px, radius 17 */}
      <View style={{ paddingHorizontal: 24, paddingTop: 22 }}>
        <View
          style={{
            height: 48,
            borderRadius: 17,
            backgroundColor: theme.surface,
            borderWidth: 1,
            borderColor: theme.chipBorder,
            flexDirection: "row",
            alignItems: "center",
            gap: 10,
            paddingHorizontal: 15,
          }}
        >
          <Svg width={17} height={17} viewBox="0 0 24 24" fill="none">
            <Circle cx={11} cy={11} r={7} stroke={theme.muted} strokeWidth={2} />
            <Path d="M20 20l-3.5-3.5" stroke={theme.muted} strokeWidth={2} strokeLinecap="round" />
          </Svg>
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder={`Search ${countries.length || 200} countries`}
            placeholderTextColor={theme.muted}
            style={{ flex: 1, fontSize: 15, color: theme.text }}
          />
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 20, paddingBottom: 200 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Eyebrow variant="mono-2xs" style={{ color: theme.dim, paddingBottom: 10 }}>
          {query ? "RESULTS" : "POPULAR"}
        </Eyebrow>

        {popular.map((country, i) => (
          <View key={country.name}>
            {i > 0 ? <View style={{ height: 1, backgroundColor: theme.hairline }} /> : null}
            <Pressable
              onPress={() => setCountry(country.name)}
              accessibilityRole="button"
              accessibilityState={{ selected: chosen === country.name }}
              style={({ pressed }) => ({
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                paddingVertical: 13,
                opacity: pressed ? 0.7 : 1,
              })}
            >
              <Text
                variant="body-xl"
                weight={chosen === country.name ? "600" : "400"}
                style={{ color: chosen === country.name ? "#8B3DFF" : theme.text }}
              >
                {country.name}
              </Text>
              <Text variant="body-sm" weight="300" style={{ color: theme.muted }}>
                {country.stationcount.toLocaleString()}
              </Text>
            </Pressable>
          </View>
        ))}
      </ScrollView>

      <ProgressDots step={2} />

      <PrimaryCta
        label="Continue"
        disabled={!chosen}
        onPress={() => {
          if (chosen && !selectedCountry) setCountry(chosen);
          router.push("/(onboarding)/aha-moment");
        }}
        style={{ position: "absolute", left: 24, right: 24, bottom: 40 }}
      />

      <HomeIndicator />
    </OnboardingScreen>
  );
}
