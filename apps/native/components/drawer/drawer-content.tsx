import Constants from "expo-constants";
import { useRouter } from "expo-router";
import { DrawerContentScrollView } from "expo-router/drawer";
import type { DrawerContentComponentProps } from "expo-router/drawer";
import type { ReactNode } from "react";
import { Pressable, View } from "react-native";

import {
  ClockIcon,
  HomeIcon,
  MoonIcon,
  PlayIcon,
  SearchIcon,
  SunIcon,
} from "@/components/ui/icons";
import { Eyebrow, Text } from "@/components/ui/text";
import { useAppColors } from "@/components/ui/theme";
import { Wordmark } from "@/components/ui/wordmark";
import { useAppTheme } from "@/contexts/app-theme-context";
import { formatCollectionSummary } from "@/lib/format";
import { useFavorites, useRecentlyPlayed, useSettings } from "@/stores";

/**
 * Drawer contents.
 *
 * The design file covers five screens and six onboarding steps; the drawer is
 * not among them. So nothing here is invented visually — the wordmark, the
 * mono eyebrow, the chip fill, the hairline and the 15px row type are all
 * lifted from screens that ARE specified. If a drawer design lands later this
 * should be re-transcribed against it.
 *
 * This is also the only place `AppThemeProvider.toggleTheme` is reachable from.
 * It existed with no caller until now, which meant a user who wanted light mode
 * had no way to ask for it.
 */

function NavItem({
  label,
  icon,
  active = false,
  onPress,
}: {
  label: string;
  icon: (color: string) => ReactNode;
  active?: boolean;
  onPress: () => void;
}) {
  const { colors } = useAppColors();
  const color = active ? "#8B3DFF" : colors.text;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      style={({ pressed }) => ({
        flexDirection: "row",
        alignItems: "center",
        gap: 14,
        height: 50,
        paddingHorizontal: 14,
        borderRadius: 18,
        backgroundColor: active ? colors.chipBg : "transparent",
        opacity: pressed ? 0.7 : 1,
      })}
    >
      {icon(color)}
      <Text weight={active ? "500" : "400"} style={{ fontSize: 15, color }}>
        {label}
      </Text>
    </Pressable>
  );
}

/**
 * A labelled row with a switch on the right — the theme toggle's markup,
 * pulled out so "Instant play" doesn't duplicate the track/knob styling.
 * Track 46×28, knob 22 — sized off the design's 26px pills so it sits at the
 * same visual weight as the chips elsewhere.
 */
function ToggleRow({
  label,
  icon,
  checked,
  onPress,
  accessibilityLabel,
}: {
  label: string;
  icon: ReactNode;
  checked: boolean;
  onPress: () => void;
  accessibilityLabel: string;
}) {
  const { colors } = useAppColors();

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="switch"
      accessibilityState={{ checked }}
      accessibilityLabel={accessibilityLabel}
      style={({ pressed }) => ({
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        height: 50,
        paddingHorizontal: 14,
        borderRadius: 18,
        opacity: pressed ? 0.7 : 1,
      })}
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: 14 }}>
        {icon}
        <Text weight="400" style={{ fontSize: 15, color: colors.text }}>
          {label}
        </Text>
      </View>

      <View
        style={{
          width: 46,
          height: 28,
          borderRadius: 14,
          backgroundColor: checked ? "#8B3DFF" : colors.chipBg,
          borderWidth: 1,
          borderColor: checked ? "#8B3DFF" : colors.chipBorder,
          justifyContent: "center",
          paddingHorizontal: 2,
          alignItems: checked ? "flex-end" : "flex-start",
        }}
      >
        <View
          style={{
            width: 22,
            height: 22,
            borderRadius: 11,
            backgroundColor: checked ? "#FAFAFC" : colors.muted,
          }}
        />
      </View>
    </Pressable>
  );
}

