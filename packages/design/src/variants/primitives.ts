import { tv } from "tailwind-variants";

/**
 * Shared component recipes.
 *
 * These emit className strings, so the same recipe drives a `<button>` on web
 * and a `<Pressable>` in the Expo app.
 *
 * CONSTRAINT: only utilities that uniwind supports in React Native may be used
 * here. That rules out `shadow-*`, `backdrop-blur-*`, CSS gradients, and
 * pseudo-selectors (`hover:`, `before:`). Anything web-only belongs in
 * packages/ui, not this file. Gradients on native go through
 * `expo-linear-gradient` with the token exports.
 */

/**
 * Primary CTAs across both design files: "Get started", "Continue",
 * "Sounds good — let's go", "Turn on notifications", "Play station".
 *
 * The gradient variant intentionally sets no background — the caller wraps it
 * in a LinearGradient (native) or adds `bg-brand-gradient` (web), because RN
 * can't express a gradient as a class.
 */
export const button = tv({
  // 20px radius (rounded-lg), NOT a pill — verified against both design files,
  // where every primary CTA is 58px tall with a 20px corner.
  base: "flex-row items-center justify-center rounded-lg",
  variants: {
    variant: {
      gradient: "",
      solid: "bg-brand",
      secondary: "bg-surface-alt border border-border",
      ghost: "bg-transparent",
      danger: "bg-red-500",
    },
    size: {
      sm: "h-9 px-4 gap-1.5",
      md: "h-11 px-5 gap-2",
      // 58px — the design's primary CTA height.
      lg: "h-[58px] px-6 gap-2",
    },
    block: {
      true: "w-full",
      false: "self-start",
    },
    disabled: {
      true: "opacity-40",
      false: "",
    },
  },
  defaultVariants: { variant: "gradient", size: "lg", block: true, disabled: false },
});

export const buttonLabel = tv({
  base: "font-display font-semibold text-center",
  variants: {
    variant: {
      gradient: "text-brand-foreground",
      solid: "text-brand-foreground",
      secondary: "text-foreground",
      ghost: "text-muted",
      danger: "text-white",
    },
    size: {
      sm: "text-body-md",
      md: "text-body-lg",
      lg: "text-body-xl",
    },
  },
  defaultVariants: { variant: "gradient", size: "lg" },
});

/**
 * Genre pills on onboarding step 02, and the filter chips (Jazz / Country /
 * Language / HD) on Search.
 */
export const chip = tv({
  base: "flex-row items-center justify-center rounded-pill border",
  variants: {
    selected: {
      true: "bg-brand border-brand",
      false: "bg-surface-alt border-border",
    },
    size: {
      sm: "h-8 px-3 gap-1",
      md: "h-10 px-4 gap-1.5",
    },
  },
  defaultVariants: { selected: false, size: "md" },
});

export const chipLabel = tv({
  base: "font-display font-medium text-body-md",
  variants: {
    selected: { true: "text-brand-foreground", false: "text-foreground" },
  },
  defaultVariants: { selected: false },
});

/**
 * The mono uppercase micro-labels used constantly in both files:
 * "NOW PLAYING", "FEATURED", "DETECTED", "POPULAR", "LOCK SCREEN",
 * "248 RESULTS", "ALL SAVED", "BITRATE".
 */
export const eyebrow = tv({
  base: "font-mono uppercase",
  variants: {
    size: {
      sm: "text-mono-sm",
      xs: "text-mono-xs",
      "2xs": "text-mono-2xs",
    },
    tone: {
      muted: "text-muted",
      dim: "text-dim",
      brand: "text-brand",
      foreground: "text-foreground",
      onAir: "text-on-air",
    },
  },
  defaultVariants: { size: "xs", tone: "dim" },
});

/** "ON AIR", "LIVE", "HD", "192K", "TRENDING". */
export const badge = tv({
  base: "flex-row items-center rounded-pill",
  variants: {
    tone: {
      onAir: "bg-on-air",
      brand: "bg-brand",
      neutral: "bg-surface-alt",
      outline: "bg-transparent border border-border",
    },
    size: {
      sm: "h-5 px-1.5 gap-1",
      md: "h-6 px-2 gap-1",
    },
  },
  defaultVariants: { tone: "neutral", size: "sm" },
});

export const badgeLabel = tv({
  base: "font-mono uppercase text-mono-2xs",
  variants: {
    tone: {
      onAir: "text-on-air-foreground",
      brand: "text-brand-foreground",
      neutral: "text-muted",
      outline: "text-muted",
    },
  },
  defaultVariants: { tone: "neutral" },
});

