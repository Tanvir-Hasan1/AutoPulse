import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from "react-native";
import { useUser } from "../../contexts/UserContext";
import Toast from "react-native-toast-message";
import { useRouter } from "expo-router";

export default function EditProfile() {
  const { user, updateUser, selectBike } = useUser();
  const [username, setUsername] = useState(user?.username || "");
  const [password, setPassword] = useState("");
  const [bikes, setBikes] = useState(user?.bikes || []);
  const router = useRouter();

  // Update username
  const handleUpdateUsername = () => {
    if (!username.trim()) {
      Toast.show({
        type: "error",
        text1: "Username required",
        text2: "Please enter a username.",
        position: "bottom",
        autoHide: true,
      });
      return;
    }
    updateUser({ ...user, username });
    Toast.show({
      type: "success",
      text1: "Username updated",
      position: "bottom",
      autoHide: true,
    });
  };

  // Update password
  const handleUpdatePassword = () => {
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
    // Here you would call your API to update password
    Toast.show({
      type: "success",
      text1: "Password updated",
      position: "bottom",
      autoHide: true,
    });
    setPassword("");
  };

  // Delete bike
  const handleDeleteBike = (bikeId) => {
    Alert.alert("Delete Bike", "Are you sure you want to delete this bike?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          const updatedBikes = bikes.filter((b) => b._id !== bikeId);
          setBikes(updatedBikes);
          updateUser({ ...user, bikes: updatedBikes });
          Toast.show({
            type: "success",
            text1: "Bike deleted",
            position: "bottom",
            autoHide: true,
          });
        },
      },
    ]);
  };

  // Edit bike info (for demo, just allow editing name)
  const handleEditBike = (bikeId, newName) => {
    const updatedBikes = bikes.map((b) =>
      b._id === bikeId ? { ...b, name: newName } : b
    );
    setBikes(updatedBikes);
    updateUser({ ...user, bikes: updatedBikes });
    Toast.show({
      type: "success",
      text1: "Bike updated",
      position: "bottom",
      autoHide: true,
    });
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Text style={{ color: "#4F46E5", fontWeight: "bold" }}>← Back</Text>
      </TouchableOpacity>

      <Text style={styles.header}>Edit Profile</Text>

      <Text style={styles.label}>Username</Text>
      <TextInput
        style={styles.input}
        value={username}
        onChangeText={setUsername}
        placeholder="Enter username"
      />
      <TouchableOpacity style={styles.button} onPress={handleUpdateUsername}>
        <Text style={styles.buttonText}>Update Username</Text>
      </TouchableOpacity>

      <Text style={styles.label}>New Password</Text>
      <TextInput
        style={styles.input}
        value={password}
        onChangeText={setPassword}
        placeholder="Enter new password"
        secureTextEntry
      />
      <TouchableOpacity style={styles.button} onPress={handleUpdatePassword}>
        <Text style={styles.buttonText}>Update Password</Text>
      </TouchableOpacity>

      <Text style={styles.header}>Your Bikes</Text>
      {bikes.map((bike) => (
        <View key={bike._id} style={styles.bikeCard}>
          <TextInput
            style={styles.bikeNameInput}
            value={bike.name}
            onChangeText={(newName) => handleEditBike(bike._id, newName)}
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
