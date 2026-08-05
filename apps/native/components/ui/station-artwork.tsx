import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useState } from "react";
import { ActivityIndicator, View } from "react-native";

import { getStationAvatar } from "@/lib/format";

import { Text } from "./text";

/**
 * Large station artwork — Player, Station Details, and the onboarding
 * "we found this for you" tile.
 *
 * This exists because those three screens each hand-rolled the tile and all
 * three rendered initials ONLY, never the favicon. The small surfaces
 * (`StationRow`, `NowPlayingBar`, the dashboard rails) did render it, which
 * produced the confusing symptom of artwork showing in the now-playing dock and
 * then disappearing when you opened the Player — the image was fine, only the
 * big tiles never asked for it.
 *
 * `onError` matters as much as the URL check: RadioBrowser favicons are
 * user-submitted and a live-looking https URL is frequently a 404, which no
 * amount of validation catches ahead of time.
 */

export type StationArtworkProps = {
  station: { stationuuid: string; name: string; favicon: string } | null;
  size: number;
  radius: number;
  /**
   * Gradient shown behind/instead of the image.
   *
   * `brand` is the full four-stop ramp — the hero tiles (Player, onboarding)
   * use it. `station` uses the station's own stable two-colour pair, which is
   * what the smaller tiles in the design do so a list isn't one flat colour.
   */
  palette?: "brand" | "station";
  /** Explicit override, e.g. Station Details' near-black tile. */
  colors?: readonly string[];
  locations?: readonly number[];
  initialsSize: number;
  /** Player and onboarding place initials bottom-left; details centres them. */
  align?: "bottom-left" | "center";
  padding?: number;
  isLoading?: boolean;
  borderColor?: string;
};

const BRAND = ["#FF2FD6", "#8B3DFF", "#2E7BFF", "#22D3EE"] as const;
const BRAND_LOCATIONS = [0, 0.45, 0.74, 1] as const;

export function StationArtwork({
  station,
  size,
  radius,
  palette = "brand",
  colors,
  locations,
  initialsSize,
  align = "bottom-left",
  padding = 26,
  isLoading = false,
  borderColor,
}: StationArtworkProps) {
  const [failed, setFailed] = useState(false);

  const avatar = station ? getStationAvatar(station) : null;
  const showImage = Boolean(avatar?.uri) && !failed;

  const stops =
    colors ??
    (palette === "station" && avatar ? avatar.colors : BRAND);
  // Two-stop station palettes have no explicit locations; the brand ramp does.
  const stopLocations = locations ?? (stops === BRAND ? BRAND_LOCATIONS : undefined);

  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: radius,
        overflow: "hidden",
        ...(borderColor ? { borderWidth: 1, borderColor } : {}),
      }}
      accessibilityRole="image"
      accessibilityLabel={station?.name ?? "Station artwork"}
    >
      <LinearGradient
        colors={stops as unknown as [string, string, ...string[]]}
        locations={stopLocations as unknown as [number, number, ...number[]]}
        start={{ x: 0.15, y: 0 }}
        end={{ x: 0.85, y: 1 }}
        style={{
          width: "100%",
          height: "100%",
          justifyContent: align === "center" ? "center" : "flex-end",
          alignItems: align === "center" ? "center" : "flex-start",
          padding,
        }}
      >
        {isLoading ? (
          <ActivityIndicator color="rgba(255,255,255,0.94)" />
        ) : (
          <Text
            weight="600"
            style={{
              fontSize: initialsSize,
              lineHeight: initialsSize * 0.9,
              letterSpacing: initialsSize * -0.05,
              color: "rgba(255,255,255,0.94)",
            }}
          >
            {avatar?.initials ?? "?"}
          </Text>
        )}
      </LinearGradient>

      {/* Layered over the gradient rather than swapped for it, so a slow or
          failing image degrades to the designed tile instead of a blank box. */}
      {showImage && avatar?.uri ? (
        <Image
          source={{ uri: avatar.uri }}
          contentFit="cover"
          transition={200}
          onError={() => setFailed(true)}
          style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
        />
      ) : null}
    </View>
  );
}
