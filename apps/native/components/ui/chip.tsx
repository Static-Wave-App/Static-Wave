import { badge, badgeLabel, chip, chipLabel } from "@static-wave/design";
import type { ReactNode } from "react";
import type { PressableProps } from "react-native";
import { Pressable, View } from "react-native";

import { cn } from "@/lib/cn";

import { Text } from "./text";

export type ChipProps = Omit<PressableProps, "children"> & {
  label: string;
  selected?: boolean;
  size?: "sm" | "md";
  left?: ReactNode;
  className?: string;
};

/**
 * Multi-select pills on onboarding step 02, and the filter chips on Search.
 * `accessibilityState.selected` matters here — without it a screen reader can't
 * tell which genres are picked.
 */
export function Chip({
  label,
  selected = false,
  size = "md",
  left,
  className,
  ...props
}: ChipProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      className={cn(chip({ selected, size }), className)}
      style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1 })}
      {...props}
    >
      {left}
      <Text
        variant={size === "sm" ? "body-sm" : "body-md"}
        className={cn(chipLabel({ selected }))}
        weight="500"
      >
        {label}
      </Text>
    </Pressable>
  );
}

export type BadgeProps = {
  label: string;
  tone?: "onAir" | "brand" | "neutral" | "outline";
  size?: "sm" | "md";
  left?: ReactNode;
  className?: string;
};

/** "ON AIR", "LIVE", "HD", "192K", "TRENDING". Always mono, always uppercase. */
export function Badge({
  label,
  tone = "neutral",
  size = "sm",
  left,
  className,
}: BadgeProps) {
  return (
    <View className={cn(badge({ tone, size }), className)}>
      {left}
      <Text variant="mono-2xs" className={cn(badgeLabel({ tone }))} weight="500">
        {label}
      </Text>
    </View>
  );
}
