import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

// Mirrors ranks.js on the backend — used only to compute progress toward
// the next tier for the progress bar. Keep in sync if ranks.js changes.
const RANK_THRESHOLDS = [0, 50, 150, 350, 700];

const STATUS_CONFIG = {
  pending: { icon: "time-outline", color: "#F4A825", label: "Pending" },
  in_progress: { icon: "sync-outline", color: "#4A9FE5", label: "In progress" },
  resolved: { icon: "checkmark-circle-outline", color: "#4ADE80", label: "Resolved" },
};

export default function CitizenHome() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [reports, setReports] = useState([]);
  const [rankInfo, setRankInfo] = useState(null);

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

    // Rank/points badge — separate call, fails silently if it errors
    // so a gamification hiccup never blocks the reports list from loading
    try {
      const meResponse = await fetch(`${API_URL}/me`, {
        headers: { Authorization: `Bearer ${storedToken}` },
      });
      const meData = await meResponse.json();
      setRankInfo(meData);
    } catch (err) {
      console.log("Failed to load rank info:", err);
    }
  }

  async function handleLogout() {
    await AsyncStorage.removeItem("token");
    await AsyncStorage.removeItem("user");
    router.replace("/");
  }

  function getProgressToNextRank(points) {
    const nextThreshold = RANK_THRESHOLDS.find((t) => t > points);
    if (!nextThreshold) return { isMaxRank: true, progress: 1, pointsToGo: 0 };

    const prevThreshold = [...RANK_THRESHOLDS].reverse().find((t) => t <= points) ?? 0;
    const progress = (points - prevThreshold) / (nextThreshold - prevThreshold);
    return { isMaxRank: false, progress, pointsToGo: nextThreshold - points };
  }

  if (!user) return null;

  const progressInfo = rankInfo ? getProgressToNextRank(rankInfo.points) : null;

  return (
    <LinearGradient colors={["#0B1830", "#0F2A3D", "#0B1830"]} style={styles.screen}>
      <View style={styles.header}>
        <View>
          <Text style={styles.welcomeLabel}>Welcome back</Text>
          <Text style={styles.welcome}>{user.name}</Text>
        </View>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Ionicons name="log-out-outline" size={20} color="#8B93A7" />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {rankInfo ? (
          <TouchableOpacity
            style={styles.rankCard}
            onPress={() => router.push("/leaderboard")}
            activeOpacity={0.85}
          >
            <View style={styles.rankTop}>
              <View style={styles.rankLeft}>
                <Text style={styles.rankEmoji}>{rankInfo.rankEmoji}</Text>
                <View>
                  <Text style={styles.rankName}>{rankInfo.rank}</Text>
                  <Text style={styles.rankPoints}>{rankInfo.points} points</Text>
                </View>
              </View>
              <View style={styles.leaderboardLink}>
                <Text style={styles.rankLink}>Leaderboard</Text>
                <Ionicons name="chevron-forward" size={14} color="#F4A825" />
              </View>
            </View>

            {progressInfo && !progressInfo.isMaxRank && (
              <View style={styles.progressSection}>
                <View style={styles.progressTrack}>
                  <View style={[styles.progressFill, { width: `${progressInfo.progress * 100}%` }]} />
                </View>
                <Text style={styles.progressLabel}>
                  {progressInfo.pointsToGo} points to next rank
                </Text>
              </View>
            )}
          </TouchableOpacity>
        ) : null}

        <TouchableOpacity
          style={styles.reportButton}
          onPress={() => router.push("/report-guest")}
          activeOpacity={0.85}
        >
          <Ionicons name="camera" size={20} color="#0B1830" style={{ marginRight: 8 }} />
          <Text style={styles.reportButtonText}>Report an Issue</Text>
        </TouchableOpacity>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>My Reports</Text>
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{reports.length}</Text>
          </View>
        </View>

        <FlatList
          data={reports}
          keyExtractor={(item) => item.id.toString()}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="document-text-outline" size={32} color="#3A4459" />
              <Text style={styles.empty}>You haven't submitted any reports yet.</Text>
            </View>
          }
          renderItem={({ item }) => {
            const statusConfig = STATUS_CONFIG[item.status] || STATUS_CONFIG.pending;
            return (
              <View style={styles.card}>
                {item.photo_url ? (
                  <Image source={{ uri: item.photo_url }} style={styles.cardImage} />
                ) : (
                  <View style={[styles.cardImage, styles.cardImagePlaceholder]}>
                    <Ionicons name="videocam-outline" size={22} color="#5C6B84" />
                  </View>
                )}
                <View style={styles.cardBody}>
                  <Text style={styles.cardCategory}>{item.category}</Text>
                  <View style={styles.statusRow}>
                    <Ionicons name={statusConfig.icon} size={13} color={statusConfig.color} />
                    <Text style={[styles.cardStatus, { color: statusConfig.color }]}>
                      {statusConfig.label}
                    </Text>
                  </View>
                </View>
              </View>
            );
          }}
        />
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingTop: 56,
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  welcomeLabel: { color: "#5C6B84", fontSize: 13, marginBottom: 2 },
  welcome: { color: "#F5F2EA", fontSize: 22, fontWeight: "800", letterSpacing: -0.4 },
  logoutButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(245,242,234,0.06)",
    justifyContent: "center",
    alignItems: "center",
  },
  content: { flex: 1, paddingHorizontal: 20 },
  rankCard: {
    backgroundColor: "rgba(244,168,37,0.08)",
    borderWidth: 1,
    borderColor: "rgba(244,168,37,0.25)",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  rankTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  rankLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  rankEmoji: { fontSize: 30 },
  rankName: { color: "#F5F2EA", fontWeight: "700", fontSize: 15 },
  rankPoints: { color: "#8B93A7", fontSize: 12, marginTop: 2 },
  leaderboardLink: { flexDirection: "row", alignItems: "center", gap: 2 },
  rankLink: { color: "#F4A825", fontWeight: "600", fontSize: 12.5 },
  progressSection: { marginTop: 14 },
  progressTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(245,242,234,0.1)",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 3,
    backgroundColor: "#F4A825",
  },
  progressLabel: { color: "#5C6B84", fontSize: 11.5, marginTop: 6 },
  reportButton: {
    flexDirection: "row",
    backgroundColor: "#F4A825",
    borderRadius: 14,
    paddingVertical: 16,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
    shadowColor: "#F4A825",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 5,
  },
  reportButtonText: { color: "#0B1830", fontWeight: "700", fontSize: 15 },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 14,
  },
  sectionTitle: { color: "#F5F2EA", fontWeight: "700", fontSize: 16 },
  countBadge: {
    backgroundColor: "rgba(245,242,234,0.08)",
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  countText: { color: "#8B93A7", fontSize: 12, fontWeight: "600" },
  emptyState: { alignItems: "center", marginTop: 40, gap: 10 },
  empty: { color: "#5C6B84", textAlign: "center", fontSize: 13.5 },
  card: {
    flexDirection: "row",
    backgroundColor: "rgba(245,242,234,0.06)",
    borderWidth: 1,
    borderColor: "rgba(245,242,234,0.08)",
    borderRadius: 14,
    marginBottom: 12,
    overflow: "hidden",
  },
  cardImage: { width: 72, height: 72 },
  cardImagePlaceholder: {
    backgroundColor: "rgba(245,242,234,0.04)",
    justifyContent: "center",
    alignItems: "center",
  },
  cardBody: { flex: 1, padding: 14, justifyContent: "center" },
  cardCategory: { color: "#F5F2EA", fontWeight: "600", fontSize: 14.5, marginBottom: 5 },
  statusRow: { flexDirection: "row", alignItems: "center", gap: 5 },
  cardStatus: { fontSize: 12, fontWeight: "600", textTransform: "capitalize" },
});