/** Cards — 22px radius is the signature shape of this design. */
export const card = tv({
  base: "rounded-xl overflow-hidden",
  variants: {
    surface: {
      base: "bg-surface",
      alt: "bg-surface-alt",
      raised: "bg-surface-raised",
      transparent: "bg-transparent",
    },
    bordered: { true: "border border-border", false: "" },
    padded: { true: "p-4", false: "" },
  },
  defaultVariants: { surface: "base", bordered: false, padded: true },
});

/** Station rows in Search, Favorites, Recently Played, Suggested. */
export const listRow = tv({
  base: "flex-row items-center gap-3 rounded-lg",
  variants: {
    padded: { true: "p-3", false: "" },
    surface: {
      none: "bg-transparent",
      base: "bg-surface",
      alt: "bg-surface-alt",
    },
    active: { true: "border border-brand", false: "" },
  },
  defaultVariants: { padded: true, surface: "none", active: false },
});

/** Wraps the initials fallback from apps/native/lib/format/station-avatar.ts. */
export const avatar = tv({
  base: "items-center justify-center overflow-hidden",
  variants: {
    size: {
      xs: "w-8 h-8 rounded-sm",
      sm: "w-10 h-10 rounded-md",
      md: "w-12 h-12 rounded-md",
      lg: "w-16 h-16 rounded-lg",
      xl: "w-24 h-24 rounded-xl",
      hero: "w-full aspect-square rounded-2xl",
    },
    shape: { rounded: "", circle: "rounded-full" },
  },
  defaultVariants: { size: "md", shape: "rounded" },
});

export const avatarInitials = tv({
  base: "font-display font-semibold text-white",
  variants: {
    size: {
      xs: "text-body-xs",
      sm: "text-body-md",
      md: "text-body-lg",
      lg: "text-display-xs",
      xl: "text-display-md",
      hero: "text-display-xl",
    },
  },
  defaultVariants: { size: "md" },
});

/** Search inputs: "Stations, genres, countries", "Search 200 countries". */
export const input = tv({
  base: "flex-row items-center gap-2 rounded-md bg-surface-alt border",
  variants: {
    focused: { true: "border-brand", false: "border-border" },
    invalid: { true: "border-red-500", false: "" },
    size: { md: "h-11 px-3", lg: "h-12 px-4" },
  },
  defaultVariants: { focused: false, invalid: false, size: "lg" },
});

export const inputText = tv({
  base: "flex-1 font-display text-body-lg text-foreground",
});

/** Bottom sheet — sleep timer presets, country picker. */
export const sheet = tv({
  base: "bg-surface rounded-t-2xl border-t border-border",
  variants: { padded: { true: "px-6 pt-4 pb-8", false: "" } },
  defaultVariants: { padded: true },
});

export const sheetHandle = tv({
  base: "self-center w-10 h-1 rounded-pill bg-border-strong mb-4",
});

/** Onboarding progress dots. */
export const progressDot = tv({
  base: "h-1.5 rounded-pill",
  variants: {
    state: {
      active: "w-6 bg-brand",
      complete: "w-1.5 bg-brand",
      upcoming: "w-1.5 bg-border-strong",
    },
  },
  defaultVariants: { state: "upcoming" },
});

/** Toggle rows on the notifications permission screen. */
export const switchRow = tv({
  base: "flex-row items-center justify-between gap-4 py-3",
  variants: { bordered: { true: "border-b border-border", false: "" } },
  defaultVariants: { bordered: false },
});

export const divider = tv({
  base: "bg-border",
  variants: {
    orientation: { horizontal: "h-px w-full", vertical: "w-px h-full" },
  },
  defaultVariants: { orientation: "horizontal" },
});

export const skeleton = tv({
  base: "bg-skeleton",
  variants: {
    radius: { sm: "rounded-sm", md: "rounded-md", pill: "rounded-pill" },
  },
  defaultVariants: { radius: "md" },
});

/** Screen container — owns the gutter decision from the design review. */
export const screen = tv({
  base: "flex-1 bg-background",
  variants: {
    gutter: {
      standard: "px-6",
      tight: "px-5",
      none: "",
    },
  },
  defaultVariants: { gutter: "standard" },
});

/** Empty states — "No favorites yet". */
export const emptyState = tv({
  base: "flex-1 items-center justify-center gap-3 px-8",
});
