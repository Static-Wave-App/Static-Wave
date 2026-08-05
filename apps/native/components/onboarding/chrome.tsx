import { LinearGradient } from "expo-linear-gradient";
import type { ReactNode } from "react";
import { Pressable, View, useColorScheme } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Defs, Polyline, RadialGradient, Rect, Stop } from "react-native-svg";

import { Text } from "@/components/ui/text";

/**
 * Shared chrome for the six onboarding screens.
 *
 * Every value here is read from Onboarding.html rather than approximated —
 * the design ships a dark row and a light row, so both are encoded.
 */

export type OnboardingTheme = {
  background: string;
  text: string;
  muted: string;
  dim: string;
  surface: string;
  hairline: string;
  chipBg: string;
  chipBorder: string;
  dotInactive: string;
  homeIndicator: string;
  /** Bars inside the logo mark — inverted between themes. */
  markBar: string;
  ringOuter: string;
  ringInner: string;
};

const DARK: OnboardingTheme = {
  background: "#08080A",
  text: "#FAFAFC",
  muted: "#9C9CA8",
  dim: "#62626C",
  surface: "#16161B",
  hairline: "rgba(255,255,255,0.08)",
  chipBg: "rgba(255,255,255,0.06)",
  chipBorder: "rgba(255,255,255,0.08)",
  dotInactive: "rgba(255,255,255,0.14)",
  homeIndicator: "#62626C",
  markBar: "rgba(10,10,12,0.82)",
  ringOuter: "rgba(139,61,255,0.16)",
  ringInner: "rgba(139,61,255,0.30)",
};

const LIGHT: OnboardingTheme = {
  background: "#FFFFFF",
  text: "#0A0A0C",
  muted: "#6C6C77",
  dim: "#8A8A93",
  surface: "#F5F5F7",
  hairline: "rgba(0,0,0,0.08)",
  chipBg: "rgba(0,0,0,0.04)",
  chipBorder: "rgba(0,0,0,0.08)",
  dotInactive: "rgba(0,0,0,0.10)",
  homeIndicator: "#A0A0AA",
  markBar: "rgba(255,255,255,0.92)",
  ringOuter: "rgba(139,61,255,0.10)",
  ringInner: "rgba(139,61,255,0.10)",
};

export function useOnboardingTheme(): { theme: OnboardingTheme; isDark: boolean } {
  const scheme = useColorScheme();
  const isDark = scheme !== "light";
  return { theme: isDark ? DARK : LIGHT, isDark };
}

/** Per-screen background glow, exactly as specified in the design file. */
export type Glow = {
  color: string;
  /** Opacity in dark mode; light mode is flattened to 0.10 per the light row. */
  opacity: number;
  /** Fractional centre, e.g. { x: 0.5, y: 0.34 }. */
  cx: number;
  cy: number;
  /** Fractional radii of the ellipse. */
  rx: number;
  ry: number;
};

/**
 * React Native has no radial-gradient primitive, so the glow is drawn with
 * react-native-svg rather than approximated with a linear gradient.
 */
function GlowLayer({ glow, isDark }: { glow: Glow; isDark: boolean }) {
  const opacity = isDark ? glow.opacity : 0.1;

  return (
    <View style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }} pointerEvents="none">
      <Svg width="100%" height="100%">
        <Defs>
          <RadialGradient
            id="glow"
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
        <Rect x="0" y="0" width="100%" height="100%" fill="url(#glow)" />
      </Svg>
    </View>
  );
}

export function OnboardingScreen({
  glow,
  children,
}: {
  glow: Glow;
  children: ReactNode;
}) {
  const { theme, isDark } = useOnboardingTheme();
  const insets = useSafeAreaInsets();

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <GlowLayer glow={glow} isDark={isDark} />
      <View style={{ flex: 1, paddingTop: insets.top }}>{children}</View>
    </View>
  );
}

