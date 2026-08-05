import { useEffect, useRef } from "react";
import { Animated, Easing, View } from "react-native";

/**
 * The 5-bar equaliser in the Now Playing bar, and the 26-bar waveform on the
 * Player. Both are static in the design file; both need to move in the app,
 * because a stopped equaliser next to playing audio reads as a bug.
 *
 * Animated via `scaleY` rather than `height`: transforms run on the native
 * driver, so the bars keep moving during a JS-thread stall (a station change,
 * a list re-render). Animating `height` would not — it can't be natively
 * driven, and it would relayout the row on every frame.
 *
 * React Native's default transform origin is the centre of the view, which
 * matches the design's `align-items: center` on both containers.
 */

/** heights 8/16/11/19/7, colours cyan → blue → violet → pink → violet. */
const EQ_BARS = [
  { height: 8, color: "#22D3EE" },
  { height: 16, color: "#2E7BFF" },
  { height: 11, color: "#8B3DFF" },
  { height: 19, color: "#FF2FD6" },
  { height: 7, color: "#8B3DFF" },
] as const;

const EQ_CONTAINER_HEIGHT = 20;

function useBarAnimations(count: number, active: boolean, minScale: number) {
  // One value per bar, created once and reused — recreating them on each
  // render would restart every animation mid-cycle.
  const values = useRef(
    Array.from({ length: count }, () => new Animated.Value(1)),
  ).current;

  useEffect(() => {
    if (!active) {
      // Settle flat rather than freezing mid-bounce.
      const settle = values.map((v) =>
        Animated.timing(v, {
          toValue: minScale,
          duration: 180,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
      );
      Animated.parallel(settle).start();
      return;
    }

    // Prime numbers-ish durations so the bars never resynchronise into a
    // single pulsing block.
    const loops = values.map((value, i) => {
      const duration = 380 + ((i * 137) % 320);
      return Animated.loop(
        Animated.sequence([
          Animated.timing(value, {
            toValue: minScale,
            duration,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(value, {
            toValue: 1,
            duration,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
        ]),
      );
    });

    for (const loop of loops) loop.start();
    return () => {
      for (const loop of loops) loop.stop();
    };
  }, [active, minScale, values]);

  return values;
}

/**
 * Now Playing bar equaliser. 5 bars, width 2, radius 1, gap 2, in a 20px box.
 */
export function Equaliser({ active = true }: { active?: boolean }) {
  const values = useBarAnimations(EQ_BARS.length, active, 0.4);

  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 2,
        height: EQ_CONTAINER_HEIGHT,
      }}
    >
      {EQ_BARS.map((bar, i) => (
        <Animated.View
          key={i}
          style={{
            width: 2,
            height: bar.height,
            borderRadius: 1,
            backgroundColor: bar.color,
            transform: [{ scaleY: values[i] }],
          }}
        />
      ))}
    </View>
  );
}

/**
 * Player waveform — 26 bars, width 3, radius 2, gap 3, in a 60px box.
 * The colour ramp walks the full brand gradient (#FF2FD6 → #22D3EE) bar by
 * bar; both the heights and the per-bar hex values are read from the design.
 */
const WAVE_BARS = [
  { height: 10, color: "#FF2FD6" },
  { height: 22, color: "#FF2FD6" },
  { height: 14, color: "#F135DC" },
  { height: 34, color: "#E13AE1" },
  { height: 20, color: "#D13DE6" },
  { height: 44, color: "#C13FEB" },
  { height: 16, color: "#B141F0" },
  { height: 28, color: "#A143F5" },
  { height: 52, color: "#9142FA" },
  { height: 24, color: "#8B3DFF" },
  { height: 38, color: "#7B48FF" },
  { height: 18, color: "#6B53FF" },
  { height: 46, color: "#5B5EFF" },
  { height: 26, color: "#4B69FF" },
  { height: 58, color: "#3B74FF" },
  { height: 30, color: "#2E7BFF" },
  { height: 42, color: "#2E88FA" },
  { height: 20, color: "#2B95F5" },
  { height: 36, color: "#28A2F0" },
  { height: 14, color: "#25AFEB" },
  { height: 48, color: "#23BCE6" },
  { height: 22, color: "#22C7DC" },
  { height: 32, color: "#22D3EE" },
  { height: 12, color: "#22D3EE" },
  { height: 26, color: "#22D3EE" },
  { height: 9, color: "#22D3EE" },
] as const;

const WAVE_CONTAINER_HEIGHT = 60;

export function Waveform({ active = true }: { active?: boolean }) {
  const values = useBarAnimations(WAVE_BARS.length, active, 0.35);

  return (
    // The 60px box is the bar track; the 24px top padding sits outside it.
    // (In CSS the design's `height:60px` is a content box, so it doesn't
    // include the padding — collapsing them here would clip the 58px bar.)
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={{ paddingTop: 24, paddingHorizontal: 30 }}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          gap: 3,
          height: WAVE_CONTAINER_HEIGHT,
        }}
      >
        {WAVE_BARS.map((bar, i) => (
          <Animated.View
            key={i}
            style={{
              width: 3,
              height: bar.height,
              borderRadius: 2,
              backgroundColor: bar.color,
              transform: [{ scaleY: values[i] }],
            }}
          />
        ))}
      </View>
    </View>
  );
}
