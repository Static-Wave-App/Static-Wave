import { Share } from "react-native";

import type { Station } from "@static-wave/types";

/**
 * Shares a station via the OS share sheet. Prefers the station's homepage over
 * the raw stream URL — a stream link is useless to anyone without the app.
 *
 * Returns false if the user dismissed the sheet or sharing failed, so callers
 * can skip any success feedback.
 */
export async function shareStation(station: Station): Promise<boolean> {
  const link = station.homepage || station.urlResolved || station.url;
  const message = link ? `${station.name} — ${link}` : station.name;

  try {
    const result = await Share.share(
      { message, title: station.name },
      { subject: `Listening to ${station.name} on Static Wave` },
    );
    return result.action === Share.sharedAction;
  } catch {
    return false;
  }
}
