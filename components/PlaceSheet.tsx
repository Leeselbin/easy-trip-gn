import { useEffect, useRef, useState } from "react";
import { Animated, Easing, Pressable, StyleSheet } from "react-native";

import { Text, View } from "@/components/ui/Themed";

export type SimplePlace = {
  id: string;
  name: string;
  categoryLabel: string;
};

const OFFSCREEN_Y = 300;

export default function PlaceSheet({
  place,
  onClose,
}: {
  place: SimplePlace | null;
  onClose: () => void;
}) {
  const translateY = useRef(new Animated.Value(OFFSCREEN_Y)).current;
  const [content, setContent] = useState<SimplePlace | null>(null);

  useEffect(() => {
    if (place) {
      setContent(place);
      translateY.setValue(OFFSCREEN_Y);
      Animated.timing(translateY, {
        toValue: 0,
        duration: 280,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
    } else if (content) {
      Animated.timing(translateY, {
        toValue: OFFSCREEN_Y,
        duration: 220,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }).start(() => setContent(null));
    }
  }, [place, translateY, content]);

  if (!content) {
    return null;
  }

  return (
    <>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <Animated.View style={[styles.sheetWrapper, { transform: [{ translateY }] }]}>
        <View style={styles.sheet}>
          <View style={styles.handle} />
          <View style={styles.header}>
            <Text style={styles.title}>{content.name}</Text>
            <Text style={styles.subtitle}>{content.categoryLabel}</Text>
          </View>
        </View>
      </Animated.View>
    </>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  sheetWrapper: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    shadowColor: "#000",
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
    alignSelf: "center",
    width: 40,
    height: 5,
    borderRadius: 3,
    backgroundColor: "rgba(127,127,127,0.35)",
  },
  header: {
    gap: 2,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
  },
  subtitle: {
    fontSize: 13,
    opacity: 0.5,
  },
});
