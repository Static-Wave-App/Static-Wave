import { radius, semanticColors } from "./tokens";

/**
 * heroui-native theme mapping.
 *
 * Points heroui's primitives at our tokens so its Button/Chip/Sheet/Switch
 * inherit the design without per-usage overrides. Pass to `HeroUINativeProvider`
 * in apps/native/app/_layout.tsx.
 *
 * Where the design diverges from what heroui can express, use a thin wrapper
 * component rather than fighting the theme — that was the agreed approach.
 *
 * NOTE: heroui-native's theme option names are not fully documented for v1.0.
 * If a key here is ignored, the fix is to rename it to heroui's expected key,
 * not to hardcode a colour at the call site.
 */
export const heroUITheme = {
  light: {
    colors: {
      background: semanticColors.light.background,
      foreground: semanticColors.light.text,
      surface: semanticColors.light.surface,
      surfaceForeground: semanticColors.light.text,
      muted: semanticColors.light.textMuted,
      mutedForeground: semanticColors.light.textDim,
      border: semanticColors.light.border,
      accent: semanticColors.light.brand,
      accentForeground: semanticColors.light.brandForeground,
      success: semanticColors.light.onAir,
      danger: "#E5484D",
      warning: "#F5A524",
    },
  },
  dark: {
    colors: {
      background: semanticColors.dark.background,
      foreground: semanticColors.dark.text,
      surface: semanticColors.dark.surface,
      surfaceForeground: semanticColors.dark.text,
      muted: semanticColors.dark.textMuted,
      mutedForeground: semanticColors.dark.textDim,
      border: semanticColors.dark.border,
      accent: semanticColors.dark.brand,
      accentForeground: semanticColors.dark.brandForeground,
      success: semanticColors.dark.onAir,
      danger: "#FF6369",
      warning: "#FFB224",
    },
  },
  radius: {
    small: radius.sm,
    medium: radius.md,
    large: radius.xl,
  },
} as const;
