import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export default function Login() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    setError("");
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/login`, {
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
      setError("Something went wrong. Please check your connection.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Log In</Text>

      {error ? <Text style={styles.error}>{error}</Text> : null}

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

      <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
        {loading ? <ActivityIndicator color="#0B1830" /> : <Text style={styles.buttonText}>Log In</Text>}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push("/signup")}>
        <Text style={styles.link}>Need an account? Sign up</Text>
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