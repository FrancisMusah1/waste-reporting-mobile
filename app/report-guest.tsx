import { CameraView, useCameraPermissions } from "expo-camera";
import * as Location from "expo-location";
import { useRouter } from "expo-router";
import { useRef, useState } from "react";
import { ActivityIndicator, Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function ReportGuest() {
  const router = useRouter();
  const cameraRef = useRef(null);

  const [permission, requestPermission] = useCameraPermissions();
  const [photo, setPhoto] = useState(null);
  const [locating, setLocating] = useState(false);
  const [coords, setCoords] = useState(null);

  if (!permission) {
    return <View style={styles.container}><Text style={styles.text}>Loading camera...</Text></View>;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>We need camera access to let you report issues with a photo.</Text>
        <TouchableOpacity style={styles.button} onPress={requestPermission}>
          <Text style={styles.buttonText}>Grant Camera Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  async function takePicture() {
    if (!cameraRef.current) return;

    try {
      const result = await cameraRef.current.takePictureAsync({ exif: true });

      if (!result || !result.uri) {
        console.log("Capture failed: no photo URI returned");
        return;
      }

      setPhoto(result);
      resolveLocation(result);
    } catch (err) {
      console.log("Capture error:", err);
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
    setCoords(null);
  }

  function continueToDetails() {
    // Guard: this button should be unreachable without a photo, but
    // check explicitly rather than assume, to avoid a crash either way
    if (!photo?.uri) return;

    router.push({
      pathname: "/report-details",
      params: {
        photoUri: photo.uri,
        latitude: coords?.latitude?.toString() ?? "",
        longitude: coords?.longitude?.toString() ?? "",
      },
    });
  }

  return (
    <View style={styles.container}>
      {!photo?.uri ? (
        <>
          <CameraView ref={cameraRef} style={styles.camera} facing="back" />
          <TouchableOpacity style={styles.captureButton} onPress={takePicture}>
            <View style={styles.captureButtonInner} />
          </TouchableOpacity>
        </>
      ) : (
        <>
          <Image source={{ uri: photo.uri }} style={styles.camera} />

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
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#fff",
  },
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
  locationText: {
    color: "#F5F2EA",
    fontSize: 13,
  },
  reviewActions: {
    position: "absolute",
    bottom: 40,
    flexDirection: "row",
    width: "100%",
    justifyContent: "center",
    gap: 12,
  },
  retakeButton: {
    borderWidth: 1,
    borderColor: "#F5F2EA",
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 12,
  },
  retakeButtonText: { color: "#F5F2EA", fontWeight: "600" },
  continueButton: {
    backgroundColor: "#F4A825",
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 12,
  },
  continueButtonText: { color: "#0B1830", fontWeight: "700" },
});