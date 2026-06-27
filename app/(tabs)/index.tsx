import * as Location from "expo-location";
import { router } from "expo-router";
import { SymbolView } from "expo-symbols";
import { useEffect, useMemo, useState } from "react";
import {
  Pressable,
  View as RNView,
  ScrollView,
  StyleSheet,
} from "react-native";

import { Text } from "@/components/ui/Themed";
import { useBusStops } from "@/hooks/useBusStops";
import { useRestaurants } from "@/hooks/useRestaurants";
import { useTouristSpots } from "@/hooks/useTouristSpots";
import { distanceKm } from "@/lib/geo";
import { ensureLocationPermission } from "@/lib/location";
import { useAuthStore } from "@/store/authStore";

const GANGNEUNG_CENTER = { latitude: 37.7634, longitude: 128.8995 };

type Category = "restaurant" | "busStop" | "tour";

const CATEGORY_CARDS = [
  {
    key: "restaurant",
    label: "음식점",
    icon: { ios: "fork.knife", android: "restaurant", web: "restaurant" },
  },
  {
    key: "busStop",
    label: "정류장",
    icon: { ios: "bus", android: "directions_bus", web: "directions_bus" },
  },
  {
    key: "tour",
    label: "관광지",
    icon: { ios: "mappin.and.ellipse", android: "place", web: "place" },
  },
] as const satisfies readonly {
  key: Category;
  label: string;
  icon: { ios: string; android: string; web: string };
}[];

const CATEGORY_LABEL: Record<Category, string> = {
  restaurant: "음식점",
  busStop: "정류장",
  tour: "관광지",
};

export default function HomeScreen() {
  const { user } = useAuthStore();
  const [coords, setCoords] = useState(GANGNEUNG_CENTER);

  const { data: busStops } = useBusStops();
  const { data: restaurants } = useRestaurants();
  const { data: touristSpots } = useTouristSpots();

  useEffect(() => {
    (async () => {
      const granted = await ensureLocationPermission();
      if (!granted) return;
      const location = await Location.getCurrentPositionAsync();
      setCoords({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
    })();
  }, []);

  const nearbyPlaces = useMemo(() => {
    const items = [
      ...(busStops ?? []).map((s) => ({
        id: s.id,
        name: s.name,
        latitude: s.latitude,
        longitude: s.longitude,
        category: "busStop" as Category,
      })),
      ...(restaurants ?? []).map((r) => ({
        id: r.id,
        name: r.name,
        latitude: r.latitude,
        longitude: r.longitude,
        category: "restaurant" as Category,
      })),
      ...(touristSpots ?? []).map((t) => ({
        id: t.id,
        name: t.name,
        latitude: t.latitude,
        longitude: t.longitude,
        category: "tour" as Category,
      })),
    ];

    return items
      .map((item) => ({
        ...item,
        distance: distanceKm(
          coords.latitude,
          coords.longitude,
          item.latitude,
          item.longitude
        ),
      }))
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 5);
  }, [busStops, restaurants, touristSpots, coords]);

  const goToCategory = (category: Category) => {
    router.push({ pathname: "/explore", params: { category } });
  };

  const goToPlace = (category: Category, placeId: string) => {
    router.push({ pathname: "/explore", params: { category, placeId } });
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.greeting}>
        {user?.nickname ?? "여행자"}님, 강릉 여행을 시작해보세요
      </Text>

      <RNView style={styles.categoryRow}>
        {CATEGORY_CARDS.map((card) => (
          <Pressable
            key={card.key}
            style={styles.categoryCard}
            onPress={() => goToCategory(card.key)}
          >
            <SymbolView name={card.icon} tintColor="#2f95dc" size={28} />
            <Text style={styles.categoryCardLabel}>{card.label}</Text>
          </Pressable>
        ))}
      </RNView>

      <Text style={styles.sectionTitle}>내 주변</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.nearbyRow}
        contentContainerStyle={styles.nearbyRowContent}
      >
        {nearbyPlaces.map((place) => (
          <Pressable
            key={`${place.category}-${place.id}`}
            style={styles.nearbyCard}
            onPress={() => goToPlace(place.category, place.id)}
          >
            <Text style={styles.nearbyCategory}>
              {CATEGORY_LABEL[place.category]}
            </Text>
            <Text style={styles.nearbyName} numberOfLines={1}>
              {place.name}
            </Text>
            <Text style={styles.nearbyDistance}>
              {place.distance.toFixed(1)}km
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      <RNView style={styles.accessibilityCard}>
        <Text style={styles.accessibilityTitle}>♿ 무장애 여행 정보</Text>
        <Text style={styles.accessibilityDescription}>
          저상버스 운행 정류장과 휠체어 접근 가능 정보를 함께 안내해요. 탐색
          탭에서 정류장을 눌러 확인해보세요.
        </Text>
      </RNView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingVertical: 20,
    gap: 20,
  },
  greeting: {
    fontSize: 20,
    fontWeight: "bold",
    paddingHorizontal: 20,
  },
  categoryRow: {
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 20,
  },
  categoryCard: {
    flex: 1,
    alignItems: "center",
    gap: 8,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  categoryCardLabel: {
    fontSize: 13,
    fontWeight: "600",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    paddingHorizontal: 20,
  },
  nearbyRow: {
    flexGrow: 0,
  },
  nearbyRowContent: {
    paddingVertical: 8,
    paddingLeft: 20,
  },
  nearbyCard: {
    width: 140,
    marginRight: 12,
    padding: 12,
    borderRadius: 12,
    backgroundColor: "#fff",
    gap: 4,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  nearbyCategory: {
    fontSize: 11,
    color: "#2f95dc",
    fontWeight: "600",
  },
  nearbyName: {
    fontSize: 14,
    fontWeight: "600",
  },
  nearbyDistance: {
    fontSize: 12,
    opacity: 0.6,
  },
  accessibilityCard: {
    padding: 16,
    marginHorizontal: 20,
    borderRadius: 12,
    backgroundColor: "#e8f4fb",
    gap: 6,
  },
  accessibilityTitle: {
    fontSize: 15,
    fontWeight: "bold",
  },
  accessibilityDescription: {
    fontSize: 13,
    opacity: 0.8,
    lineHeight: 19,
  },
});
