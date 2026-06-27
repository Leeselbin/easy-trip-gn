import * as Location from "expo-location";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Pressable,
  Text as RNText,
  View as RNView,
  StyleSheet,
} from "react-native";
import MapView, { Marker, Polyline, type Region } from "react-native-maps";

import BusStopSheet from "@/components/BusStopSheet";
import PlaceSheet, { type SimplePlace } from "@/components/PlaceSheet";
import { Text, View } from "@/components/ui/Themed";
import { type BusStop } from "@/constants/busStops";
import { useBusStops } from "@/hooks/useBusStops";
import { useRestaurants } from "@/hooks/useRestaurants";
import { useTouristSpots } from "@/hooks/useTouristSpots";
import { ensureLocationPermission } from "@/lib/location";

const INITIAL_REGION: Region = {
  latitude: 37.7634,
  longitude: 128.8995,
  latitudeDelta: 0.04,
  longitudeDelta: 0.04,
};

// 1보다 작을수록 더 많이 확대됨 살짝씩 줌인/줌아웃
const ZOOM_STEP = 0.5;
const FOCUS_DELTA = 0.01;

type Category = "busStop" | "restaurant" | "tour";

const CATEGORY_BUTTONS: { key: Category; label: string }[] = [
  { key: "restaurant", label: "음식점" },
  { key: "busStop", label: "정류장" },
  { key: "tour", label: "관광지" },
];

const CATEGORY_LABEL: Record<Category, string> = {
  busStop: "정류장",
  restaurant: "음식점",
  tour: "관광지",
};

