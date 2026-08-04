import { Stack } from "expo-router";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";

import { getOnboarding } from "@/lib/storage/mmkv";

export default function OnboardingLayout() {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const data = getOnboarding();
    if (data.complete) {
      router.replace("/(drawer)/(tabs)");
    }
    setIsChecking(false);
  }, [router]);

  if (isChecking) return null;

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="welcome" />
    </Stack>
  );
}