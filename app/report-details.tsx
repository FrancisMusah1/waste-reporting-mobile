import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import {
    ActivityIndicator,
    Image, ScrollView,
    StyleSheet,
    Text, TextInput, TouchableOpacity,
    View
} from "react-native";

const API_URL = process.env.EXPO_PUBLIC_API_URL;


const CATEGORIES = ["Blocked Drain", "Illegal Dumping", "Overflowing Bin", "Other"];

export default function ReportDetails() {
  const router = useRouter();
  const { photoUri, latitude, longitude } = useLocalSearchParams();

  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit() {
    if (!category) {
      alert("Please select a category");
      return;
    }

    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("category", category);
      formData.append("description", description);
      formData.append("location", location || "Not specified");
      formData.append("latitude", latitude || "");
      formData.append("longitude", longitude || "");

      formData.append("photo", {
        uri: photoUri,
        name: "report-photo.jpg",
        type: "image/jpeg",
      });

      const response = await fetch(`${API_URL}/reports/guest`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Something went wrong");
        return;
      }

      router.replace("/report-success");
    } catch (err) {
      console.log("Submit error:", err);
      alert("Failed to submit report: " + err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 20 }}>
      <Image source={{ uri: photoUri }} style={styles.preview} />

      <Text style={styles.label}>Category</Text>
      <View style={styles.categoryRow}>
        {CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat}
            style={[styles.categoryChip, category === cat && styles.categoryChipActive]}
            onPress={() => setCategory(cat)}
          >
            <Text style={[styles.categoryText, category === cat && styles.categoryTextActive]}>
              {cat}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Description (optional)</Text>
      <TextInput
        style={styles.textArea}
        placeholder="Describe what you saw..."
        placeholderTextColor="#6b7d72"
        multiline
        value={description}
        onChangeText={setDescription}
      />

      <Text style={styles.label}>Location details (optional)</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. Near Madina Market"
        placeholderTextColor="#6b7d72"
        value={location}
        onChangeText={setLocation}
      />

      <TouchableOpacity
        style={styles.submitButton}
        onPress={handleSubmit}
        disabled={submitting}
      >
        {submitting ? (
          <ActivityIndicator color="#0B1830" />
        ) : (
          <Text style={styles.submitButtonText}>Submit Report</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0B1830" },
  preview: { width: "100%", height: 200, borderRadius: 12, marginBottom: 20 },
  label: { color: "#F5F2EA", fontWeight: "600", marginBottom: 8, marginTop: 12 },
  categoryRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 8 },
  categoryChip: {
    borderWidth: 1,
    borderColor: "#8B93A7",
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  categoryChipActive: { backgroundColor: "#F4A825", borderColor: "#F4A825" },
  categoryText: { color: "#F5F2EA", fontSize: 13 },
  categoryTextActive: { color: "#0B1830", fontWeight: "700" },
  textArea: {
    backgroundColor: "rgba(245,242,234,0.08)",
    borderRadius: 10,
    padding: 12,
    color: "#F5F2EA",
    height: 90,
    textAlignVertical: "top",
  },
  input: {
    backgroundColor: "rgba(245,242,234,0.08)",
    borderRadius: 10,
    padding: 12,
    color: "#F5F2EA",
  },
  submitButton: {
    backgroundColor: "#F4A825",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 28,
    marginBottom: 40,
  },
  submitButtonText: { color: "#0B1830", fontWeight: "700", fontSize: 16 },
});