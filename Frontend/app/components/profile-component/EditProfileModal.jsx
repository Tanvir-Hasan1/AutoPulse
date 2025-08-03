import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Animated,
  Alert, // <-- import Alert
} from "react-native";
import { useUser } from "../../contexts/UserContext";
import { API_BASE_URL } from '../../../config';

export default function EditProfileModal({ visible, onClose, user }) {
  const { updateUser } = useUser();
  const [username, setUsername] = useState(user?.username || "");
  const [prevPassword, setPrevPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState(false);
  const [passwordMatch, setPasswordMatch] = useState(null);
  const [loading, setLoading] = useState(false); // Loading state

  // Animation refs
  const usernameShake = useRef(new Animated.Value(0)).current;
  const prevPassShake = useRef(new Animated.Value(0)).current;
  const newPassShake = useRef(new Animated.Value(0)).current;
  const confirmPassShake = useRef(new Animated.Value(0)).current;

  // Shake animation function for any field
  const shakeField = (fieldRef) => {
    Animated.sequence([
      Animated.timing(fieldRef, {
        toValue: 10,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(fieldRef, {
        toValue: -10,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(fieldRef, {
        toValue: 6,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(fieldRef, {
        toValue: -6,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(fieldRef, {
        toValue: 0,
        duration: 50,
        useNativeDriver: true,
      }),
    ]).start();
  };

  // Helper to clear all fields
  const clearFields = () => {
    setUsername("");
    setPrevPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setPasswordMatch(null);
    setPasswordError(false);
  };

  // Username update handler with API integration
  const handleUpdateUsername = async () => {
    if (!username.trim()) {
      shakeField(usernameShake);
      return;
    }
    try {
      console.log("Updating username for user:", user); // <-- log user object
      const response = await fetch(`${API_BASE_URL}/auth/change-name`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: user.userId,
          newName: username,
        }),
      });
      const data = await response.json();
      if (response.ok && data.name) {
        updateUser({ ...user, name: data.name });
        Alert.alert("Success", "Name updated successfully!");
        clearFields();
        onClose();
      } else {
        Alert.alert("Error", data.message || "Failed to update name.");
      }
    } catch (error) {
      Alert.alert("Error", "Network error. Please try again.");
    }
  };

  // Password update handler
  const handleUpdatePassword = async () => {
    let error = false;
    if (!prevPassword) {
      shakeField(prevPassShake);
      error = true;
    }
    if (!newPassword) {
      shakeField(newPassShake);
      error = true;
    }
    if (!confirmPassword) {
      shakeField(confirmPassShake);
      error = true;
    }
    if (error) return;

    if (newPassword.length < 6 || confirmPassword.length < 6) {
      Alert.alert(
        "Password too short",
        "Password must be at least 6 characters."
      );
      if (newPassword.length < 6) shakeField(newPassShake);
      if (confirmPassword.length < 6) shakeField(confirmPassShake);
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert(
        "Passwords do not match",
        "Please make sure both passwords match."
      );
      setPasswordMatch(false);
      setPasswordError(true);
      shakeField(newPassShake);
      shakeField(confirmPassShake);
      return;
    }
    setPasswordMatch(true);
    setPasswordError(false);

    setLoading(true); // Start loading
    try {
      const response = await fetch(`${API_BASE_URL}/auth/update-password`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: user.userId,
          currentPassword: prevPassword,
          newPassword: newPassword,
        }),
      });
      const data = await response.json();
      setLoading(false); // Stop loading
      if (response.ok && data.message) {
        Alert.alert("Success", data.message);
        clearFields();
        onClose();
      } else {
        Alert.alert("Error", data.message || "Failed to update password.");
      }
    } catch (error) {
      setLoading(false); // Stop loading
      Alert.alert("Error", "Network error. Please try again.");
    }
  };

  // Border color logic
  const getPasswordBorderColor = () => {
    if (newPassword.length < 6 || confirmPassword.length < 6) return "#ef4444";
    if (passwordMatch === false) return "#ef4444";
    if (
      passwordMatch === true &&
      newPassword.length >= 6 &&
      confirmPassword.length >= 6
    )
      return "#22c55e";
    return "#d1d5db";
  };

  // Clear fields on modal close
  const handleClose = () => {
    clearFields();
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={styles.header}>Edit Profile</Text>

          {/* Username Section */}
          <Text style={styles.label}>Username</Text>
          <Animated.View
            style={{
              width: "100%",
              transform: [{ translateX: usernameShake }],
            }}
          >
            <TextInput
              style={styles.input}
              value={username}
              onChangeText={setUsername}
              placeholder="Enter username"
            />
          </Animated.View>
          <TouchableOpacity
            style={styles.button}
            onPress={handleUpdateUsername}
          >
            <Text style={styles.buttonText}>Update Username</Text>
          </TouchableOpacity>

          {/* Divider */}
          <View
            style={{
              height: 1,
              backgroundColor: "#e5e7eb",
              width: "100%",
              marginVertical: 18,
            }}
          />

          {/* Password Section */}
          <Text style={styles.label}>Previous Password</Text>
          <Animated.View
            style={{
              width: "100%",
              transform: [{ translateX: prevPassShake }],
            }}
          >
            <TextInput
              style={styles.input}
              value={prevPassword}
              onChangeText={setPrevPassword}
              placeholder="Enter previous password"
              secureTextEntry
            />
          </Animated.View>
          <Text style={styles.label}>New Password</Text>
          <Animated.View
            style={{
              width: "100%",
              transform: [{ translateX: newPassShake }],
            }}
          >
            <TextInput
              style={[
                styles.input,
                {
                  borderColor: getPasswordBorderColor(),
                },
              ]}
              value={newPassword}
              onChangeText={setNewPassword}
              placeholder="Enter new password"
              secureTextEntry
            />
          </Animated.View>
          <Text style={styles.label}>Confirm Password</Text>
          <Animated.View
            style={{
              width: "100%",
              transform: [{ translateX: confirmPassShake }],
            }}
          >
            <TextInput
              style={[
                styles.input,
                {
                  borderColor: getPasswordBorderColor(),
                },
              ]}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Confirm new password"
              secureTextEntry
            />
          </Animated.View>
          <TouchableOpacity
            style={[styles.button, loading && { opacity: 0.6 }]}
            onPress={handleUpdatePassword}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? "Updating..." : "Update Password"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
            <Text style={styles.closeButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  modal: {
    width: "90%",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 24,
    elevation: 5,
    alignItems: "center",
  },
  header: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 24,
    color: "#1f2937",
  },
  label: {
    fontSize: 16,
    alignSelf: "flex-start",
    marginTop: 12,
    color: "#374151",
  },
  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
    backgroundColor: "#fff",
    width: "100%",
  },
  button: {
    backgroundColor: "#4F46E5",
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
    alignItems: "center",
    width: "100%",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  closeButton: {
    marginTop: 12,
    alignItems: "center",
    width: "100%",
  },
  closeButtonText: {
    color: "#4F46E5",
    fontWeight: "bold",
    fontSize: 16,
  },
});
