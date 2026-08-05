/**
 * Per-screen background glows, read verbatim from the design files.
 *
 * Each corresponds to a CSS `radial-gradient(<rx> <ry> at <cx> <cy>, <color>)`
 * layered over the screen background. Light mode flattens every opacity to 0.10,
 * which is what the light row of the design files uses.
 *
 * Collected here so nobody invents a new glow inline.
 */
export type Glow = {
  color: string;
  /** Dark-mode opacity. Light mode is flattened to 0.10. */
  opacity: number;
  /** Fractional centre. */
  cx: number;
  cy: number;
  /** Fractional radii. */
  rx: number;
  ry: number;
};

export const GLOW = {
  // --- Onboarding (Onboarding.html) ---
  /** 110% 50% at 50% 34%, rgba(139,61,255,0.30) */
  welcome: { color: "#8B3DFF", opacity: 0.3, cx: 0.5, cy: 0.34, rx: 1.1, ry: 0.5 },
  /** 120% 45% at 20% 0%, rgba(34,211,238,0.16) */
  genreSelect: { color: "#22D3EE", opacity: 0.16, cx: 0.2, cy: 0, rx: 1.2, ry: 0.45 },
  /** 120% 45% at 80% 0%, rgba(46,123,255,0.18) */
  countrySelect: { color: "#2E7BFF", opacity: 0.18, cx: 0.8, cy: 0, rx: 1.2, ry: 0.45 },
  /** 95% 42% at 50% 36%, rgba(255,47,214,0.24) */
  ahaMoment: { color: "#FF2FD6", opacity: 0.24, cx: 0.5, cy: 0.36, rx: 0.95, ry: 0.42 },
  /** 110% 45% at 50% 22%, rgba(139,61,255,0.22) */
  notifications: { color: "#8B3DFF", opacity: 0.22, cx: 0.5, cy: 0.22, rx: 1.1, ry: 0.45 },
  /** 110% 45% at 50% 22%, rgba(34,211,238,0.20) */
  backgroundAudio: { color: "#22D3EE", opacity: 0.2, cx: 0.5, cy: 0.22, rx: 1.1, ry: 0.45 },
} as const satisfies Record<string, Glow>;

export type GlowName = keyof typeof GLOW;
