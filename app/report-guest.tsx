import { Ionicons } from "@expo/vector-icons";
import { Video } from "expo-av";
import { CameraView, useCameraPermissions, useMicrophonePermissions } from "expo-camera";
import * as Location from "expo-location";
import { useRouter } from "expo-router";
import { useRef, useState } from "react";
import { ActivityIndicator, Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function ReportGuest() {
  const router = useRouter();
  const cameraRef = useRef(null);

  const [permission, requestPermission] = useCameraPermissions();
  const [micPermission, requestMicPermission] = useMicrophonePermissions();

  // "photo" or "video" — which capture mode is currently active
  const [mode, setMode] = useState("photo");

  const [photo, setPhoto] = useState(null);
  const [video, setVideo] = useState(null);
  const [isRecording, setIsRecording] = useState(false);

  const [locating, setLocating] = useState(false);
  const [coords, setCoords] = useState(null);

  if (!permission || !micPermission) {
    return <View style={styles.container}><Text style={styles.text}>Loading camera...</Text></View>;
  }

  if (!permission.granted || !micPermission.granted) {
    return (
      <View style={styles.container}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={22} color="#F5F2EA" />
        </TouchableOpacity>
        <Text style={styles.text}>We need camera and microphone access to let you report issues with photo or video.</Text>
        <TouchableOpacity
          style={styles.button}
          onPress={async () => {
            await requestPermission();
            await requestMicPermission();
          }}
        >
          <Text style={styles.buttonText}>Grant Permissions</Text>
        </TouchableOpacity>
      </View>
    );
  }

  async function takePicture() {
    if (!cameraRef.current) return;

    try {
      const result = await cameraRef.current.takePictureAsync({ exif: true });
      if (!result?.uri) return;

      setPhoto(result);
      resolveLocation(result);
    } catch (err) {
      console.log("Capture error:", err);
    }
  }

  async function startVideoRecording() {
    if (!cameraRef.current) return;

    try {
      setIsRecording(true);
      // maxDuration keeps file size sane — 30 seconds is enough to show
      // and narrate an incident without risking a huge, slow upload
      const result = await cameraRef.current.recordAsync({ maxDuration: 30 });

      if (result?.uri) {
        setVideo(result);
        resolveLocation(null); // videos don't carry EXIF GPS, go straight to device location
      }
    } catch (err) {
      console.log("Video recording error:", err);
    } finally {
      setIsRecording(false);
    }
  }

  function stopVideoRecording() {
    if (cameraRef.current) {
      cameraRef.current.stopRecording();
    }
  }

  async function resolveLocation(capturedPhoto) {
    setLocating(true);

    const exifLat = capturedPhoto?.exif?.GPSLatitude;
    const exifLng = capturedPhoto?.exif?.GPSLongitude;

    if (exifLat && exifLng) {
      setCoords({ latitude: exifLat, longitude: exifLng, source: "photo" });
      setLocating(false);
      return;
    }

    const { status } = await Location.requestForegroundPermissionsAsync();

    if (status !== "granted") {
      setCoords(null);
      setLocating(false);
      return;
    }

    const position = await Location.getCurrentPositionAsync({});
    setCoords({
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      source: "device",
    });
    setLocating(false);
  }

  function retake() {
    setPhoto(null);
    setVideo(null);
    setCoords(null);
  }

  function continueToDetails() {
    const mediaUri = photo?.uri || video?.uri;
    if (!mediaUri) return;

    router.push({
      pathname: "/report-details",
      params: {
        photoUri: photo?.uri || "",
        videoUri: video?.uri || "",
        latitude: coords?.latitude?.toString() ?? "",
        longitude: coords?.longitude?.toString() ?? "",
      },
    });
  }

  const hasCaptured = !!(photo?.uri || video?.uri);

  return (
    <View style={styles.container}>
      {!hasCaptured ? (
        <>
          <CameraView
            ref={cameraRef}
            style={styles.camera}
            facing="back"
            mode={mode}
          />

          {/* Back button — only shown when not actively recording, so a
              mid-recording tap can't accidentally strand the video */}
          {!isRecording && (
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
              <Ionicons name="chevron-back" size={22} color="#F5F2EA" />
            </TouchableOpacity>
          )}

          {/* Photo/Video mode toggle, only visible before capturing */}
          {!isRecording && (
            <View style={styles.modeToggle}>
              <TouchableOpacity
                style={[styles.modeButton, mode === "photo" && styles.modeButtonActive]}
                onPress={() => setMode("photo")}
              >
                <Text style={[styles.modeText, mode === "photo" && styles.modeTextActive]}>Photo</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modeButton, mode === "video" && styles.modeButtonActive]}
                onPress={() => setMode("video")}
              >
                <Text style={[styles.modeText, mode === "video" && styles.modeTextActive]}>Video</Text>
              </TouchableOpacity>
            </View>
          )}

          {isRecording && (
            <View style={styles.recordingBadge}>
              <View style={styles.recordingDot} />
              <Text style={styles.recordingText}>Recording... (max 30s)</Text>
            </View>
          )}

          <TouchableOpacity
            style={[styles.captureButton, mode === "video" && styles.captureButtonVideo]}
            onPress={() => {
              if (mode === "photo") {
                takePicture();
              } else {
                isRecording ? stopVideoRecording() : startVideoRecording();
              }
            }}
          >
            <View
              style={[
                styles.captureButtonInner,
                mode === "video" && styles.captureButtonInnerVideo,
                isRecording && styles.captureButtonInnerRecording,
              ]}
            />
          </TouchableOpacity>
        </>
      ) : (
        <>
          {photo?.uri ? (
            <Image source={{ uri: photo.uri }} style={styles.camera} />
          ) : (
            <Video
              source={{ uri: video.uri }}
              style={styles.camera}
              useNativeControls
              isLooping
              shouldPlay
            />
          )}

          {/* Back button in review state too — retake/continue aren't the
              only ways out; someone may want to abandon the report entirely */}
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={22} color="#F5F2EA" />
          </TouchableOpacity>

          <View style={styles.locationBar}>
            {locating ? (
              <>
                <ActivityIndicator color="#F4A825" size="small" />
                <Text style={styles.locationText}>Detecting location...</Text>
              </>
            ) : coords ? (
              <Text style={styles.locationText}>
                📍 Location {coords.source === "photo" ? "found in photo" : "captured from device"}
              </Text>
            ) : (
              <Text style={styles.locationText}>⚠️ Location unavailable — you can add it manually next</Text>
            )}
          </View>

          <View style={styles.reviewActions}>
            <TouchableOpacity style={styles.retakeButton} onPress={retake}>
              <Text style={styles.retakeButtonText}>Retake</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.continueButton} onPress={continueToDetails}>
              <Text style={styles.continueButtonText}>Continue →</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0B1830" },
  camera: { flex: 1 },
  text: { color: "#F5F2EA", textAlign: "center", margin: 24, fontSize: 15 },
  button: { backgroundColor: "#F4A825", padding: 14, borderRadius: 10, marginHorizontal: 24, alignItems: "center" },
  buttonText: { color: "#0B1830", fontWeight: "700" },
  backButton: {
    position: "absolute",
    top: 50,
    left: 20,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(11,24,48,0.7)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  modeToggle: {
    position: "absolute",
    bottom: 130,
    alignSelf: "center",
    flexDirection: "row",
    backgroundColor: "rgba(11,24,48,0.7)",
    borderRadius: 24,
    padding: 4,
  },
  modeButton: { paddingVertical: 8, paddingHorizontal: 20, borderRadius: 20 },
  modeButtonActive: { backgroundColor: "#F4A825" },
  modeText: { color: "#F5F2EA", fontWeight: "600", fontSize: 13 },
  modeTextActive: { color: "#0B1830" },
  recordingBadge: {
    position: "absolute",
    top: 50,
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(11,24,48,0.85)",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  recordingDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: "#e53935" },
  recordingText: { color: "#F5F2EA", fontSize: 13 },
  captureButton: {
    position: "absolute",
    bottom: 40,
    alignSelf: "center",
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: "rgba(255,255,255,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  captureButtonVideo: { backgroundColor: "rgba(229,57,53,0.3)" },
  captureButtonInner: { width: 60, height: 60, borderRadius: 30, backgroundColor: "#fff" },
  captureButtonInnerVideo: { backgroundColor: "#e53935" },
  captureButtonInnerRecording: { borderRadius: 10 },
  locationBar: {
    position: "absolute",
    top: 50,
    alignSelf: "center",
    backgroundColor: "rgba(11,24,48,0.85)",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  locationText: { color: "#F5F2EA", fontSize: 13 },
  reviewActions: {
    position: "absolute",
    bottom: 40,
    flexDirection: "row",
    width: "100%",
    justifyContent: "center",
    gap: 12,
  },
  retakeButton: { borderWidth: 1, borderColor: "#F5F2EA", paddingVertical: 14, paddingHorizontal: 28, borderRadius: 12 },
  retakeButtonText: { color: "#F5F2EA", fontWeight: "600" },
  continueButton: { backgroundColor: "#F4A825", paddingVertical: 14, paddingHorizontal: 28, borderRadius: 12 },
  continueButtonText: { color: "#0B1830", fontWeight: "700" },
});