import { StyleSheet } from "react-native";

import { Text, View } from "@/components/Themed";

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.container}>
        <Text style={styles.title}>홈</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
  button: {
    marginTop: 16,
    backgroundColor: "#2f95dc",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
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
