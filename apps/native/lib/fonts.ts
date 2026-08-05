import { fontFace } from "@static-wave/design";

/**
 * Font resolution for React Native.
 *
 * This is the one place the web and native diverge on typography. On the web a
 * browser is handed `font-family: Outfit` plus `font-weight: 600` and picks the
 * right face itself. React Native does no such thing — Android in particular
 * will either ignore the weight or synthesise a fake bold. Each weight must be
 * requested by its own PostScript family name.
 *
 * So `font-display`/`font-medium` classes are not enough on native; components
 * resolve the concrete family through `getFontFamily` and set it via `style`.
 */

export type FontFamilyName = "display" | "mono";
export type FontWeightValue = "300" | "400" | "500" | "600" | "700";

/** Weights actually shipped for each family (see app.json's expo-font plugin). */
const AVAILABLE: Record<FontFamilyName, FontWeightValue[]> = {
  display: ["300", "400", "500", "600", "700"],
  mono: ["400", "500", "600"],
};

/**
 * Resolves a family + weight to the embedded PostScript name.
 * Falls back to the nearest available weight rather than rendering a synthetic
 * face — mono has no 300 or 700, so asking for those is legitimate.
 */
export function getFontFamily(
  family: FontFamilyName,
  weight: FontWeightValue = "400",
): string {
  const available = AVAILABLE[family];
  const target = Number(weight);

  const nearest = available.reduce((best, candidate) =>
    Math.abs(Number(candidate) - target) < Math.abs(Number(best) - target) ? candidate : best,
  );

  return fontFace[family][nearest as keyof (typeof fontFace)[typeof family]];
}

/**
 * Map for `useFonts`. The expo-font config plugin embeds these at build time,
 * so on a development or production build they're available before first
 * render and this resolves immediately. It's kept as a safety net: if the
 * plugin config and these names ever drift, `useFonts` fails loudly at startup
 * instead of silently falling back to the system font.
 */
export const appFonts = {
  "Outfit-Light": require("../assets/fonts/Outfit/Outfit-Light.ttf"),
  "Outfit-Regular": require("../assets/fonts/Outfit/Outfit-Regular.ttf"),
  "Outfit-Medium": require("../assets/fonts/Outfit/Outfit-Medium.ttf"),
  "Outfit-SemiBold": require("../assets/fonts/Outfit/Outfit-SemiBold.ttf"),
  "Outfit-Bold": require("../assets/fonts/Outfit/Outfit-Bold.ttf"),
  "IBMPlexMono-Regular": require("../assets/fonts/IBMPlexMono/IBMPlexMono-Regular.ttf"),
  "IBMPlexMono-Medium": require("../assets/fonts/IBMPlexMono/IBMPlexMono-Medium.ttf"),
  "IBMPlexMono-SemiBold": require("../assets/fonts/IBMPlexMono/IBMPlexMono-SemiBold.ttf"),
};
