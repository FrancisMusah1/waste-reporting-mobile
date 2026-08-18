import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export default function CitizenHome() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [reports, setReports] = useState([]);

  // Runs every time this screen comes into focus (not just on first load),
  // so the report list stays fresh after submitting a new one
  useFocusEffect(
    useCallback(() => {
      loadUserAndReports();
    }, [])
  );

  async function loadUserAndReports() {
    const storedToken = await AsyncStorage.getItem("token");
    const storedUser = await AsyncStorage.getItem("user");

    if (!storedToken || !storedUser) {
      router.replace("/login");
      return;
    }

    setToken(storedToken);
    setUser(JSON.parse(storedUser));

    const response = await fetch(`${API_URL}/my-reports`, {
      headers: { Authorization: `Bearer ${storedToken}` },
    });
    const data = await response.json();
    setReports(data);
  }

  async function handleLogout() {
    await AsyncStorage.removeItem("token");
    await AsyncStorage.removeItem("user");
    router.replace("/");
  }

  if (!user) return null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.welcome}>Welcome, {user.name}</Text>
        <TouchableOpacity onPress={handleLogout}>
          <Text style={styles.logout}>Logout</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.reportButton} onPress={() => router.push("/report-guest")}>
        <Text style={styles.reportButtonText}>📸 Report an Issue</Text>
      </TouchableOpacity>

      <Text style={styles.sectionTitle}>My Reports ({reports.length})</Text>

      <FlatList
        data={reports}
        keyExtractor={(item) => item.id.toString()}
        ListEmptyComponent={<Text style={styles.empty}>You haven't submitted any reports yet.</Text>}
        renderItem={({ item }) => (
          <View style={styles.card}>
            {item.photo_url ? (
              <Image source={{ uri: item.photo_url }} style={styles.cardImage} />
            ) : null}
            <View style={styles.cardBody}>
              <Text style={styles.cardCategory}>{item.category}</Text>
              <Text style={styles.cardStatus}>{item.status.replace("_", " ")}</Text>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0B1830", paddingTop: 60, paddingHorizontal: 20 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
  welcome: { color: "#F5F2EA", fontSize: 18, fontWeight: "700" },
  logout: { color: "#8B93A7" },
  reportButton: {
    backgroundColor: "#F4A825",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginBottom: 24,
  },
  reportButtonText: { color: "#0B1830", fontWeight: "700", fontSize: 15 },
  sectionTitle: { color: "#F5F2EA", fontWeight: "700", fontSize: 16, marginBottom: 12 },
  empty: { color: "#8B93A7", textAlign: "center", marginTop: 20 },
  card: {
    flexDirection: "row",
    backgroundColor: "rgba(245,242,234,0.08)",
    borderRadius: 12,
    marginBottom: 12,
    overflow: "hidden",
  },
  cardImage: { width: 70, height: 70 },
  cardBody: { flex: 1, padding: 12, justifyContent: "center" },
  cardCategory: { color: "#F5F2EA", fontWeight: "600" },
  cardStatus: { color: "#F4A825", fontSize: 12, marginTop: 4, textTransform: "capitalize" },
});