export default function ExploreScreen() {
  const mapRef = useRef<MapView>(null);
  const regionRef = useRef<Region>(INITIAL_REGION);
  const markerRefs = useRef<
    Record<string, React.ComponentRef<typeof Marker> | null>
  >({});
  const { category: categoryParam, placeId } = useLocalSearchParams<{
    category?: Category;
    placeId?: string;
  }>();
  const [selectedStop, setSelectedStop] = useState<BusStop | null>(null);
  const [selectedPlace, setSelectedPlace] = useState<SimplePlace | null>(null);
  const [category, setCategory] = useState<Category>(
    categoryParam ?? "busStop"
  );
  const [mapReady, setMapReady] = useState(false);
  const { data: busStops, isLoading, isError } = useBusStops();
  const { data: restaurants } = useRestaurants();
  const { data: touristSpots } = useTouristSpots();

  useEffect(() => {
    if (categoryParam) {
      setCategory(categoryParam);
    }
  }, [categoryParam]);

  const focusOn = (latitude: number, longitude: number) => {
    const nextRegion: Region = {
      latitude,
      longitude,
      latitudeDelta: FOCUS_DELTA,
      longitudeDelta: FOCUS_DELTA,
    };
    regionRef.current = nextRegion;
    mapRef.current?.animateToRegion(nextRegion, 300);
  };

  useEffect(() => {
    if (!placeId || !categoryParam || !mapReady) {
      return;
    }

    let matchedId: string | undefined;

    if (categoryParam === "busStop") {
      const stop = busStops?.find((s) => s.id === placeId);
      if (stop) {
        setSelectedPlace(null);
        setSelectedStop(stop);
        focusOn(stop.latitude, stop.longitude);
        matchedId = stop.id;
      }
    } else if (categoryParam === "restaurant") {
      const restaurant = restaurants?.find((r) => r.id === placeId);
      if (restaurant) {
        setSelectedStop(null);
        setSelectedPlace({ id: restaurant.id, name: restaurant.name, categoryLabel: CATEGORY_LABEL.restaurant });
        focusOn(restaurant.latitude, restaurant.longitude);
        matchedId = restaurant.id;
      }
    } else if (categoryParam === "tour") {
      const spot = touristSpots?.find((t) => t.id === placeId);
      if (spot) {
        setSelectedStop(null);
        setSelectedPlace({ id: spot.id, name: spot.name, categoryLabel: CATEGORY_LABEL.tour });
        focusOn(spot.latitude, spot.longitude);
        matchedId = spot.id;
      }
    }

    if (matchedId) {
      // 카테고리 전환 시 해당 마커가 막 렌더링되는 시점이라, 한 틱 뒤에 콜아웃을 띄워야 ref가 잡혀있음
      const timeoutId = setTimeout(() => {
        markerRefs.current[matchedId!]?.showCallout();
      }, 400);
      return () => clearTimeout(timeoutId);
    }
  }, [placeId, categoryParam, busStops, restaurants, touristSpots, mapReady]);

  const routeCoordinates =
    busStops?.map(({ latitude, longitude }) => ({ latitude, longitude })) ?? [];

  const closeSheet = () => {
    if (selectedStop) {
      markerRefs.current[selectedStop.id]?.hideCallout();
    }
    setSelectedStop(null);
  };

  const closePlaceSheet = () => {
    if (selectedPlace) {
      markerRefs.current[selectedPlace.id]?.hideCallout();
    }
    setSelectedPlace(null);
  };

  const zoom = (factor: number) => {
    const current = regionRef.current;
    const nextRegion: Region = {
      ...current,
      latitudeDelta: current.latitudeDelta * factor,
      longitudeDelta: current.longitudeDelta * factor,
    };
    regionRef.current = nextRegion;
    mapRef.current?.animateToRegion(nextRegion, 200);
  };

  const goToCurrentLocation = async () => {
    const granted = await ensureLocationPermission();
    if (!granted) {
      return;
    }

    const location = await Location.getCurrentPositionAsync();
    const nextRegion: Region = {
      ...regionRef.current,
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    };
    regionRef.current = nextRegion;
    mapRef.current?.animateToRegion(nextRegion, 300);
  };

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={INITIAL_REGION}
        showsUserLocation
        onMapReady={() => setMapReady(true)}
        onRegionChangeComplete={(nextRegion) => {
          regionRef.current = nextRegion;
        }}
      >
        {category === "busStop" &&
          busStops?.map((stop) => (
            <Marker
              key={stop.id}
              ref={(ref) => {
                markerRefs.current[stop.id] = ref;
              }}
              coordinate={{
                latitude: stop.latitude,
                longitude: stop.longitude,
              }}
              title={stop.name}
              pinColor={
                stop.arrivals.some((a) => a.isLowFloor) ? "#2f95dc" : "#999999"
              }
              onPress={() => {
                setSelectedPlace(null);
                setSelectedStop(stop);
              }}
            />
          ))}
        {category === "busStop" && (
          <Polyline
            coordinates={routeCoordinates}
            strokeColor="#2f95dc"
            strokeWidth={4}
          />
        )}
        {category === "restaurant" &&
          restaurants?.map((restaurant) => (
            <Marker
              key={restaurant.id}
              ref={(ref) => {
                markerRefs.current[restaurant.id] = ref;
              }}
              coordinate={{
                latitude: restaurant.latitude,
                longitude: restaurant.longitude,
              }}
              title={restaurant.name}
              pinColor={selectedPlace?.id === restaurant.id ? "#9c27b0" : "#ff7043"}
              onPress={() => {
                setSelectedStop(null);
                setSelectedPlace({ id: restaurant.id, name: restaurant.name, categoryLabel: CATEGORY_LABEL.restaurant });
              }}
            />
          ))}
        {category === "tour" &&
          touristSpots?.map((spot) => (
            <Marker
              key={spot.id}
              ref={(ref) => {
                markerRefs.current[spot.id] = ref;
              }}
              coordinate={{
                latitude: spot.latitude,
                longitude: spot.longitude,
              }}
              title={spot.name}
              pinColor={selectedPlace?.id === spot.id ? "#9c27b0" : "#43a047"}
              onPress={() => {
                setSelectedStop(null);
                setSelectedPlace({ id: spot.id, name: spot.name, categoryLabel: CATEGORY_LABEL.tour });
              }}
            />
          ))}
      </MapView>

      <RNView style={styles.categoryBar}>
        {CATEGORY_BUTTONS.map((button) => (
          <Pressable
            key={button.key}
            style={[
              styles.categoryButton,
              category === button.key && styles.categoryButtonActive,
            ]}
            onPress={() => setCategory(button.key)}
          >
            <RNText
              style={[
                styles.categoryButtonText,
                category === button.key && styles.categoryButtonTextActive,
              ]}
            >
              {button.label}
            </RNText>
          </Pressable>
        ))}
      </RNView>

      {category === "busStop" && isLoading && (
        <RNView style={styles.statusBanner}>
          <Text>정류장 정보를 불러오는 중...</Text>
        </RNView>
      )}
      {category === "busStop" && isError && (
        <RNView style={styles.statusBanner}>
          <Text>정류장 정보를 불러오지 못했습니다.</Text>
        </RNView>
      )}

      <Pressable style={styles.locationButton} onPress={goToCurrentLocation}>
        <RNText style={styles.locationButtonText}>⊙</RNText>
      </Pressable>

      <RNView style={styles.zoomControls}>
        <Pressable style={styles.zoomButton} onPress={() => zoom(ZOOM_STEP)}>
          <RNText style={styles.zoomButtonText}>＋</RNText>
        </Pressable>
        <RNView style={styles.zoomDivider} />
        <Pressable
          style={styles.zoomButton}
          onPress={() => zoom(1 / ZOOM_STEP)}
        >
          <RNText style={styles.zoomButtonText}>－</RNText>
        </Pressable>
      </RNView>

      <BusStopSheet stop={selectedStop} onClose={closeSheet} />
      <PlaceSheet place={selectedPlace} onClose={closePlaceSheet} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  locationButton: {
    position: "absolute",
    top: 16,
    left: 16,
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  locationButtonText: {
    fontSize: 18,
    color: "#2f95dc",
  },
  zoomControls: {
    position: "absolute",
    top: 16,
    right: 16,
    borderRadius: 10,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  zoomButton: {
    width: 34,
    height: 34,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  zoomButtonText: {
    fontSize: 17,
    fontWeight: "600",
    color: "#333",
  },
  zoomDivider: {
    height: 1,
    backgroundColor: "rgba(0,0,0,0.1)",
  },
  categoryBar: {
    position: "absolute",
    top: 16,
    alignSelf: "center",
    flexDirection: "row",
    borderRadius: 10,
    overflow: "hidden",
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  categoryButtonActive: {
    backgroundColor: "#2f95dc",
  },
  categoryButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
  categoryButtonTextActive: {
    color: "#fff",
  },
  statusBanner: {
    position: "absolute",
    bottom: 24,
    alignSelf: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
});
