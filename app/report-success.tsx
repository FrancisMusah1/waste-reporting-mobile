import { useRouter } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

// Shown immediately after a report is successfully submitted.
// Kept simple and positive — this is a key moment for making a first-time
// guest reporter feel good about using the app, encouraging repeat use.
export default function ReportSuccess() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>✅</Text>
      <Text style={styles.title}>Report Submitted!</Text>
      <Text style={styles.subtitle}>
        Thank you for helping keep Accra's drains clear. Sanitation officials
        will review your report shortly.
      </Text>

      <TouchableOpacity
        style={styles.primaryButton}
        onPress={() => router.push("/report-guest")}
      >
        <Text style={styles.primaryButtonText}>📸 Report Another Issue</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.secondaryButton}
        onPress={() => router.push("/login")}
      >
        <Text style={styles.secondaryButtonText}>
          Sign up to track this report →
        </Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.replace("/")}>
        <Text style={styles.homeLink}>Back to Home</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0B1830",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  emoji: { fontSize: 56, marginBottom: 16 },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: "#F5F2EA",
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 14,
    color: "#8B93A7",
    textAlign: "center",
    marginBottom: 32,
    paddingHorizontal: 16,
  },
  primaryButton: {
    backgroundColor: "#F4A825",
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    width: "100%",
    alignItems: "center",
    marginBottom: 12,
  },
  primaryButtonText: { color: "#0B1830", fontWeight: "700", fontSize: 15 },
  secondaryButton: {
    borderWidth: 1,
    borderColor: "#F5F2EA",
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
    width: "100%",
    alignItems: "center",
    marginBottom: 20,
  },
  secondaryButtonText: { color: "#F5F2EA", fontWeight: "600", fontSize: 14 },
  homeLink: { color: "#6b7d72", fontSize: 13, textDecorationLine: "underline" },
});