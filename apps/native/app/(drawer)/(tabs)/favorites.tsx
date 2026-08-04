import { Text, View } from "react-native";

export default function FavoritesScreen() {
  return (
    <View className="flex-1 items-center justify-center p-6">
      <Text className="text-xl font-semibold text-foreground">Favorites</Text>
      <Text className="text-muted text-sm mt-2">Your saved stations will appear here.</Text>
    </View>
  );
}
