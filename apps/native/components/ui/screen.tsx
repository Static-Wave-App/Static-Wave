import type { ReactNode } from "react";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Defs, RadialGradient, Rect, Stop } from "react-native-svg";

import { layout } from "@static-wave/design";

import type { Glow } from "./glow";
import { useAppColors } from "./theme";

/**
 * React Native has no radial-gradient primitive, so the glow is drawn with
 * react-native-svg. A linear approximation is visibly wrong against the design.
 */
function GlowLayer({ glow, isDark }: { glow: Glow; isDark: boolean }) {
  const opacity = isDark ? glow.opacity : 0.1;

  return (
    <View
      pointerEvents="none"
      style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
    >
      <Svg width="100%" height="100%">
        <Defs>
          <RadialGradient
            id="screenGlow"
            cx={`${glow.cx * 100}%`}
            cy={`${glow.cy * 100}%`}
            rx={`${glow.rx * 100}%`}
            ry={`${glow.ry * 100}%`}
            gradientUnits="userSpaceOnUse"
          >
            <Stop offset="0" stopColor={glow.color} stopOpacity={opacity} />
            <Stop offset="0.7" stopColor={glow.color} stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Rect x="0" y="0" width="100%" height="100%" fill="url(#screenGlow)" />
      </Svg>
    </View>
  );
}

export type ScreenProps = {
  children: ReactNode;
  /**
   * Optional — the dense list screens (Search, Favorites) have no glow in the
   * design. Only pass one where the design file shows one.
   */
  glow?: Glow;
  /**
   * `standard` = 24px, `tight` = 20px. Both exist in the design files; see
   * `layout.screenGutter` / `layout.screenGutterTight`.
   */
  gutter?: "standard" | "tight" | "none";
  /** Set false when the screen owns its own top inset (e.g. a scroll header). */
  safeTop?: boolean;
};

export function Screen({
  children,
  glow,
  gutter = "none",
  safeTop = true,
}: ScreenProps) {
  const { colors, isDark } = useAppColors();
  const insets = useSafeAreaInsets();

  const paddingHorizontal =
    gutter === "standard"
      ? layout.screenGutter
      : gutter === "tight"
        ? layout.screenGutterTight
        : 0;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {glow ? <GlowLayer glow={glow} isDark={isDark} /> : null}
      <View
        style={{
          flex: 1,
          paddingTop: safeTop ? insets.top : 0,
          paddingHorizontal,
        }}
      >
        {children}
      </View>
    </View>
  );
}
