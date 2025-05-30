import { FontAwesome, Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { API_BASE_URL } from "../config";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    try {
      setIsLoading(true);

      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Login failed");
        setIsLoading(false);
        return;
      }

      // ✅ Save user info or token here if needed
      console.log("Login successful:", data.user);

      setIsLoading(false);
      router.replace("/home");
    } catch (error) {
      console.error("Login error:", error);
      alert("Server error. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={styles.container}
    >
      <View style={styles.logoContainer}>
        <Ionicons name="bicycle" size={40} color="#4F46E5" />
        <Text style={styles.title}>Welcome to AutoPulse</Text>
        <Text style={styles.subtitle}>
          Sign in to manage your bike's performance
        </Text>
      </View>

      <View style={styles.formContainer}>
        {/* Email */}
        <View style={styles.inputWrapper}>
          <FontAwesome
            name="envelope"
            size={16}
            color="gray"
            style={styles.icon}
          />
          <TextInput
            placeholder="name@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
            style={styles.input}
            value={email}
            onChangeText={setEmail}
          />
        </View>

        {/* Password */}
        <View style={styles.inputWrapper}>
          <FontAwesome
            name="lock"
            size={16}
            color="gray"
            style={[styles.icon, { marginLeft: 4 }]}
          />
          <TextInput
            placeholder="Password"
            secureTextEntry={!passwordVisible}
            style={[styles.input, { flex: 1 }]}
            value={password}
            onChangeText={setPassword}
          />
          <TouchableOpacity
            onPress={() => setPasswordVisible(!passwordVisible)}
          >
            <Ionicons
              name={passwordVisible ? "eye-off" : "eye"}
              size={20}
              color="gray"
            />
          </TouchableOpacity>
        </View>

        {/* Forgot Password */}
        <TouchableOpacity
          style={styles.link}
          onPress={() => router.push("/(auth)/ForgotPasswordPage")}
        >
          <Text style={styles.linkText}>Forgot password?</Text>
        </TouchableOpacity>

        {/* Login Button */}
        <TouchableOpacity
          style={styles.button}
          onPress={handleLogin}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Sign In</Text>
          )}
        </TouchableOpacity>

        {/* Sign Up */}
        <TouchableOpacity
          style={styles.link}
          onPress={() => router.push("/(auth)/SignupPage")}
        >
          <Text style={styles.linkText}>Don't have an account? Sign up</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 12,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    color: "gray",
    textAlign: "center",
    marginTop: 4,
  },
  formContainer: {
    marginTop: 8,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f3f4f6",
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 12,
  },
  icon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    paddingVertical: 8,
    fontSize: 16,
  },
  button: {
    backgroundColor: "#4F46E5",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 12,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  link: {
    marginTop: 12,
    alignItems: "center",
  },
  linkText: {
    fontWeight: "bold",

    color: "#4F46E5",
    fontSize: 14,
  },
});