/** Top-right "Skip" — 14px / 400 / muted, in a row padded 20px 24px 0. */
export function OnboardingHeader({
  onSkip,
  onBack,
}: {
  onSkip?: () => void;
  onBack?: () => void;
}) {
  const { theme } = useOnboardingTheme();

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: onBack ? "space-between" : "flex-end",
        paddingHorizontal: 24,
        paddingTop: 20,
      }}
    >
      {onBack ? (
        <Pressable
          onPress={onBack}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          style={{
            width: 40,
            height: 40,
            borderRadius: 14,
            backgroundColor: theme.chipBg,
            borderWidth: 1,
            borderColor: theme.chipBorder,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
            <Polyline
              points="15 18 9 12 15 6"
              stroke={theme.text}
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        </Pressable>
      ) : null}

      {onSkip ? (
        <Pressable onPress={onSkip} accessibilityRole="button" hitSlop={12}>
          <Text variant="body-md" weight="400" style={{ color: theme.muted }}>
            Skip
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}

/**
 * Six dots, bottom 112px, gap 7px. Completed dots are solid #8B3DFF, the
 * active dot is a 22x6 gradient pill, upcoming dots are theme-tinted.
 */
export function ProgressDots({ step }: { step: number }) {
  const { theme } = useOnboardingTheme();

  return (
    <View
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 112,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 7,
      }}
    >
      {Array.from({ length: 6 }, (_, i) => {
        if (i === step) {
          return (
            <LinearGradient
              key={i}
              colors={["#8B3DFF", "#22D3EE"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{ width: 22, height: 6, borderRadius: 3 }}
            />
          );
        }
        return (
          <View
            key={i}
            style={{
              width: 6,
              height: 6,
              borderRadius: 3,
              backgroundColor: i < step ? "#8B3DFF" : theme.dotInactive,
            }}
          />
        );
      })}
    </View>
  );
}

/**
 * Primary CTA — 58px tall, 20px radius (NOT a pill), inset 24px, bottom 40px,
 * gradient(120deg, #FF2FD6, #8B3DFF 50%, #2E7BFF).
 */
export function PrimaryCta({
  label,
  onPress,
  withArrow = true,
  disabled = false,
  style,
}: {
  label: string;
  onPress: () => void;
  withArrow?: boolean;
  disabled?: boolean;
  style?: object;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      style={({ pressed }) => [
        {
          height: 58,
          borderRadius: 20,
          overflow: "hidden",
          opacity: disabled ? 0.4 : pressed ? 0.9 : 1,
        },
        style,
      ]}
    >
      <LinearGradient
        // 120deg in CSS ≈ this diagonal in RN's start/end coordinate space.
        colors={["#FF2FD6", "#8B3DFF", "#2E7BFF"]}
        locations={[0, 0.5, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0.6 }}
        style={{
          flex: 1,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          gap: 9,
        }}
      >
        <Text variant="body-xl" weight="500" style={{ color: "rgba(255,255,255,0.96)" }}>
          {label}
        </Text>
        {withArrow ? (
          <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
            <Polyline
              points="9 18 15 12 9 6"
              stroke="rgba(255,255,255,0.96)"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        ) : null}
      </LinearGradient>
    </Pressable>
  );
}

/** The 140x5 home indicator drawn in the mockups. */
export function HomeIndicator() {
  const { theme } = useOnboardingTheme();
  return (
    <View
      pointerEvents="none"
      style={{
        position: "absolute",
        bottom: 9,
        alignSelf: "center",
        width: 140,
        height: 5,
        borderRadius: 3,
        backgroundColor: theme.homeIndicator,
      }}
    />
  );
}

/**
 * The logo mark: 180x180 (or sized), radius 52, brand gradient, five bars of
 * heights 38/74/110/62/28 at width 9 and radius 5.
 */
export function WaveMark({ size = 180 }: { size?: number }) {
  const { theme } = useOnboardingTheme();
  const scale = size / 180;
  const heights = [38, 74, 110, 62, 28];

  return (
    <LinearGradient
      colors={["#FF2FD6", "#8B3DFF", "#2E7BFF", "#22D3EE"]}
      locations={[0, 0.45, 0.78, 1]}
      start={{ x: 0, y: 0 }}
      end={{ x: 0.85, y: 1 }}
      style={{
        width: size,
        height: size,
        borderRadius: 52 * scale,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 9 * scale,
      }}
    >
      {heights.map((h, i) => (
        <View
          key={i}
          style={{
            width: 9 * scale,
            height: h * scale,
            borderRadius: 5 * scale,
            backgroundColor: theme.markBar,
          }}
        />
      ))}
    </LinearGradient>
  );
}
