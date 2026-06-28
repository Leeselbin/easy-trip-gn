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
import { useTourPlaces } from "@/hooks/useTourPlaces";
import { ensureLocationPermission } from "@/lib/location";
import { radiusFromLatitudeDelta } from "@/lib/tourApi";

const INITIAL_REGION: Region = {
  latitude: 37.7634,
  longitude: 128.8995,
  latitudeDelta: 0.015,
  longitudeDelta: 0.015,
};

// 1보다 작을수록 더 많이 확대됨 살짝씩 줌인/줌아웃
const ZOOM_STEP = 0.5;
const FOCUS_DELTA = 0.01;

// 화면에 보이는 마커가 이 개수 이하로 듬성듬성해지면(=충분히 확대됨) 이름표를 같이 띄웁니다.
const LABEL_VISIBLE_MAX_MARKERS = 8;

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
  const { category: categoryParam, placeId, name, latitude, longitude } =
    useLocalSearchParams<{
      category?: Category;
      placeId?: string;
      name?: string;
      latitude?: string;
      longitude?: string;
    }>();
  const [selectedStop, setSelectedStop] = useState<BusStop | null>(null);
  const [selectedPlace, setSelectedPlace] = useState<SimplePlace | null>(null);
  const [category, setCategory] = useState<Category>(
    categoryParam ?? "busStop"
  );
  const [mapReady, setMapReady] = useState(false);
  const [mapView, setMapView] = useState({
    latitude: INITIAL_REGION.latitude,
    longitude: INITIAL_REGION.longitude,
    radius: radiusFromLatitudeDelta(INITIAL_REGION.latitudeDelta),
  });
  const mapCenter = { latitude: mapView.latitude, longitude: mapView.longitude };
  const regionDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasHandledInitialRegion = useRef(false);
  const handledPlaceKeyRef = useRef<string | null>(null);
  const { data: busStops, isLoading, isError } = useBusStops();
  const {
    data: restaurants,
    isLoading: isRestaurantsLoading,
    isError: isRestaurantsError,
  } = useTourPlaces("39", mapCenter, mapView.radius, category === "restaurant");
  const {
    data: touristSpots,
    isLoading: isTouristSpotsLoading,
    isError: isTouristSpotsError,
  } = useTourPlaces("12", mapCenter, mapView.radius, category === "tour");

  useEffect(() => {
    if (categoryParam) {
      setCategory(categoryParam);
    }
  }, [categoryParam]);

  const focusOn = (lat: number, lng: number) => {
    const nextRegion: Region = {
      latitude: lat,
      longitude: lng,
      latitudeDelta: FOCUS_DELTA,
      longitudeDelta: FOCUS_DELTA,
    };
    regionRef.current = nextRegion;
    setMapView({
      latitude: lat,
      longitude: lng,
      radius: radiusFromLatitudeDelta(FOCUS_DELTA),
    });
    mapRef.current?.animateToRegion(nextRegion, 300);
  };

  const focusAndShowCallout = (id: string, lat: number, lng: number) => {
    focusOn(lat, lng);
    // 카테고리 전환/위치 이동 직후엔 마커가 막 렌더링되는 시점이라, 한 틱 뒤에 콜아웃을 띄워야 ref가 잡혀있음
    setTimeout(() => {
      markerRefs.current[id]?.showCallout();
    }, 400);
  };

  useEffect(() => {
    if (!placeId || !categoryParam || !mapReady) {
      return;
    }

    // 같은 placeId는 한 번만 처리합니다. (지도 이동으로 음식점/관광지 데이터가
    // 다시 조회될 때마다 effect가 재실행돼서, 처리 안 하면 같은 장소로 계속 다시 포커스됨)
    const placeKey = `${categoryParam}:${placeId}`;
    if (handledPlaceKeyRef.current === placeKey) {
      return;
    }

    if (categoryParam === "busStop") {
      const stop = busStops?.find((s) => s.id === placeId);
      if (stop) {
        handledPlaceKeyRef.current = placeKey;
        setSelectedPlace(null);
        setSelectedStop(stop);
        focusAndShowCallout(stop.id, stop.latitude, stop.longitude);
      }
      return;
    }

    // 음식점/관광지는 위치 기반으로 매번 다른 데이터가 잡혀서, 홈에서 넘어온 좌표/이름으로 바로 포커스합니다.
    const lat = latitude ? parseFloat(latitude) : undefined;
    const lng = longitude ? parseFloat(longitude) : undefined;
    if (lat !== undefined && lng !== undefined && name) {
      handledPlaceKeyRef.current = placeKey;
      setSelectedStop(null);
      setSelectedPlace({ id: placeId, name, categoryLabel: CATEGORY_LABEL[categoryParam] });
      focusAndShowCallout(placeId, lat, lng);
      return;
    }

    // 마커를 직접 눌러서 들어온 경우(좌표 파라미터 없음)엔 이미 로드된 목록에서 찾습니다.
    const list = categoryParam === "restaurant" ? restaurants : touristSpots;
    const item = list?.find((p) => p.id === placeId);
    if (item) {
      handledPlaceKeyRef.current = placeKey;
      setSelectedStop(null);
      setSelectedPlace({ id: item.id, name: item.name, categoryLabel: CATEGORY_LABEL[categoryParam] });
      focusAndShowCallout(item.id, item.latitude, item.longitude);
    }
  }, [placeId, categoryParam, name, latitude, longitude, busStops, restaurants, touristSpots, mapReady]);

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
    setMapView((prev) => ({
      ...prev,
      latitude: nextRegion.latitude,
      longitude: nextRegion.longitude,
    }));
    mapRef.current?.animateToRegion(nextRegion, 300);
  };

  const handleRegionChangeComplete = (nextRegion: Region) => {
    regionRef.current = nextRegion;

    // 지도가 처음 마운트될 때 네이티브 엔진이 initialRegion을 픽셀 비율에 맞게 보정하면서
    // onRegionChangeComplete를 한 번 더 자동으로 쏘는데, 이건 사용자 동작이 아니라서 무시합니다.
    if (!hasHandledInitialRegion.current) {
      hasHandledInitialRegion.current = true;
      return;
    }

    if (regionDebounceRef.current) {
      clearTimeout(regionDebounceRef.current);
    }
    regionDebounceRef.current = setTimeout(() => {
      setMapView({
        latitude: nextRegion.latitude,
        longitude: nextRegion.longitude,
        radius: radiusFromLatitudeDelta(nextRegion.latitudeDelta),
      });
    }, 400);
  };

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={INITIAL_REGION}
        showsUserLocation
        onMapReady={() => setMapReady(true)}
        onRegionChangeComplete={handleRegionChangeComplete}
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
          (restaurants?.length ?? 0) <= LABEL_VISIBLE_MAX_MARKERS &&
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
              onPress={() => {
                setSelectedStop(null);
                setSelectedPlace({ id: restaurant.id, name: restaurant.name, categoryLabel: CATEGORY_LABEL.restaurant });
              }}
            >
              <RNView style={styles.markerWrap}>
                <RNView style={styles.markerLabel}>
                  <RNText style={styles.markerLabelText} numberOfLines={1}>
                    {restaurant.name}
                  </RNText>
                </RNView>
                <RNView
                  style={[
                    styles.markerDot,
                    {
                      backgroundColor:
                        selectedPlace?.id === restaurant.id ? "#9c27b0" : "#ff7043",
                    },
                  ]}
                />
              </RNView>
            </Marker>
          ))}
        {category === "restaurant" &&
          (restaurants?.length ?? 0) > LABEL_VISIBLE_MAX_MARKERS &&
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
          (touristSpots?.length ?? 0) <= LABEL_VISIBLE_MAX_MARKERS &&
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
              onPress={() => {
                setSelectedStop(null);
                setSelectedPlace({ id: spot.id, name: spot.name, categoryLabel: CATEGORY_LABEL.tour });
              }}
            >
              <RNView style={styles.markerWrap}>
                <RNView style={styles.markerLabel}>
                  <RNText style={styles.markerLabelText} numberOfLines={1}>
                    {spot.name}
                  </RNText>
                </RNView>
                <RNView
                  style={[
                    styles.markerDot,
                    { backgroundColor: selectedPlace?.id === spot.id ? "#9c27b0" : "#43a047" },
                  ]}
                />
              </RNView>
            </Marker>
          ))}
        {category === "tour" &&
          (touristSpots?.length ?? 0) > LABEL_VISIBLE_MAX_MARKERS &&
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
      {category === "restaurant" && isRestaurantsLoading && (
        <RNView style={styles.statusBanner}>
          <Text>음식점 정보를 불러오는 중...</Text>
        </RNView>
      )}
      {category === "restaurant" && isRestaurantsError && (
        <RNView style={styles.statusBanner}>
          <Text>음식점 정보를 불러오지 못했습니다.</Text>
        </RNView>
      )}
      {category === "tour" && isTouristSpotsLoading && (
        <RNView style={styles.statusBanner}>
          <Text>관광지 정보를 불러오는 중...</Text>
        </RNView>
      )}
      {category === "tour" && isTouristSpotsError && (
        <RNView style={styles.statusBanner}>
          <Text>관광지 정보를 불러오지 못했습니다.</Text>
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
  markerWrap: {
    alignItems: "center",
  },
  markerDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: "#fff",
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
    elevation: 3,
  },
  markerLabel: {
    marginBottom: 4,
    maxWidth: 120,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  markerLabelText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#333",
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
