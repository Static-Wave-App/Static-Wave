import { useRouter } from "expo-router";
import { FlatList, Pressable, View } from "react-native";

import {
  AsyncBoundary,
  SectionHeader,
  StateBlock,
  StationRowSkeleton,
} from "@/components/ui/async-boundary";
import { GLOW } from "@/components/ui/glow";
import { ChevronLeftIcon } from "@/components/ui/icons";
import { PlayPauseButton } from "@/components/ui/play-pause-button";
import { Screen } from "@/components/ui/screen";
import { StationRow } from "@/components/ui/station-row";
import { Text } from "@/components/ui/text";
import { useAppColors } from "@/components/ui/theme";
import { useSuggestedFeed } from "@/hooks";
import { useOnboarding } from "@/stores";

/**
 * `/suggested` — the "See all" target for the dashboard's Suggested for you.
 *
 * Like `/recently-played`, this route isn't in the design file, so it reuses
 * the header block and `sm` row that are specified rather than inventing
 * anything. It pages through the user's onboarding genres and country via
 * `useSuggestedFeed`; the dashboard card deliberately stays capped at 10.
 */
export default function SuggestedScreen() {
  const router = useRouter();
  const { colors } = useAppColors();

  const genres = useOnboarding((s) => s.selectedGenres);
  const country = useOnboarding((s) => s.selectedCountry);
  const feed = useSuggestedFeed();

  const basis =
    genres.length > 0
      ? genres.slice(0, 3).join(", ")
      : (country ?? "your listening");

  return (
    <Screen glow={GLOW.dashboard}>
      <View style={{ paddingHorizontal: 20, paddingTop: 22 }}>
        <Pressable
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Back"
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
          <ChevronLeftIcon size={19} color={colors.text} />
        </Pressable>
      </View>

      <View style={{ paddingHorizontal: 24, paddingTop: 18 }}>
        <Text
          variant="display-xl"
          style={{ fontSize: 31, lineHeight: 34, color: colors.text }}
        >
          Suggested for you
        </Text>
        <Text
          weight="300"
          numberOfLines={1}
          style={{ marginTop: 5, fontSize: 13.5, color: colors.muted }}
        >
          {`Based on ${basis}`}
        </Text>
      </View>

      <AsyncBoundary
        isLoading={feed.isLoading}
        error={feed.error}
        isEmpty={!feed.isLoading && feed.stations.length === 0}
        onRetry={feed.refresh}
        loadingFallback={
          <View style={{ paddingHorizontal: 24, paddingTop: 26 }}>
            <StationRowSkeleton count={7} gap={9} />
          </View>
        }
        empty={
          <StateBlock
            title="No suggestions yet"
            body="Pick a few genres and we'll fill this up."
            action={
              <Pressable
                onPress={() => router.push("/(drawer)/(tabs)")}
                accessibilityRole="button"
                style={{ marginTop: 8 }}
              >
                <Text variant="body-md" style={{ color: "#8B3DFF" }}>
                  Browse stations
                </Text>
              </Pressable>
            }
          />
        }
      >
        <FlatList
          style={{ flex: 1 }}
          data={feed.stations}
          keyExtractor={(s) => s.stationuuid}
          showsVerticalScrollIndicator={false}
          onEndReached={feed.loadMore}
          onEndReachedThreshold={0.6}
          contentContainerStyle={{ paddingBottom: 120 }}
          ListHeaderComponent={
            <SectionHeader
              title="ALL SUGGESTIONS"
              eyebrow
              actionLabel={feed.hasMore ? "Loading more…" : "End of list"}
              withChevron={false}
              style={{ paddingHorizontal: 24, paddingTop: 26, paddingBottom: 12 }}
            />
          }
          renderItem={({ item }) => (
            <View style={{ paddingHorizontal: 24, paddingBottom: 9 }}>
              <StationRow
                station={item}
                size="sm"
                onPress={() => router.push(`/station/${item.stationuuid}`)}
                trailing={<PlayPauseButton station={item} size={36} iconSize={14} />}
              />
            </View>
          )}
          ListFooterComponent={
            feed.isLoadingMore ? (
              <View style={{ paddingHorizontal: 24, paddingTop: 4 }}>
                <StationRowSkeleton count={2} gap={9} />
              </View>
            ) : null
          }
        />
      </AsyncBoundary>
    </Screen>
  );
}
