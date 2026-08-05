/**
 * Typography primitives.
 *
 * The two design files use ~29 distinct sizes including half-pixel steps
 * (12.5 / 13.5 / 14.5 / 15.5px). Those are collapsed here to a scale of 15
 * steps, rounding .5 up. The mapping is recorded in `sourceSizeMap` below so
 * the decision is auditable rather than folklore.
 *
 * The defining rule of this design, consistent across both files: display text
 * is TIGHT and gets tighter as it grows (-0.02em → -0.035em), while mono
 * eyebrows are UPPERCASE and WIDE (+0.1em → +0.16em). Tracking is therefore
 * bound to each size rather than left to the call site.
 */

export const fontFamily = {
  /** Outfit — headings, body, buttons. */
  display: "Outfit",
  /** IBM Plex Mono — eyebrows, metadata, bitrates, counts. */
  mono: "IBM Plex Mono",
} as const;

/** Font files are embedded via the expo-font plugin (see apps/native/app.json). */
export const fontFace = {
  display: {
    300: "Outfit-Light",
    400: "Outfit-Regular",
    500: "Outfit-Medium",
    600: "Outfit-SemiBold",
    700: "Outfit-Bold",
  },
  mono: {
    400: "IBMPlexMono-Regular",
    500: "IBMPlexMono-Medium",
    600: "IBMPlexMono-SemiBold",
  },
} as const;

export const fontWeight = {
  light: "300",
  regular: "400",
  medium: "500",
  semibold: "600",
  bold: "700",
} as const;

/**
 * Which raw mockup sizes collapsed into which token. Kept so that a future
 * "this looks 0.5px off from the design" question has an answer.
 */
export const sourceSizeMap = {
  "display-2xl": [36],
  "display-xl": [34, 31, 30],
  "display-lg": [28, 27],
  "display-md": [22],
  "display-sm": [19],
  "display-xs": [17],
  "body-xl": [16, 15.5],
  "body-lg": [15, 14.5],
  "body-md": [14, 13.5],
  "body-sm": [13, 12.5],
  "body-xs": [12, 11.5],
  "body-2xs": [11],
  "mono-sm": [12],
  "mono-xs": [11, 10.5],
  "mono-2xs": [10, 9.5],
} as const;

export type TextStyleToken = keyof typeof sourceSizeMap;

export type TextStyle = {
  fontSize: number;
  lineHeight: number;
  letterSpacing: number;
  fontFamily: string;
  fontWeight: string;
  textTransform?: "uppercase";
};

const DISPLAY_LEADING = 1.1;
const BODY_LEADING = 1.45;
const MONO_LEADING = 1.2;

const round = (n: number) => Math.round(n * 100) / 100;

function display(size: number, tracking: number): TextStyle {
  return {
    fontSize: size,
    lineHeight: round(size * DISPLAY_LEADING),
    letterSpacing: round(size * tracking),
    fontFamily: fontFamily.display,
    fontWeight: fontWeight.semibold,
  };
}

function body(size: number, weight: string = fontWeight.regular): TextStyle {
  return {
    fontSize: size,
    lineHeight: round(size * BODY_LEADING),
    letterSpacing: round(size * -0.015),
    fontFamily: fontFamily.display,
    fontWeight: weight,
  };
}

function mono(size: number, tracking: number): TextStyle {
  return {
    fontSize: size,
    lineHeight: round(size * MONO_LEADING),
    letterSpacing: round(size * tracking),
    fontFamily: fontFamily.mono,
    fontWeight: fontWeight.medium,
    textTransform: "uppercase",
  };
}

/**
 * `letterSpacing` is in **px** (React Native has no em unit). The CSS theme
 * re-expresses these as em — see theme.css.
 */
export const textStyles = {
  "display-2xl": display(36, -0.03),
  "display-xl": display(32, -0.035),
  "display-lg": display(28, -0.03),
  "display-md": display(22, -0.02),
  "display-sm": display(19, -0.02),
  "display-xs": display(17, -0.02),

  "body-xl": body(16),
  "body-lg": body(15),
  "body-md": body(14),
  "body-sm": body(13),
  "body-xs": body(12),
  "body-2xs": body(11),

  // Eyebrows: "NOW PLAYING", "DETECTED", "FEATURED", "248 RESULTS", "ON AIR".
  "mono-sm": mono(12, 0.1),
  "mono-xs": mono(11, 0.14),
  "mono-2xs": mono(10, 0.16),
} as const satisfies Record<TextStyleToken, TextStyle>;

/** Raw em tracking values, for the CSS theme where em is the natural unit. */
export const trackingEm = {
  "display-2xl": -0.03,
  "display-xl": -0.035,
  "display-lg": -0.03,
  "display-md": -0.02,
  "display-sm": -0.02,
  "display-xs": -0.02,
  body: -0.015,
  "mono-sm": 0.1,
  "mono-xs": 0.14,
  "mono-2xs": 0.16,
} as const;
