import { Picker } from "@react-native-picker/picker";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import * as Progress from "react-native-progress";
import { API_BASE_URL } from "../config";
import { useUser } from "../contexts/UserContext";

const BIKE_BRANDS = [
  "Royal Enfield",
  "Bajaj",
  "Hero",
  "Honda",
  "TVS",
  "Yamaha",
  "KTM",
  "Suzuki",
  "Jawa",
  "Other",
];

const BIKE_MODELS = {
  "Royal Enfield": [
    "Classic 350",
    "Bullet 350",
    "Meteor 350",
    "Himalayan",
    "Continental GT",
    "Interceptor 650",
  ],
  Bajaj: ["Pulsar 150", "Pulsar 180", "Pulsar 220", "Dominar 400", "Avenger"],
  Hero: ["Splendor", "HF Deluxe", "Passion Pro", "Glamour", "Xtreme 160R"],
  Honda: ["Shine", "Unicorn", "Hornet 2.0", "CB350", "CB500X"],
  TVS: ["Apache RTR 160", "Apache RTR 200", "Raider", "Ronin", "Jupiter"],
  Yamaha: ["FZ", "MT-15", "R15", "FZ25", "Fascino"],
  KTM: [
    "Duke 125",
    "Duke 200",
    "Duke 390",
    "RC 200",
    "RC 390",
    "Adventure 390",
  ],
  Suzuki: ["Gixxer", "Access 125", "Burgman Street", "V-Strom SX", "Hayabusa"],
  Jawa: ["Jawa", "Forty Two", "Perak"],
  Other: ["Custom"],
};

export default function OnboardingScreen() {
  const router = useRouter();
  const { user } = useUser();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const [bikeData, setBikeData] = useState({
    brand: "",
    model: "",
    year: "",
    registrationNumber: "",
    odometer: "",
  });

  const handleChange = (field, value) => {
    setBikeData((prev) => ({
      ...prev,
      [field]: value,
      ...(field === "brand" && { model: "" }), // Reset model if brand changes
    }));
  };

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      submitBikeData();
    }
  };

  const submitBikeData = async () => {
    if (!user.userId || !user.email) {
      Alert.alert("Error", "User information not found. Please sign up again.");
      router.replace("/(auth)/SignupPage");
      return;
    }

    try {
      setIsLoading(true);

      // Console log for verification
      console.log("🚲 Submitting bike data:");
      console.log("User ID from context:", user.userId);
      console.log("Email from context:", user.email);
      console.log("Bike data:", bikeData);

      const payload = {
        user: user.userId,
        brand: bikeData.brand,
        model: bikeData.model,
        year: bikeData.year,
        registrationNumber: bikeData.registrationNumber,
        odometer: parseInt(bikeData.odometer),
      };

      console.log("📤 API Payload:", payload);

      const response = await fetch(`${API_BASE_URL}/api/bikes/registerBike`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to save bike data");
      }

      console.log("✅ Bike data saved successfully:", data);

      Alert.alert("Success", "Bike setup completed successfully!", [
        {
          text: "OK",
          onPress: () => router.replace("/(tabs)"),
        },
      ]);
    } catch (error) {
      console.error("❌ Onboarding error:", error);
      Alert.alert("Error", error.message || "Failed to save bike data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const isStepComplete = () => {
    if (step === 1) return bikeData.brand && bikeData.model;
    if (step === 2) return bikeData.year && bikeData.registrationNumber;
    if (step === 3) return bikeData.odometer;
    return false;
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Bike Setup - Step {step} of 3</Text>
      <Progress.Bar
        progress={step / 3}
        width={null}
        color="#4F46E5"
        unfilledColor="#E5E7EB"
        borderWidth={0}
        height={10}
        borderRadius={6}
        style={{ marginVertical: 16 }}
      />

      {step === 1 && (
        <>
          <Text style={styles.label}>Bike Brand</Text>
          <View style={styles.pickerWrapper}>
            <Picker
              selectedValue={bikeData.brand}
              onValueChange={(value) => handleChange("brand", value)}
            >
              <Picker.Item label="Select brand" value="" />
              {BIKE_BRANDS.map((brand) => (
                <Picker.Item key={brand} label={brand} value={brand} />
              ))}
            </Picker>
          </View>

          <Text style={styles.label}>Bike Model</Text>
          <View style={styles.pickerWrapper}>
            <Picker
              selectedValue={bikeData.model}
              enabled={bikeData.brand !== ""}
              onValueChange={(value) => handleChange("model", value)}
            >
              <Picker.Item label="Select model" value="" />
              {bikeData.brand &&
                BIKE_MODELS[bikeData.brand]?.map((model) => (
                  <Picker.Item key={model} label={model} value={model} />
                ))}
            </Picker>
          </View>
        </>
      )}

      {step === 2 && (
        <>
          <Text style={styles.label}>Manufacturing Year</Text>
          <View style={styles.pickerWrapper}>
            <Picker
              selectedValue={bikeData.year}
              onValueChange={(value) => handleChange("year", value)}
            >
              <Picker.Item label="Select year" value="" />
              {Array.from(
                { length: 25 },
                (_, i) => new Date().getFullYear() - i
              ).map((year) => (
                <Picker.Item
                  key={year}
                  label={year.toString()}
                  value={year.toString()}
                />
              ))}
            </Picker>
          </View>

          <Text style={styles.label}>Registration Number</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. KA-01-AB-1234"
            value={bikeData.registrationNumber}
            onChangeText={(text) => handleChange("registrationNumber", text)}
          />
        </>
      )}

      {step === 3 && (
        <>
          <Text style={styles.label}>Odometer Reading (km)</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            placeholder="e.g. 12345"
            value={bikeData.odometer}
            onChangeText={(text) => handleChange("odometer", text)}
          />
        </>
      )}

      <View style={styles.buttonRow}>
        <TouchableOpacity
          onPress={handleBack}
          style={[styles.button, { backgroundColor: "#E5E7EB" }]}
          disabled={step === 1}
        >
          <Text style={[styles.buttonText, { color: "#111827" }]}>Back</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handleNext}
          style={[
            styles.button,
            { backgroundColor: isStepComplete() ? "#4F46E5" : "#9CA3AF" },
          ]}
          disabled={!isStepComplete() || isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.buttonText}>
              {step === 3 ? "Complete" : "Next"}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    flexGrow: 1,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
  },
  label: {
    marginTop: 16,
    marginBottom: 4,
    fontSize: 16,
    fontWeight: "500",
    color: "#111827",
  },
  pickerWrapper: {
    backgroundColor: "#f3f4f6",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#d1d5db",
    marginBottom: 12,
  },
  input: {
    backgroundColor: "#f3f4f6",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#d1d5db",
    paddingVertical: 10,
    paddingHorizontal: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 24,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginHorizontal: 4,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});
