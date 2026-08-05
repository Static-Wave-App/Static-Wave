import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import type { BottomSheetBackdropProps } from "@gorhom/bottom-sheet";
import { forwardRef, useCallback, useImperativeHandle, useMemo, useRef } from "react";
import { Pressable, View } from "react-native";

import { Eyebrow, Text } from "@/components/ui/text";
import { useAppColors } from "@/components/ui/theme";
import { formatCountdown } from "@/lib/format";
import { useSleepTimer } from "@/stores";

/**
 * Sleep timer sheet.
 *
 * The copy here is load-bearing, not decoration. expo-audio has no background
 * JS runtime, so the OS suspends our interval the moment the app leaves the
 * foreground. What actually happens:
 *
 *   - foreground → playback pauses on time
 *   - backgrounded → a local notification fires at expiry, and playback pauses
 *     the moment the app is next foregrounded
 *
 * `endTime` is absolute so no time is lost, but the pause is not precise while
 * backgrounded. The user is told this rather than left to discover it. See §8
 * of the handover — this was an agreed trade for dropping react-native-track-
 * player, and the UI must not imply precision it doesn't have.
 */

const DURATIONS = [15, 30, 45, 60, 90] as const;

export type SleepTimerSheetRef = {
  open: () => void;
  close: () => void;
};

export const SleepTimerSheet = forwardRef<SleepTimerSheetRef>(function SleepTimerSheet(
  _props,
  ref,
) {
  const { colors } = useAppColors();
  // Modal rather than plain sheet, so it portals to the root provider and can't
  // be layered under anything the screen draws over it.
  const bottomSheet = useRef<BottomSheetModal>(null);

  const isActive = useSleepTimer((s) => s.isActive);
  const remainingSeconds = useSleepTimer((s) => s.remainingSeconds);
  const setTimer = useSleepTimer((s) => s.set);
  const cancel = useSleepTimer((s) => s.cancel);

  // Exposes only open/close, keeping the sheet's own ref private. Assigning to
  // a ref during render would be a side effect in the render phase.
  useImperativeHandle(
    ref,
    () => ({
      open: () => bottomSheet.current?.present(),
      close: () => bottomSheet.current?.dismiss(),
    }),
    [],
  );

  const snapPoints = useMemo(() => ["48%"], []);

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        opacity={0.6}
        pressBehavior="close"
      />
    ),
    [],
  );

  return (
    <BottomSheetModal
      ref={bottomSheet}
      snapPoints={snapPoints}
      enablePanDownToClose
      backdropComponent={renderBackdrop}
      backgroundStyle={{ backgroundColor: colors.surface }}
      handleIndicatorStyle={{ backgroundColor: colors.dim }}
    >
      <BottomSheetView style={{ paddingHorizontal: 24, paddingBottom: 40 }}>
        <Eyebrow variant="mono-2xs" style={{ letterSpacing: 1.8, color: colors.muted }}>
          SLEEP TIMER
        </Eyebrow>

        <Text
          weight="600"
          style={{ marginTop: 10, fontSize: 22, letterSpacing: -0.44, color: colors.text }}
        >
          {isActive ? formatCountdown(remainingSeconds) : "Stop playing after"}
        </Text>

        <View
          style={{
            flexDirection: "row",
            flexWrap: "wrap",
            gap: 8,
            marginTop: 20,
          }}
        >
          {DURATIONS.map((minutes) => (
            <Pressable
              key={minutes}
              onPress={() => {
                setTimer(minutes);
                bottomSheet.current?.dismiss();
              }}
              accessibilityRole="button"
              accessibilityLabel={`Sleep after ${minutes} minutes`}
              style={({ pressed }) => ({
                height: 36,
                paddingHorizontal: 15,
                borderRadius: 18,
                backgroundColor: colors.chipBg,
                borderWidth: 1,
                borderColor: colors.chipBorder,
                justifyContent: "center",
                opacity: pressed ? 0.7 : 1,
              })}
            >
              <Text weight="400" style={{ fontSize: 13.5, color: colors.text }}>
                {minutes} min
              </Text>
            </Pressable>
          ))}
        </View>

        {isActive ? (
          <Pressable
            onPress={() => {
              cancel();
              bottomSheet.current?.dismiss();
            }}
            accessibilityRole="button"
            accessibilityLabel="Cancel sleep timer"
            style={({ pressed }) => ({ marginTop: 20, opacity: pressed ? 0.6 : 1 })}
          >
            <Text variant="body-md" style={{ color: "#FF2FD6" }}>
              Cancel timer
            </Text>
          </Pressable>
        ) : null}

        <Text
          weight="300"
          style={{ marginTop: 22, fontSize: 12.5, lineHeight: 19, color: colors.muted }}
        >
          Exact while Static Wave is open. If the app is in the background when the
          timer ends, you&apos;ll get a notification and playback stops as soon as you
          open the app again.
        </Text>
      </BottomSheetView>
    </BottomSheetModal>
  );
});
