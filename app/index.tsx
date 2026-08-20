import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

// This is the very first screen a user sees.
// citizens who want to track their history and build up their rank.
export default function Index() {
  const router = useRouter();

  return (
    <LinearGradient
      colors={["#0B1830", "#0F2A3D", "#0B1830"]}
      style={styles.container}
    >
      <View style={styles.content}>
        <View style={styles.iconBadge}>
          <View style={styles.iconGlow} />
          <Ionicons name="leaf" size={44} color="#4ADE80" />
        </View>

        <Text style={styles.title}>Smart Waste Reporting</Text>
        <Text style={styles.subtitle}>
          Help keep Accra's drains clear. See a problem? Report it in seconds.
        </Text>

        <View style={styles.buttonGroup}>
          {/* Guest path: no login required, gets straight to reporting */}
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => router.push("/report-guest")}
            activeOpacity={0.85}
          >
            <Ionicons name="camera" size={20} color="#0B1830" style={styles.buttonIcon} />
            <Text style={styles.primaryButtonText}>Report Now (No Sign-Up)</Text>
          </TouchableOpacity>

          {/* Registered path: unlocks report history, tracking, and rank */}
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => router.push("/login")}
            activeOpacity={0.7}
          >
            <Ionicons name="person" size={18} color="#F5F2EA" style={styles.buttonIcon} />
            <Text style={styles.secondaryButtonText}>Log In / Sign Up</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.hint}>
          Signing up lets you track your reports and earn your reporter rank.
        </Text>
      </View>

      <View style={styles.trustStrip}>
        <View style={styles.trustItem}>
          <Ionicons name="lock-open" size={14} color="#8B93A7" />
          <Text style={styles.trustText}>Free</Text>
        </View>
        <View style={styles.trustDot} />
        <View style={styles.trustItem}>
          <Ionicons name="eye-off" size={14} color="#8B93A7" />
          <Text style={styles.trustText}>Anonymous</Text>
        </View>
        <View style={styles.trustDot} />
        <View style={styles.trustItem}>
          <Ionicons name="flash" size={14} color="#8B93A7" />
          <Text style={styles.trustText}>30 seconds</Text>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 28,
  },
  iconBadge: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: "rgba(74,222,128,0.08)",
    borderWidth: 1,
    borderColor: "rgba(74,222,128,0.25)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  iconGlow: {
    position: "absolute",
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: "#4ADE80",
    opacity: 0.06,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#F5F2EA",
    textAlign: "center",
    marginBottom: 10,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    color: "#8B93A7",
    textAlign: "center",
    marginBottom: 40,
    paddingHorizontal: 12,
    lineHeight: 22,
  },
  buttonGroup: {
    width: "100%",
  },
  primaryButton: {
    flexDirection: "row",
    backgroundColor: "#F4A825",
    paddingVertical: 17,
    paddingHorizontal: 28,
    borderRadius: 14,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
    shadowColor: "#F4A825",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  primaryButtonText: {
    color: "#0B1830",
    fontWeight: "700",
    fontSize: 16,
  },
  secondaryButton: {
    flexDirection: "row",
    backgroundColor: "rgba(245,242,234,0.06)",
    borderWidth: 1,
    borderColor: "rgba(245,242,234,0.2)",
    paddingVertical: 15,
    paddingHorizontal: 28,
    borderRadius: 14,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  secondaryButtonText: {
    color: "#F5F2EA",
    fontWeight: "600",
    fontSize: 15,
  },
  buttonIcon: {
    marginRight: 8,
  },
  hint: {
    color: "#5C6B84",
    fontSize: 12.5,
    marginTop: 22,
    textAlign: "center",
    lineHeight: 18,
  },
  trustStrip: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: 40,
  },
  trustItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  trustText: {
    color: "#8B93A7",
    fontSize: 12,
    fontWeight: "500",
  },
  trustDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: "#3A4459",
    marginHorizontal: 12,
  },
});