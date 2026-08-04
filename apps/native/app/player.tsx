import { Text, View } from "react-native";

export default function PlayerScreen() {
  return (
    <View className="flex-1 items-center justify-center p-6">
      <Text className="text-lg font-semibold text-foreground">Player</Text>
      <Text className="text-muted text-sm mt-2">Now playing screen</Text>
    </View>
  );
}