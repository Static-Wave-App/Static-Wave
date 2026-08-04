import { Text, View } from "react-native";

export default function SearchScreen() {
  return (
    <View className="flex-1 items-center justify-center p-6">
      <Text className="text-xl font-semibold text-foreground">Search</Text>
      <Text className="text-muted text-sm mt-2">Find radio stations by name or genre.</Text>
    </View>
  );
}
