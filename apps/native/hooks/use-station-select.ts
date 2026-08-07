import { useRouter } from "expo-router";
import { useCallback } from "react";

import type { Station } from "@static-wave/types";

import { useAudioPlayer, useSettings } from "@/stores";

/**
 * Tap-a-station behaviour, shared by every list/card that renders a station
 * (StationRow, the dashboard rails, Favorites). Always navigates to Station
 * Details. Also starts playback immediately when the user has turned on
 * "Instant play" in the drawer — requested directly by a user who wanted
 * selecting a station to be audible right away, rather than needing a second
 * tap on the Details screen's Play button. Off by default, so this changes
 * nothing for anyone who hasn't opted in.
 *
 * Not for the "on air" card that shows the currently-playing station (see
 * Favorites) — that station is already playing, and calling `play()` again
 * would tear down and restart the exact same stream.
 */
export function useStationSelect() {
  const router = useRouter();
  const instantPlay = useSettings((s) => s.instantPlay);
  const play = useAudioPlayer((s) => s.play);

  return useCallback(
    (station: Station) => {
      if (instantPlay) play(station);
      router.push(`/station/${station.stationuuid}`);
    },
    [instantPlay, play, router],
  );
}
