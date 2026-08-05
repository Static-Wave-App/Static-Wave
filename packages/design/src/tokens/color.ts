/**
 * Colour primitives.
 *
 * Every value here was read out of the two design files (StaticWave Screens and
 * Onboarding) rather than chosen. Both files ship a light and a dark row, so
 * every semantic token resolves in both themes.
 */

/**
 * The brand gradient. Byte-identical in both design files:
 * `linear-gradient(90deg, #FF2FD6, #8B3DFF 45%, #2E7BFF 75%, #22D3EE)`
 *
 * Kept as ordered stops (not a CSS string) so it can drive CSS gradients,
 * `expo-linear-gradient`, SVG `<linearGradient>`, and the widget renderers from
 * one definition.
 */
export const brandGradient = {
  angle: 90,
  stops: [
    { color: "#FF2FD6", position: 0 },
    { color: "#8B3DFF", position: 0.45 },
    { color: "#2E7BFF", position: 0.75 },
    { color: "#22D3EE", position: 1 },
  ],
} as const;

/** Convenience derivations of the gradient for each consumer. */
export const brandGradientColors = brandGradient.stops.map((s) => s.color);
export const brandGradientLocations = brandGradient.stops.map((s) => s.position);
export const brandGradientCss = `linear-gradient(${brandGradient.angle}deg, ${brandGradient.stops
  .map((s) => (s.position === 0 ? s.color : `${s.color} ${s.position * 100}%`))
  .join(", ")})`;

/** Individual brand hues, for when a flat colour is needed instead of a ramp. */
export const brand = {
  pink: "#FF2FD6",
  violet: "#8B3DFF", // the solid primary — most-used colour in both files
  blue: "#2E7BFF",
  cyan: "#22D3EE",
} as const;

/**
 * Neutral ramps. Named by lightness rather than by role so the semantic layer
 * below can remap them without renaming primitives.
 */
export const neutralDark = {
  1000: "#08080A", // deepest — behind the app, phone bezel
  950: "#0A0A0C", // app background
  900: "#16161B", // card / surface
  850: "#17171A", // alternate surface
  800: "#1B1B20", // raised surface, pressed states
} as const;

export const neutralLight = {
  0: "#FFFFFF", // card / surface
  50: "#FAFAFC", // app background
  100: "#F5F5F7", // alternate surface
  200: "#E9E9ED", // border
  300: "#D4D4DA", // strong border
  400: "#C6C6CC", // disabled foreground
} as const;

/**
 * Greys used for text in both themes. The design files contain several
 * near-identical values (#9C9CA8 / #A0A0AA / #9A9AA2); they're collapsed here
 * to the dominant one in each band.
 */
export const grey = {
  muted: "#9C9CA8",
  mutedAlt: "#8A8A93",
  dim: "#6C6C77",
  dimAlt: "#62626C",
} as const;

export type ThemeName = "light" | "dark";

/**
 * Semantic colours — what components should reference. Roles are inferred from
 * how each value is used across the two files.
 */
export const semanticColors = {
  dark: {
    background: neutralDark[950],
    backgroundDeep: neutralDark[1000],
    surface: neutralDark[900],
    surfaceAlt: neutralDark[850],
    surfaceRaised: neutralDark[800],

    border: "#1F1F26",
    borderStrong: "#2A2A33",

    text: "#FAFAFC",
    textMuted: grey.muted,
    textDim: grey.dim,
    textDisabled: "#4A4A53",

    brand: brand.violet,
    brandForeground: "#FFFFFF",

    /** "ON AIR" / "LIVE" badges — cyan reads as active against the dark UI. */
    onAir: brand.cyan,
    onAirForeground: neutralDark[1000],

    overlay: "rgba(8, 8, 10, 0.72)",
    skeleton: neutralDark[800],
  },
  light: {
    background: neutralLight[50],
    backgroundDeep: neutralLight[100],
    surface: neutralLight[0],
    surfaceAlt: neutralLight[100],
    surfaceRaised: neutralLight[0],

    border: neutralLight[200],
    borderStrong: neutralLight[300],

    text: neutralDark[950],
    textMuted: grey.dim,
    textDim: grey.mutedAlt,
    textDisabled: neutralLight[400],

    brand: brand.violet,
    brandForeground: "#FFFFFF",

    onAir: "#0E9BB5",
    onAirForeground: "#FFFFFF",

    overlay: "rgba(10, 10, 12, 0.45)",
    skeleton: neutralLight[100],
  },
} as const satisfies Record<ThemeName, Record<string, string>>;

export type SemanticColorToken = keyof (typeof semanticColors)["dark"];
