import { useLocalSearchParams } from "expo-router";
import { Text, View } from "react-native";

export default function StationDetailsScreen() {
  const { uuid } = useLocalSearchParams<{ uuid: string }>();

  return (
    <View className="flex-1 items-center justify-center p-6">
      <Text className="text-lg font-semibold text-foreground">Station Details</Text>
      <Text className="text-muted text-sm mt-2">{uuid}</Text>
    </View>
  );
}