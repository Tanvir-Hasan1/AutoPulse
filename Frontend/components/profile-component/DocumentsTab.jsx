import { Ionicons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Modal,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  Platform
} from "react-native";
import Toast from "react-native-toast-message";
import { WebView } from "react-native-webview";
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import * as IntentLauncher from 'expo-intent-launcher';
import Pdf from 'react-native-pdf';
import { API_BASE_URL } from "../../config";
import { useAuthStore } from "../../store/useAuthStore";
import api from "../../store/api";
import ConfirmDeleteModal from "../common/ConfirmDeleteModal";

const DocumentsTab = ({ documents, styles }) => {
  const userId = useAuthStore((s) => s.userId);
  const selectedBikeId = useAuthStore((s) => s.selectedBikeId);
  const token = useAuthStore((s) => s.accessToken);
  const user = { userId, selectedBikeId };
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

  // Modal State
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState(null);

  const executeDelete = () => {
    setDeleteModalVisible(false);
    if (!documentToDelete) return;

    if (documentToDelete.type === 'license') {
      handleDeleteDocument(documentToDelete.doc);
    } else if (documentToDelete.type === 'registration') {
      handleDeleteRegistration();
    } else if (documentToDelete.type === 'taxToken') {
      handleDeleteTaxToken();
    }
    setDocumentToDelete(null);
  };

  // Fetch license info on mount and after upload/delete
  const fetchLicenseInfo = async () => {
    try {
      setLicenseLoading(true);
      const data = await api.get(`/license/info/${user.userId}`);
      setLicenseLoading(false);
      if (data && data.license && data.license.fileId) {
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
      const data = await api.get(`/registration/info/${user.selectedBikeId}`);
      setRegistrationLoading(false);
      if (data && data.registration && data.registration.fileId) {
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
      const data = await api.get(`/tax-token/info/${user.selectedBikeId}`);
      setTaxTokenLoading(false);
      if (data && data.taxToken && data.taxToken.fileId) {
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
        const token = useAuthStore.getState().accessToken;
        const url = `${API_BASE_URL}/license/download/${user.userId}`;
        const response = await fetch(url, { 
          method: "GET",
          headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) }
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to download license");
        }
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("pdf")) {
          setLicenseImageUri(url);
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
        Toast.show({
          type: "error",
          text1: "Error",
          text2: `Viewing document: ${doc.name}`,
          position: "bottom",
          autoHide: true,
          visibilityTime: 3000,
        });
      }
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: error.message || "Failed to load document.",
        position: "bottom",
        autoHide: true,
        visibilityTime: 3000,
      });
      setIsLoadingLicense(false);
    }
  };

  // Handler to view a tax token document
  const handleViewTaxToken = async () => {
    try {
      setIsLoadingLicense(true);
      const token = useAuthStore.getState().accessToken;
      const url = `${API_BASE_URL}/tax-token/download/${user.selectedBikeId}`;
      const response = await fetch(url, { 
        method: "GET",
        headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) }
      });
      if (!response.ok) {
        throw new Error("Failed to download tax token document");
      }
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("pdf")) {
          setLicenseImageUri(url);
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
      Toast.show({
        type: "error",
        text1: "Error",
        text2: error.message || "Failed to load tax token document.",
        position: "bottom",
        autoHide: true,
        visibilityTime: 3000,
      });
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
      const data = await api.upload(`/license/upload/${user.userId}`, formData);
      setIsLoadingLicense(false);
      Toast.show({
        type: "success",
        text1: "Success",
        text2: data.message || "License uploaded successfully",
        position: "bottom",
        autoHide: true,
        visibilityTime: 2500,
      });
      fetchLicenseInfo(); // Refresh license info after upload
    } catch (error) {
      setIsLoadingLicense(false);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: error.message || "Failed to upload license",
        position: "bottom",
        autoHide: true,
        visibilityTime: 3000,
      });
    }
  };

  // Handler to view a registration document
  const handleViewRegistration = async () => {
    try {
      setIsLoadingLicense(true);
      const token = useAuthStore.getState().accessToken;
      const url = `${API_BASE_URL}/registration/download/${user.selectedBikeId}`;
      const response = await fetch(url, { 
        method: "GET",
        headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) }
      });
      if (!response.ok) {
        throw new Error("Failed to download registration document");
      }
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("pdf")) {
          setLicenseImageUri(url);
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
      Toast.show({
        type: "error",
        text1: "Error",
        text2: error.message || "Failed to load registration document.",
        position: "bottom",
        autoHide: true,
        visibilityTime: 3000,
      });
      setIsLoadingLicense(false);
    }
  };

  // Handler to delete a registration document
  const handleDeleteRegistration = async () => {
    try {
      setIsLoadingLicense(true);
      const data = await api.delete(`/registration/delete/${user.selectedBikeId}`);
      setIsLoadingLicense(false);
      Toast.show({
        type: "success",
        text1: "Success",
        text2: data.message || "Registration deleted successfully",
        position: "bottom",
        autoHide: true,
        visibilityTime: 2500,
      });
      fetchRegistrationInfo(); // Refresh registration info after delete
    } catch (error) {
      setIsLoadingLicense(false);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: error.message || "Failed to delete registration document",
        position: "bottom",
        autoHide: true,
        visibilityTime: 3000,
      });
    }
  };

  // Handler to delete a document
  const handleDeleteDocument = async (doc) => {
    try {
      let url = "";
      if (doc.name === "Driving License") {
        url = `/license/delete/${user.userId}`;
      } else {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: `Delete not implemented for ${doc.name}`,
          position: "bottom",
          autoHide: true,
          visibilityTime: 3000,
        });
        return;
      }
      setIsLoadingLicense(true);
      const data = await api.delete(url);
      setIsLoadingLicense(false);
      Toast.show({
        type: "success",
        text1: "Success",
        text2: data?.message || "Document deleted successfully",
        position: "bottom",
        autoHide: true,
        visibilityTime: 2500,
      });
      fetchLicenseInfo(); // Refresh license info after delete
    } catch (error) {
      setIsLoadingLicense(false);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: error.message || "Failed to delete document",
        position: "bottom",
        autoHide: true,
        visibilityTime: 3000,
      });
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
      const data = await api.upload(`/registration/upload/${user.selectedBikeId}`, formData);
      setIsLoadingLicense(false);
      Toast.show({
        type: "success",
        text1: "Success",
        text2: data.message || "Registration uploaded successfully",
        position: "bottom",
        autoHide: true,
        visibilityTime: 2500,
      });
      fetchRegistrationInfo(); // Refresh registration info after upload
    } catch (error) {
      setIsLoadingLicense(false);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: error.message || "Failed to upload registration document",
        position: "bottom",
        autoHide: true,
        visibilityTime: 3000,
      });
    }
  };

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

      const data = await api.upload(`/tax-token/upload/${user.selectedBikeId}`, formData);
      setIsLoadingLicense(false);

      Toast.show({
        type: "success",
        text1: "Success",
        text2: data.message || "Tax token uploaded successfully",
        position: "bottom",
        autoHide: true,
        visibilityTime: 2500,
      });
      fetchTaxTokenInfo(); // Refresh tax token info after upload
    } catch (error) {
      setIsLoadingLicense(false);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: error.message || "Failed to upload tax token document",
        position: "bottom",
        autoHide: true,
        visibilityTime: 3000,
      });
    }
  };
  // Handler to delete a tax token document
  const handleDeleteTaxToken = async () => {
    try {
      setIsLoadingLicense(true);
      const data = await api.delete(`/tax-token/delete/${user.selectedBikeId}`);
      setIsLoadingLicense(false);
      Toast.show({
        type: "success",
        text1: "Success",
        text2: data.message || "Tax token deleted successfully",
        position: "bottom",
        autoHide: true,
        visibilityTime: 2500,
      });
      fetchTaxTokenInfo(); // Refresh tax token info after delete
    } catch (error) {
      setIsLoadingLicense(false);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: error.message || "Failed to delete tax token document",
        position: "bottom",
        autoHide: true,
        visibilityTime: 3000,
      });
    }
  };

  const closeLicenseOverlay = () => {
    setLicenseOverlayVisible(false);
    setLicenseImageUri(null);
  };

  return (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
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
                  ? () => { setDocumentToDelete({ type: 'license', doc }); setDeleteModalVisible(true); }
                  : isRegistration
                  ? () => { setDocumentToDelete({ type: 'registration' }); setDeleteModalVisible(true); }
                  : isTaxToken
                  ? () => { setDocumentToDelete({ type: 'taxToken' }); setDeleteModalVisible(true); }
                  : undefined
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
              <Pdf
                source={{ uri: licenseImageUri, headers: { Authorization: `Bearer ${token}` } }}
                trustAllCerts={false}
                style={{ flex: 1, width: "100%", height: "100%" }}
                onError={(error) => {
                  console.log('PDF Render Error:', error);
                  Toast.show({ type: "error", text1: "Error", text2: "Failed to render PDF" });
                }}
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

      {/* Delete Confirmation Modal */}
      <ConfirmDeleteModal
        visible={deleteModalVisible}
        onClose={() => {
          setDeleteModalVisible(false);
          setDocumentToDelete(null);
        }}
        onConfirm={executeDelete}
        title="Delete Document"
        message="Are you sure you want to delete this document? This action cannot be undone."
      />
    </ScrollView>
  );
};

export default DocumentsTab;
