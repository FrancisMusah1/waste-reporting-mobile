import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

// Shown immediately after a report is successfully submitted.
// Kept simple and positive — this is a key moment for making a first-time
// guest reporter feel good about using the app, encouraging repeat use.
export default function ReportSuccess() {
  const router = useRouter();

  return (
    <LinearGradient colors={["#0B1830", "#0F2A3D", "#0B1830"]} style={styles.container}>
      <View style={styles.iconBadge}>
        <View style={styles.iconGlow} />
        <Ionicons name="checkmark" size={48} color="#4ADE80" />
      </View>

      <Text style={styles.title}>Report Submitted!</Text>
      <Text style={styles.subtitle}>
        Thank you for helping keep Accra's drains clear. Sanitation officials
        will review your report shortly.
      </Text>

      <View style={styles.buttonGroup}>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => router.push("/report-guest")}
          activeOpacity={0.85}
        >
          <Ionicons name="camera" size={18} color="#0B1830" style={{ marginRight: 8 }} />
          <Text style={styles.primaryButtonText}>Report Another Issue</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => router.push("/login")}
          activeOpacity={0.7}
        >
          <Text style={styles.secondaryButtonText}>Sign up to track this report</Text>
          <Ionicons name="arrow-forward" size={16} color="#F5F2EA" style={{ marginLeft: 6 }} />
        </TouchableOpacity>
      </View>

      <TouchableOpacity onPress={() => router.replace("/")}>
        <Text style={styles.homeLink}>Back to Home</Text>
      </TouchableOpacity>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 28,
  },
  iconBadge: {
    width: 104,
    height: 104,
    borderRadius: 52,
    backgroundColor: "rgba(74,222,128,0.1)",
    borderWidth: 1,
    borderColor: "rgba(74,222,128,0.3)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 28,
  },
  iconGlow: {
    position: "absolute",
    width: 104,
    height: 104,
    borderRadius: 52,
    backgroundColor: "#4ADE80",
    opacity: 0.08,
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
    color: "#F5F2EA",
    marginBottom: 12,
    letterSpacing: -0.4,
  },
  subtitle: {
    fontSize: 14.5,
    color: "#8B93A7",
    textAlign: "center",
    marginBottom: 36,
    paddingHorizontal: 12,
    lineHeight: 21,
  },
  buttonGroup: { width: "100%" },
  primaryButton: {
    flexDirection: "row",
    backgroundColor: "#F4A825",
    paddingVertical: 16,
    borderRadius: 14,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
    shadowColor: "#F4A825",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 5,
  },
  primaryButtonText: { color: "#0B1830", fontWeight: "700", fontSize: 15 },
  secondaryButton: {
    flexDirection: "row",
    borderWidth: 1,
    borderColor: "rgba(245,242,234,0.2)",
    backgroundColor: "rgba(245,242,234,0.05)",
    paddingVertical: 14,
    borderRadius: 14,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  secondaryButtonText: { color: "#F5F2EA", fontWeight: "600", fontSize: 14 },
  homeLink: { color: "#5C6B84", fontSize: 13, textDecorationLine: "underline" },
});