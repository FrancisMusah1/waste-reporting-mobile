import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

const PODIUM_COLORS = {
  1: { border: "#F4C845", bg: "rgba(244,200,69,0.1)" },
  2: { border: "#C4CDD8", bg: "rgba(196,205,216,0.08)" },
  3: { border: "#D98E4A", bg: "rgba(217,142,74,0.08)" },
};

export default function Leaderboard() {
  const router = useRouter();
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLeaderboard();
  }, []);

  async function loadLeaderboard() {
    try {
      const response = await fetch(`${API_URL}/leaderboard`);
      const data = await response.json();
      setEntries(data);
    } catch (err) {
      console.log("Failed to load leaderboard:", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <LinearGradient colors={["#0B1830", "#0F2A3D", "#0B1830"]} style={styles.screen}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={22} color="#F5F2EA" />
        </TouchableOpacity>
        <Text style={styles.title}>Leaderboard</Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.content}>
        {loading ? (
          <ActivityIndicator color="#F4A825" style={{ marginTop: 60 }} />
        ) : (
          <FlatList
            data={entries}
            keyExtractor={(item) => item.position.toString()}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 20 }}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Ionicons name="trophy-outline" size={32} color="#3A4459" />
                <Text style={styles.empty}>No ranked users yet.</Text>
              </View>
            }
            renderItem={({ item }) => {
              const podium = PODIUM_COLORS[item.position];
              return (
                <View
                  style={[
                    styles.row,
                    podium && { borderColor: podium.border, backgroundColor: podium.bg },
                  ]}
                >
                  <View style={[styles.positionBadge, podium && { backgroundColor: podium.border }]}>
                    <Text style={[styles.position, podium && styles.positionPodium]}>
                      {item.position}
                    </Text>
                  </View>

                  <Text style={styles.emoji}>{item.rankEmoji}</Text>

                  <View style={styles.rowTextGroup}>
                    <Text style={styles.name}>{item.name}</Text>
                    <Text style={styles.rankName}>{item.rankName}</Text>
                  </View>

                  <Text style={styles.points}>{item.points} pts</Text>
                </View>
              );
            }}
          />
        )}
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 56,
    paddingBottom: 16,
    paddingHorizontal: 12,
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(245,242,234,0.06)",
    justifyContent: "center",
    alignItems: "center",
  },
  title: { color: "#F5F2EA", fontSize: 17, fontWeight: "700" },
  headerSpacer: { width: 38 },
  content: { flex: 1, paddingHorizontal: 20 },
  emptyState: { alignItems: "center", marginTop: 60, gap: 10 },
  empty: { color: "#5C6B84", textAlign: "center", fontSize: 13.5 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(245,242,234,0.06)",
    borderWidth: 1,
    borderColor: "rgba(245,242,234,0.08)",
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
  },
  positionBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(245,242,234,0.08)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  position: { color: "#8B93A7", fontWeight: "700", fontSize: 12.5 },
  positionPodium: { color: "#0B1830" },
  emoji: { fontSize: 22, marginRight: 12 },
  rowTextGroup: { flex: 1 },
  name: { color: "#F5F2EA", fontWeight: "600", fontSize: 14.5 },
  rankName: { color: "#8B93A7", fontSize: 12, marginTop: 2 },
  points: { color: "#F4A825", fontWeight: "700", fontSize: 14 },
});