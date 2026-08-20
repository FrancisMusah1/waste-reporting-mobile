import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Audio, Video } from "expo-av";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image, ScrollView,
  StyleSheet,
  Text, TouchableOpacity,
  View
} from "react-native";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

const CATEGORIES = [
  { label: "Blocked Drain", icon: "water-outline" },
  { label: "Illegal Dumping", icon: "trash-outline" },
  { label: "Overflowing Bin", icon: "warning-outline" },
  { label: "Other", icon: "ellipsis-horizontal-outline" },
];

// Wraps fetch with a real timeout (via AbortController) and one automatic
// retry. React Native's fetch has no reliable built-in timeout, so without
// this, a slow/cold server just hangs until the OS gives up inconsistently.
async function fetchWithRetry(url, options, { timeoutMs = 60000, retries = 1 } = {}) {
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
    
    }
  }
}

export default function ReportDetails() {
  const router = useRouter();
  const { photoUri, videoUri, latitude, longitude } = useLocalSearchParams();

  const isVideo = !!videoUri;

  const [category, setCategory] = useState("");
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
    setSubmitting(true);

    try {
      // Check whether this device has an active logged-in session.
      // If so, submit to the authenticated endpoint (attributed to
      // their account); otherwise fall back to the guest endpoint.
      const token = await AsyncStorage.getItem("token");
      const endpoint = token ? "/reports" : "/reports/guest";

      const formData = new FormData();
      // Category is optional — send it only if the user tapped one.
      // Description and location are no longer collected: voice notes
      // cover description, and GPS (from EXIF or device) covers location.
      if (category) formData.append("category", category);
      formData.append("latitude", latitude || "");
      formData.append("longitude", longitude || "");

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

      // Video uploads take longer (bigger payload + possible cold start),
      // so give them a longer timeout than photo-only submissions.
      const response = await fetchWithRetry(
        `${API_URL}${endpoint}`,
        {
          method: "POST",
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          body: formData,
        },
        { timeoutMs: isVideo ? 90000 : 60000, retries: 1 }
      );

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
    <LinearGradient colors={["#0B1830", "#0F2A3D", "#0B1830"]} style={styles.screen}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={22} color="#F5F2EA" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>New Report</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.container} contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
        <View style={styles.previewWrapper}>
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
          <View style={styles.previewBadge}>
            <Ionicons name={isVideo ? "videocam" : "camera"} size={13} color="#F5F2EA" />
            <Text style={styles.previewBadgeText}>{isVideo ? "Video" : "Photo"}</Text>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Ionicons name="pricetag-outline" size={16} color="#8B93A7" />
          <Text style={styles.label}>Category</Text>
          <Text style={styles.optionalTag}>optional</Text>
        </View>
        <View style={styles.categoryRow}>
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat.label}
              style={[styles.categoryChip, category === cat.label && styles.categoryChipActive]}
              onPress={() => setCategory(category === cat.label ? "" : cat.label)}
              activeOpacity={0.8}
            >
              <Ionicons
                name={cat.icon}
                size={15}
                color={category === cat.label ? "#0B1830" : "#8B93A7"}
                style={{ marginRight: 6 }}
              />
              <Text style={[styles.categoryText, category === cat.label && styles.categoryTextActive]}>
                {cat.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {!isVideo && (
          <>
            <View style={styles.sectionHeader}>
              <Ionicons name="mic-outline" size={16} color="#8B93A7" />
              <Text style={styles.label}>Voice Note</Text>
              <Text style={styles.optionalTag}>optional</Text>
            </View>

            {!audioUri ? (
              <TouchableOpacity
                style={[styles.micButton, isRecording && styles.micButtonActive]}
                onPress={isRecording ? stopRecording : startRecording}
                activeOpacity={0.85}
              >
                <View style={[styles.micIconCircle, isRecording && styles.micIconCircleActive]}>
                  <Ionicons
                    name={isRecording ? "stop" : "mic"}
                    size={20}
                    color={isRecording ? "#FF6B6B" : "#F4A825"}
                  />
                </View>
                <Text style={styles.micButtonText}>
                  {isRecording ? "Recording... Tap to stop" : "Tap to record a voice note"}
                </Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.audioReview}>
                <TouchableOpacity style={styles.playButton} onPress={playRecording} disabled={isPlaying}>
                  <Ionicons
                    name={isPlaying ? "volume-high" : "play"}
                    size={16}
                    color="#0B1830"
                  />
                </TouchableOpacity>
                <Text style={styles.audioLabel}>
                  {isPlaying ? "Playing voice note..." : "Voice note recorded"}
                </Text>
                <TouchableOpacity onPress={discardRecording} style={styles.discardButton}>
                  <Ionicons name="trash-outline" size={16} color="#FF6B6B" />
                </TouchableOpacity>
              </View>
            )}
          </>
        )}

        <TouchableOpacity
          style={styles.submitButton}
          onPress={handleSubmit}
          disabled={submitting}
          activeOpacity={0.85}
        >
          {submitting ? (
            <ActivityIndicator color="#0B1830" />
          ) : (
            <>
              <Text style={styles.submitButtonText}>Submit Report</Text>
              <Ionicons name="arrow-forward" size={18} color="#0B1830" style={{ marginLeft: 6 }} />
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 56,
    paddingBottom: 14,
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
  headerTitle: { color: "#F5F2EA", fontSize: 16, fontWeight: "700" },
  headerSpacer: { width: 38 },
  container: { flex: 1 },
  previewWrapper: { position: "relative", marginBottom: 24 },
  preview: { width: "100%", height: 220, borderRadius: 16, backgroundColor: "#000" },
  previewBadge: {
    position: "absolute",
    top: 12,
    left: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "rgba(11,24,48,0.75)",
    borderRadius: 20,
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  previewBadgeText: { color: "#F5F2EA", fontSize: 11.5, fontWeight: "600" },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 12,
    marginTop: 8,
  },
  label: { color: "#F5F2EA", fontWeight: "700", fontSize: 14.5 },
  optionalTag: { color: "#5C6B84", fontSize: 11.5, fontStyle: "italic" },
  categoryRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 24 },
  categoryChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(245,242,234,0.06)",
    borderWidth: 1,
    borderColor: "rgba(245,242,234,0.15)",
    borderRadius: 22,
    paddingVertical: 9,
    paddingHorizontal: 15,
  },
  categoryChipActive: { backgroundColor: "#F4A825", borderColor: "#F4A825" },
  categoryText: { color: "#F5F2EA", fontSize: 13, fontWeight: "500" },
  categoryTextActive: { color: "#0B1830", fontWeight: "700" },
  micButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(245,242,234,0.06)",
    borderWidth: 1,
    borderColor: "rgba(245,242,234,0.15)",
    borderRadius: 14,
    padding: 14,
    marginBottom: 24,
  },
  micButtonActive: {
    borderColor: "rgba(255,107,107,0.4)",
    backgroundColor: "rgba(255,107,107,0.08)",
  },
  micIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(244,168,37,0.12)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  micIconCircleActive: { backgroundColor: "rgba(255,107,107,0.15)" },
  micButtonText: { color: "#F5F2EA", fontWeight: "600", fontSize: 14 },
  audioReview: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(74,222,128,0.08)",
    borderWidth: 1,
    borderColor: "rgba(74,222,128,0.25)",
    borderRadius: 14,
    padding: 12,
    marginBottom: 24,
  },
  playButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#4ADE80",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  audioLabel: { color: "#F5F2EA", fontSize: 13, fontWeight: "500", flex: 1 },
  discardButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255,107,107,0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  submitButton: {
    flexDirection: "row",
    backgroundColor: "#F4A825",
    borderRadius: 14,
    paddingVertical: 17,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
    shadowColor: "#F4A825",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  submitButtonText: { color: "#0B1830", fontWeight: "700", fontSize: 16 },
});