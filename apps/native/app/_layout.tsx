import "@/global.css";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
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
// Paywall disabled — see git history to re-enable.
// import { HardPaywall } from "@/components/paywall/hard-paywall";
import { IncrementalUpdateWall } from "@/components/ui/incremental-update-wall";
import { AppThemeProvider } from "@/contexts/app-theme-context";
import { appFonts } from "@/lib/fonts";
import { INCREMENTAL_CHANGE_PENDING } from "@/lib/incremental-update";
import { releaseAllPlayers } from "@/stores/audio-player";
import { startDeepLinkHandler } from "@/lib/deep-links";
import { startNetworkPlaybackService } from "@/lib/services/network-playback-service";
import { startRecentlyPlayedTracker } from "@/lib/services/recently-played-tracker";
import { startSleepTimerService } from "@/lib/services/sleep-timer-service";
import {
  startNetworkListener,
  useAudioPlayer,
  useFavorites,
  useNetwork,
  useRecentlyPlayed,
  useSettings,
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
    // Every screen draws its own chrome — Station Details runs a gradient hero
    // under the status bar, and the Player has its own nav row — so no screen
    // here wants a navigation header.
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(drawer)" />
      <Stack.Screen name="(onboarding)" />
      <Stack.Screen name="station/[uuid]" />
      <Stack.Screen name="recently-played" />
      <Stack.Screen name="suggested" />
      <Stack.Screen name="player" options={{ presentation: "modal" }} />
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
    // Hard wall: don't hydrate stores, don't touch audio, don't start any
    // background service behind it. Someone looking at the wall shouldn't
    // have a player quietly buffering or a sleep timer running underneath.
    if (INCREMENTAL_CHANGE_PENDING) return;

    useAudioPlayer.getState().setup();
    useFavorites.getState().hydrate();
    useRecentlyPlayed.getState().hydrate();
    useSleepTimer.getState().hydrate();
    useSettings.getState().hydrate();
    useNetwork.getState().check();

    // Service-layer bridges: these coordinate between stores without the
    // stores importing each other (see systems/state-management.md).
    const teardown = [
      startNetworkListener(),
      startNetworkPlaybackService(),
      startRecentlyPlayedTracker(),
      startSleepTimerService(),
      startDeepLinkHandler(),
    ];

    return () => {
      for (const stop of teardown) stop();
      // Release native audio players. Without this a Fast Refresh or JS reload
      // strands them and they keep playing with nothing left to control them.
      releaseAllPlayers();
    };
  }, []);

  // Splash is still up at this point, so rendering nothing avoids a flash of
  // system-font text behind it.
  if (!fontsLoaded && !fontError) return null;

  if (INCREMENTAL_CHANGE_PENDING) {
    // Nothing else in this file renders below this point — no navigator, no
    // theme/store providers, no screens. There is nothing underneath to
    // reveal and nothing here to dismiss the wall with.
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <IncrementalUpdateWall />
        </SafeAreaProvider>
      </GestureHandlerRootView>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      {/* Required by useSafeAreaInsets() in the onboarding chrome. */}
      <SafeAreaProvider>
        <KeyboardProvider>
          <AppThemeProvider>
            <HeroUINativeProvider config={{ theme: heroUITheme }}>
              {/* Bottom sheets present through here rather than inline, so a
                  sheet opened from a tab screen isn't drawn under the floating
                  tab bar (which is a sibling of the navigator). */}
              <BottomSheetModalProvider>
                <ErrorBoundary>
                  {/* <HardPaywall>
                    <StackLayout />
                  </HardPaywall> */}
                  <StackLayout />
                </ErrorBoundary>
              </BottomSheetModalProvider>
            </HeroUINativeProvider>
          </AppThemeProvider>
        </KeyboardProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
