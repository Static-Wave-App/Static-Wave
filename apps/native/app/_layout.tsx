import "@/global.css";
import { Stack } from "expo-router";
import { HeroUINativeProvider } from "heroui-native";
import { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";

import { ErrorBoundary } from "@/components/error-boundary";
import { AppThemeProvider } from "@/contexts/app-theme-context";
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

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <KeyboardProvider>
        <AppThemeProvider>
          <HeroUINativeProvider>
            <ErrorBoundary>
              <StackLayout />
            </ErrorBoundary>
          </HeroUINativeProvider>
        </AppThemeProvider>
      </KeyboardProvider>
    </GestureHandlerRootView>
  );
}
