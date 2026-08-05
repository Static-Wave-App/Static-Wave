import * as Notifications from "expo-notifications";
import { AppState } from "react-native";

import { useAudioPlayer } from "@/stores/audio-player";
import { useSleepTimer } from "@/stores/sleep-timer";

const TICK_INTERVAL_MS = 1000;

let scheduledNotificationId: string | null = null;

/**
 * Drives the sleep timer countdown and pauses playback when it expires.
 *
 * IMPORTANT LIMITATION: expo-audio has no background JS runtime (unlike
 * react-native-track-player's playback service). While the app is backgrounded
 * the OS suspends timers, so audio cannot be paused at the exact expiry moment.
 *
 * The compromise:
 *   - foreground → the interval below pauses playback on time
 *   - backgrounded → a local notification fires at expiry so the user knows,
 *     and playback pauses the moment the app is next foregrounded
 *
 * Because `endTime` is absolute, no time is "lost" — expiry is detected
 * correctly on resume regardless of how long the app was suspended.
 */
export function startSleepTimerService(): () => void {
  const expire = () => {
    useAudioPlayer.getState().pause().catch(() => {});
    cancelScheduledNotification();
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

  // Keep the scheduled notification in sync with the timer.
  const unsubscribeTimer = useSleepTimer.subscribe((state, prev) => {
    if (state.endTime === prev.endTime) return;

    cancelScheduledNotification();
    if (state.endTime) {
      scheduleExpiryNotification(state.endTime);
    }
  });

  return () => {
    clearInterval(interval);
    subscription.remove();
    unsubscribeTimer();
    cancelScheduledNotification();
  };
}

function scheduleExpiryNotification(endTime: number) {
  const seconds = Math.max(1, Math.round((endTime - Date.now()) / 1000));

  Notifications.scheduleNotificationAsync({
    content: {
      title: "Sleep timer finished",
      body: "Open static wave to stop playback.",
    },
    trigger: { seconds, channelId: "sleep-timer" },
  })
    .then((id) => {
      scheduledNotificationId = id;
    })
    .catch(() => {
      // Permission denied or scheduling unavailable — the foreground path
      // still works, so this is not worth surfacing.
    });
}

function cancelScheduledNotification() {
  if (!scheduledNotificationId) return;
  const id = scheduledNotificationId;
  scheduledNotificationId = null;
  Notifications.cancelScheduledNotificationAsync(id).catch(() => {});
}
