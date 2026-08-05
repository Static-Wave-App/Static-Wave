import { brandGradientColors, brandGradientLocations, button, buttonLabel } from "@static-wave/design";
import { LinearGradient } from "expo-linear-gradient";
import type { ReactNode } from "react";
import type { PressableProps } from "react-native";
import { ActivityIndicator, Pressable, View } from "react-native";

import { cn } from "@/lib/cn";

import { Text } from "./text";

type Variant = "gradient" | "solid" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

export type ButtonProps = Omit<PressableProps, "children"> & {
  label: string;
  variant?: Variant;
  size?: Size;
  block?: boolean;
  loading?: boolean;
  left?: ReactNode;
  right?: ReactNode;
  className?: string;
};

const LABEL_SIZE = { sm: "body-md", md: "body-lg", lg: "body-xl" } as const;

/**
 * Primary action across both designs: "Get started", "Continue with 3",
 * "Sounds good — let's go", "Turn on notifications", "Allow background audio".
 *
 * The gradient variant is why this is a wrapper rather than a styled heroui
 * Button: React Native can't express a gradient as a style, so the fill has to
 * be a real `LinearGradient` view layered under the content. The token exports
 * keep those stops identical to the web's CSS gradient.
 */
export function Button({
  label,
  variant = "gradient",
  size = "lg",
  block = true,
  loading = false,
  disabled,
  left,
  right,
  className,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;

  const content = (
    <>
      {loading ? (
        <ActivityIndicator size="small" color={variant === "secondary" || variant === "ghost" ? undefined : "#FFFFFF"} />
      ) : (
        <>
          {left}
          <Text
            variant={LABEL_SIZE[size]}
            className={cn(buttonLabel({ variant, size }))}
            weight="600"
          >
            {label}
          </Text>
          {right}
        </>
      )}
    </>
  );

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: Boolean(isDisabled), busy: loading }}
      disabled={isDisabled}
      className={cn(button({ variant, size, block, disabled: Boolean(isDisabled) }), className)}
      style={({ pressed }) => ({ opacity: pressed && !isDisabled ? 0.85 : 1 })}
      {...props}
    >
      {variant === "gradient" ? (
        <>
          {/* Sits behind the label; `pointerEvents none` so it never eats taps. */}
          <LinearGradient
            colors={brandGradientColors as unknown as [string, string, ...string[]]}
            locations={brandGradientLocations as unknown as [number, number, ...number[]]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            pointerEvents="none"
            style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
          />
          <View className="flex-row items-center justify-center gap-2">{content}</View>
        </>
      ) : (
        content
      )}
    </Pressable>
  );
}
