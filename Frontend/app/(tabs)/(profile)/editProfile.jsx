import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Toast from "react-native-toast-message";
import api from "../../../store/api";
import { useAuthStore } from "../../../store/useAuthStore";

export default function EditProfile() {
  const updateUser = useAuthStore((s) => s.updateUser);
  const setBikes = useAuthStore((s) => s.setBikes);
  const name = useAuthStore((s) => s.name);
  const bikes = useAuthStore((s) => s.bikes);
  const [username, setUsername] = useState(name || "");
  const [password, setPassword] = useState("");
  const [localBikes, setLocalBikes] = useState(bikes || []);
  const router = useRouter();

  // Update name via API
  const handleUpdateUsername = async () => {
    if (!username.trim()) {
      Toast.show({
        type: "error",
        text1: "Name required",
        text2: "Please enter your name.",
        position: "bottom",
        autoHide: true,
      });
      return;
    }
    try {
      await api.put("/auth/change-name", { newName: username });
      updateUser({ name: username });
      Toast.show({
        type: "success",
        text1: "Name updated",
        position: "bottom",
        autoHide: true,
      });
    } catch (err) {
      Toast.show({
        type: "error",
        text1: "Update failed",
        text2: err.message,
        position: "bottom",
        autoHide: true,
      });
    }
  };

  // Update password via API
  const handleUpdatePassword = async () => {
    if (password.length < 6) {
      Toast.show({
        type: "error",
        text1: "Password too short",
        text2: "Password must be at least 6 characters.",
        position: "bottom",
        autoHide: true,
      });
      return;
    }
    // Prompt for current password
    Alert.prompt(
      "Current Password",
      "Enter your current password to confirm the change",
      async (currentPassword) => {
        try {
          await api.put("/auth/update-password", { currentPassword, newPassword: password });
          Toast.show({
            type: "success",
            text1: "Password updated",
            position: "bottom",
            autoHide: true,
          });
          setPassword("");
        } catch (err) {
          Toast.show({
            type: "error",
            text1: "Update failed",
            text2: err.message,
            position: "bottom",
            autoHide: true,
          });
        }
      },
      "secure-text"
    );
  };

  // Delete bike via API
  const handleDeleteBike = (bikeId) => {
    Alert.alert("Delete Bike", "Are you sure you want to delete this bike?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await api.delete("/bikes/delete", { id: bikeId });
            const updatedBikes = localBikes.filter((b) => b._id !== bikeId);
            setLocalBikes(updatedBikes);
            setBikes(updatedBikes);
            Toast.show({
              type: "success",
              text1: "Bike deleted",
              position: "bottom",
              autoHide: true,
            });
          } catch (err) {
            Toast.show({
              type: "error",
              text1: "Delete failed",
              text2: err.message,
              position: "bottom",
              autoHide: true,
            });
          }
        },
      },
    ]);
  };

  // Edit bike info via API
  const handleEditBike = async (bikeId, field, value) => {
    try {
      await api.put("/bikes/update", { id: bikeId, [field]: value });
      const updatedBikes = localBikes.map((b) =>
        b._id === bikeId ? { ...b, [field]: value } : b
      );
      setLocalBikes(updatedBikes);
      setBikes(updatedBikes);
      Toast.show({
        type: "success",
        text1: "Bike updated",
        position: "bottom",
        autoHide: true,
      });
    } catch (err) {
      Toast.show({
        type: "error",
        text1: "Update failed",
        text2: err.message,
        position: "bottom",
        autoHide: true,
      });
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Text style={{ color: "#4F46E5", fontWeight: "bold" }}>← Back</Text>
      </TouchableOpacity>

      <Text style={styles.header}>Edit Profile</Text>

      <Text style={styles.label}>Name</Text>
      <TextInput
        style={styles.input}
        value={username}
        onChangeText={setUsername}
        placeholder="Enter your name"
        placeholderTextColor="#888"
      />
      <TouchableOpacity style={styles.button} onPress={handleUpdateUsername}>
        <Text style={styles.buttonText}>Update Name</Text>
      </TouchableOpacity>

      <Text style={styles.label}>New Password</Text>
      <TextInput
        style={styles.input}
        value={password}
        onChangeText={setPassword}
        placeholder="Enter new password"
        placeholderTextColor="#888"
        secureTextEntry
      />
      <TouchableOpacity style={styles.button} onPress={handleUpdatePassword}>
        <Text style={styles.buttonText}>Update Password</Text>
      </TouchableOpacity>

      <Text style={styles.header}>Your Bikes</Text>
      {localBikes.map((bike) => (
        <View key={bike._id} style={styles.bikeCard}>
          <TextInput
            style={styles.bikeNameInput}
            value={bike.model || bike.name}
            onChangeText={(val) => handleEditBike(bike._id, "model", val)}
          />
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => handleDeleteBike(bike._id)}
          >
            <Text style={styles.deleteButtonText}>Delete</Text>
          </TouchableOpacity>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#f8fafc",
    flexGrow: 1,
  },
  backButton: {
    marginBottom: 10,
    alignSelf: "flex-start",
  },
  header: {
    fontSize: 20,
    fontWeight: "bold",
    marginVertical: 16,
    color: "#1f2937",
  },
  label: {
    fontSize: 16,
    marginTop: 16,
    color: "#374151",
  },
  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
    backgroundColor: "#fff",
  },
  button: {
    backgroundColor: "#4F46E5",
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  bikeCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  bikeNameInput: {
    flex: 1,
    fontSize: 16,
    color: "#1f2937",
    backgroundColor: "#f3f4f6",
    borderRadius: 6,
    padding: 8,
    marginRight: 10,
  },
  deleteButton: {
    backgroundColor: "#ef4444",
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 6,
  },
  deleteButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});