export function DrawerContent(props: DrawerContentComponentProps) {
  const router = useRouter();
  const { colors, isDark } = useAppColors();
  const { toggleTheme } = useAppTheme();

  const favorites = useFavorites((s) => s.favorites);
  const recentCount = useRecentlyPlayed((s) => s.recentlyPlayed.length);

  const instantPlay = useSettings((s) => s.instantPlay);
  const toggleInstantPlay = useSettings((s) => s.toggleInstantPlay);

  // Which drawer screen is showing. Nested routes (the tabs group) report their
  // own name here, so this compares against the drawer's route list.
  const activeRoute = props.state.routeNames[props.state.index];

  const close = () => props.navigation.closeDrawer();

  const go = (action: () => void) => {
    close();
    action();
  };

  const version = Constants.expoConfig?.version ?? "0.1.0";

  return (
    <DrawerContentScrollView
      {...props}
      contentContainerStyle={{ paddingTop: 8, paddingBottom: 24 }}
      style={{ backgroundColor: colors.background }}
    >
      <View style={{ paddingHorizontal: 20, paddingBottom: 6 }}>
        <Wordmark />
        <Text weight="300" style={{ marginTop: 6, fontSize: 12.5, color: colors.muted }}>
          {favorites.length > 0
            ? formatCollectionSummary(favorites)
            : "radio, everywhere."}
        </Text>
      </View>

      <View style={{ paddingHorizontal: 12, paddingTop: 14, gap: 2 }}>
        <NavItem
          label="Home"
          active={activeRoute === "index"}
          icon={(c) => <HomeIcon size={20} color={c} />}
          onPress={() => go(() => router.push("/(drawer)"))}
        />
        <NavItem
          label="Browse"
          active={activeRoute === "(tabs)"}
          icon={(c) => <SearchIcon size={20} color={c} />}
          onPress={() => go(() => router.push("/(drawer)/(tabs)"))}
        />
        <NavItem
          label={recentCount > 0 ? `Recently played · ${recentCount}` : "Recently played"}
          icon={(c) => <ClockIcon size={20} color={c} />}
          onPress={() => go(() => router.push("/recently-played"))}
        />
      </View>

      <View
        style={{
          height: 1,
          backgroundColor: colors.hairline,
          marginHorizontal: 20,
          marginVertical: 18,
        }}
      />

      <View style={{ paddingHorizontal: 20 }}>
        <Eyebrow variant="mono-xs" style={{ fontSize: 10.5, color: colors.dim }}>
          APPEARANCE
        </Eyebrow>
      </View>

      <View style={{ paddingHorizontal: 12, paddingTop: 8 }}>
        <ToggleRow
          label={isDark ? "Dark" : "Light"}
          icon={
            isDark ? (
              <MoonIcon size={20} color={colors.text} />
            ) : (
              <SunIcon size={20} color={colors.text} />
            )
          }
          checked={isDark}
          onPress={toggleTheme}
          accessibilityLabel={isDark ? "Switch to light mode" : "Switch to dark mode"}
        />
      </View>

      <View
        style={{
          height: 1,
          backgroundColor: colors.hairline,
          marginHorizontal: 20,
          marginVertical: 18,
        }}
      />

      <View style={{ paddingHorizontal: 20 }}>
        <Eyebrow variant="mono-xs" style={{ fontSize: 10.5, color: colors.dim }}>
          PLAYBACK
        </Eyebrow>
      </View>

      <View style={{ paddingHorizontal: 12, paddingTop: 8 }}>
        <ToggleRow
          label="Instant play"
          icon={<PlayIcon size={20} color={colors.text} />}
          checked={instantPlay}
          onPress={toggleInstantPlay}
          accessibilityLabel={
            instantPlay
              ? "Turn off instant play"
              : "Turn on instant play: tapping a station starts it immediately"
          }
        />
        <Text
          weight="300"
          style={{ marginTop: 2, marginLeft: 14, fontSize: 12, color: colors.dim }}
        >
          Start playing the moment you tap a station
        </Text>
      </View>

      <View style={{ paddingHorizontal: 20, paddingTop: 24 }}>
        <Eyebrow variant="mono-2xs" style={{ color: colors.dim }}>
          {`Static Wave ${version}`.toUpperCase()}
        </Eyebrow>
      </View>
    </DrawerContentScrollView>
  );
}
