import { useRouter } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export default function Signup() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

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
    <View style={styles.container}>
      <Text style={styles.title}>Sign Up</Text>

      {error ? <Text style={styles.error}>{error}</Text> : null}
      {success ? <Text style={styles.success}>{success}</Text> : null}

      <Text style={styles.label}>Name</Text>
      <TextInput
        style={styles.input}
        value={name}
        onChangeText={setName}
        placeholder="Your name"
        placeholderTextColor="#6b7d72"
      />

      <Text style={styles.label}>Email</Text>
      <TextInput
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        placeholder="you@example.com"
        placeholderTextColor="#6b7d72"
      />

      <Text style={styles.label}>Password</Text>
      <TextInput
        style={styles.input}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        placeholder="••••••••"
        placeholderTextColor="#6b7d72"
      />

      <TouchableOpacity style={styles.button} onPress={handleSignup} disabled={loading}>
        {loading ? <ActivityIndicator color="#0B1830" /> : <Text style={styles.buttonText}>Sign Up</Text>}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push("/login")}>
        <Text style={styles.link}>Already have an account? Log in</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.back()}>
        <Text style={styles.backLink}>← Back</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0B1830", justifyContent: "center", padding: 24 },
  title: { fontSize: 26, fontWeight: "800", color: "#F5F2EA", marginBottom: 24, textAlign: "center" },
  label: { color: "#F5F2EA", fontWeight: "600", marginBottom: 6, marginTop: 12 },
  input: {
    backgroundColor: "rgba(245,242,234,0.08)",
    borderRadius: 10,
    padding: 12,
    color: "#F5F2EA",
    borderWidth: 1,
    borderColor: "#8B93A7",
  },
  error: { color: "#e53935", textAlign: "center", marginBottom: 8 },
  success: { color: "#2e7d32", textAlign: "center", marginBottom: 8 },
  button: {
    backgroundColor: "#F4A825",
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: "center",
    marginTop: 24,
  },
  buttonText: { color: "#0B1830", fontWeight: "700", fontSize: 16 },
  link: { color: "#F4A825", textAlign: "center", marginTop: 20, fontWeight: "600" },
  backLink: { color: "#8B93A7", textAlign: "center", marginTop: 16 },
});