import { useRouter } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

// This is the very first screen a user sees. It offers two clear paths,
// matching the supervisor's guidance: reporting should be as low-friction
// as possible for a passerby, while still supporting full accounts for
// citizens who want to track their history and build up their rank.
export default function Index() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>🌿</Text>
      <Text style={styles.title}>Smart Waste Reporting</Text>
      <Text style={styles.subtitle}>
        Help keep Accra's drains clear. See a problem? Report it in seconds.
      </Text>

      {/* Guest path: no login required, gets straight to reporting */}
      <TouchableOpacity
        style={styles.primaryButton}
        onPress={() => router.push("/report-guest")}
      >
        <Text style={styles.primaryButtonText}>📸 Report Now (No Sign-Up)</Text>
      </TouchableOpacity>

      {/* Registered path: unlocks report history, tracking, and rank */}
      <TouchableOpacity
        style={styles.secondaryButton}
        onPress={() => router.push("/login")}
      >
        <Text style={styles.secondaryButtonText}>Log In / Sign Up</Text>
      </TouchableOpacity>

      <Text style={styles.hint}>
        Signing up lets you track your reports and earn your reporter rank.
      </Text>
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
  emoji: {
    fontSize: 48,
    marginBottom: 8,
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
    color: "#F5F2EA",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: "#8B93A7",
    textAlign: "center",
    marginBottom: 36,
    paddingHorizontal: 16,
  },
  primaryButton: {
    backgroundColor: "#F4A825",
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    width: "100%",
    alignItems: "center",
    marginBottom: 14,
  },
  primaryButtonText: {
    color: "#0B1830",
    fontWeight: "700",
    fontSize: 16,
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: "#F5F2EA",
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
    width: "100%",
    alignItems: "center",
  },
  secondaryButtonText: {
    color: "#F5F2EA",
    fontWeight: "600",
    fontSize: 15,
  },
  hint: {
    color: "#6b7d72",
    fontSize: 12,
    marginTop: 20,
    textAlign: "center",
  },
});
