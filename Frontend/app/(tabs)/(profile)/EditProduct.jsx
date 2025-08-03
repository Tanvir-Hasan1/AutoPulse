import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Platform,
  Image,
  KeyboardAvoidingView,
  ScrollView,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { useRoute, useNavigation } from "@react-navigation/native";
import { API_BASE_URL } from '../../../config';
import { useUser } from "../../contexts/UserContext";
import * as ImagePicker from "expo-image-picker";

const categories = [
  { label: "Accessories", value: "accessories" },
  { label: "Bike", value: "bike" },
  { label: "Tires", value: "tires" },
  { label: "Chains", value: "chains" },
  { label: "Sprockets", value: "sprockets" },
  { label: "Brake Pads", value: "brake_pads" },
  { label: "Pedals", value: "pedals" },
  { label: "Handlebars", value: "handlebars" },
  { label: "Seats", value: "seats" },
  { label: "Inner Tubes", value: "inner_tubes" },
  { label: "Cranksets", value: "cranksets" },
  { label: "Derailleurs", value: "derailleurs" },
  { label: "Other", value: "other" },
];

const conditionOptions = [
  { label: "Any Condition", value: "all" },
  { label: "Brand New", value: "new" },
  { label: "Like New", value: "like_new" },
  { label: "Good", value: "good" },
  { label: "Fair", value: "fair" },
  { label: "Poor", value: "poor" },
];

const countryCodes = [
  { label: "+880", value: "+880", country: "Bangladesh" },
  { label: "+1", value: "+1", country: "USA" },
  { label: "+44", value: "+44", country: "UK" },
  { label: "+91", value: "+91", country: "India" },
  { label: "+92", value: "+92", country: "Pakistan" },
  { label: "+971", value: "+971", country: "UAE" },
  { label: "+966", value: "+966", country: "Saudi Arabia" },
  { label: "+974", value: "+974", country: "Qatar" },
  { label: "+965", value: "+965", country: "Kuwait" },
  { label: "+968", value: "+968", country: "Oman" },
];

