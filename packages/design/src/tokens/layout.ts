/**
 * Spacing, radius, and layout primitives.
 *
 * Raw values observed across the two design files: gaps of 2/3/4/6/7/8/9/10/
 * 12/13/14/36/40px, gutters of 20 and 24px, and row padding like `11px 13px`.
 * Those odd values are snapped to an even 2px-based scale — the design was
 * hand-placed, and preserving 11/13px would produce a scale nobody can choose
 * from later.
 */

/** Keys are the pixel value, so `space[12]` is unambiguous at the call site. */
export const space = {
  0: 0,
  2: 2,
  4: 4,
  6: 6,
  8: 8,
  10: 10,
  12: 12,
  14: 14,
  16: 16,
  20: 20,
  24: 24,
  28: 28,
  32: 32,
  40: 40,
  48: 48,
  56: 56,
  64: 64,
} as const;

export type SpaceToken = keyof typeof space;

/**
 * Named spacing for the cases the screens repeat. Both gutters exist in the
 * designs: 24px is standard, 20px is used where list content needs the width.
 */
export const layout = {
  /** Standard screen gutter — headings, hero copy, CTAs. */
  screenGutter: space[24],
  /** Tighter gutter for dense scrolling lists. */
  screenGutterTight: space[20],
  /** Vertical gap between station rows (design used 13px). */
  listRowGap: space[12],
  /** Inner padding of a station row (design used 11px 13px). */
  listRowPaddingY: space[12],
  listRowPaddingX: space[12],
  /** Gap between a section heading and its content. */
  sectionGap: space[24],
  /** Gap between stacked sections. */
  sectionGapLarge: space[40],
  /** Minimum tappable square — below this, taps get missed. */
  minHitSlop: 44,
  /** Height of the persistent now-playing bar. */
  nowPlayingBarHeight: 64,
  /** Reference frame from both design files. */
  designWidth: 390,
  designHeight: 844,
} as const;

/**
 * Radii. `22px` is the card radius in both files (30 uses each) and is the
 * single most identifiable shape in the design, so it anchors the scale as
 * `xl`. The 1–3.5px values in the source files are waveform bars, not UI.
 */
export const radius = {
  none: 0,
  xs: 6,
  sm: 10,
  md: 14,
  lg: 18,
  /** Cards, sheets, large surfaces — the signature radius. */
  xl: 22,
  "2xl": 26,
  "3xl": 32,
  /** Chips, badges, pill buttons. */
  pill: 999,
  /** Avatars. */
  full: 9999,
} as const;

export type RadiusToken = keyof typeof radius;

export const borderWidth = {
  none: 0,
  hairline: 1,
  thick: 2,
} as const;

/**
 * The design is largely flat — depth comes from surface colour rather than
 * shadow. These are deliberately restrained, and Android needs `elevation`
 * because it ignores shadow offsets.
 */
export const elevation = {
  none: { shadowOpacity: 0, shadowRadius: 0, elevation: 0 },
  sm: {
    shadowColor: "#000000",
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  md: {
    shadowColor: "#000000",
    shadowOpacity: 0.18,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  /** Bottom sheets and modals. */
  lg: {
    shadowColor: "#000000",
    shadowOpacity: 0.28,
    shadowRadius: 32,
    shadowOffset: { width: 0, height: 16 },
    elevation: 12,
  },
} as const;

export const opacity = {
  disabled: 0.4,
  pressed: 0.7,
  muted: 0.6,
  overlay: 0.72,
} as const;

export const duration = {
  instant: 80,
  fast: 140,
  normal: 220,
  slow: 320,
  /** Screen transitions between onboarding steps. */
  screen: 280,
} as const;

export const easing = {
  standard: [0.2, 0, 0, 1],
  decelerate: [0, 0, 0, 1],
  accelerate: [0.3, 0, 1, 1],
} as const;

export const zIndex = {
  base: 0,
  nowPlayingBar: 10,
  header: 20,
  sheet: 30,
  toast: 40,
  modal: 50,
} as const;
