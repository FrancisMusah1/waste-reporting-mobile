import { Audio, Video } from "expo-av";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
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
  const { photoUri, videoUri, latitude, longitude } = useLocalSearchParams();

  // Whether this report was captured as a photo or a video determines
  // whether we show the voice-note option at all
  const isVideo = !!videoUri;

  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [recording, setRecording] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [audioUri, setAudioUri] = useState(null);
  const [sound, setSound] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    return sound ? () => { sound.unloadAsync(); } : undefined;
  }, [sound]);

  async function startRecording() {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== "granted") {
        alert("Microphone permission is needed to record a voice note");
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording: newRecording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      setRecording(newRecording);
      setIsRecording(true);
    } catch (err) {
      console.log("Failed to start recording:", err);
    }
  }

  async function stopRecording() {
    if (!recording) return;

    setIsRecording(false);
    await recording.stopAndUnloadAsync();

    const uri = recording.getURI();
    setAudioUri(uri);
    setRecording(null);
  }

  async function playRecording() {
    if (!audioUri) return;

    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      playsInSilentModeIOS: true,
    });

    const { sound: newSound } = await Audio.Sound.createAsync({ uri: audioUri });
    setSound(newSound);
    setIsPlaying(true);

    newSound.setOnPlaybackStatusUpdate((status) => {
      if (status.didJustFinish) {
        setIsPlaying(false);
      }
    });

    await newSound.playAsync();
  }

  function discardRecording() {
    setAudioUri(null);
    setSound(null);
    setIsPlaying(false);
  }

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

      // Attach whichever media type was actually captured
      if (isVideo) {
        formData.append("video", {
          uri: videoUri,
          name: "report-video.mp4",
          type: "video/mp4",
        });
      } else {
        formData.append("photo", {
          uri: photoUri,
          name: "report-photo.jpg",
          type: "image/jpeg",
        });

        if (audioUri) {
          formData.append("audio", {
            uri: audioUri,
            name: "voice-note.m4a",
            type: "audio/m4a",
          });
        }
      }

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
      alert("Failed to submit report. Please check your connection.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 20 }}>
      {isVideo ? (
        <Video
          source={{ uri: videoUri }}
          style={styles.preview}
          useNativeControls
          isLooping
        />
      ) : (
        <Image source={{ uri: photoUri }} style={styles.preview} />
      )}

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

      {/* Voice note is only offered for photo reports */}
      {!isVideo && (
        <>
          <Text style={styles.label}>Voice Note (optional)</Text>
          {!audioUri ? (
            <TouchableOpacity
              style={[styles.micButton, isRecording && styles.micButtonActive]}
              onPress={isRecording ? stopRecording : startRecording}
            >
              <Text style={styles.micButtonText}>
                {isRecording ? "⏹ Stop Recording" : "🎤 Hold to Record a Voice Note"}
              </Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.audioReview}>
              <TouchableOpacity style={styles.playButton} onPress={playRecording} disabled={isPlaying}>
                <Text style={styles.playButtonText}>{isPlaying ? "▶ Playing..." : "▶ Play"}</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={discardRecording}>
                <Text style={styles.discardText}>Discard</Text>
              </TouchableOpacity>
            </View>
          )}
        </>
      )}

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
  preview: { width: "100%", height: 200, borderRadius: 12, marginBottom: 20, backgroundColor: "#000" },
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
  micButton: {
    borderWidth: 1,
    borderColor: "#8B93A7",
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
  },
  micButtonActive: {
    borderColor: "#e53935",
    backgroundColor: "rgba(229,57,53,0.12)",
  },
  micButtonText: { color: "#F5F2EA", fontWeight: "600" },
  audioReview: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    backgroundColor: "rgba(245,242,234,0.08)",
    borderRadius: 10,
    padding: 14,
  },
  playButton: {
    backgroundColor: "#F4A825",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  playButtonText: { color: "#0B1830", fontWeight: "700" },
  discardText: { color: "#e53935", fontWeight: "600" },
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