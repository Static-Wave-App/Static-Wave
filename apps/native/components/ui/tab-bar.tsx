import { LinearGradient } from "expo-linear-gradient";
import { Pressable, View } from "react-native";

import { HeartIcon, SearchIcon } from "./icons";
import { Text } from "./text";
import { useAppColors } from "./theme";

/**
 * The tab bar is a floating pill, not a tab bar.
 *
 * `left/right 52, bottom 34`, height 66, radius 26, glass fill + 1px border,
 * `padding 8`. Each tab is `flex: 1`, height 50. The ACTIVE tab is an inner
 * gradient pill at radius 19 — and the gradient differs per tab:
 *
 *   Search    `120deg #8B3DFF → #2E7BFF`
 *   Favorites `120deg #FF2FD6 → #8B3DFF`
 *
 * Label 14px/500 white when active, 14px/400 dim when not. The inactive
 * Favorites icon is an outline heart; active is filled white.
 *
 * Because it inherits the screen's own bottom inset handling, this replaces
 * `tabBarStyle` entirely — the default bar is hidden by rendering this as the
 * `tabBar` prop.
 */

const TABS = {
  index: {
    label: "Search",
    gradient: ["#8B3DFF", "#2E7BFF"],
  },
  favorites: {
    label: "Favorites",
    gradient: ["#FF2FD6", "#8B3DFF"],
  },
} as const;

type TabName = keyof typeof TABS;

function isKnownTab(name: string): name is TabName {
  return name in TABS;
}

/**
 * Structural subset of React Navigation's `BottomTabBarProps`.
 *
 * `@react-navigation/bottom-tabs` is a transitive dependency of expo-router,
 * and `.npmrc` sets `node-linker=isolated` — so it is not resolvable from this
 * package and importing its types would not typecheck. Declaring only what
 * this component reads is both sufficient and honest about the coupling.
 */
export type FloatingTabBarProps = {
  state: {
    index: number;
    routes: Array<{ key: string; name: string }>;
  };
  navigation: {
    navigate: (name: string) => void;
    emit: (event: {
      type: string;
      target: string;
      canPreventDefault?: boolean;
    }) => { defaultPrevented: boolean };
  };
};

function TabIcon({ name, active }: { name: TabName; active: boolean }) {
  const { colors } = useAppColors();
  const color = active ? "rgba(255,255,255,0.96)" : colors.dim;

  if (name === "index") return <SearchIcon size={19} color={color} />;
  return <HeartIcon size={20} color={color} filled={active} />;
}

export function FloatingTabBar({ state, navigation }: FloatingTabBarProps) {
  const { colors } = useAppColors();

  return (
    <View
      style={{
        position: "absolute",
        left: 52,
        right: 52,
        bottom: 34,
        height: 66,
        borderRadius: 26,
        backgroundColor: colors.glass,
        borderWidth: 1,
        borderColor: colors.glassBorder,
        flexDirection: "row",
        alignItems: "center",
        padding: 8,
      }}
    >
      {state.routes.map((route, index) => {
        if (!isKnownTab(route.name)) return null;

        const tab = TABS[route.name];
        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: "tabPress",
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        const content = (
          <>
            <TabIcon name={route.name} active={isFocused} />
            <Text
              weight={isFocused ? "500" : "400"}
              style={{
                fontSize: 14,
                color: isFocused ? "rgba(255,255,255,0.96)" : colors.dim,
              }}
            >
              {tab.label}
            </Text>
          </>
        );

        return (
          <Pressable
            key={route.key}
            onPress={onPress}
            onLongPress={() =>
              navigation.emit({ type: "tabLongPress", target: route.key })
            }
            accessibilityRole="button"
            accessibilityState={{ selected: isFocused }}
            accessibilityLabel={tab.label}
            style={{ flex: 1, height: 50 }}
          >
            {isFocused ? (
              <LinearGradient
                colors={tab.gradient as unknown as [string, string]}
                // 120deg in CSS ≈ this diagonal; the design's active pills all
                // run top-left to bottom-right rather than straight across.
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{
                  flex: 1,
                  borderRadius: 19,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                }}
              >
                {content}
              </LinearGradient>
            ) : (
              <View
                style={{
                  flex: 1,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                }}
              >
                {content}
              </View>
            )}
          </Pressable>
        );
      })}
    </View>
  );
}