const EditProduct = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { user } = useUser();

  // Get product data from route params
  let product = route.params?.product;
  if (!product && route.params?.productData) {
    try {
      product = JSON.parse(route.params.productData);
    } catch (e) {
      console.log("Error parsing product data:", e);
      product = null;
    }
  }

  // Form state
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [imageUri, setImageUri] = useState(null);
  const [imageVersion, setImageVersion] = useState(Date.now());
  const [category, setCategory] = useState(categories[0].value);
  const [condition, setCondition] = useState("all");
  const [address, setAddress] = useState("");
  const [details, setDetails] = useState("");
  const [countryCode, setCountryCode] = useState("+880");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [updating, setUpdating] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const [dataLoaded, setDataLoaded] = useState(false);

  const productId = product?._id || product?.id;
  const existingImageUrl = productId
    ? `${API_BASE_URL}/marketplace/product-image/${productId}`
    : null;

  // Initialize form with existing product data
  useEffect(() => {
    console.log("Product data received:", product);

    if (product && !dataLoaded) {
      setName(product.productName || product.name || "");
      setPrice(product.price?.toString() || "");
      setCategory(product.category || categories[0].value);
      setCondition(product.condition || "all");
      setAddress(product.address || "");
      setDetails(product.details || "");

      // Parse phone number to extract country code and number
      const fullPhone = product.phoneNumber || "";
      const matchedCode = countryCodes.find((code) =>
        fullPhone.startsWith(code.value)
      );
      if (matchedCode) {
        setCountryCode(matchedCode.value);
        setPhoneNumber(fullPhone.substring(matchedCode.value.length));
      } else {
        setCountryCode("+880");
        setPhoneNumber(fullPhone);
      }

      setDataLoaded(true);
      console.log("Form data initialized");
    }
  }, [product, dataLoaded]);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission Denied", "Camera roll permissions are required!");
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setImageUri(result.assets[0].uri);
      console.log("New image selected:", result.assets[0].uri);
    }
  };

  const handleImageLoad = () => {
    setImageLoading(false);
    setImageError(false);
  };

  const handleImageError = () => {
    setImageLoading(false);
    setImageError(true);
    console.log("Image loading error");
  };

  const handleUpdate = async () => {
    // Validation
    if (
      !name.trim() ||
      !price.trim() ||
      !category ||
      !address.trim() ||
      !phoneNumber.trim()
    ) {
      Alert.alert(
        "Missing Fields",
        "Please fill all required fields including phone number."
      );
      return;
    }

    if (!user?.userId) {
      Alert.alert("User Error", "User not found. Please login again.");
      return;
    }

    if (!productId) {
      Alert.alert("Error", "Product ID not found.");
      return;
    }

    setUpdating(true);

    try {
      const formData = new FormData();
      formData.append("productName", name.trim());
      formData.append("price", price.trim());
      formData.append("category", category);
      formData.append("address", address.trim());
      formData.append("details", details.trim());

      const fullPhone = phoneNumber.trim()
        ? `${countryCode}${phoneNumber.trim()}`
        : "";
      formData.append("phoneNumber", fullPhone);
      formData.append("condition", condition);

      // Handle image upload - FIXED VERSION
      if (imageUri) {
        // Get filename from URI
        const uriParts = imageUri.split("/");
        const fileName = uriParts[uriParts.length - 1];

        // Determine file extension and MIME type
        const fileExtension = fileName.split(".").pop()?.toLowerCase() || "jpg";
        let mimeType;

        switch (fileExtension) {
          case "jpg":
          case "jpeg":
            mimeType = "image/jpeg";
            break;
          case "png":
            mimeType = "image/png";
            break;
          case "gif":
            mimeType = "image/gif";
            break;
          case "webp":
            mimeType = "image/webp";
            break;
          default:
            mimeType = "image/jpeg";
        }

        // Create proper file object for FormData
        const imageFile = {
          uri:
            Platform.OS === "ios" ? imageUri.replace("file://", "") : imageUri,
          type: mimeType,
          name: fileName || `product_image_${Date.now()}.${fileExtension}`,
        };

        formData.append("productImage", imageFile);

        console.log("Image file object:", imageFile);
      }

      console.log("Sending update request for product ID:", productId);
      console.log("FormData contents:");

      // Log FormData contents for debugging
      if (formData._parts) {
        formData._parts.forEach((part, index) => {
          console.log(
            `FormData[${index}]:`,
            part[0],
            typeof part[1] === "object" ? "FILE_OBJECT" : part[1]
          );
        });
      }

      const response = await fetch(
        `${API_BASE_URL}/marketplace/edit-product/${productId}`,
        {
          method: "PATCH",
          body: formData,
          headers: {
            Accept: "application/json",
            // Don't set Content-Type header - let the browser set it with boundary for multipart/form-data
          },
        }
      );

      console.log("Response status:", response.status);
      console.log("Response headers:", response.headers);

      const resText = await response.text();
      console.log("Raw response:", resText);

      let resJson;
      try {
        resJson = JSON.parse(resText);
      } catch (parseError) {
        console.error("Failed to parse response as JSON:", parseError);
        throw new Error("Invalid response from server");
      }

      console.log("Parsed response:", resJson);

      setUpdating(false);

      if (response.ok) {
        setImageVersion(Date.now()); // Bust cache for new image
        Alert.alert("Success", "Product updated successfully!", [
          {
            text: "OK",
            onPress: () => {
              // Navigate back and refresh the previous screen
              navigation.goBack();
            },
          },
        ]);
      } else {
        console.error("Update failed:", resJson);
        Alert.alert("Error", resJson.message || "Failed to update product.");
      }
    } catch (err) {
      console.error("Update error:", err);
      setUpdating(false);
      Alert.alert(
        "Error",
        "Failed to update product. Please check your connection and try again."
      );
    }
  };

  // Debug function to check current form state
  const logCurrentState = () => {
    console.log("Current form state:", {
      name,
      price,
      category,
      condition,
      address,
      details,
      phoneNumber,
      countryCode,
      productId,
      hasNewImage: !!imageUri,
      imageUri,
      existingImageUrl,
    });
  };

  if (!product) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>No product data found.</Text>
        <Text style={styles.errorSubtext}>
          Please navigate back and try again.
        </Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.keyboardContainer}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
    >
      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.container}>
          <View style={styles.card}>
            {/* Debug button - remove in production */}
            {__DEV__ && (
              <TouchableOpacity
                style={styles.debugButton}
                onPress={logCurrentState}
              >
                <Text style={styles.debugButtonText}>Log State</Text>
              </TouchableOpacity>
            )}

            {/* Image Section */}
            <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
              {imageUri ? (
                <View style={styles.imageContainer}>
                  <Image
                    source={{ uri: imageUri }}
                    style={styles.imagePreview}
                  />
                  <View style={styles.imageOverlay}>
                    <Text style={styles.imageOverlayText}>
                      Tap to change image
                    </Text>
                  </View>
                </View>
              ) : existingImageUrl ? (
                <View style={styles.imageContainer}>
                  {imageLoading && (
                    <View style={styles.imagePlaceholder}>
                      <Text style={styles.placeholderText}>Loading...</Text>
                    </View>
                  )}
                  {!imageError ? (
                    <Image
                      source={{
                        uri: existingImageUrl
                          ? `${existingImageUrl}?t=${imageVersion}`
                          : undefined,
                      }}
                      style={[
                        styles.imagePreview,
                        imageLoading && styles.hiddenImage,
                      ]}
                      onLoad={handleImageLoad}
                      onError={handleImageError}
                      resizeMode="cover"
                    />
                  ) : (
                    <View style={styles.imageErrorContainer}>
                      <Text style={styles.imageErrorText}>
                        Tap to select new image
                      </Text>
                    </View>
                  )}
                  <View style={styles.imageOverlay}>
                    <Text style={styles.imageOverlayText}>
                      Tap to change image
                    </Text>
                  </View>
                </View>
              ) : (
                <Text style={styles.imagePickerText}>Pick Product Image</Text>
              )}
            </TouchableOpacity>

            {/* Product Name and Price */}
            <View style={styles.rowInputs}>
              <TextInput
                placeholder="Product Name"
                style={[styles.input, styles.flex1]}
                value={name}
                onChangeText={setName}
                placeholderTextColor="#9CA3AF"
                editable={!updating}
              />
              <TextInput
                placeholder="Price"
                style={[styles.input, styles.priceInput]}
                keyboardType="numeric"
                value={price}
                onChangeText={setPrice}
                placeholderTextColor="#9CA3AF"
                editable={!updating}
              />
            </View>

            {/* Category Picker */}
            <View
              style={
                Platform.OS === "android"
                  ? styles.pickerAndroid
                  : styles.pickerIOS
              }
            >
              <Picker
                selectedValue={category}
                onValueChange={(itemValue) => setCategory(itemValue)}
                style={{ width: "100%" }}
                dropdownIconColor="#4F46E5"
                enabled={!updating}
              >
                {categories.map((cat) => (
                  <Picker.Item
                    key={cat.value}
                    label={cat.label}
                    value={cat.value}
                  />
                ))}
              </Picker>
            </View>

            {/* Condition Picker */}
            <View
              style={
                Platform.OS === "android"
                  ? styles.pickerAndroid
                  : styles.pickerIOS
              }
            >
              <Picker
                selectedValue={condition}
                onValueChange={setCondition}
                style={{ width: "100%" }}
                dropdownIconColor="#4F46E5"
                enabled={!updating}
              >
                {conditionOptions.map((option) => (
                  <Picker.Item
                    key={option.value}
                    label={option.label}
                    value={option.value}
                  />
                ))}
              </Picker>
            </View>

            {/* Phone Number Section */}
            <View style={styles.phoneContainer}>
              <View style={styles.countryCodeContainer}>
                <View
                  style={
                    Platform.OS === "android"
                      ? styles.countryPickerAndroid
                      : styles.countryPickerIOS
                  }
                >
                  <Picker
                    selectedValue={countryCode}
                    onValueChange={(itemValue) => setCountryCode(itemValue)}
                    style={{ width: "100%" }}
                    dropdownIconColor="#4F46E5"
                    enabled={!updating}
                  >
                    {countryCodes.map((code) => (
                      <Picker.Item
                        key={code.value}
                        label={code.label}
                        value={code.value}
                      />
                    ))}
                  </Picker>
                </View>
              </View>
              <TextInput
                placeholder="Phone Number"
                style={[styles.input, styles.phoneInput]}
                keyboardType="phone-pad"
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                placeholderTextColor="#9CA3AF"
                editable={!updating}
              />
            </View>

            {/* Address */}
            <TextInput
              placeholder="Address"
              style={styles.input}
              value={address}
              onChangeText={setAddress}
              placeholderTextColor="#9CA3AF"
              editable={!updating}
            />

            {/* Details */}
            <TextInput
              placeholder="Details (Optional)"
              style={[styles.input, styles.detailsInput]}
              value={details}
              onChangeText={setDetails}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              placeholderTextColor="#9CA3AF"
              editable={!updating}
            />

            {/* Update Button */}
            <TouchableOpacity
              style={[styles.button, updating && styles.buttonDisabled]}
              onPress={handleUpdate}
              disabled={updating}
            >
              <Text style={styles.buttonText}>
                {updating ? "Updating..." : "Update Product"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  keyboardContainer: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
    minHeight: "100%",
  },
  card: {
    width: "100%",
    maxWidth: 420,
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 22,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 16,
  },
  debugButton: {
    backgroundColor: "#ff6b6b",
    padding: 8,
    borderRadius: 4,
    marginBottom: 10,
    alignItems: "center",
  },
  debugButtonText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  imagePicker: {
    backgroundColor: "#f1f5f9",
    borderRadius: 12,
    height: 200,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
    borderWidth: 2,
    borderColor: "#e0e7ef",
    overflow: "hidden",
    position: "relative",
  },
  imagePickerText: {
    color: "#6B7280",
    fontSize: 16,
  },
  imagePreview: {
    width: "100%",
    height: 200,
    resizeMode: "cover",
    borderRadius: 10,
  },
  imageContainer: {
    width: "100%",
    height: "100%",
    position: "relative",
  },
  hiddenImage: {
    opacity: 0,
  },
  imagePlaceholder: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f9f9f9",
  },
  placeholderText: {
    color: "#666",
    fontSize: 14,
  },
  imageErrorContainer: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ffe6e6",
  },
  imageErrorText: {
    color: "#d63031",
    fontSize: 14,
    fontWeight: "bold",
    textAlign: "center",
  },
  imageOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0,0,0,0.6)",
    padding: 8,
    alignItems: "center",
  },
  imageOverlayText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "500",
  },
  rowInputs: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 14,
  },
  flex1: {
    flex: 1,
  },
  priceInput: {
    width: 110,
  },
  phoneContainer: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 14,
  },
  countryCodeContainer: {
    width: 120,
  },
  phoneInput: {
    flex: 1,
    marginBottom: 0,
  },
  countryPickerAndroid: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 8,
    backgroundColor: "#f9fafb",
    overflow: "hidden",
    height: 48,
    justifyContent: "center",
  },
  countryPickerIOS: {
    backgroundColor: "#f9fafb",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 8,
    height: 48,
    justifyContent: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    marginBottom: 14,
    borderRadius: 8,
    padding: 12,
    backgroundColor: "#f9fafb",
    fontSize: 16,
    color: "#22223b",
  },
  detailsInput: {
    height: 100,
    paddingTop: 12,
  },
  pickerAndroid: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 8,
    marginBottom: 14,
    backgroundColor: "#f9fafb",
    overflow: "hidden",
  },
  pickerIOS: {
    marginBottom: 14,
    backgroundColor: "#f9fafb",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 8,
  },
  button: {
    backgroundColor: "#10b981",
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 8,
    shadowColor: "#10b981",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 2,
  },
  buttonDisabled: {
    backgroundColor: "#9ca3af",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 17,
    letterSpacing: 0.2,
  },
  errorContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
    backgroundColor: "#f8fafc",
  },
  errorText: {
    fontSize: 18,
    color: "#666",
    textAlign: "center",
    marginBottom: 8,
  },
  errorSubtext: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
  },
});

export default EditProduct;
