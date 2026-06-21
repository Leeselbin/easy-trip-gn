import * as Location from "expo-location";
import { useRef, useState } from "react";
import {
  Pressable,
  Text as RNText,
  View as RNView,
  StyleSheet,
} from "react-native";
import MapView, { Marker, Polyline, type Region } from "react-native-maps";

import BusStopSheet from "@/components/BusStopSheet";
import { View } from "@/components/Themed";
import { BUS_STOPS, type BusStop } from "@/constants/busStops";
import { ensureLocationPermission } from "@/lib/location";

const ROUTE_COORDINATES = BUS_STOPS.map(({ latitude, longitude }) => ({
  latitude,
  longitude,
}));

const INITIAL_REGION: Region = {
  latitude: 37.7634,
  longitude: 128.8995,
  latitudeDelta: 0.08,
  longitudeDelta: 0.08,
};

// 1보다 작을수록 더 많이 확대됨 살짝씩 줌인/줌아웃
const ZOOM_STEP = 0.5;

export default function ExploreScreen() {
  const mapRef = useRef<MapView>(null);
  const regionRef = useRef<Region>(INITIAL_REGION);
  const markerRefs = useRef<
    Record<string, React.ComponentRef<typeof Marker> | null>
  >({});
  const [selectedStop, setSelectedStop] = useState<BusStop | null>(null);

  const closeSheet = () => {
    if (selectedStop) {
      markerRefs.current[selectedStop.id]?.hideCallout();
    }
    setSelectedStop(null);
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
        onRegionChangeComplete={(nextRegion) => {
          regionRef.current = nextRegion;
        }}
      >
        {BUS_STOPS.map((stop) => (
          <Marker
            key={stop.id}
            ref={(ref) => {
              markerRefs.current[stop.id] = ref;
            }}
            coordinate={{ latitude: stop.latitude, longitude: stop.longitude }}
            title={stop.name}
            pinColor={
              stop.arrivals.some((a) => a.isLowFloor) ? "#2f95dc" : "#999999"
            }
            onPress={() => setSelectedStop(stop)}
          />
        ))}
        <Polyline
          coordinates={ROUTE_COORDINATES}
          strokeColor="#2f95dc"
          strokeWidth={4}
        />
      </MapView>

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
});
