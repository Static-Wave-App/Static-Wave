import { useCallback } from "react";

import type { Station } from "@static-wave/types";

import { useAudioPlayer } from "@/stores";

type StationPlayback = {
  /** This station is the one loaded in the player. */
  isCurrent: boolean;
  /** Loaded AND playing — the only state where a pause glyph is correct. */
  isPlaying: boolean;
  isLoading: boolean;
  /** "Play station" / "Pause" / "Resume" / "Connecting…". */
  label: string;
  /**
   * Plays this station, or pauses/resumes it when it's already the current one.
   */
  toggle: () => void;
};

/**
 * Playback state for one station, plus the one action a play button needs.
 *
 * Every play control in the app previously called `play(station)`
 * unconditionally. On the station that was already playing, that tore the
 * native player down and re-opened the stream — an audible gap, several
 * seconds of rebuffering, and a "Play station" button on the Station Details
 * screen that stayed labelled "Play" while the station was audibly playing.
 *
 * Centralised so the answer to "what should this button say and do?" is the
 * same on every screen.
 */
export function useStationPlayback(station: Station | null): StationPlayback {
  const currentUuid = useAudioPlayer((s) => s.currentStation?.stationuuid);
  const playing = useAudioPlayer((s) => s.isPlaying);
  const loading = useAudioPlayer((s) => s.isLoading);

  const play = useAudioPlayer((s) => s.play);
  const pause = useAudioPlayer((s) => s.pause);
  const resume = useAudioPlayer((s) => s.resume);

  const isCurrent = Boolean(station && currentUuid === station.stationuuid);
  const isPlaying = isCurrent && playing;
  const isLoading = isCurrent && loading;

  const toggle = useCallback(() => {
    if (!station) return;

    if (!isCurrent) {
      play(station);
      return;
    }

    if (playing) pause();
    else resume();
  }, [station, isCurrent, playing, play, pause, resume]);

  const label = isLoading
    ? "Connecting…"
    : isPlaying
      ? "Pause"
      : isCurrent
        ? "Resume"
        : "Play station";

  return { isCurrent, isPlaying, isLoading, label, toggle };
}
