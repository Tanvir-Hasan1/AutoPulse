import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  Modal,
  Image,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useUser } from "../../contexts/UserContext";
import { API_BASE_URL } from "../../config";
import { useState, useEffect } from "react";
import { WebView } from "react-native-webview";
import * as DocumentPicker from "expo-document-picker";

const DocumentsTab = ({ documents, styles }) => {
  const { user } = useUser();
  const [licenseOverlayVisible, setLicenseOverlayVisible] = useState(false);
  const [licenseImageUri, setLicenseImageUri] = useState(null);
  const [isLoadingLicense, setIsLoadingLicense] = useState(false);
  const [licenseFileType, setLicenseFileType] = useState(null); // 'image' or 'pdf'
  const [licenseInfo, setLicenseInfo] = useState(null);
  const [licenseLoading, setLicenseLoading] = useState(true);
  const [registrationInfo, setRegistrationInfo] = useState(null);
  const [registrationLoading, setRegistrationLoading] = useState(true);
  const [taxTokenInfo, setTaxTokenInfo] = useState(null);
  const [taxTokenLoading, setTaxTokenLoading] = useState(true);

  // Fetch license info on mount and after upload/delete
  const fetchLicenseInfo = async () => {
    try {
      setLicenseLoading(true);
      const url = `${API_BASE_URL}/license/info/${user.userId}`;
      const response = await fetch(url);
      const data = await response.json();
      setLicenseLoading(false);
      if (response.ok && data.license && data.license.fileId) {
        setLicenseInfo(data.license);
      } else {
        setLicenseInfo(null);
      }
    } catch (error) {
      setLicenseLoading(false);
      setLicenseInfo(null);
    }
  };

  // Fetch registration info on mount and after upload/delete
  const fetchRegistrationInfo = async () => {
    try {
      setRegistrationLoading(true);
      const url = `${API_BASE_URL}/registration/info/${user.selectedBikeId}`;
      const response = await fetch(url);
      const data = await response.json();
      setRegistrationLoading(false);
      if (response.ok && data.registration && data.registration.fileId) {
        setRegistrationInfo(data.registration);
      } else {
        setRegistrationInfo(null);
      }
    } catch (error) {
      setRegistrationLoading(false);
      setRegistrationInfo(null);
    }
  };

  // Fetch tax token info on mount and after upload/delete
  const fetchTaxTokenInfo = async () => {
    try {
      setTaxTokenLoading(true);
      const url = `${API_BASE_URL}/tax-token/info/${user.selectedBikeId}`;
      const response = await fetch(url);
      const data = await response.json();
      setTaxTokenLoading(false);
      if (response.ok && data.taxToken && data.taxToken.fileId) {
        setTaxTokenInfo(data.taxToken);
      } else {
        setTaxTokenInfo(null);
      }
    } catch (error) {
      setTaxTokenLoading(false);
      setTaxTokenInfo(null);
    }
  };

  useEffect(() => {
    fetchLicenseInfo();
    fetchRegistrationInfo();
    fetchTaxTokenInfo();
  }, [user.userId, user.selectedBikeId]);

  // Handler to view a document (license)
  const handleViewDocument = async (doc) => {
    try {
      if (doc.name === "Driving License" && user.selectedBikeId) {
        setIsLoadingLicense(true);
        const url = `${API_BASE_URL}/license/download/${user.userId}`;
        const response = await fetch(url, { method: "GET" });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to download license");
        }
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("pdf")) {
          const googleDocsUrl = `https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(
            url
          )}`;
          setLicenseImageUri(googleDocsUrl);
          setLicenseFileType("pdf");
          setLicenseOverlayVisible(true);
          setIsLoadingLicense(false);
        } else if (contentType && contentType.startsWith("image/")) {
          const blob = await response.blob();
          const reader = new FileReader();
          reader.onloadend = () => {
            setLicenseImageUri(reader.result);
            setLicenseFileType("image");
            setLicenseOverlayVisible(true);
            setIsLoadingLicense(false);
          };
          reader.readAsDataURL(blob);
        } else {
          throw new Error("Unsupported file type");
        }
      } else {
        Alert.alert("View Document", `Viewing document: ${doc.name}`);
      }
    } catch (error) {
      Alert.alert("Error", error.message || "Failed to load document.");
      setIsLoadingLicense(false);
    }
  };

  // Handler to view a tax token document
  const handleViewTaxToken = async () => {
    try {
      setIsLoadingLicense(true);
      const url = `${API_BASE_URL}/tax-token/download/${user.selectedBikeId}`;
      const response = await fetch(url, { method: "GET" });
      if (!response.ok) {
        throw new Error("Failed to download tax token document");
      }
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("pdf")) {
        const googleDocsUrl = `https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(
          url
        )}`;
        setLicenseImageUri(googleDocsUrl);
        setLicenseFileType("pdf");
        setLicenseOverlayVisible(true);
        setIsLoadingLicense(false);
      } else if (contentType && contentType.startsWith("image/")) {
        const blob = await response.blob();
        const reader = new FileReader();
        reader.onloadend = () => {
          setLicenseImageUri(reader.result);
          setLicenseFileType("image");
          setLicenseOverlayVisible(true);
          setIsLoadingLicense(false);
        };
        reader.readAsDataURL(blob);
      } else {
        throw new Error("Unsupported file type");
      }
    } catch (error) {
      Alert.alert(
        "Error",
        error.message || "Failed to load tax token document."
      );
      setIsLoadingLicense(false);
    }
  };

  // Handler to upload a new license document
  const handleUploadLicense = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["application/pdf", "image/*"],
        copyToCacheDirectory: true,
      });
      if (result.canceled || !result.assets || !result.assets[0]) return;
      const file = result.assets[0];
      setIsLoadingLicense(true);
      const formData = new FormData();
      formData.append("license", {
        uri: file.uri,
        name: file.name || "license.pdf",
        type: file.mimeType || "application/pdf",
      });
      const url = `${API_BASE_URL}/license/upload/${user.userId}`;
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "multipart/form-data",
        },
        body: formData,
      });
      const data = await response.json();
      setIsLoadingLicense(false);
      if (!response.ok) {
        throw new Error(data.message || "Failed to upload license");
      }
      Alert.alert("Success", data.message || "License uploaded successfully");
      fetchLicenseInfo(); // Refresh license info after upload
    } catch (error) {
      setIsLoadingLicense(false);
      Alert.alert("Error", error.message || "Failed to upload license");
    }
  };

  // Handler to view a registration document
  const handleViewRegistration = async () => {
    try {
      setIsLoadingLicense(true);
      const url = `${API_BASE_URL}/registration/download/${user.selectedBikeId}`;
      const response = await fetch(url, { method: "GET" });
      if (!response.ok) {
        throw new Error("Failed to download registration document");
      }
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("pdf")) {
        const googleDocsUrl = `https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(
          url
        )}`;
        setLicenseImageUri(googleDocsUrl);
        setLicenseFileType("pdf");
        setLicenseOverlayVisible(true);
        setIsLoadingLicense(false);
      } else if (contentType && contentType.startsWith("image/")) {
        const blob = await response.blob();
        const reader = new FileReader();
        reader.onloadend = () => {
          setLicenseImageUri(reader.result);
          setLicenseFileType("image");
          setLicenseOverlayVisible(true);
          setIsLoadingLicense(false);
        };
        reader.readAsDataURL(blob);
      } else {
        throw new Error("Unsupported file type");
      }
    } catch (error) {
      Alert.alert(
        "Error",
        error.message || "Failed to load registration document."
      );
      setIsLoadingLicense(false);
    }
  };

  // Handler to delete a registration document
  const handleDeleteRegistration = async () => {
    try {
      setIsLoadingLicense(true);
      const url = `${API_BASE_URL}/registration/delete/${user.selectedBikeId}`;
      const response = await fetch(url, { method: "DELETE" });
      const data = await response.json();
      setIsLoadingLicense(false);
      if (!response.ok) {
        throw new Error(
          data.message || "Failed to delete registration document"
        );
      }
      Alert.alert(
        "Success",
        data.message || "Registration deleted successfully"
      );
      fetchRegistrationInfo(); // Refresh registration info after delete
    } catch (error) {
      setIsLoadingLicense(false);
      Alert.alert(
        "Error",
        error.message || "Failed to delete registration document"
      );
    }
  };

  // Handler to delete a document
  const handleDeleteDocument = async (doc) => {
    try {
      let url = "";
      if (doc.name === "Driving License") {
        url = `${API_BASE_URL}/license/delete/${user.userId}`;
      } else {
        Alert.alert("Delete", `Delete not implemented for ${doc.name}`);
        return;
      }
      setIsLoadingLicense(true);
      const response = await fetch(url, { method: "DELETE" });
      const data = await response.json();
      setIsLoadingLicense(false);
      if (!response.ok) {
        throw new Error(data.message || "Failed to delete document");
      }
      Alert.alert("Success", data.message || "Document deleted successfully");
      fetchLicenseInfo(); // Refresh license info after delete
    } catch (error) {
      setIsLoadingLicense(false);
      Alert.alert("Error", error.message || "Failed to delete document");
    }
  };

  // Handler to upload a new registration document
  const handleUploadRegistration = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["application/pdf", "image/*"],
        copyToCacheDirectory: true,
      });
      if (result.canceled || !result.assets || !result.assets[0]) return;
      const file = result.assets[0];
      setIsLoadingLicense(true);
      const formData = new FormData();
      formData.append("registration", {
        uri: file.uri,
        name: file.name || "registration.pdf",
        type: file.mimeType || "application/pdf",
      });
      const url = `${API_BASE_URL}/registration/upload/${user.selectedBikeId}`;
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "multipart/form-data",
        },
        body: formData,
      });
      const data = await response.json();
      setIsLoadingLicense(false);
      if (!response.ok) {
        throw new Error(
          data.message || "Failed to upload registration document"
        );
      }
      Alert.alert(
        "Success",
        data.message || "Registration uploaded successfully"
      );
      fetchRegistrationInfo(); // Refresh registration info after upload
    } catch (error) {
      setIsLoadingLicense(false);
      Alert.alert(
        "Error",
        error.message || "Failed to upload registration document"
      );
    }
  };

  // Add this function to your DocumentsTab component
  // Place it after the handleUploadRegistration function

  // Handler to upload a new tax token document
  const handleUploadTaxToken = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["application/pdf", "image/*"],
        copyToCacheDirectory: true,
      });

      if (result.canceled || !result.assets || !result.assets[0]) return;

      const file = result.assets[0];
      setIsLoadingLicense(true);

      const formData = new FormData();
      formData.append("taxToken", {
        uri: file.uri,
        name: file.name || "tax-token.pdf",
        type: file.mimeType || "application/pdf",
      });

      const url = `${API_BASE_URL}/tax-token/upload/${user.selectedBikeId}`;
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "multipart/form-data",
        },
        body: formData,
      });

      const data = await response.json();
      setIsLoadingLicense(false);

      if (!response.ok) {
        throw new Error(data.message || "Failed to upload tax token document");
      }

      Alert.alert("Success", data.message || "Tax token uploaded successfully");
      fetchTaxTokenInfo(); // Refresh tax token info after upload
    } catch (error) {
      setIsLoadingLicense(false);
      Alert.alert(
        "Error",
        error.message || "Failed to upload tax token document"
      );
    }
  };
  // Handler to delete a tax token document
  const handleDeleteTaxToken = async () => {
    try {
      setIsLoadingLicense(true);
      const url = `${API_BASE_URL}/tax-token/delete/${user.selectedBikeId}`;
      const response = await fetch(url, { method: "DELETE" });
      const data = await response.json();
      setIsLoadingLicense(false);
      if (!response.ok) {
        throw new Error(data.message || "Failed to delete tax token document");
      }
      Alert.alert("Success", data.message || "Tax token deleted successfully");
      fetchTaxTokenInfo(); // Refresh tax token info after delete
    } catch (error) {
      setIsLoadingLicense(false);
      Alert.alert(
        "Error",
        error.message || "Failed to delete tax token document"
      );
    }
  };

  const closeLicenseOverlay = () => {
    setLicenseOverlayVisible(false);
    setLicenseImageUri(null);
  };

  return (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Vehicle Documents</Text>
        <Text style={styles.sectionDescription}>
          Upload and manage your bike registration, license, and tax documents
        </Text>
      </View>
      {documents.map((doc) => {
        const isLicense = doc.name === "Driving License";
        const isRegistration = doc.name === "Registration Certificate (RC)";
        const isTaxToken = doc.name === "Tax Token";
        const isUploaded = isLicense
          ? !!licenseInfo
          : isRegistration
          ? !!registrationInfo
          : isTaxToken
          ? !!taxTokenInfo
          : doc.isUploaded;
        const disableActions = isLicense
          ? !licenseInfo
          : isRegistration
          ? !registrationInfo
          : isTaxToken
          ? !taxTokenInfo
          : !doc.isUploaded;
        return (
          <View key={doc.id} style={styles.documentCard}>
            <View style={styles.documentHeader}>
              <View style={styles.documentInfo}>
                <View
                  style={[styles.documentIcon, { backgroundColor: doc.iconBg }]}
                >
                  <Ionicons
                    name={doc.iconName}
                    size={20}
                    color={doc.iconColor}
                  />
                </View>
                <View style={styles.documentDetails}>
                  <Text style={styles.documentName}>{doc.name}</Text>
                  <Text style={styles.documentDescription}>
                    {doc.description}
                  </Text>
                </View>
              </View>
              <View
                style={[
                  styles.uploadStatus,
                  isUploaded ? styles.uploadedStatus : styles.notUploadedStatus,
                ]}
              >
                <Text
                  style={[
                    styles.uploadStatusText,
                    isUploaded ? styles.uploadedText : styles.notUploadedText,
                  ]}
                >
                  {isUploaded ? "Uploaded" : "Not Uploaded"}
                </Text>
              </View>
            </View>
            <View style={styles.documentActions}>
              <TouchableOpacity
                style={[
                  styles.documentButton,
                  disableActions && styles.disabledButton,
                ]}
                disabled={disableActions}
                onPress={
                  disableActions
                    ? undefined
                    : isLicense
                    ? () => handleViewDocument(doc)
                    : isRegistration
                    ? () => handleViewRegistration()
                    : isTaxToken
                    ? () => handleViewTaxToken()
                    : () => handleViewDocument(doc)
                }
              >
                <Text
                  style={[
                    styles.documentButtonText,
                    disableActions && styles.disabledText,
                  ]}
                >
                  View Document
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.documentButton, { width: "100%" }]}
                onPress={
                  isLicense
                    ? () => handleUploadLicense()
                    : isRegistration
                    ? () => handleUploadRegistration()
                    : isTaxToken
                    ? () => handleUploadTaxToken()
                    : undefined
                }
              >
                <Text style={styles.documentButtonText}>
                  {isUploaded ? "Upload New" : "Upload Document"}
                </Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              style={[
                styles.documentButton,
                { width: "100%", borderColor: "#EF4444", marginTop: 8 },
                disableActions && styles.disabledButton,
              ]}
              disabled={disableActions}
              onPress={
                disableActions
                  ? undefined
                  : isLicense
                  ? () => handleDeleteDocument(doc)
                  : isRegistration
                  ? () => handleDeleteRegistration()
                  : isTaxToken
                  ? () => handleDeleteTaxToken()
                  : () => handleDeleteDocument(doc)
              }
            >
              <Text
                style={[
                  styles.documentButtonText,
                  { color: "#EF4444" },
                  disableActions && styles.disabledText,
                ]}
              >
                Delete
              </Text>
            </TouchableOpacity>
          </View>
        );
      })}
      {/* License Overlay Modal */}
      <Modal
        visible={licenseOverlayVisible}
        transparent
        animationType="fade"
        onRequestClose={closeLicenseOverlay}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.9)",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <View
            style={{
              width: "95%",
              height: "90%",
              backgroundColor: "#000",
              borderRadius: 12,
              overflow: "hidden",
              position: "relative",
            }}
          >
            <TouchableOpacity
              style={{
                position: "absolute",
                top: 16,
                left: 16,
                zIndex: 10,
                backgroundColor: "rgba(0,0,0,0.6)",
                borderRadius: 20,
                padding: 8,
              }}
              onPress={closeLicenseOverlay}
            >
              <Ionicons name="close" size={24} color="#fff" />
            </TouchableOpacity>
            {licenseFileType === "image" && licenseImageUri && (
              <ScrollView
                contentContainerStyle={{
                  flex: 1,
                  justifyContent: "center",
                  alignItems: "center",
                }}
                maximumZoomScale={3}
                minimumZoomScale={1}
                showsVerticalScrollIndicator={false}
                showsHorizontalScrollIndicator={false}
              >
                <Image
                  source={{ uri: licenseImageUri }}
                  style={{
                    width: "90%",
                    height: "100%",
                    maxHeight: 600,
                  }}
                  resizeMode="contain"
                />
              </ScrollView>
            )}
            {licenseFileType === "pdf" && licenseImageUri && (
              <WebView
                source={{ uri: licenseImageUri }}
                style={{ flex: 1, width: "100%", height: "100%" }}
                originWhitelist={["*"]}
                useWebKit
                javaScriptEnabled
                domStorageEnabled
                startInLoadingState
                scalesPageToFit
              />
            )}
          </View>
        </View>
      </Modal>
      {/* Loading Modal for License */}
      <Modal visible={isLoadingLicense} transparent animationType="fade">
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.5)",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <View
            style={{
              backgroundColor: "white",
              padding: 24,
              borderRadius: 12,
              alignItems: "center",
              minWidth: 150,
            }}
          >
            <ActivityIndicator size="large" color="#4CAF50" />
            <Text
              style={{
                marginTop: 12,
                fontSize: 16,
                color: "#333",
                fontWeight: "500",
              }}
            >
              Loading Document...
            </Text>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

export default DocumentsTab;
