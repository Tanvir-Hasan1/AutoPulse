import { useState, useEffect } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "expo-router";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
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
  const navigation = useNavigation();
  const userId = useAuthStore((s) => s.userId);
  const [licenseImageUri, setLicenseImageUri] = useState(null);
  const [isLoadingLicense, setIsLoadingLicense] = useState(false);
  const [licenseFileType, setLicenseFileType] = useState(null); // 'image' or 'pdf'
  const [error, setError] = useState(null);

  const handleDownload = async () => {
    if (!licenseImageUri) return;
    const isPdf = licenseFileType === "pdf";
    const filename = `driving_license.${isPdf ? "pdf" : "png"}`;
    const localUri = FileSystem.cacheDirectory + filename;

    setIsLoadingLicense(true);
    try {
      if (isPdf) {
        const token = useAuthStore.getState().accessToken;
        const { uri } = await FileSystem.downloadAsync(licenseImageUri, localUri, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setIsLoadingLicense(false);
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(uri);
        } else {
          Alert.alert("Success", `File downloaded to cache: ${uri}`);
        }
      } else {
        const base64Code = licenseImageUri.split("base64,")[1] || licenseImageUri;
        await FileSystem.writeAsStringAsync(localUri, base64Code, {
          encoding: FileSystem.EncodingType.Base64,
        });
        setIsLoadingLicense(false);
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(localUri);
        } else {
          Alert.alert("Success", `File saved to cache: ${localUri}`);
        }
      }
    } catch (err) {
      setIsLoadingLicense(false);
      console.error("Download error:", err);
      Alert.alert("Error", "Failed to download and share file.");
    }
  };

  useEffect(() => {
    if (licenseImageUri) {
      navigation.setOptions({
        headerRight: () => (
          <TouchableOpacity onPress={handleDownload} style={{ marginRight: 16 }}>
            <Ionicons name="download-outline" size={24} color="#4F46E5" />
          </TouchableOpacity>
        ),
      });
    } else {
      navigation.setOptions({
        headerRight: () => null,
      });
    }
  }, [licenseImageUri]);

  // Handler to fetch and preview license
  const handleLicensePress = async () => {
    setError(null);
    if (!userId) {
      Alert.alert("Error", "User ID not found. Please log in again.");
      return;
    }

    setIsLoadingLicense(true);

    try {
      // Fetch metadata first (handles token refresh automatically)
      const data = await api.get(`/license/info/${userId}`);
      if (!data || !data.license) {
        throw new Error("No driving license found for this user");
      }

      const contentType = data.license.contentType;
      if (contentType && contentType.includes("pdf")) {
        const pdfUrl = `${API_BASE_URL}/license/download/${userId}`;
        setLicenseImageUri(pdfUrl);
        setLicenseFileType("pdf");
        setIsLoadingLicense(false);
      } else if (contentType && contentType.startsWith("image/")) {
        // Fetch image as blob
        const blob = await api.get(`/license/download/${userId}`, {
          responseType: "blob",
        });
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
      setError(error.message || "Failed to download license");
      setIsLoadingLicense(false);
    }
  };

  useEffect(() => {
    if (userId) {
      handleLicensePress();
    }
  }, [userId]);

  return (
    <View style={styles.container}>
      {error ? (
        <View style={styles.errorContainer}>
          <Ionicons
            name="document-text-outline"
            size={64}
            color="#9CA3AF"
            style={{ marginBottom: 16 }}
          />
          <Text style={styles.errorTitle}>No Document Found</Text>
          <Text style={styles.errorSubtitle}>{error}</Text>
          <TouchableOpacity
            style={styles.retryBtn}
            onPress={handleLicensePress}
          >
            <Text style={styles.retryBtnText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
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
        </>
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
  errorContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#374151",
    marginBottom: 8,
  },
  errorSubtitle: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 24,
  },
  retryBtn: {
    backgroundColor: "#4F46E5",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  retryBtnText: {
    color: "#fff",
    fontWeight: "600",
  },
});
