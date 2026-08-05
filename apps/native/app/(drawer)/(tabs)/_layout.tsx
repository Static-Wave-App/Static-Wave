import { Tabs } from "expo-router";
import { View } from "react-native";

import { NowPlayingBar } from "@/components/ui/now-playing-bar";
import { FloatingTabBar } from "@/components/ui/tab-bar";
import type { FloatingTabBarProps } from "@/components/ui/tab-bar";

/**
 * Search + Favorites, under a floating pill tab bar.
 *
 * Both the tab bar and the Now Playing bar live HERE rather than on each
 * screen. They are absolutely positioned siblings of the navigator, so they
 * don't remount when the tab changes — which is what keeps the equaliser
 * animation continuous and stops the bars flickering on every navigation.
 *
 * Screens must reserve room for them in their own scroll padding: the design
 * puts the tab bar at `bottom 34` (height 66) and this variant of the Now
 * Playing bar at `bottom 118`.
 */
export default function TabLayout() {
  return (
    <View style={{ flex: 1 }}>
      <Tabs
        screenOptions={{ headerShown: false }}
        // `props` is React Navigation's BottomTabBarProps; the cast narrows it
        // to the structural subset FloatingTabBar declares, since the package
        // itself isn't resolvable under `node-linker=isolated`.
        tabBar={(props) => (
          <FloatingTabBar {...(props as unknown as FloatingTabBarProps)} />
        )}
      >
        <Tabs.Screen name="index" options={{ title: "Search" }} />
        <Tabs.Screen name="favorites" options={{ title: "Favorites" }} />
      </Tabs>

      <NowPlayingBar variant="search" />
    </View>
  );
}
