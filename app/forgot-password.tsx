import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export default function ForgotPassword() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit() {
    if (!email.trim()) {
      setError("Please enter your email address");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });

      if (response.ok) {
        setSent(true);
      } else {
        setError("Something went wrong. Please try again.");
      }
    } catch (err) {
      setError("Something went wrong. Please check your connection.");
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
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.flex}
      >
        <View style={styles.container}>
          {sent ? (
            <>
              <View style={[styles.iconBadge, styles.iconBadgeSuccess]}>
                <Ionicons name="mail-open-outline" size={30} color="#4ADE80" />
              </View>

              <Text style={styles.title}>Check your email</Text>
              <Text style={styles.subtitle}>
                If an account exists for {email.trim()}, we've sent a link to reset your password.
                The link expires in 1 hour.
              </Text>

              <TouchableOpacity
                style={styles.button}
                onPress={() => router.replace("/login")}
                activeOpacity={0.85}
              >
                <Text style={styles.buttonText}>Back to Log In</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => setSent(false)}>
                <Text style={styles.link}>
                  Didn't get it? <Text style={styles.linkAccent}>Try again</Text>
                </Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <View style={styles.iconBadge}>
                <Ionicons name="key-outline" size={30} color="#F4A825" />
              </View>

              <Text style={styles.title}>Reset your password</Text>
              <Text style={styles.subtitle}>
                Enter your email and we'll send you a link to reset your password.
              </Text>

              {error ? (
                <View style={styles.errorBox}>
                  <Ionicons name="alert-circle" size={16} color="#FF6B6B" />
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              ) : null}

              <Text style={styles.label}>Email</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="mail-outline" size={18} color="#8B93A7" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  placeholder="you@example.com"
                  placeholderTextColor="#5C6B84"
                />
              </View>

              <TouchableOpacity style={styles.button} onPress={handleSubmit} disabled={loading} activeOpacity={0.85}>
                {loading ? (
                  <ActivityIndicator color="#0B1830" />
                ) : (
                  <>
                    <Text style={styles.buttonText}>Send Reset Link</Text>
                    <Ionicons name="arrow-forward" size={18} color="#0B1830" style={{ marginLeft: 6 }} />
                  </>
                )}
              </TouchableOpacity>

              <TouchableOpacity onPress={() => router.back()}>
                <Text style={styles.link}>← Back to Log In</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  flex: { flex: 1 },
  header: {
    paddingTop: 56,
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
  container: { flex: 1, justifyContent: "center", paddingHorizontal: 28 },
  iconBadge: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: "rgba(244,168,37,0.1)",
    borderWidth: 1,
    borderColor: "rgba(244,168,37,0.25)",
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    marginBottom: 20,
  },
  iconBadgeSuccess: {
    backgroundColor: "rgba(74,222,128,0.1)",
    borderColor: "rgba(74,222,128,0.25)",
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: "#F5F2EA",
    textAlign: "center",
    marginBottom: 10,
    letterSpacing: -0.4,
  },
  subtitle: {
    fontSize: 14,
    color: "#8B93A7",
    textAlign: "center",
    marginBottom: 28,
    lineHeight: 20,
  },
  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(255,107,107,0.1)",
    borderWidth: 1,
    borderColor: "rgba(255,107,107,0.25)",
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
  },
  errorText: { color: "#FF6B6B", fontSize: 13, flex: 1 },
  label: { color: "#F5F2EA", fontWeight: "600", marginBottom: 8, marginTop: 4, fontSize: 13 },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(245,242,234,0.06)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(245,242,234,0.15)",
    paddingHorizontal: 14,
  },
  inputIcon: { marginRight: 10 },
  input: {
    flex: 1,
    paddingVertical: 14,
    color: "#F5F2EA",
    fontSize: 15,
  },
  button: {
    flexDirection: "row",
    backgroundColor: "#F4A825",
    borderRadius: 14,
    paddingVertical: 16,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 26,
    shadowColor: "#F4A825",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  buttonText: { color: "#0B1830", fontWeight: "700", fontSize: 16 },
  link: { color: "#8B93A7", textAlign: "center", marginTop: 20, fontSize: 14 },
  linkAccent: { color: "#F4A825", fontWeight: "700" },
});