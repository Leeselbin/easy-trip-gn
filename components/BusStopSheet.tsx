import { useEffect, useRef } from 'react';
import { Animated, Pressable, ScrollView, StyleSheet, useWindowDimensions } from 'react-native';

import { Text, View } from '@/components/Themed';
import type { BusStop } from '@/constants/busStops';

export default function BusStopSheet({
  stop,
  onClose,
}: {
  stop: BusStop | null;
  onClose: () => void;
}) {
  const translateY = useRef(new Animated.Value(360)).current;
  const { height: windowHeight } = useWindowDimensions();

  useEffect(() => {
    Animated.timing(translateY, {
      toValue: stop ? 0 : 360,
      duration: 220,
      useNativeDriver: true,
    }).start();
  }, [stop, translateY]);

  if (!stop) {
    return null;
  }

  return (
    <>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <Animated.View style={[styles.sheetWrapper, { transform: [{ translateY }] }]}>
        <View style={styles.sheet}>
          <View style={styles.handle} />
          <View style={styles.header}>
            <Text style={styles.title}>{stop.name}</Text>
            <Text style={styles.subtitle}>버스 도착정보</Text>
          </View>

          <ScrollView
            style={{ maxHeight: Math.min(windowHeight * 0.3, 220) }}
            showsVerticalScrollIndicator={false}
            bounces={false}>
            {stop.arrivals.map((arrival) => (
              <View key={arrival.routeName} style={styles.row}>
                <View style={styles.routeChip}>
                  <Text style={styles.routeChipText}>{arrival.routeName}</Text>
                </View>
                <Text style={[styles.arrival, arrival.arrivalMinutes <= 5 && styles.arrivalSoon]}>
                  {arrival.arrivalMinutes}분 후 도착
                </Text>
                <View style={[styles.badge, arrival.isLowFloor ? styles.badgeOn : styles.badgeOff]}>
                  <Text
                    style={[
                      styles.badgeText,
                      arrival.isLowFloor ? styles.badgeTextOn : styles.badgeTextOff,
                    ]}>
                    {arrival.isLowFloor ? '♿ 저상' : '일반'}
                  </Text>
                </View>
              </View>
            ))}
          </ScrollView>
        </View>
      </Animated.View>
    </>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  sheetWrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: -4 },
    elevation: 12,
  },
  sheet: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 36,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    gap: 14,
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 5,
    borderRadius: 3,
    backgroundColor: 'rgba(127,127,127,0.35)',
  },
  header: {
    gap: 2,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 13,
    opacity: 0.5,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(127,127,127,0.12)',
  },
  routeChip: {
    width: 44,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#2f95dc',
    alignItems: 'center',
    justifyContent: 'center',
  },
  routeChipText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 13,
  },
  arrival: {
    flex: 1,
    fontSize: 14,
    opacity: 0.8,
  },
  arrivalSoon: {
    color: '#e0524d',
    fontWeight: '700',
    opacity: 1,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  badgeOn: {
    backgroundColor: 'rgba(47,149,220,0.15)',
  },
  badgeOff: {
    backgroundColor: 'rgba(127,127,127,0.15)',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  badgeTextOn: {
    color: '#2f95dc',
  },
  badgeTextOff: {
    color: '#888',
  },
});
