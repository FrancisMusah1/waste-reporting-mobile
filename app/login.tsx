import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
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

// Wraps fetch with a real timeout (via AbortController) and one automatic
// retry. React Native's fetch has no reliable built-in timeout, so without
// this, a slow/cold server just hangs or fails outright instead of
// recovering on a second attempt.
async function fetchWithRetry(url, options, { timeoutMs = 45000, retries = 1 } = {}) {
  for (let attempt = 0; attempt <= retries; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await fetch(url, { ...options, signal: controller.signal });
      clearTimeout(timer);
      return response;
    } catch (err) {
      clearTimeout(timer);
      const isLastAttempt = attempt === retries;
      if (isLastAttempt) throw err;
      // otherwise loop and retry — likely a cold start finishing up
    }
  }
}

export default function Login() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    setError("");
    setLoading(true);

    try {
      const response = await fetchWithRetry(`${API_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message);
        return;
      }

      // Persist the session so the user stays logged in across app restarts
      await AsyncStorage.setItem("token", data.token);
      await AsyncStorage.setItem("user", JSON.stringify(data.user));

      router.replace("/citizen-home");
    } catch (err) {
      console.log("Login error:", err);
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
          <View style={styles.iconBadge}>
            <Ionicons name="lock-closed" size={30} color="#F4A825" />
          </View>

          <Text style={styles.title}>Welcome back</Text>
          <Text style={styles.subtitle}>Log in to track your reports and rank</Text>

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

          <Text style={styles.label}>Password</Text>
          <View style={styles.inputWrapper}>
            <Ionicons name="lock-closed-outline" size={18} color="#8B93A7" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              placeholder="••••••••"
              placeholderTextColor="#5C6B84"
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeButton}>
              <Ionicons
                name={showPassword ? "eye-off-outline" : "eye-outline"}
                size={18}
                color="#8B93A7"
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity onPress={() => router.push("/forgot-password")} style={styles.forgotLink}>
            <Text style={styles.forgotText}>Forgot password?</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading} activeOpacity={0.85}>
            {loading ? (
              <ActivityIndicator color="#0B1830" />
            ) : (
              <>
                <Text style={styles.buttonText}>Log In</Text>
                <Ionicons name="arrow-forward" size={18} color="#0B1830" style={{ marginLeft: 6 }} />
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.push("/signup")}>
            <Text style={styles.link}>
              Need an account? <Text style={styles.linkAccent}>Sign up</Text>
            </Text>
          </TouchableOpacity>
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
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: "#F5F2EA",
    textAlign: "center",
    marginBottom: 6,
    letterSpacing: -0.4,
  },
  subtitle: {
    fontSize: 14,
    color: "#8B93A7",
    textAlign: "center",
    marginBottom: 28,
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
  label: { color: "#F5F2EA", fontWeight: "600", marginBottom: 8, marginTop: 14, fontSize: 13 },
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
  eyeButton: { padding: 4 },
  forgotLink: { alignSelf: "flex-end", marginTop: 10 },
  forgotText: { color: "#8B93A7", fontSize: 13 },
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
  link: { color: "#8B93A7", textAlign: "center", marginTop: 22, fontSize: 14 },
  linkAccent: { color: "#F4A825", fontWeight: "700" },
});