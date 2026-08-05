import { useAppTheme } from "@/contexts/app-theme-context";

/**
 * Resolved colour palette for imperative styling.
 *
 * Tailwind classes cover most cases, but SVG fills, gradient stops and
 * `LinearGradient` colours need real values. Every value below is read from the
 * two design files (StaticWave Screens / Onboarding), which ship a dark row and
 * a light row.
 *
 * IMPORTANT: this reads the app's own theme via `useAppTheme()` (uniwind), NOT
 * the OS `useColorScheme()`. The two diverge the moment a user overrides the
 * theme in-app, which previously left onboarding light while the app was dark.
 */
export type AppColors = {
  background: string;
  text: string;
  muted: string;
  dim: string;
  surface: string;
  /** Tinted surface used behind FEATURED-style cards. */
  accentSurface: string;
  hairline: string;
  chipBg: string;
  chipBorder: string;
  /**
   * Fill for the floating bars — tab bar, Now Playing bar, FEATURED glass bar.
   * The design pairs it with `backdrop-filter: blur(20–24px)`, which React
   * Native has no equivalent for without expo-blur. These alpha values are the
   * design's own, and read correctly over the screen background on their own.
   */
  glass: string;
  glassBorder: string;
  dotInactive: string;
  homeIndicator: string;
  /** Bars inside the logo mark — inverted between themes. */
  markBar: string;
  ringOuter: string;
  ringInner: string;
  /** "ON AIR" / "LIVE" indicators. */
  onAir: string;
  /** Scrim behind modals and sheets. */
  overlay: string;
  /** Loading placeholder fill. */
  skeleton: string;
};

export const DARK_COLORS: AppColors = {
  background: "#08080A",
  text: "#FAFAFC",
  muted: "#9C9CA8",
  dim: "#62626C",
  surface: "#16161B",
  accentSurface: "#1B1B20",
  hairline: "rgba(255,255,255,0.08)",
  chipBg: "rgba(255,255,255,0.06)",
  chipBorder: "rgba(255,255,255,0.08)",
  glass: "rgba(12,12,16,0.78)",
  glassBorder: "rgba(255,255,255,0.10)",
  dotInactive: "rgba(255,255,255,0.14)",
  homeIndicator: "#62626C",
  markBar: "rgba(10,10,12,0.82)",
  ringOuter: "rgba(139,61,255,0.16)",
  ringInner: "rgba(139,61,255,0.30)",
  onAir: "#22D3EE",
  overlay: "rgba(8,8,10,0.72)",
  skeleton: "#1B1B20",
};

export const LIGHT_COLORS: AppColors = {
  background: "#FFFFFF",
  text: "#0A0A0C",
  muted: "#6C6C77",
  dim: "#8A8A93",
  surface: "#F5F5F7",
  accentSurface: "#F5F5F7",
  hairline: "rgba(0,0,0,0.08)",
  chipBg: "rgba(0,0,0,0.04)",
  chipBorder: "rgba(0,0,0,0.08)",
  glass: "rgba(255,255,255,0.82)",
  glassBorder: "rgba(0,0,0,0.10)",
  dotInactive: "rgba(0,0,0,0.10)",
  homeIndicator: "#A0A0AA",
  markBar: "rgba(255,255,255,0.92)",
  ringOuter: "rgba(139,61,255,0.10)",
  ringInner: "rgba(139,61,255,0.10)",
  onAir: "#0E9BB5",
  overlay: "rgba(10,10,12,0.45)",
  skeleton: "#F5F5F7",
};

export function useAppColors(): { colors: AppColors; isDark: boolean } {
  const { isLight } = useAppTheme();
  const isDark = !isLight;
  return { colors: isDark ? DARK_COLORS : LIGHT_COLORS, isDark };
}
