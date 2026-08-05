import { Redirect, Stack } from "expo-router";

import { useOnboarding } from "@/stores";

export const unstable_settings = {
  initialRouteName: "welcome",
};

export default function OnboardingLayout() {
  const onboardingComplete = useOnboarding((s) => s.complete);

  // Mirror of the guard in (drawer)/_layout.tsx. Both are driven by the same
  // boolean and are mutually exclusive, so they can't bounce off each other.
  if (onboardingComplete) {
    return <Redirect href="/(drawer)/(tabs)" />;
  }

  // Screens are file-registered by Expo Router, so new ones work as soon as the
  // file exists. Intended order (plans/onboarding.md):
  // welcome → genre-select → country-select → aha-moment →
  // notification-permission → background-permission
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
        gestureEnabled: false,
      }}
    />
  );
}
