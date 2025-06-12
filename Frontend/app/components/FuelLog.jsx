import { Ionicons } from "@expo/vector-icons";
import { useEffect } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { API_BASE_URL } from "../config"; // e.g. http://192.168.x.x:5000/api
import { useUser } from "../contexts/UserContext";

export default function FuelLog({
  fuelLogs,
  setFuelLogs,
  newFuelLog,
  setNewFuelLog,
  setFuelLevel,
  fuelLevel,
  openDatePicker,
  formatDisplayDate,
}) {
  const { user } = useUser();
  const bikeId = user.selectedBikeId;

  const calculateTotalCost = () => {
    const amount = parseFloat(newFuelLog.amount) || 0;
    const unitCost = parseFloat(newFuelLog.unitCost) || 0;
    return (amount * unitCost).toFixed(2);
  };

  const fetchFuelLogs = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/fuel/${bikeId}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to load fuel logs");

      // Sort logs by date ASC
      const sorted = data.sort((a, b) => new Date(a.date) - new Date(b.date));

      // Calculate mileage for each (except the first)
      const logsWithMileage = sorted.map((log, i) => {
        if (i === 0) return log;

        const prev = sorted[i - 1];
        const distance = log.odometer - prev.odometer;
        const mileage =
          log.amount > 0 && distance > 0
            ? parseFloat((distance / log.amount).toFixed(1))
            : null;

        return { ...log, mileage };
      });

      // Show in reverse order (latest first)
      setFuelLogs(logsWithMileage.reverse());
    } catch (error) {
      console.error("Fetch error:", error);
      Alert.alert("Error", "Could not load fuel logs");
    }
  };

  const handleAddFuelLog = async () => {
    if (!newFuelLog.amount || !newFuelLog.unitCost || !newFuelLog.odometer) {
      Alert.alert("Error", "Please fill all fuel log fields");
      return;
    }

    const payload = {
      bike: bikeId,
      date: newFuelLog.date,
      amount: parseFloat(newFuelLog.amount),
      volume: newFuelLog.volume ? parseFloat(newFuelLog.volume) : undefined,
      unitCost: parseFloat(newFuelLog.unitCost),
      odometer: parseFloat(newFuelLog.odometer),
    };

    try {
      const res = await fetch(`${API_BASE_URL}/fuel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to save");

      // Recalculate mileage based on the last fuel log
      const lastLog = fuelLogs[0]; // Assuming latest log is at the top
      let mileage = null;
      if (lastLog && lastLog.odometer && payload.amount > 0) {
        const distance = payload.odometer - lastLog.odometer;
        if (distance > 0) {
          mileage = parseFloat((distance / payload.amount).toFixed(1));
        }
      }

      const newLog = {
        ...data.fuelLog,
        mileage,
      };

      setFuelLogs([newLog, ...fuelLogs]);

      setNewFuelLog({
        date: new Date().toISOString().split("T")[0],
        amount: "",
        unitCost: "",
        odometer: "",
        volume: "",
      });

      setFuelLevel(Math.min(100, fuelLevel + (payload.amount / 15) * 100));

      Alert.alert("Success", "Fuel entry saved!");
    } catch (error) {
      console.error("Add fuel error:", error);
      Alert.alert("Error", error.message || "Failed to save fuel log");
    }
  };

  useEffect(() => {
    if (bikeId) fetchFuelLogs();
  }, [bikeId]);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        {/* Add Fuel Entry Form */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Add Fuel Entry</Text>

          <View style={styles.inputRow}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Date</Text>
              <TouchableOpacity
                style={styles.datePickerButton}
                onPress={openDatePicker}
              >
                <Text style={styles.datePickerText}>
                  {formatDisplayDate(newFuelLog.date)}
                </Text>
                <Ionicons name="calendar" size={20} color="#6b7280" />
              </TouchableOpacity>
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Amount (L)</Text>
              <TextInput
                style={styles.input}
                value={newFuelLog.amount}
                onChangeText={(text) =>
                  setNewFuelLog({ ...newFuelLog, amount: text })
                }
                placeholder="0.0"
                keyboardType="decimal-pad"
              />
            </View>
          </View>

          <View style={styles.inputRow}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Unit Cost (BDT/L)</Text>
              <TextInput
                style={styles.input}
                value={newFuelLog.unitCost}
                onChangeText={(text) =>
                  setNewFuelLog({ ...newFuelLog, unitCost: text })
                }
                placeholder="0.0"
                keyboardType="decimal-pad"
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Odometer (km)</Text>
              <TextInput
                style={styles.input}
                value={newFuelLog.odometer}
                onChangeText={(text) =>
                  setNewFuelLog({ ...newFuelLog, odometer: text })
                }
                placeholder="0.0"
                keyboardType="numeric"
              />
            </View>
          </View>

          <View style={styles.totalCostContainer}>
            <Text style={styles.totalCostLabel}>Total Cost:</Text>
            <Text style={styles.totalCostValue}>
              BDT {calculateTotalCost()}
            </Text>
          </View>

          <TouchableOpacity style={styles.addButton} onPress={handleAddFuelLog}>
            <Text style={styles.addButtonText}>Add Fuel Entry</Text>
          </TouchableOpacity>
        </View>

        {/* Fuel History List */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Fuel History</Text>
          {fuelLogs.map((log) => (
            //fuel log item
            <View key={log._id || log.id} style={styles.historyItem}>
              <View style={styles.cardTopMeta}>
                <View style={styles.metaItem}>
                  <Ionicons
                    name="calendar-outline"
                    size={16}
                    color="#6b7280"
                    style={styles.metaIcon}
                  />
                  <Text style={styles.metaText}>
                    {formatDisplayDate(log.date)}
                  </Text>
                </View>
                <View style={styles.metaSeparator} />
                <View style={styles.metaItem}>
                  <Ionicons
                    name="speedometer-outline"
                    size={16}
                    color="#6b7280"
                    style={styles.metaIcon}
                  />
                  <Text style={styles.metaText}>
                    {log.odometer.toLocaleString()} km
                  </Text>
                </View>
              </View>

              <View style={styles.historyContent}>
                {/* Mileage Display */}
                {log.mileage && (
                  <View style={styles.mileageDisplay}>
                    <Text style={styles.largeMileage}>
                      {log.mileage.toFixed(2)}
                    </Text>
                    <Text style={styles.mileageUnit}>km/l</Text>
                  </View>
                )}

                {/* Fuel Detail Column */}
                <View style={styles.detailsColumn}>
                  <View style={styles.detailRow}>
                    <View
                      style={[
                        styles.colorIndicator,
                        { backgroundColor: "#f97316" },
                      ]}
                    />
                    <Text style={styles.detailText}>
                      {log.odometer -
                        (fuelLogs[fuelLogs.indexOf(log) + 1]?.odometer ||
                          log.odometer) || 0}{" "}
                      km
                    </Text>
                  </View>

                  <View style={styles.detailRow}>
                    <View
                      style={[
                        styles.colorIndicator,
                        { backgroundColor: "#eab308" },
                      ]}
                    />
                    <Text style={styles.detailText}>{log.amount}L</Text>
                  </View>

                  <View style={styles.detailRow}>
                    <View
                      style={[
                        styles.colorIndicator,
                        { backgroundColor: "#22c55e" },
                      ]}
                    />
                    <Text style={styles.detailText}>{log.totalCost} BDT</Text>
                  </View>

                  <View style={styles.detailRow}>
                    <View
                      style={[
                        styles.colorIndicator,
                        { backgroundColor: "#6b7280" },
                      ]}
                    />
                    <Text style={styles.detailText}>{log.unitCost} BDT/l</Text>
                  </View>
                </View>
              </View>

              {/* Optional Notes */}
              {log.notes && (
                <View style={styles.notesSection}>
                  <Text style={styles.notesText}>{log.notes}</Text>
                </View>
              )}
            </View>
          ))}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
    color: "#1f2937",
  },
  inputRow: {
    flexDirection: "row",
    gap: 12,
  },
  inputGroup: {
    flex: 1,
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    color: "#374151",
    marginBottom: 6,
  },
  input: {
    backgroundColor: "#f9fafb",
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  datePickerButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#f9fafb",
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  datePickerText: {
    fontSize: 16,
    color: "#1f2937",
  },
  totalCostContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 12,
    backgroundColor: "#f3f4f6",
    borderRadius: 8,
    borderColor: "#e5e7eb",
    borderWidth: 1,
    marginBottom: 12,
  },
  totalCostLabel: {
    fontSize: 16,
    fontWeight: "600",
  },
  totalCostValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#059669",
  },
  addButton: {
    backgroundColor: "#4F46E5",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
  },
  addButtonText: {
    color: "#ffffff",
    fontWeight: "600",
    fontSize: 16,
  },

  // Updated card layout
  historyItem: {
    borderLeftWidth: 4,
    borderLeftColor: "#10b981",
    borderBottomColor: "#e5e7eb",
    borderBottomWidth: 1,
    marginBottom: 10,
    backgroundColor: "#ffffff",
    borderRadius: 10,
    padding: 15,
    elevation: 0,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  historyContent: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    alignItems: "flex-start",
  },
  cardTopMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  metaIcon: {
    marginRight: 6,
  },
  metaText: {
    fontSize: 15,
    color: "#6b7280",
    fontWeight: "700",
  },
  metaSeparator: {
    width: 1,
    height: 16,
    backgroundColor: "#d1d5d0",
    marginHorizontal: 10,
  },

  mileageDisplay: {
    alignItems: "flex-end",
    marginRight: 24,
  },
  largeMileage: {
    fontSize: 35,
    fontWeight: "bold",
    color: "#4F46E5",
    lineHeight: 48,
  },
  mileageUnit: {
    fontSize: 16,
    color: "#4F46E5",
    fontWeight: "500",
  },
  detailsColumn: {
    justifyContent: "space-between",
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  colorIndicator: {
    width: 14,
    height: 14,
    borderRadius: 4,
    marginRight: 12,
  },
  detailText: {
    fontSize: 16,
    color: "#1f2937",
    fontWeight: "500",
  },
  notesSection: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
  },
  notesText: {
    fontSize: 14,
    color: "#6b7280",
    fontStyle: "italic",
  },
});
