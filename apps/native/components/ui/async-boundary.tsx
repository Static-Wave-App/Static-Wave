import type { ReactNode } from "react";
import { ActivityIndicator, Pressable, View } from "react-native";
import Svg, { Polyline } from "react-native-svg";

import { useNetwork } from "@/stores";

import { Eyebrow, Text } from "./text";
import { useAppColors } from "./theme";

/**
 * The loading / error / empty / offline triad, in one place.
 *
 * Five screens need this. Without it each one grows its own slightly different
 * version and the offline case gets forgotten on three of them.
 */
export type AsyncBoundaryProps = {
  isLoading?: boolean;
  error?: string | null;
  isEmpty?: boolean;
  empty?: ReactNode;
  onRetry?: () => void;
  /** Shown while loading — a skeleton list reads better than a spinner. */
  loadingFallback?: ReactNode;
  children: ReactNode;
};

export function AsyncBoundary({
  isLoading = false,
  error = null,
  isEmpty = false,
  empty,
  onRetry,
  loadingFallback,
  children,
}: AsyncBoundaryProps) {
  const { colors } = useAppColors();
  const isConnected = useNetwork((s) => s.isConnected);

  // Offline outranks a generic error: it's actionable and the error message
  // would otherwise be misleading ("Couldn't load stations" when the network
  // is simply off).
  if (!isConnected && (error || isEmpty)) {
    return (
      <StateBlock
        title="No internet connection"
        body="Reconnect to browse stations."
        onRetry={onRetry}
      />
    );
  }

  if (isLoading) {
    return (
      loadingFallback ?? (
        <View style={{ paddingVertical: 48, alignItems: "center" }}>
          <ActivityIndicator color={colors.muted} />
        </View>
      )
    );
  }

  if (error) {
    return <StateBlock title="Something went wrong" body={error} onRetry={onRetry} />;
  }

  if (isEmpty) return <>{empty ?? <StateBlock title="Nothing here yet" />}</>;

  return <>{children}</>;
}

export function StateBlock({
  title,
  body,
  onRetry,
  action,
}: {
  title: string;
  body?: string;
  onRetry?: () => void;
  action?: ReactNode;
}) {
  const { colors } = useAppColors();

  return (
    <View style={{ alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 48, paddingHorizontal: 32 }}>
      <Text variant="display-xs" style={{ color: colors.text, textAlign: "center" }}>
        {title}
      </Text>
      {body ? (
        <Text
          variant="body-md"
          weight="300"
          style={{ color: colors.muted, textAlign: "center" }}
        >
          {body}
        </Text>
      ) : null}

      {action}

      {onRetry ? (
        <Pressable
          onPress={onRetry}
          accessibilityRole="button"
          hitSlop={8}
          style={({ pressed }) => ({
            marginTop: 8,
            height: 36,
            paddingHorizontal: 15,
            borderRadius: 17,
            backgroundColor: colors.chipBg,
            borderWidth: 1,
            borderColor: colors.chipBorder,
            alignItems: "center",
            justifyContent: "center",
            opacity: pressed ? 0.7 : 1,
          })}
        >
          <Text variant="body-sm" style={{ fontSize: 13.5, color: colors.text }}>
            Try again
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}

/**
 * Section header. Title 17px/600/-.02em with an optional muted action —
 * "See all" (Dashboard) or "Recently added" (Favorites).
 */
export function SectionHeader({
  title,
  /** Renders the title as a mono eyebrow instead — "ALL SAVED", "248 RESULTS". */
  eyebrow = false,
  actionLabel,
  onAction,
  withChevron = true,
  style,
}: {
  title: string;
  eyebrow?: boolean;
  actionLabel?: string;
  onAction?: () => void;
  withChevron?: boolean;
  style?: object;
}) {
  const { colors } = useAppColors();

  return (
    <View
      style={[
        { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
        style,
      ]}
    >
      {eyebrow ? (
        <Eyebrow variant="mono-xs" style={{ fontSize: 10.5, color: colors.dim }}>
          {title}
        </Eyebrow>
      ) : (
        <Text variant="display-xs" style={{ color: colors.text }}>
          {title}
        </Text>
      )}

      {actionLabel ? (
        <Pressable
          onPress={onAction}
          accessibilityRole="button"
          hitSlop={8}
          style={({ pressed }) => ({
            flexDirection: "row",
            alignItems: "center",
            gap: withChevron ? 4 : 6,
            opacity: pressed ? 0.6 : 1,
          })}
        >
          <Text variant="body-sm" style={{ fontSize: 13, color: colors.muted }}>
            {actionLabel}
          </Text>
          {withChevron ? (
            <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
              <Polyline
                points="9 18 15 12 9 6"
                stroke={colors.muted}
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
          ) : null}
        </Pressable>
      ) : null}
    </View>
  );
}

/** Placeholder block. Lists shimmer rather than spin — they're the main content. */
export function Skeleton({
  width,
  height,
  radius = 14,
  style,
}: {
  width?: number | `${number}%`;
  height: number;
  radius?: number;
  style?: object;
}) {
  const { colors } = useAppColors();
  return (
    <View
      style={[
        { width: width ?? "100%", height, borderRadius: radius, backgroundColor: colors.skeleton },
        style,
      ]}
    />
  );
}

/** A stand-in for a list of StationRows while data loads. */
export function StationRowSkeleton({ count = 5, gap = 10 }: { count?: number; gap?: number }) {
  return (
    <View style={{ gap }}>
      {Array.from({ length: count }, (_, i) => (
        <Skeleton key={i} height={74} radius={22} />
      ))}
    </View>
  );
}
