import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function ForgotPassword() {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <Ionicons name="construct-outline" size={48} color="#4F46E5" />
      <Text style={styles.title}>Under Maintenance</Text>
      <Text style={styles.subtitle}>
        The forgot password feature is currently being worked on. Please try
        again later.
      </Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.buttonText}>Go Back</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginTop: 20,
    color: "#4F46E5",
  },
  subtitle: {
    fontSize: 16,
    color: "gray",
    textAlign: "center",
    marginVertical: 12,
    paddingHorizontal: 10,
  },
  button: {
    marginTop: 20,
    backgroundColor: "#4F46E5",
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});
