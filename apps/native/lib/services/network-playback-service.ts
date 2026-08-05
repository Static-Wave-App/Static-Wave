import { useAudioPlayer } from "@/stores/audio-player";
import { useNetwork } from "@/stores/network";

/**
 * Pauses playback when connectivity drops and resumes it when the connection
 * comes back.
 *
 * Only resumes if *this* service was the one that paused — if the user paused
 * manually, or stopped the station, connectivity returning must not start audio
 * behind their back.
 *
 * Lives in the service layer so `network` and `audio-player` stay independent
 * (see systems/state-management.md).
 */
export function startNetworkPlaybackService(): () => void {
  let pausedByNetwork = false;

  const unsubscribe = useNetwork.subscribe((state, prevState) => {
    if (state.isConnected === prevState.isConnected) return;

    const player = useAudioPlayer.getState();

    if (!state.isConnected) {
      if (player.isPlaying) {
        pausedByNetwork = true;
        player.pause().catch(() => {});
      }
      return;
    }

    // Reconnected.
    if (pausedByNetwork) {
      pausedByNetwork = false;
      if (player.currentStation && !player.isPlaying) {
        player.resume().catch(() => {});
      }
    }
  });

  return () => {
    pausedByNetwork = false;
    unsubscribe();
  };
}
