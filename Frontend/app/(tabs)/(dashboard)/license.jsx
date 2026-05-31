import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Pdf from 'react-native-pdf';
import { API_BASE_URL } from "../../../config";
import api from "../../../store/api";
import { useAuthStore } from "../../../store/useAuthStore";

export default function License() {
  const userId = useAuthStore((s) => s.userId);
  const [licenseImageUri, setLicenseImageUri] = useState(null);
  const [isLoadingLicense, setIsLoadingLicense] = useState(false);
  const [licenseFileType, setLicenseFileType] = useState(null); // 'image' or 'pdf'

  // Handler to fetch and preview license
  const handleLicensePress = async () => {
    if (!userId) {
      Alert.alert("Error", "User ID not found. Please log in again.");
      return;
    }

    setIsLoadingLicense(true);

    try {
      const token = useAuthStore.getState().accessToken;
      const response = await fetch(
        `${API_BASE_URL}/license/download/${userId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to download license");
      }

      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("pdf")) {
        const pdfUrl = `${API_BASE_URL}/license/download/${userId}`;
        setLicenseImageUri(pdfUrl);
        setLicenseFileType("pdf");
        setIsLoadingLicense(false);
      } else if (contentType && contentType.startsWith("image/")) {
        // Handle image
        const blob = await response.blob();
        const reader = new FileReader();
        reader.onloadend = () => {
          setLicenseImageUri(reader.result);
          setLicenseFileType("image");
          setIsLoadingLicense(false);
        };
        reader.readAsDataURL(blob);
      } else {
        throw new Error("Unsupported file type");
      }
    } catch (error) {
      console.error("License download error:", error);
      Alert.alert("Error", error.message || "Failed to download license");
      setIsLoadingLicense(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* License Preview Button (hidden if license already loaded) */}
      {!licenseImageUri && (
        <TouchableOpacity style={styles.openBtn} onPress={handleLicensePress}>
          <Text style={styles.openBtnText}>Show License</Text>
        </TouchableOpacity>
      )}

      {/* License File (Image or PDF) */}
      {licenseFileType === "image" && licenseImageUri && (
        <ScrollView
          contentContainerStyle={styles.licenseScrollContainer}
          maximumZoomScale={3}
          minimumZoomScale={1}
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
        >
          <Image
            source={{ uri: licenseImageUri }}
            style={styles.licenseImage}
            resizeMode="contain"
          />
        </ScrollView>
      )}
      {licenseFileType === "pdf" && licenseImageUri && (
        <Pdf
          source={{ uri: licenseImageUri, headers: { Authorization: `Bearer ${useAuthStore.getState().accessToken}` } }}
          style={styles.pdf}
          trustAllCerts={false}
          onError={(error) => console.log('PDF Render Error:', error)}
        />
      )}

      {/* Loading Modal for License */}
      {isLoadingLicense && (
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#4CAF50" />
            <Text style={styles.loadingText}>Loading License...</Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center" },
  openBtn: {
    backgroundColor: "#4CAF50",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    elevation: 2,
    marginTop: 32,
  },
  openBtnText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  licenseScrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    minHeight: "100%",
  },
  licenseImage: {
    width: Dimensions.get("window").width * 0.9,
    height: Dimensions.get("window").height * 0.7,
    borderRadius: 8,
  },
  pdf: {
    flex: 1,
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height,
  },
  loadingOverlay: {
    position: "absolute",
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 999,
  },
  loadingContainer: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    flexDirection: "row",
    alignItems: "center",
  },
  loadingText: {
    marginLeft: 16,
    fontSize: 18,
    color: "#333",
  },
});
