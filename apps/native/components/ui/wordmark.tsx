import MaskedView from "@react-native-masked-view/masked-view";
import { LinearGradient } from "expo-linear-gradient";
import { View } from "react-native";

import { getFontFamily } from "@/lib/fonts";

import { Text } from "./text";
import { useAppColors } from "./theme";

/**
 * The "static wave" wordmark in the Dashboard header.
 *
 * 17px / -.02em. "static" is plain at weight 500; "wave" is weight 600 filled
 * with `90deg #FF2FD6 → #8B3DFF 45% → #2E7BFF 75% → #22D3EE`.
 *
 * On the web that's `background-clip: text`. React Native has no equivalent, so
 * "wave" is a MaskedView: the gradient is painted, and the glyphs are the mask.
 * The mask text and the visible text must use identical font metrics or the
 * gradient clips mid-letter — hence the shared constant below.
 */

const WORDMARK_TEXT_STYLE = {
  fontSize: 17,
  letterSpacing: -0.34, // 17 × -0.02em
  lineHeight: 22,
} as const;

export function Wordmark() {
  const { colors } = useAppColors();

  return (
    <View
      style={{ flexDirection: "row", alignItems: "center" }}
      accessibilityRole="header"
      // Screen readers announce the product name, not the lowercase logotype.
      accessibilityLabel="Static Wave"
    >
      <Text
        weight="500"
        style={{ ...WORDMARK_TEXT_STYLE, color: colors.text }}
        accessibilityElementsHidden
      >
        static
      </Text>

      <MaskedView
        style={{ height: WORDMARK_TEXT_STYLE.lineHeight }}
        maskElement={
          <Text weight="600" style={{ ...WORDMARK_TEXT_STYLE, color: "#000000" }}>
            wave
          </Text>
        }
      >
        <LinearGradient
          colors={["#FF2FD6", "#8B3DFF", "#2E7BFF", "#22D3EE"]}
          locations={[0, 0.45, 0.75, 1]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          {/* Transparent copy: sizes the gradient to the glyphs. Without it the
              LinearGradient has no intrinsic width and collapses to nothing. */}
          <Text
            weight="600"
            style={{
              ...WORDMARK_TEXT_STYLE,
              opacity: 0,
              fontFamily: getFontFamily("display", "600"),
            }}
          >
            wave
          </Text>
        </LinearGradient>
      </MaskedView>
    </View>
  );
}
