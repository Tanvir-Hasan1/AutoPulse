import { StyleSheet, Text, View } from "react-native";
import { useUser } from "../contexts/UserContext"; // Adjust path if needed

export default function Dashboard() {
  const { user } = useUser();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Dashboard</Text>

      <Text style={styles.subtitle}>Welcome, {user.email}! You Rock!</Text>


      {user.selectedBikeId && (
        <View style={styles.bikeBox}>
          <Text style={styles.bikeText}>Bike ID: {user.selectedBikeId}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 16,
  },
  bikeBox: {
    marginTop: 10,
    backgroundColor: "#f3f4f6",
    padding: 10,
    borderRadius: 8,
  },
  bikeText: {
    fontSize: 14,
    color: "#333",
  },
});
