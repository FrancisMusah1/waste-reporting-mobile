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

function getPasswordStrength(password) {
  if (!password) return { score: 0, label: "", color: "#3A4459" };
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 1) return { score: 0.25, label: "Weak", color: "#FF6B6B" };
  if (score === 2) return { score: 0.5, label: "Fair", color: "#F4A825" };
  if (score === 3) return { score: 0.75, label: "Good", color: "#4A9FE5" };
  return { score: 1, label: "Strong", color: "#4ADE80" };
}

export default function Signup() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const strength = getPasswordStrength(password);

  async function handleSignup() {
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message);
        return;
      }

      // After successful signup, send them to log in with their new account
      setSuccess("Account created! Redirecting to login...");
      setTimeout(() => router.replace("/login"), 1200);
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
          <View style={styles.iconBadge}>
            <Ionicons name="person-add" size={28} color="#4ADE80" />
          </View>

          <Text style={styles.title}>Create your account</Text>
          <Text style={styles.subtitle}>Track your reports and earn your reporter rank</Text>

          {error ? (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle" size={16} color="#FF6B6B" />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          {success ? (
            <View style={styles.successBox}>
              <Ionicons name="checkmark-circle" size={16} color="#4ADE80" />
              <Text style={styles.successText}>{success}</Text>
            </View>
          ) : null}

          <Text style={styles.label}>Name</Text>
          <View style={styles.inputWrapper}>
            <Ionicons name="person-outline" size={18} color="#8B93A7" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Your name"
              placeholderTextColor="#5C6B84"
            />
          </View>

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

          {password.length > 0 && (
            <View style={styles.strengthSection}>
              <View style={styles.strengthTrack}>
                <View
                  style={[
                    styles.strengthFill,
                    { width: `${strength.score * 100}%`, backgroundColor: strength.color },
                  ]}
                />
              </View>
              <Text style={[styles.strengthLabel, { color: strength.color }]}>{strength.label}</Text>
            </View>
          )}

          <TouchableOpacity style={styles.button} onPress={handleSignup} disabled={loading} activeOpacity={0.85}>
            {loading ? (
              <ActivityIndicator color="#0B1830" />
            ) : (
              <>
                <Text style={styles.buttonText}>Create Account</Text>
                <Ionicons name="arrow-forward" size={18} color="#0B1830" style={{ marginLeft: 6 }} />
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.push("/login")}>
            <Text style={styles.link}>
              Already have an account? <Text style={styles.linkAccent}>Log in</Text>
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
  header: { paddingTop: 56, paddingHorizontal: 12 },
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
    backgroundColor: "rgba(74,222,128,0.1)",
    borderWidth: 1,
    borderColor: "rgba(74,222,128,0.25)",
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
  subtitle: { fontSize: 14, color: "#8B93A7", textAlign: "center", marginBottom: 24 },
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
  successBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(74,222,128,0.1)",
    borderWidth: 1,
    borderColor: "rgba(74,222,128,0.25)",
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
  },
  successText: { color: "#4ADE80", fontSize: 13, flex: 1 },
  label: { color: "#F5F2EA", fontWeight: "600", marginBottom: 8, marginTop: 12, fontSize: 13 },
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
  input: { flex: 1, paddingVertical: 14, color: "#F5F2EA", fontSize: 15 },
  eyeButton: { padding: 4 },
  strengthSection: { marginTop: 10, flexDirection: "row", alignItems: "center", gap: 10 },
  strengthTrack: {
    flex: 1,
    height: 5,
    borderRadius: 3,
    backgroundColor: "rgba(245,242,234,0.1)",
    overflow: "hidden",
  },
  strengthFill: { height: "100%", borderRadius: 3 },
  strengthLabel: { fontSize: 11.5, fontWeight: "600", width: 44 },
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