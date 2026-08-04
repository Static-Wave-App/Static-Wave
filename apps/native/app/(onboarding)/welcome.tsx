import { Text, View } from "react-native";

export default function WelcomeScreen() {
  return (
    <View className="flex-1 items-center justify-center p-6">
      <Text className="text-4xl font-bold text-foreground tracking-tight">
        static wave
      </Text>
      <Text className="text-muted text-sm mt-2">
        radio, everywhere.
      </Text>
    </View>
  );
}