import type { TextStyleToken } from "@static-wave/design";
import { textStyles } from "@static-wave/design";
import type { TextProps as RNTextProps } from "react-native";
import { Text as RNText } from "react-native";

import { getFontFamily } from "@/lib/fonts";
import type { FontWeightValue } from "@/lib/fonts";
import { cn } from "@/lib/cn";

type Tone = "default" | "muted" | "dim" | "brand" | "inverse" | "onAir";

const TONE_CLASS: Record<Tone, string> = {
  default: "text-foreground",
  muted: "text-muted",
  dim: "text-dim",
  brand: "text-brand",
  inverse: "text-brand-foreground",
  onAir: "text-on-air",
};

export type TextProps = RNTextProps & {
  /** A token from the design system's type scale. */
  variant?: TextStyleToken;
  tone?: Tone;
  /** Overrides the weight baked into the variant. */
  weight?: FontWeightValue;
  className?: string;
};

/**
 * The typography primitive. Every piece of text in the app goes through this.
 *
 * It exists because React Native can't pick a font weight from a family the way
 * a browser can — `fontWeight: 600` on a custom family is ignored on Android and
 * faked on iOS. So the concrete PostScript face is resolved here and applied via
 * `style`, while colour still comes from Tailwind classes.
 */
export function Text({
  variant = "body-lg",
  tone = "default",
  weight,
  className,
  style,
  ...props
}: TextProps) {
  const token = textStyles[variant];
  const family = variant.startsWith("mono") ? "mono" : "display";
  const resolvedWeight = (weight ?? token.fontWeight) as FontWeightValue;

  return (
    <RNText
      className={cn(TONE_CLASS[tone], className)}
      style={[
        {
          fontFamily: getFontFamily(family, resolvedWeight),
          fontSize: token.fontSize,
          lineHeight: token.lineHeight,
          letterSpacing: token.letterSpacing,
          ...(token.textTransform ? { textTransform: token.textTransform } : {}),
        },
        style,
      ]}
      {...props}
    />
  );
}

/**
 * The mono uppercase micro-label used throughout both designs — "NOW PLAYING",
 * "FEATURED", "DETECTED", "LOCK SCREEN".
 */
export function Eyebrow({
  variant = "mono-xs",
  tone = "dim",
  ...props
}: TextProps) {
  return <Text variant={variant} tone={tone} {...props} />;
}
