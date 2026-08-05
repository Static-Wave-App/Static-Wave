import { useAudioPlayer } from "@/stores/audio-player";
import { useRecentlyPlayed } from "@/stores/recently-played";

/**
 * A station only counts as "played" after this much continuous playback, so
 * skipping through stations doesn't flood the history (flows/05).
 */
const MIN_PLAY_MS = 5000;

/**
 * Records the current station to Recently Played after `MIN_PLAY_MS` of
 * uninterrupted playback.
 *
 * Lives in the service layer so `audio-player` and `recently-played` stay
 * independent (see systems/state-management.md).
 */
export function startRecentlyPlayedTracker(): () => void {
  let timer: ReturnType<typeof setTimeout> | null = null;
  let scheduledFor: string | null = null;

  const clearPending = () => {
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
  };

  const unsubscribe = useAudioPlayer.subscribe((state) => {
    const station = state.currentStation;

    // Stopped, paused, or failed — drop any pending record so a station that
    // was cut short before the threshold never lands in the history.
    if (!station || !state.isPlaying) {
      clearPending();
      scheduledFor = null;
      return;
    }

    if (scheduledFor === station.stationuuid) return;

    clearPending();
    scheduledFor = station.stationuuid;

    timer = setTimeout(() => {
      timer = null;
      useRecentlyPlayed.getState().add(station).catch(() => {});
    }, MIN_PLAY_MS);
  });

  return () => {
    clearPending();
    unsubscribe();
  };
}
