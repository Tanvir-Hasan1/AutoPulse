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
import { useAuthStore } from "../../../store/useAuthStore";

export default function TaxToken() {
  const navigation = useNavigation();
  const selectedBikeId = useAuthStore((s) => s.selectedBikeId);
  const token = useAuthStore((s) => s.accessToken);
  const [fileUri, setFileUri] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [fileType, setFileType] = useState(null); // 'image' or 'pdf'
  const [error, setError] = useState(null);

  const handleDownload = async () => {
    if (!fileUri) return;
    const isPdf = fileType === "pdf";
    const filename = `tax_token.${isPdf ? "pdf" : "png"}`;
    const localUri = FileSystem.cacheDirectory + filename;

    setIsLoading(true);
    try {
      if (isPdf) {
        const { uri } = await FileSystem.downloadAsync(fileUri, localUri, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setIsLoading(false);
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(uri);
        } else {
          Alert.alert("Success", `File downloaded to cache: ${uri}`);
        }
      } else {
        const base64Code = fileUri.split("base64,")[1] || fileUri;
        await FileSystem.writeAsStringAsync(localUri, base64Code, {
          encoding: FileSystem.EncodingType.Base64,
        });
        setIsLoading(false);
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(localUri);
        } else {
          Alert.alert("Success", `File saved to cache: ${localUri}`);
        }
      }
    } catch (err) {
      setIsLoading(false);
      console.error("Download error:", err);
      Alert.alert("Error", "Failed to download and share file.");
    }
  };

  useEffect(() => {
    if (fileUri) {
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
  }, [fileUri]);

  const handleTaxTokenPress = async () => {
    setError(null);
    if (!selectedBikeId) {
      Alert.alert("Error", "No bike selected. Please select a bike first.");
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/tax-token/download/${selectedBikeId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        }
      );
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to download tax token");
      }
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("pdf")) {
        const pdfUrl = `${API_BASE_URL}/tax-token/download/${selectedBikeId}`;
        setFileUri(pdfUrl);
        setFileType("pdf");
        setIsLoading(false);
      } else if (contentType && contentType.startsWith("image/")) {
        const blob = await response.blob();
        const reader = new FileReader();
        reader.onloadend = () => {
          setFileUri(reader.result);
          setFileType("image");
          setIsLoading(false);
        };
        reader.readAsDataURL(blob);
      } else {
        throw new Error("Unsupported file type");
      }
    } catch (error) {
      console.error("Tax token download error:", error);
      setError(error.message || "Failed to download tax token");
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (selectedBikeId) {
      handleTaxTokenPress();
    }
  }, [selectedBikeId]);

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
            onPress={handleTaxTokenPress}
          >
            <Text style={styles.retryBtnText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          {/* Tax Token Preview Button (hidden if file already loaded) */}
          {!fileUri && (
            <TouchableOpacity style={styles.openBtn} onPress={handleTaxTokenPress}>
              <Text style={styles.openBtnText}>Show Tax Token</Text>
            </TouchableOpacity>
          )}
          {/* Tax Token File (Image or PDF) */}
          {fileType === "image" && fileUri && (
            <ScrollView
              contentContainerStyle={styles.licenseScrollContainer}
              maximumZoomScale={3}
              minimumZoomScale={1}
              showsVerticalScrollIndicator={false}
              showsHorizontalScrollIndicator={false}
            >
              <Image
                source={{ uri: fileUri }}
                style={styles.licenseImage}
                resizeMode="contain"
              />
            </ScrollView>
          )}
          {fileType === "pdf" && fileUri && (
            <Pdf
              source={{ uri: fileUri, headers: { Authorization: `Bearer ${token}` } }}
              style={styles.pdf}
              trustAllCerts={false}
              onError={(error) => console.log('PDF Render Error:', error)}
            />
          )}
        </>
      )}
      {/* Loading Modal for Tax Token */}
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#4CAF50" />
            <Text style={styles.loadingText}>Loading Tax Token...</Text>
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
