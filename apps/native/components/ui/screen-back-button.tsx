import { useNavigation, useRouter } from "expo-router";
import { Pressable, View } from "react-native";

import { ChevronLeftIcon, MenuIcon } from "./icons";
import { useAppColors } from "./theme";

/**
 * Top-left back affordance for screens that aren't pushed onto a stack.
 *
 * The tab screens have no "back" in the navigation sense — Discover and
 * Favorites are siblings under a drawer, so `router.back()` is a no-op on a
 * cold open. Rather than render a dead control, this falls through:
 *
 *   1. pop, if there's anything to pop back to
 *   2. otherwise go to the Dashboard, which is the drawer's home
 *
 * When there's nothing to go back to it shows a menu glyph and opens the
 * drawer instead, so the button always does something and its icon always
 * describes what that is.
 */
export function ScreenBackButton() {
  const router = useRouter();
  const navigation = useNavigation();
  const { colors } = useAppColors();

  const canGoBack = router.canGoBack();

  const onPress = () => {
    if (canGoBack) {
      router.back();
      return;
    }
    // `@react-navigation/drawer` isn't resolvable under `node-linker=isolated`,
    // so `DrawerActions` can't be imported; the navigation object exposes this
    // directly. Falls back to the dashboard if the drawer isn't an ancestor.
    const drawer = navigation as unknown as { openDrawer?: () => void };
    if (drawer.openDrawer) drawer.openDrawer();
    else router.push("/(drawer)");
  };

  return (
    <View style={{ paddingHorizontal: 20, paddingTop: 18 }}>
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={canGoBack ? "Back" : "Open menu"}
        style={({ pressed }) => ({
          width: 40,
          height: 40,
          borderRadius: 14,
          backgroundColor: colors.chipBg,
          borderWidth: 1,
          borderColor: colors.chipBorder,
          alignItems: "center",
          justifyContent: "center",
          opacity: pressed ? 0.7 : 1,
        })}
      >
        {canGoBack ? (
          <ChevronLeftIcon size={19} color={colors.text} />
        ) : (
          <MenuIcon size={20} color={colors.text} />
        )}
      </Pressable>
    </View>
  );
}
