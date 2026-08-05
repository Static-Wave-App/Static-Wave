import * as Notifications from "expo-notifications";
import { AppState, Platform } from "react-native";

import { useAudioPlayer } from "@/stores/audio-player";
import { useSleepTimer } from "@/stores/sleep-timer";

const TICK_INTERVAL_MS = 1000;

/** Must match the `channelId` passed to `scheduleNotificationAsync` below. */
const CHANNEL_ID = "sleep-timer";

let scheduledNotificationId: string | null = null;
let channelReady: Promise<void> | null = null;

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
/**
 * Android 8+ drops any notification posted to a channel that doesn't exist —
 * silently, with no error at the scheduling call. Without this the entire
 * background half of the sleep timer is dead: the user backgrounds the app,
 * the timer expires, and nothing tells them.
 *
 * Idempotent and cached, because it's awaited on every schedule.
 */
function ensureChannel(): Promise<void> {
  if (Platform.OS !== "android") return Promise.resolve();

  if (!channelReady) {
    const pending = Notifications.setNotificationChannelAsync(CHANNEL_ID, {
      name: "Sleep timer",
      importance: Notifications.AndroidImportance.DEFAULT,
      sound: "default",
      lightColor: "#8B3DFF",
    })
      .then(() => {})
      .catch(() => {
        // Clear the cache so the next schedule retries, rather than caching a
        // failure for the life of the process.
        if (channelReady === pending) channelReady = null;
      });

    channelReady = pending;
  }

  return channelReady;
}

/**
 * Without a handler, a notification that fires while the app is foregrounded is
 * swallowed. That's the common case here — the user is often still looking at
 * the Player when the timer runs out.
 */
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export function startSleepTimerService(): () => void {
  // Created up front so the channel exists before the first timer is set.
  ensureChannel();

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

  // Channel first: scheduling against a missing channel fails silently.
  ensureChannel()
    .then(() =>
      Notifications.scheduleNotificationAsync({
        content: {
          title: "Sleep timer finished",
          body: "Open static wave to stop playback.",
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds,
          channelId: CHANNEL_ID,
        },
      }),
    )
    .then((id) => {
      // A cancel may have landed while this was in flight; honour it rather
      // than leaving an orphaned notification the user can't dismiss.
      if (useSleepTimer.getState().endTime === endTime) {
        scheduledNotificationId = id;
      } else {
        Notifications.cancelScheduledNotificationAsync(id).catch(() => {});
      }
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
