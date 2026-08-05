import "@/global.css";
import { heroUITheme } from "@static-wave/design";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { HeroUINativeProvider } from "heroui-native";
import { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { ErrorBoundary } from "@/components/error-boundary";
import { AppThemeProvider } from "@/contexts/app-theme-context";
import { appFonts } from "@/lib/fonts";
import { startNetworkPlaybackService } from "@/lib/services/network-playback-service";
import { startRecentlyPlayedTracker } from "@/lib/services/recently-played-tracker";
import { startSleepTimerService } from "@/lib/services/sleep-timer-service";
import {
  startNetworkListener,
  useAudioPlayer,
  useFavorites,
  useNetwork,
  useRecentlyPlayed,
  useSleepTimer,
} from "@/stores";

export const unstable_settings = {
  initialRouteName: "(drawer)",
};

// Hold the splash until fonts resolve, so the first frame isn't rendered in the
// system font and then reflowed.
SplashScreen.preventAutoHideAsync().catch(() => {});

function StackLayout() {
  return (
    <Stack screenOptions={{}}>
      <Stack.Screen name="(drawer)" options={{ headerShown: false }} />
      <Stack.Screen name="(onboarding)" options={{ headerShown: false }} />
      <Stack.Screen name="station/[uuid]" options={{ title: "Station" }} />
      <Stack.Screen name="player" options={{ title: "Now Playing", presentation: "modal" }} />
    </Stack>
  );
}

export default function Layout() {
  const [fontsLoaded, fontError] = useFonts(appFonts);

  useEffect(() => {
    // Release the splash once fonts settle. On a font error we still continue —
    // falling back to the system font is far better than a stuck splash.
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [fontsLoaded, fontError]);

  useEffect(() => {
    useAudioPlayer.getState().setup();
    useFavorites.getState().hydrate();
    useRecentlyPlayed.getState().hydrate();
    useSleepTimer.getState().hydrate();
    useNetwork.getState().check();

    // Service-layer bridges: these coordinate between stores without the
    // stores importing each other (see systems/state-management.md).
    const teardown = [
      startNetworkListener(),
      startNetworkPlaybackService(),
      startRecentlyPlayedTracker(),
      startSleepTimerService(),
    ];

    return () => {
      for (const stop of teardown) stop();
    };
  }, []);

  // Splash is still up at this point, so rendering nothing avoids a flash of
  // system-font text behind it.
  if (!fontsLoaded && !fontError) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      {/* Required by useSafeAreaInsets() in the onboarding chrome. */}
      <SafeAreaProvider>
        <KeyboardProvider>
          <AppThemeProvider>
            <HeroUINativeProvider config={{ theme: heroUITheme }}>
              <ErrorBoundary>
                <StackLayout />
              </ErrorBoundary>
            </HeroUINativeProvider>
          </AppThemeProvider>
        </KeyboardProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
