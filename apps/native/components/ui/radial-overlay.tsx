import { useId } from "react";
import { View } from "react-native";
import Svg, { Defs, RadialGradient, Rect, Stop } from "react-native-svg";

/**
 * A CSS `radial-gradient(<rx> <ry> at <cx> <cy>, <color>, transparent <stop>)`
 * layered over its parent.
 *
 * React Native has no radial gradient primitive, and `expo-linear-gradient`
 * can't fake one — a linear approximation of the FEATURED card's cyan bloom
 * reads as a diagonal band rather than a glow. So it's drawn with SVG.
 *
 * Used by the Dashboard's FEATURED card and the Station Details hero. The
 * screen-level glow in `screen.tsx` does the same thing for a full screen.
 */
export type RadialOverlayProps = {
  color: string;
  opacity: number;
  /** Fractional centre, matching CSS's `at <cx> <cy>`. */
  cx: number;
  cy: number;
  /** Fractional radii. */
  rx: number;
  ry: number;
  /** Where the colour reaches zero. CSS default in these designs is 60%. */
  fadeAt?: number;
  borderRadius?: number;
};

export function RadialOverlay({
  color,
  opacity,
  cx,
  cy,
  rx,
  ry,
  fadeAt = 0.6,
  borderRadius,
}: RadialOverlayProps) {
  // Gradient ids are global to the SVG namespace; two overlays on one screen
  // with the same id would make the second one adopt the first's stops.
  const id = `radial-${useId()}`;

  return (
    <View
      pointerEvents="none"
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        borderRadius,
        overflow: "hidden",
      }}
    >
      <Svg width="100%" height="100%">
        <Defs>
          <RadialGradient
            id={id}
            cx={`${cx * 100}%`}
            cy={`${cy * 100}%`}
            rx={`${rx * 100}%`}
            ry={`${ry * 100}%`}
            gradientUnits="userSpaceOnUse"
          >
            <Stop offset="0" stopColor={color} stopOpacity={opacity} />
            <Stop offset={String(fadeAt)} stopColor={color} stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Rect x="0" y="0" width="100%" height="100%" fill={`url(#${id})`} />
      </Svg>
    </View>
  );
}
