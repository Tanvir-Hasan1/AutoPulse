import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

export default function FuelMeter({ fuelLevel, fuelLogs }) {
  const calculateAvgMileage = () => {
    if (fuelLogs.length === 0) return 0;
    const validMileages = fuelLogs.filter((log) => log.mileage > 0);
    if (validMileages.length === 0) return 0;
    const sum = validMileages.reduce((acc, log) => acc + log.mileage, 0);
    return (sum / validMileages.length).toFixed(1);
  };

  const calculateCostPerKm = () => {
    if (fuelLogs.length === 0) return 0;
    const totalCost = fuelLogs.reduce((acc, log) => acc + log.totalCost, 0);
    const totalDistance = fuelLogs.reduce(
      (acc, log) => acc + log.amount * log.mileage,
      0
    );
    return totalDistance > 0 ? (totalCost / totalDistance).toFixed(2) : 0;
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Current Fuel Level</Text>
        <Text style={styles.cardDescription}>
          Estimated remaining fuel in your tank
        </Text>

        <View style={styles.meterContainer}>
          <View style={styles.circularProgress}>
            <Text style={styles.percentageText}>{fuelLevel}%</Text>
          </View>
          <Text style={styles.rangeText}>
            Estimated Range: {Math.floor(fuelLevel * 1.2)} km
          </Text>
          <Text
            style={[styles.statusText, fuelLevel < 20 && styles.lowFuelText]}
          >
            {fuelLevel < 20 ? "Low fuel! Refill soon." : "Fuel level is good."}
          </Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Fuel Economy</Text>
        <Text style={styles.cardDescription}>
          Your bike's performance metrics
        </Text>

        <View style={styles.metricsContainer}>
          <View style={styles.metricCard}>
            <Ionicons name="trending-up" size={32} color="#4F46E5" />
            <Text style={styles.metricLabel}>Avg. Mileage</Text>
            <Text style={styles.metricValue}>{calculateAvgMileage()} km/L</Text>
          </View>
          <View style={styles.metricCard}>
            <Ionicons name="cash" size={32} color="#4F46E5" />
            <Text style={styles.metricLabel}>Cost per km</Text>
            <Text style={styles.metricValue}>₹{calculateCostPerKm()}/km</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 16,
  },
  meterContainer: {
    alignItems: "center",
  },
  circularProgress: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#e5e7eb",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  percentageText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1f2937",
  },
  rangeText: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 8,
  },
  statusText: {
    fontSize: 14,
    color: "#6b7280",
  },
  lowFuelText: {
    color: "#ef4444",
    fontWeight: "bold",
  },
  metricsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  metricCard: {
    flex: 1,
    alignItems: "center",
    padding: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 8,
    marginHorizontal: 4,
  },
  metricLabel: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 8,
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1f2937",
  },
});
