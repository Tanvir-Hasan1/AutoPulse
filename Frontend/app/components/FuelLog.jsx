import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
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
  const [selectedLogId, setSelectedLogId] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editingLog, setEditingLog] = useState(null);

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
            ? Math.floor((distance / log.amount) * 100) / 100 // truncate to 2 decimals
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
      note: newFuelLog.note || "", // Include note in payload
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
          mileage = Math.floor((distance / payload.amount) * 100) / 100;
        }
      }

      await fetchFuelLogs(); // Refresh logs to include new entry

      setNewFuelLog({
        date: new Date().toISOString().split("T")[0],
        amount: "",
        unitCost: "",
        odometer: "",
        volume: "",
        note: "",
      });

      setFuelLevel(Math.min(100, fuelLevel + (payload.amount / 15) * 100));

      Alert.alert("Success", "Fuel entry saved!");
    } catch (error) {
      console.error("Add fuel error:", error);
      Alert.alert("Error", error.message || "Failed to save fuel log");
    }
  };

  const handleDeleteFuelLog = async (logId) => {
    Alert.alert(
      "Delete Fuel Log",
      "Are you sure you want to delete this fuel log entry?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const res = await fetch(`${API_BASE_URL}/fuel/${logId}`, {
                method: "DELETE",
              });

              if (!res.ok) {
                const data = await res.json();
                throw new Error(data.message || "Failed to delete fuel log");
              }

              // Remove the deleted log from the state
              setFuelLogs(
                fuelLogs.filter((log) => (log._id || log.id) !== logId)
              );
              setSelectedLogId(null);

              Alert.alert("Success", "Fuel log deleted successfully");
            } catch (error) {
              console.error("Delete error:", error);
              Alert.alert(
                "Error",
                error.message || "Failed to delete fuel log"
              );
            }
          },
        },
      ]
    );
  };

  const handleEditFuelLog = (log) => {
    setEditingLog({
      id: log._id || log.id,
      date: log.date.split("T")[0], // Format date for input
      amount: log.amount.toString(),
      unitCost: log.unitCost.toString(),
      odometer: log.odometer.toString(),
      note: log.note || "",
    });
    setIsEditing(true);
    setSelectedLogId(null);
  };

  const handleUpdateFuelLog = async () => {
    if (!editingLog.amount || !editingLog.unitCost || !editingLog.odometer) {
      Alert.alert("Error", "Please fill all fuel log fields");
      return;
    }

    const payload = {
      date: editingLog.date, // format: "YYYY-MM-DD"
      amount: parseFloat(editingLog.amount),
      unitCost: parseFloat(editingLog.unitCost),
      odometer: parseFloat(editingLog.odometer),
      note: editingLog.note || "",
    };

    try {
      const res = await fetch(`${API_BASE_URL}/fuel/${editingLog.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Failed to update");

      // Refresh fuel logs after update (recalculate mileage, etc.)
      await fetchFuelLogs();

      // Reset editing state
      setIsEditing(false);
      setEditingLog(null);

      Alert.alert("Success", "Fuel log updated successfully!");
    } catch (error) {
      console.error("Update error:", error);
      Alert.alert("Error", error.message || "Failed to update fuel log");
    }
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setEditingLog(null);
  };

  const handleLongPress = (logId) => {
    setSelectedLogId(logId);
  };

  const handlePress = () => {
    if (selectedLogId) {
      setSelectedLogId(null);
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
        {/* Add/Edit Fuel Entry Form */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>
            {isEditing ? "Edit Fuel Entry" : "Add Fuel Entry"}
          </Text>

          <View style={styles.inputRow}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Date</Text>
              <TouchableOpacity
                style={styles.datePickerButton}
                onPress={isEditing ? () => {} : openDatePicker}
              >
                <Text style={styles.datePickerText}>
                  {isEditing
                    ? formatDisplayDate(editingLog.date)
                    : formatDisplayDate(newFuelLog.date)}
                </Text>
                <Ionicons name="calendar" size={20} color="#6b7280" />
              </TouchableOpacity>
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Amount (L)</Text>
              <TextInput
                style={styles.input}
                value={isEditing ? editingLog.amount : newFuelLog.amount}
                onChangeText={(text) =>
                  isEditing
                    ? setEditingLog({ ...editingLog, amount: text })
                    : setNewFuelLog({ ...newFuelLog, amount: text })
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
                value={isEditing ? editingLog.unitCost : newFuelLog.unitCost}
                onChangeText={(text) =>
                  isEditing
                    ? setEditingLog({ ...editingLog, unitCost: text })
                    : setNewFuelLog({ ...newFuelLog, unitCost: text })
                }
                placeholder="0.0"
                keyboardType="decimal-pad"
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Odometer (km)</Text>
              <TextInput
                style={styles.input}
                value={isEditing ? editingLog.odometer : newFuelLog.odometer}
                onChangeText={(text) =>
                  isEditing
                    ? setEditingLog({ ...editingLog, odometer: text })
                    : setNewFuelLog({ ...newFuelLog, odometer: text })
                }
                placeholder="0.0"
                keyboardType="numeric"
              />
            </View>
          </View>

          {/* Notes Field */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Notes (Optional)</Text>
            <TextInput
              style={styles.notesInput}
              value={isEditing ? editingLog.note : newFuelLog.note}
              onChangeText={(text) =>
                isEditing
                  ? setEditingLog({ ...editingLog, note: text })
                  : setNewFuelLog({ ...newFuelLog, note: text })
              }
              placeholder="Add any notes about this fuel entry..."
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>

          <View style={styles.totalCostContainer}>
            <Text style={styles.totalCostLabel}>Total Cost:</Text>
            <Text style={styles.totalCostValue}>
              BDT{" "}
              {isEditing
                ? (
                    (parseFloat(editingLog.amount) || 0) *
                    (parseFloat(editingLog.unitCost) || 0)
                  ).toFixed(2)
                : calculateTotalCost()}
            </Text>
          </View>

          {isEditing ? (
            <View style={styles.editButtonsContainer}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={cancelEdit}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.updateButton}
                onPress={handleUpdateFuelLog}
              >
                <Text style={styles.updateButtonText}>Update Entry</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.addButton}
              onPress={handleAddFuelLog}
            >
              <Text style={styles.addButtonText}>Add Fuel Entry</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Fuel History List */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Fuel History</Text>
          {fuelLogs.map((log) => (
            <Pressable
              key={log._id || log.id}
              onLongPress={() => handleLongPress(log._id || log.id)}
              onPress={handlePress}
              style={[
                styles.historyItem,
                selectedLogId === (log._id || log.id) &&
                  styles.selectedHistoryItem,
              ]}
            >
              {/* Action Icons */}
              {selectedLogId === (log._id || log.id) && (
                <View style={styles.actionIcons}>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.editButton]}
                    onPress={() => handleEditFuelLog(log)}
                  >
                    <Ionicons name="pencil" size={18} color="#ffffff" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.deleteButton]}
                    onPress={() => handleDeleteFuelLog(log._id || log.id)}
                  >
                    <Ionicons name="trash" size={18} color="#ffffff" />
                  </TouchableOpacity>
                </View>
              )}

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

              {/* Notes Section */}
              {log.note && (
                <View style={styles.notesSection}>
                  <View style={styles.noteHeader}>
                    <Ionicons
                      name="document-text-outline"
                      size={16}
                      color="#6b7280"
                      style={styles.noteIcon}
                    />
                  </View>
                  <Text style={styles.notesText}>{log.note}</Text>
                </View>
              )}
            </Pressable>
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
    fontWeight: "500",
  },
  input: {
    backgroundColor: "#f9fafb",
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: "#1f2937",
  },
  notesInput: {
    backgroundColor: "#f9fafb",
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: "#1f2937",
    minHeight: 80,
    maxHeight: 120,
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
    alignItems: "center",
  },
  datePickerText: {
    fontSize: 16,
    color: "#1f2937",
  },
  totalCostContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#f0f9f4",
    borderRadius: 10,
    borderColor: "#d1fae5",
    borderWidth: 1,
    marginBottom: 16,
  },
  totalCostLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#065f46",
  },
  totalCostValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#059669",
  },
  addButton: {
    backgroundColor: "#4F46E5",
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: "center",
    elevation: 2,
    shadowColor: "#4F46E5",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  addButtonText: {
    color: "#ffffff",
    fontWeight: "600",
    fontSize: 16,
  },
  editButtonsContainer: {
    flexDirection: "row",
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: "#6b7280",
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: "center",
  },
  cancelButtonText: {
    color: "#ffffff",
    fontWeight: "600",
    fontSize: 16,
  },
  updateButton: {
    flex: 1,
    backgroundColor: "#059669",
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: "center",
  },
  updateButtonText: {
    color: "#ffffff",
    fontWeight: "600",
    fontSize: 16,
  },

  // Updated card layout with selection
  historyItem: {
    borderLeftWidth: 4,
    borderLeftColor: "#10b981",
    borderBottomColor: "#e5e7eb",
    borderBottomWidth: 1,
    marginBottom: 12,
    backgroundColor: "#ffffff",
    borderRadius: 10,
    padding: 16,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    position: "relative",
  },
  selectedHistoryItem: {
    backgroundColor: "#f8f9ff",
    borderColor: "#4F46E5",
    borderWidth: 2,
  },
  actionIcons: {
    position: "absolute",
    top: 8,
    right: 8,
    flexDirection: "row",
    gap: 8,
    zIndex: 1,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  editButton: {
    backgroundColor: "#059669",
  },
  deleteButton: {
    backgroundColor: "#dc2626",
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
    marginBottom: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
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
    fontWeight: "600",
  },
  metaSeparator: {
    width: 1,
    height: 16,
    backgroundColor: "#d1d5db",
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
    flexDirection: "row",
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    backgroundColor: "#f8fafc",
    borderRadius: 8,
    padding: 12,
    marginHorizontal: -4,
  },
  noteHeader: {
    marginBottom: 6,
  },
  noteIcon: {
    marginRight: 6,
  },
  notesText: {
    fontSize: 14,
    color: "#4b5563",
    lineHeight: 20,
    fontStyle: "italic",
  },
});
