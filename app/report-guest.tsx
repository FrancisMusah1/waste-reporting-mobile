import { CameraView, useCameraPermissions } from "expo-camera";
import { useRouter } from "expo-router";
import { useRef, useState } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function ReportGuest() {
  const router = useRouter();
  const cameraRef = useRef(null);

  // Expo's permission hook: gives us the current permission status,
  // and a function to request it if not already granted
  const [permission, requestPermission] = useCameraPermissions();

  // Holds the captured photo's local file info once taken
  const [photo, setPhoto] = useState(null);

  // Still waiting to hear back about permission status
  if (!permission) {
    return <View style={styles.container}><Text style={styles.text}>Loading camera...</Text></View>;
  }

  // Permission not yet granted — show a friendly prompt instead of a blank camera
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
    const result = await cameraRef.current.takePictureAsync({ exif: true });
    setPhoto(result);
  }

  return (
    <View style={styles.container}>
      {!photo ? (
        <>
          <CameraView ref={cameraRef} style={styles.camera} facing="back" />
          <TouchableOpacity style={styles.captureButton} onPress={takePicture}>
            <View style={styles.captureButtonInner} />
          </TouchableOpacity>
        </>
      ) : (
        <Image source={{ uri: photo.uri }} style={styles.camera} />
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
});