import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Image,
  ActivityIndicator,
  Alert,
  Dimensions,
} from 'react-native';
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeIn, FadeOut, SlideInDown, SlideOutDown } from "react-native-reanimated";
import { ScaledSheet, moderateScale } from "react-native-size-matters";
import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system/legacy";
import Pdf from 'react-native-pdf';


const UploadOptionModal = ({ visible, onClose, onSelect, title }) => {
  const [cameraStep, setCameraStep] = useState(null); // null, 'front', 'front_preview', 'back', 'back_preview', 'processing', 'pdf_preview'
  const [frontUri, setFrontUri] = useState(null);
  const [backUri, setBackUri] = useState(null);
  const [compiledPdfUri, setCompiledPdfUri] = useState(null);

  if (!visible) return null;

  const handleClose = () => {
    // Reset state and close
    setCameraStep(null);
    setFrontUri(null);
    setBackUri(null);
    setCompiledPdfUri(null);
    onClose();
  };

  const handleUpload = () => {
    if (!compiledPdfUri) return;
    onSelect({
      uri: compiledPdfUri,
      name: `${title?.replace(/\s+/g, '_') || 'document'}_compiled.pdf`,
      type: "application/pdf",
    });
    handleClose();
  };

  const handlePickFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["application/pdf", "image/*"],
        copyToCacheDirectory: true,
      });

      if (result.canceled || !result.assets || !result.assets[0]) return;

      const file = result.assets[0];
      onSelect({
        uri: file.uri,
        name: file.name || "document.pdf",
        type: file.mimeType || (file.name?.endsWith(".pdf") ? "application/pdf" : "image/jpeg"),
      });
      handleClose();
    } catch (error) {
      console.error("Error picking document:", error);
      Alert.alert("Error", "Failed to select document.");
    }
  };

  const requestCameraPermission = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        "Camera Permission",
        "We need camera access to capture your documents. Please enable it in settings.",
        [{ text: "OK" }]
      );
      return false;
    }
    return true;
  };

  const launchCamera = async (isFrontStep) => {
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        quality: 0.8,
        allowsEditing: false,
      });

      if (result.canceled || !result.assets || !result.assets[0]) return;

      const uri = result.assets[0].uri;
      if (isFrontStep) {
        setFrontUri(uri);
        setCameraStep('front_preview');
      } else {
        setBackUri(uri);
        setCameraStep('back_preview');
      }
    } catch (error) {
      console.error("Error launching camera:", error);
      Alert.alert("Error", "Failed to open camera.");
    }
  };

  const compilePdfAndUpload = async () => {
    setCameraStep('processing');
    try {
      const Print = require("expo-print");
      // Read image files as base64 to embed in HTML
      const frontBase64 = await FileSystem.readAsStringAsync(frontUri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      const backBase64 = await FileSystem.readAsStringAsync(backUri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // Construct a single page HTML layout containing both images
      const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8" />
            <title>Compiled Document</title>
            <style>
              body {
                margin: 0;
                padding: 30px;
                font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
                background-color: #ffffff;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                height: 100vh;
                box-sizing: border-box;
              }
              .container {
                width: 100%;
                height: 100%;
                display: flex;
                flex-direction: column;
                justify-content: space-evenly;
                align-items: center;
              }
              .header {
                font-size: 20px;
                font-weight: bold;
                color: #1e1e2d;
                text-align: center;
                margin-bottom: 10px;
              }
              .divider {
                width: 100%;
                height: 1px;
                background-color: #e5e7eb;
                margin: 15px 0;
              }
              .card {
                width: 90%;
                height: 40%;
                border: 1px solid #d1d5db;
                border-radius: 12px;
                overflow: hidden;
                display: flex;
                align-items: center;
                justify-content: center;
                background-color: #f9fafb;
                box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
              }
              img {
                max-width: 100%;
                max-height: 100%;
                object-fit: contain;
              }
              .label {
                font-size: 13px;
                color: #4f46e5;
                margin-top: 8px;
                text-transform: uppercase;
                font-weight: 700;
                letter-spacing: 1.5px;
                text-align: center;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">AutoPulse - Uploaded Document</div>
              <div class="card">
                <img src="data:image/jpeg;base64,${frontBase64}" />
              </div>
              <div class="label">Front Side</div>
              <div class="divider"></div>
              <div class="card">
                <img src="data:image/jpeg;base64,${backBase64}" />
              </div>
              <div class="label">Back Side</div>
            </div>
          </body>
        </html>
      `;

      // Compile HTML into a PDF file
      const { uri } = await Print.printToFileAsync({ html });
      setCompiledPdfUri(uri);
      setCameraStep('pdf_preview');
    } catch (error) {
      console.error("Error compiling PDF:", error);
      if (error.message && (error.message.includes("native module") || error.message.includes("ExpoPrint"))) {
        Alert.alert(
          "Scanner Module Missing",
          "The guided camera scanner requires a native application rebuild. Please run 'npx expo run:android' in your terminal, or use the 'Choose from File' option instead.",
          [{ text: "OK" }]
        );
      } else {
        Alert.alert("Error", "Failed to compile document photos into PDF.");
      }
      setCameraStep('back_preview');
    }
  };

  const renderContent = () => {
    // 1. Initial State (Choose Camera or File)
    if (cameraStep === null) {
      return (
        <Animated.View 
          style={styles.modalContent} 
          entering={SlideInDown.duration(250)}
          exiting={SlideOutDown.duration(250)}
        >
          <View style={styles.header}>
            <Text style={styles.title}>{title || "Upload Document"}</Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeBtn}>
              <Ionicons name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <View style={styles.optionsContainer}>
            <TouchableOpacity style={styles.optionCard} onPress={() => setCameraStep('front')}>
              <View style={[styles.iconContainer, { backgroundColor: 'rgba(79, 70, 229, 0.1)' }]}>
                <Ionicons name="camera-outline" size={moderateScale(32)} color="#4F46E5" />
              </View>
              <View style={styles.optionInfo}>
                <Text style={styles.optionTitle}>Take Photos (Front & Back)</Text>
                <Text style={styles.optionDescription}>Sequential photo capture compiled into a single PDF</Text>
              </View>
              <Ionicons name="chevron-forward-outline" size={20} color="#9CA3AF" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.optionCard} onPress={handlePickFile}>
              <View style={[styles.iconContainer, { backgroundColor: 'rgba(16, 185, 129, 0.1)' }]}>
                <Ionicons name="document-text-outline" size={moderateScale(32)} color="#10B981" />
              </View>
              <View style={styles.optionInfo}>
                <Text style={styles.optionTitle}>Choose from File</Text>
                <Text style={styles.optionDescription}>Select a PDF or image file from your device</Text>
              </View>
              <Ionicons name="chevron-forward-outline" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          </View>
        </Animated.View>
      );
    }

    // 2. Camera Guided Step (Front Capture)
    if (cameraStep === 'front') {
      return (
        <Animated.View style={styles.modalContent} entering={FadeIn}>
          <View style={styles.header}>
            <Text style={styles.title}>Step 1: Front Side</Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeBtn}>
              <Ionicons name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <View style={styles.guidedContainer}>
            <View style={styles.scannerOutline}>
              <Ionicons name="camera" size={moderateScale(48)} color="#9CA3AF" />
              <Text style={styles.guidedInstruction}>Position the FRONT side of your document in the frame</Text>
            </View>

            <TouchableOpacity style={styles.primaryBtn} onPress={() => launchCamera(true)}>
              <Ionicons name="camera-outline" size={20} color="#fff" style={{ marginRight: 8 }} />
              <Text style={styles.primaryBtnText}>Launch Camera</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.backBtn} onPress={() => setCameraStep(null)}>
              <Text style={styles.backBtnText}>Back to options</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      );
    }

    // 3. Front Preview & Confirmation
    if (cameraStep === 'front_preview') {
      return (
        <Animated.View style={styles.modalContent} entering={FadeIn}>
          <View style={styles.header}>
            <Text style={styles.title}>Confirm Front Side</Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeBtn}>
              <Ionicons name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <View style={styles.guidedContainer}>
            <View style={styles.imagePreviewContainer}>
              <Image source={{ uri: frontUri }} style={styles.imagePreview} resizeMode="contain" />
            </View>

            <View style={styles.actionRow}>
              <TouchableOpacity style={styles.secondaryBtn} onPress={() => launchCamera(true)}>
                <Ionicons name="reload-outline" size={18} color="#4F46E5" style={{ marginRight: 6 }} />
                <Text style={styles.secondaryBtnText}>Retake</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.primaryBtn, { flex: 1, marginLeft: 12 }]} onPress={() => setCameraStep('back')}>
                <Text style={styles.primaryBtnText}>Continue</Text>
                <Ionicons name="arrow-forward-outline" size={18} color="#fff" style={{ marginLeft: 6 }} />
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
      );
    }

    // 4. Camera Guided Step (Back Capture)
    if (cameraStep === 'back') {
      return (
        <Animated.View style={styles.modalContent} entering={FadeIn}>
          <View style={styles.header}>
            <Text style={styles.title}>Step 2: Back Side</Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeBtn}>
              <Ionicons name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <View style={styles.guidedContainer}>
            <View style={[styles.scannerOutline, { borderColor: '#10B981' }]}>
              <Ionicons name="camera" size={moderateScale(48)} color="#10B981" />
              <Text style={styles.guidedInstruction}>Position the BACK side of your document in the frame</Text>
            </View>

            <TouchableOpacity style={[styles.primaryBtn, { backgroundColor: '#10B981' }]} onPress={() => launchCamera(false)}>
              <Ionicons name="camera-outline" size={20} color="#fff" style={{ marginRight: 8 }} />
              <Text style={styles.primaryBtnText}>Launch Camera</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.backBtn} onPress={() => setCameraStep('front_preview')}>
              <Text style={styles.backBtnText}>Back to Front Preview</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      );
    }

    // 5. Back Preview & Confirmation
    if (cameraStep === 'back_preview') {
      return (
        <Animated.View style={styles.modalContent} entering={FadeIn}>
          <View style={styles.header}>
            <Text style={styles.title}>Confirm Back Side</Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeBtn}>
              <Ionicons name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <View style={styles.guidedContainer}>
            <View style={styles.imagePreviewContainer}>
              <Image source={{ uri: backUri }} style={styles.imagePreview} resizeMode="contain" />
            </View>

            <View style={styles.actionRow}>
              <TouchableOpacity style={styles.secondaryBtn} onPress={() => launchCamera(false)}>
                <Ionicons name="reload-outline" size={18} color="#4F46E5" style={{ marginRight: 6 }} />
                <Text style={styles.secondaryBtnText}>Retake</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.primaryBtn, { flex: 1, marginLeft: 12 }]} onPress={compilePdfAndUpload}>
                <Ionicons name="document-text-outline" size={18} color="#fff" style={{ marginRight: 6 }} />
                <Text style={styles.primaryBtnText}>Preview PDF</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
      );
    }

    // 6. Processing Loader
    if (cameraStep === 'processing') {
      return (
        <Animated.View style={styles.modalContent} entering={FadeIn} exiting={FadeOut}>
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color="#4F46E5" />
            <Text style={styles.loaderText}>Processing document photos...</Text>
            <Text style={styles.loaderSubtext}>Compiling Front & Back side into a single PDF document</Text>
          </View>
        </Animated.View>
      );
    }

    // 7. PDF Preview Screen
    if (cameraStep === 'pdf_preview') {
      return (
        <Animated.View style={styles.modalContent} entering={FadeIn}>
          <View style={styles.header}>
            <Text style={styles.title}>Preview PDF Document</Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeBtn}>
              <Ionicons name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <View style={styles.guidedContainer}>
            <View style={styles.pdfPreviewContainer}>
              {compiledPdfUri && (
                <Pdf
                  source={{ uri: compiledPdfUri }}
                  trustAllCerts={false}
                  style={styles.pdfPreview}
                  onError={(error) => {
                    console.log('PDF Preview Error:', error);
                  }}
                />
              )}
            </View>

            <View style={styles.actionRow}>
              <TouchableOpacity style={styles.secondaryBtn} onPress={() => setCameraStep('back_preview')}>
                <Ionicons name="arrow-back-outline" size={18} color="#4F46E5" style={{ marginRight: 6 }} />
                <Text style={styles.secondaryBtnText}>Back</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.primaryBtn, { flex: 1, marginLeft: 12 }]} onPress={handleUpload}>
                <Ionicons name="cloud-upload-outline" size={18} color="#fff" style={{ marginRight: 6 }} />
                <Text style={styles.primaryBtnText}>Upload PDF</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
      );
    }
  };

  return (
    <Modal 
      visible={visible} 
      transparent 
      animationType="fade" 
      onRequestClose={handleClose}
      statusBarTranslucent={true}
    >
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.dismissBackdrop} activeOpacity={1} onPress={cameraStep === 'processing' ? undefined : handleClose} />
        {renderContent()}
      </View>
    </Modal>
  );
};

const styles = ScaledSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "flex-end",
  },
  dismissBackdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modalContent: {
    backgroundColor: "white",
    borderTopLeftRadius: '28@s',
    borderTopRightRadius: '28@s',
    paddingHorizontal: '24@s',
    paddingTop: '24@vs',
    paddingBottom: '36@vs',
    minHeight: Dimensions.get('window').height * 0.45,
    maxHeight: Dimensions.get('window').height * 0.85,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: '20@vs',
    paddingBottom: '12@vs',
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  title: {
    fontSize: '18@ms0.5',
    fontWeight: "800",
    color: "#1E1E2D",
    letterSpacing: -0.5,
  },
  closeBtn: {
    padding: '4@ms',
  },
  optionsContainer: {
    marginTop: '8@vs',
  },
  optionCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#F3F4F6",
    borderRadius: '16@s',
    padding: '16@ms',
    marginBottom: '16@vs',
  },
  iconContainer: {
    width: '56@s',
    height: '56@s',
    borderRadius: '16@s',
    justifyContent: "center",
    alignItems: "center",
    marginRight: '16@s',
  },
  optionInfo: {
    flex: 1,
    marginRight: '8@s',
  },
  optionTitle: {
    fontSize: '15@ms0.5',
    fontWeight: "700",
    color: "#1E1E2D",
    marginBottom: '4@vs',
  },
  optionDescription: {
    fontSize: '12@ms0.5',
    color: "#6B7280",
    lineHeight: '16@ms',
  },
  guidedContainer: {
    alignItems: "center",
    paddingTop: '8@vs',
  },
  scannerOutline: {
    width: "100%",
    height: '180@vs',
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: "#4F46E5",
    borderRadius: '16@s',
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    paddingHorizontal: '24@s',
    marginBottom: '24@vs',
  },
  guidedInstruction: {
    fontSize: '13@ms0.5',
    color: "#6B7280",
    fontWeight: "600",
    textAlign: "center",
    marginTop: '16@vs',
    lineHeight: '18@ms',
  },
  imagePreviewContainer: {
    width: "100%",
    height: '240@vs',
    borderRadius: '16@s',
    overflow: "hidden",
    backgroundColor: "#F3F4F6",
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: '24@vs',
    justifyContent: "center",
    alignItems: "center",
  },
  imagePreview: {
    width: "100%",
    height: "100%",
  },
  pdfPreviewContainer: {
    width: "100%",
    height: '260@vs',
    borderRadius: '16@s',
    overflow: "hidden",
    backgroundColor: "#F3F4F6",
    marginBottom: '24@vs',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  pdfPreview: {
    flex: 1,
    width: "100%",
    height: "100%",
    backgroundColor: "#F3F4F6",
  },
  primaryBtn: {
    flexDirection: "row",
    backgroundColor: "#4F46E5",
    paddingVertical: '14@vs',
    borderRadius: '14@s',
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    shadowColor: "#4F46E5",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryBtnText: {
    color: "white",
    fontSize: '15@ms0.5',
    fontWeight: "700",
  },
  secondaryBtn: {
    flexDirection: "row",
    backgroundColor: "#EEF2F6",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    paddingVertical: '14@vs',
    borderRadius: '14@s',
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: '16@s',
  },
  secondaryBtnText: {
    color: "#4F46E5",
    fontSize: '15@ms0.5',
    fontWeight: "700",
  },
  actionRow: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "space-between",
  },
  backBtn: {
    marginTop: '16@vs',
    paddingVertical: '8@vs',
  },
  backBtnText: {
    color: "#6B7280",
    fontSize: '14@ms0.5',
    fontWeight: "600",
  },
  loaderContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: '48@vs',
  },
  loaderText: {
    fontSize: '16@ms0.5',
    fontWeight: "700",
    color: "#1E1E2D",
    marginTop: '16@vs',
    marginBottom: '8@vs',
  },
  loaderSubtext: {
    fontSize: '13@ms0.5',
    color: "#6B7280",
    textAlign: "center",
  },
});

export default UploadOptionModal;
