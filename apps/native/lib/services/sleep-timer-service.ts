import { AppState } from "react-native";

import { useAudioPlayer } from "@/stores/audio-player";
import { useSleepTimer } from "@/stores/sleep-timer";

const TICK_INTERVAL_MS = 1000;

/**
 * Drives the sleep timer countdown and pauses playback when it expires.
 *
 * Lives in the service layer rather than the store so that `sleep-timer` and
 * `audio-player` stay independent (see systems/state-management.md).
 *
 * JS timers are throttled or suspended while the app is backgrounded, so the
 * countdown is derived from the absolute `endTime` and re-checked whenever the
 * app returns to the foreground. That way a timer that lapsed in the background
 * still stops playback on resume.
 */
export function startSleepTimerService(): () => void {
  const expire = () => {
    useAudioPlayer.getState().pause().catch(() => {});
  };

  const interval = setInterval(() => {
    if (useSleepTimer.getState().tick()) {
      expire();
    }
  }, TICK_INTERVAL_MS);

  const subscription = AppState.addEventListener("change", (status) => {
    if (status === "active" && useSleepTimer.getState().tick()) {
      expire();
    }
  });

  return () => {
    clearInterval(interval);
    subscription.remove();
  };
}
