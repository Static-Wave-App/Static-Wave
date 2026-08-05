import { avatar, avatarInitials } from "@static-wave/design";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useState } from "react";
import { View } from "react-native";

import { cn } from "@/lib/cn";
import { getStationAvatar } from "@/lib/format";

import { Text } from "./text";

type Size = "xs" | "sm" | "md" | "lg" | "xl" | "hero";

export type StationAvatarProps = {
  station: { stationuuid: string; name: string; favicon: string };
  size?: Size;
  shape?: "rounded" | "circle";
  className?: string;
};

/**
 * Station artwork with an initials fallback.
 *
 * Falling back is the common case, not the edge case — most RadioBrowser
 * favicons are missing, plain HTTP (blocked by iOS ATS), or dead links. The
 * `onError` handler covers the last of those, which no amount of URL validation
 * can catch ahead of time.
 */
export function StationAvatar({
  station,
  size = "md",
  shape = "rounded",
  className,
}: StationAvatarProps) {
  const { uri, initials, colors } = getStationAvatar(station);
  const [failed, setFailed] = useState(false);

  const showImage = uri !== null && !failed;

  return (
    <View
      className={cn(avatar({ size, shape }), className)}
      accessibilityRole="image"
      accessibilityLabel={station.name}
    >
      <LinearGradient
        colors={colors as unknown as [string, string]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
      />

      {showImage ? (
        <Image
          source={{ uri }}
          contentFit="cover"
          transition={150}
          onError={() => setFailed(true)}
          style={{ width: "100%", height: "100%" }}
        />
      ) : (
        <Text className={cn(avatarInitials({ size }))} weight="600" tone="inverse">
          {initials}
        </Text>
      )}
    </View>
  );
}
