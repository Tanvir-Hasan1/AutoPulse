import { useState } from "react";
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
import { useRouter } from "expo-router";
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

export default function PostProduct() {
  const [condition, setCondition] = useState("all");
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [imageUri, setImageUri] = useState(null);
  const [category, setCategory] = useState(categories[0].value);
  const [address, setAddress] = useState("");
  const [details, setDetails] = useState("");
  const [countryCode, setCountryCode] = useState("+880");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [uploading, setUploading] = useState(false);
  const router = useRouter();
  const { user } = useUser();

  // Updated pickImage function - removed deprecated MediaTypeOptions
  const pickImage = async () => {
    console.log("Picking image...");
    try {
      console.log("Requesting permissions...");
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== "granted") {
        Alert.alert(
          "Permission Denied",
          "Camera roll permissions are required!"
        );
        return;
      }

      console.log("Launching image library...");
      const result = await ImagePicker.launchImageLibraryAsync({
        // Removed deprecated MediaTypeOptions.Images - images are default
        allowsEditing: true,
        // aspect: [4, 3],
        quality: 0.8, // Slightly reduced quality for better performance
        allowsMultipleSelection: false,
      });

      console.log("Full result object:", JSON.stringify(result, null, 2));

      if (result.canceled) {
        console.log("User cancelled image selection");
        return;
      }

      if (result.assets && result.assets.length > 0) {
        const selectedImage = result.assets[0];
        console.log("Selected image URI:", selectedImage.uri);
        setImageUri(selectedImage.uri);
      } else {
        console.log("No assets found in result");
        Alert.alert("Error", "No image was selected");
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert("Error", "Failed to pick image. Please try again.");
    }
  };

  // Alternative Solution 2: Use string directly
  const pickImageAlternative = async () => {
    console.log("Picking image...");
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission Denied", "Camera roll permissions are required!");
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: "Images", // Use string directly
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    console.log("Image picker result:", result);

    if (!result.canceled && result.assets && result.assets.length > 0) {
      console.log("Setting image URI:", result.assets[0].uri);
      setImageUri(result.assets[0].uri);
    }
  };

  // Solution 3: More robust version with better error handling
  const pickImageRobust = async () => {
    try {
      console.log("Requesting permissions...");
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== "granted") {
        Alert.alert(
          "Permission Denied",
          "Camera roll permissions are required!"
        );
        return;
      }

      console.log("Launching image library...");
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8, // Slightly reduced quality for better performance
        allowsMultipleSelection: false,
      });

      console.log("Full result object:", JSON.stringify(result, null, 2));

      if (result.canceled) {
        console.log("User cancelled image selection");
        return;
      }

      if (result.assets && result.assets.length > 0) {
        const selectedImage = result.assets[0];
        console.log("Selected image URI:", selectedImage.uri);
        setImageUri(selectedImage.uri);
      } else {
        console.log("No assets found in result");
        Alert.alert("Error", "No image was selected");
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert("Error", "Failed to pick image. Please try again.");
    }
  };

  const handleSubmit = async () => {
    if (!name || !price || !imageUri || !category || !address || !phoneNumber) {
      Alert.alert(
        "Missing Fields",
        "Please fill all fields including phone number and select an image."
      );
      return;
    }
    if (!user?.userId) {
      Alert.alert("User Error", "User not found. Please login again.");
      return;
    }
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("productName", name);
      formData.append("price", price);
      formData.append("category", category);
      formData.append("address", address);
      formData.append("details", details);
      formData.append("phoneNumber", `${countryCode}${phoneNumber}`);
      formData.append("condition", condition);
      if (imageUri) {
        const filename = imageUri.split("/").pop();
        const match = /\.([a-zA-Z0-9]+)$/.exec(filename || "");
        const type = match ? `image/${match[1]}` : `image`;
        formData.append("productImage", {
          uri: imageUri,
          name: filename,
          type,
        });
      }
      const response = await fetch(
        `${API_BASE_URL}/marketplace/post-product/${user.userId}`,
        {
          method: "POST",
          headers: {
            // 'Content-Type' should NOT be set for FormData in React Native fetch
          },
          body: formData,
        }
      );
      const resJson = await response.json();
      setUploading(false);
      if (response.ok) {
        Alert.alert("Success", "Product posted!");
        router.back();
      } else {
        Alert.alert("Error", resJson.message || "Failed to post product.");
      }
    } catch (err) {
      setUploading(false);
      Alert.alert("Error", "Failed to post product. Please try again.");
    }
  };

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
            <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
              {imageUri ? (
                <Image source={{ uri: imageUri }} style={styles.imagePreview} />
              ) : (
                <Text style={styles.imagePickerText}>Pick Product Image</Text>
              )}
            </TouchableOpacity>

            <View style={styles.rowInputs}>
              <TextInput
                placeholder="Product Name"
                style={[styles.input, styles.flex1]}
                value={name}
                onChangeText={setName}
                placeholderTextColor="#9CA3AF"
              />
              <TextInput
                placeholder="Price"
                style={[styles.input, styles.priceInput]}
                keyboardType="numeric"
                value={price}
                onChangeText={setPrice}
                placeholderTextColor="#9CA3AF"
              />
            </View>

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

            {/* Condition Dropdown */}
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
              />
            </View>

            <TextInput
              placeholder="Address"
              style={styles.input}
              value={address}
              onChangeText={setAddress}
              placeholderTextColor="#9CA3AF"
            />

            <TextInput
              placeholder="Details (Optional)"
              style={[styles.input, styles.detailsInput]}
              value={details}
              onChangeText={setDetails}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              placeholderTextColor="#9CA3AF"
            />

            <TouchableOpacity
              style={[styles.button, uploading && styles.buttonDisabled]}
              onPress={handleSubmit}
              disabled={uploading}
            >
              <Text style={styles.buttonText}>
                {uploading ? "Posting..." : "Submit Product"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

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
  imagePicker: {
    backgroundColor: "#f1f5f9",
    borderRadius: 12,
    height: 160,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
    borderWidth: 2,
    borderColor: "#e0e7ef",
    overflow: "hidden",
  },
  imagePickerText: {
    color: "#6B7280",
    fontSize: 16,
  },
  imagePreview: {
    width: "100%",
    height: 160,
    resizeMode: "cover",
    borderRadius: 10,
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
    backgroundColor: "#4F46E5",
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 8,
    shadowColor: "#4F46E5",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 2,
  },
  buttonDisabled: {
    backgroundColor: "#a5b4fc",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 17,
    letterSpacing: 0.2,
  },
});
