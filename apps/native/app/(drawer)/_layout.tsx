import { Redirect } from "expo-router";
import { Drawer } from "expo-router/drawer";

import { DrawerContent } from "@/components/drawer/drawer-content";
import { useAppColors } from "@/components/ui/theme";
import { useOnboarding } from "@/stores";

function DrawerLayout() {
  const onboardingComplete = useOnboarding((s) => s.complete);
  const { colors } = useAppColors();

  // Declarative guard: renders the redirect *instead of* the drawer, so there's
  // no frame where the main app is visible to a first-time user. Reading from
  // the store (not storage) means calling `finish()` releases this immediately.
  //
  // Do NOT pair this with an imperative `router.replace()` — the two race and
  // cancel each other (handover §7.2).
  if (!onboardingComplete) {
    return <Redirect href="/(onboarding)/welcome" />;
  }

  return (
    <Drawer
      drawerContent={(props) => <DrawerContent {...props} />}
      screenOptions={{
        // The Dashboard draws its own header (hamburger, wordmark, sleep timer
        // button) and the tabs own theirs, so a navigation header would sit on
        // top of both.
        headerShown: false,
        drawerStyle: { backgroundColor: colors.background, width: 300 },
      }}
    >
      <Drawer.Screen name="index" />
      <Drawer.Screen name="(tabs)" />
    </Drawer>
  );
}

export default DrawerLayout;
