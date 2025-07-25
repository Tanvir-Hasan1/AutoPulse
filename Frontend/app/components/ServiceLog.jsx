import { Ionicons } from "@expo/vector-icons";
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
  Modal,
  Pressable,
  RefreshControl,
} from "react-native";
import { useState, useEffect } from "react";
import { API_BASE_URL } from "../config"; // e.g. http://192.168.x.x:5000/api
import { useUser } from "../contexts/UserContext";
import CalendarModal from "./CalendarModal"; // <-- Make sure you have this import
import Toast from "react-native-toast-message";

const serviceTypes = [
  "Engine Oil Change",
  "General Service",
  "Chain & Sprocket",
  "Brake Service",
  "Tire Replacement",
  "Battery Service",
  "Air Filter Change",
  "Spark Plug Change",
  "Other",
];

export default function ServiceLog({
  serviceLogs,
  setServiceLogs,
  newServiceLog,
  setNewServiceLog,
  showDatePicker,
  openDatePicker,
  formatDisplayDate,
}) {
  const { user } = useUser();
  const bikeId = user.selectedBikeId;
  const [selectedLogId, setSelectedLogId] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editingLog, setEditingLog] = useState(null);
  const [showServiceTypeDropdown, setShowServiceTypeDropdown] = useState(false);
  const [showEditServiceTypeDropdown, setShowEditServiceTypeDropdown] =
    useState(false);
  const [refreshing, setRefreshing] = useState(false);
  // Add state for CalendarModal visibility if not managed by parent
  const [showServiceDatePicker, setShowServiceDatePicker] = useState(false);

  const fetchServiceLogs = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/service/${bikeId}`);
      const data = await res.json();
      if (!res.ok)
        throw new Error(data.message || "Failed to load service logs");

      // Sort logs by date DESC (latest first)
      const sorted = data.sort((a, b) => new Date(b.date) - new Date(a.date));
      setServiceLogs(sorted);
    } catch (error) {
      console.error("Fetch error:", error);
      Alert.alert("Error", "Could not load service logs");
    }
  };

  const handleAddServiceLog = async () => {
    if (!newServiceLog.type || !newServiceLog.cost || !newServiceLog.odometer) {
      Alert.alert("Error", "Please fill required service log fields");
      return;
    }

    const payload = {
      bike: bikeId,
      date: newServiceLog.date,
      serviceType: newServiceLog.type,
      cost: parseFloat(newServiceLog.cost),
      odometer: parseFloat(newServiceLog.odometer),
      nextService: newServiceLog.nextService
        ? parseFloat(newServiceLog.nextService)
        : null,
      description: newServiceLog.description,
    };

    try {
      const res = await fetch(`${API_BASE_URL}/service`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to save");

      await fetchServiceLogs(); // Refresh logs to include new entry

      setNewServiceLog({
        date: new Date().toISOString().split("T")[0],
        type: "",
        cost: "",
        odometer: "",
        nextService: "",
        description: "",
      });

      Toast.show({
        type: "success",
        text1: "Success",
        text2: "Service log added successfully!",
        position: "bottom",
        autoHide: true,
        visibilityTime: 2500,
      });
    } catch (error) {
      console.error("Add service error:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: error.message || "Failed to add service log",
        position: "bottom",
        autoHide: true,
        visibilityTime: 3000,
      });
    }
  };

  const handleDeleteServiceLog = async (logId) => {
    try {
      const res = await fetch(`${API_BASE_URL}/service/${logId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to delete service log");
      }

      setServiceLogs(
        serviceLogs.filter((log) => (log._id || log.id) !== logId)
      );
      setSelectedLogId(null);

      Toast.show({
        type: "success",
        text1: "Deleted",
        text2: "Service log deleted successfully.",
        visibilityTime: 2500,
        position: "bottom",
        autoHide: true,
      });
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: error.message || "Failed to delete service log",
        visibilityTime: 3000,
        position: "bottom",
        autoHide: true,
      });
    }
  };

  const handleEditServiceLog = (log) => {
    setEditingLog({
      id: log._id || log.id,
      date: log.date.split("T")[0], // Format date for input
      type: log.serviceType,
      cost: log.cost.toString(),
      odometer: log.odometer.toString(),
      nextService: log.nextService ? log.nextService.toString() : "",
      description: log.Description || log.description || "", // Handle both cases
    });
    setIsEditing(true);
    setSelectedLogId(null);
  };

  const handleUpdateServiceLog = async () => {
    if (!editingLog.cost || !editingLog.odometer || !editingLog.type) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Please fill all required fields",
        position: "bottom",
        autoHide: true,
        visibilityTime: 2500,
      });
      return;
    }

    const payload = {
      date: editingLog.date,
      serviceType: editingLog.type,
      cost: parseFloat(editingLog.cost),
      odometer: parseFloat(editingLog.odometer),
      nextService: editingLog.nextService
        ? parseFloat(editingLog.nextService)
        : null,
      description: editingLog.description,
    };

    try {
      const res = await fetch(`${API_BASE_URL}/service/${editingLog.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Failed to update");

      // Refresh service logs after update
      await fetchServiceLogs();

      setIsEditing(false);
      setEditingLog(null);

      Toast.show({
        type: "success",
        text1: "Success",
        text2: "Service log updated successfully!",
        position: "bottom",
        autoHide: true,
        visibilityTime: 2500,
      });
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: error.message || "Failed to update service log",
        position: "bottom",
        autoHide: true,
        visibilityTime: 3000,
      });
    }
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setEditingLog(null);
  };

  const handleServiceTypeSelect = (type) => {
    if (isEditing) {
      setEditingLog({ ...editingLog, type });
      setShowEditServiceTypeDropdown(false);
    } else {
      setNewServiceLog({ ...newServiceLog, type });
      setShowServiceTypeDropdown(false);
    }
  };

  const handleLongPress = (logId) => {
    setSelectedLogId(logId);
  };

  const handlePress = () => {
    if (selectedLogId) {
      setSelectedLogId(null);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchServiceLogs();
    setRefreshing(false);
  };

  // Date select handler for both add and edit
  const handleServiceDateSelect = (date) => {
    if (isEditing) {
      setEditingLog((prev) => ({ ...prev, date }));
    } else {
      setNewServiceLog((prev) => ({ ...prev, date }));
    }
    setShowServiceDatePicker(false);
  };

  useEffect(() => {
    if (bikeId) fetchServiceLogs();
  }, [bikeId]);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <ScrollView
        keyboardShouldPersistTaps="always"
        contentContainerStyle={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.card}>
          <Text style={styles.cardTitle}>
            {isEditing ? "Edit Service Entry" : "Add Service Entry"}
          </Text>

          <View style={styles.inputRow}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Date</Text>
              <TouchableOpacity
                style={styles.datePickerButton}
                onPress={() => setShowServiceDatePicker(true)}
              >
                <Text style={styles.datePickerText}>
                  {isEditing
                    ? formatDisplayDate(editingLog?.date)
                    : formatDisplayDate(newServiceLog.date)}
                </Text>
                <Ionicons name="calendar" size={20} color="#6b7280" />
              </TouchableOpacity>
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Service Type *</Text>
              <TouchableOpacity
                style={styles.dropdownButton}
                onPress={() =>
                  isEditing
                    ? setShowEditServiceTypeDropdown(true)
                    : setShowServiceTypeDropdown(true)
                }
              >
                <Text
                  style={[
                    styles.dropdownButtonText,
                    !(isEditing ? editingLog?.type : newServiceLog.type) &&
                      styles.dropdownPlaceholder,
                  ]}
                >
                  {(isEditing ? editingLog?.type : newServiceLog.type) ||
                    "Select service type"}
                </Text>
                <Ionicons name="chevron-down" size={16} color="#6b7280" />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.inputRow}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Cost (BDT) *</Text>
              <TextInput
                style={styles.input}
                value={isEditing ? editingLog?.cost : newServiceLog.cost}
                onChangeText={(text) =>
                  isEditing
                    ? setEditingLog({ ...editingLog, cost: text })
                    : setNewServiceLog({ ...newServiceLog, cost: text })
                }
                placeholder="0.00"
                keyboardType="numeric"
                autoComplete="off"
                importantForAutofill="no"
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Odometer (km) *</Text>
              <TextInput
                style={styles.input}
                value={
                  isEditing ? editingLog?.odometer : newServiceLog.odometer
                }
                onChangeText={(text) =>
                  isEditing
                    ? setEditingLog({ ...editingLog, odometer: text })
                    : setNewServiceLog({ ...newServiceLog, odometer: text })
                }
                placeholder="0"
                keyboardType="numeric"
                autoComplete="off"
                importantForAutofill="no"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Next Service (km)</Text>
            <TextInput
              style={styles.input}
              value={
                isEditing ? editingLog?.nextService : newServiceLog.nextService
              }
              onChangeText={(text) =>
                isEditing
                  ? setEditingLog({ ...editingLog, nextService: text })
                  : setNewServiceLog({ ...newServiceLog, nextService: text })
              }
              placeholder="Optional"
              keyboardType="numeric"
              autoComplete="off"
              importantForAutofill="no"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={
                isEditing ? editingLog?.description : newServiceLog.description
              }
              onChangeText={(text) =>
                isEditing
                  ? setEditingLog({ ...editingLog, description: text })
                  : setNewServiceLog({ ...newServiceLog, description: text })
              }
              placeholder="Service details..."
              multiline
              numberOfLines={3}
            />
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
                onPress={handleUpdateServiceLog}
              >
                <Text style={styles.updateButtonText}>Update Entry</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.addButton}
              onPress={handleAddServiceLog}
            >
              <Text style={styles.addButtonText}>Add Service Entry</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Service History</Text>
          {serviceLogs.map((log) => (
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
                    onPress={() => handleEditServiceLog(log)}
                  >
                    <Ionicons name="pencil" size={18} color="#ffffff" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.deleteButton]}
                    onPress={() => handleDeleteServiceLog(log._id || log.id)}
                  >
                    <Ionicons name="trash" size={18} color="#ffffff" />
                  </TouchableOpacity>
                </View>
              )}

              <View style={styles.historyHeader}>
                <View style={styles.metaItem}>
                  <Ionicons
                    name="calendar-outline"
                    size={16}
                    color="#6b7280"
                    style={styles.metaIcon}
                  />
                  <Text style={styles.historyDate}>
                    {formatDisplayDate(log.date)}
                  </Text>
                </View>
                <Text style={styles.historyCost}>
                  BDT {log.cost.toFixed(2)}
                </Text>
              </View>

              <Text style={styles.serviceType}>{log.serviceType}</Text>

              <View style={styles.historyDetails}>
                <View style={styles.detailRow}>
                  <View
                    style={[
                      styles.colorIndicator,
                      { backgroundColor: "#f97316" },
                    ]}
                  />
                  <Text style={styles.historyDetail}>
                    Odometer: {log.odometer} km
                  </Text>
                </View>
                {log.nextService && (
                  <View style={styles.detailRow}>
                    <View
                      style={[
                        styles.colorIndicator,
                        { backgroundColor: "#22c55e" },
                      ]}
                    />
                    <Text style={styles.historyDetail}>
                      Next Service: {log.nextService} km
                    </Text>
                  </View>
                )}
              </View>

              {(log.Description || log.description) && (
                <View style={styles.descriptionSection}>
                  <View style={styles.noteHeader}>
                    <Ionicons
                      name="document-text-outline"
                      size={16}
                      color="#6b7280"
                      style={styles.noteIcon}
                    />
                  </View>
                  <Text style={styles.serviceDescription}>
                    {log.Description || log.description}
                  </Text>
                </View>
              )}
            </Pressable>
          ))}
        </View>
      </ScrollView>

      {/* Calendar Modal for both add and edit */}
      <CalendarModal
        visible={showServiceDatePicker}
        onClose={() => setShowServiceDatePicker(false)}
        onSelect={handleServiceDateSelect}
        title="Select Service Date"
        selectedDate={isEditing ? editingLog?.date : newServiceLog.date}
      />

      {/* Service Type Dropdown Modal */}
      <Modal
        visible={showServiceTypeDropdown || showEditServiceTypeDropdown}
        transparent={true}
        animationType="fade"
        onRequestClose={() => {
          setShowServiceTypeDropdown(false);
          setShowEditServiceTypeDropdown(false);
        }}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => {
            setShowServiceTypeDropdown(false);
            setShowEditServiceTypeDropdown(false);
          }}
        >
          <View style={styles.dropdownModal}>
            <View style={styles.dropdownHeader}>
              <Text style={styles.dropdownTitle}>Select Service Type</Text>
              <TouchableOpacity
                onPress={() => {
                  setShowServiceTypeDropdown(false);
                  setShowEditServiceTypeDropdown(false);
                }}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.dropdownList}>
              {serviceTypes.map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.dropdownItem,
                    (isEditing ? editingLog?.type : newServiceLog.type) ===
                      type && styles.dropdownItemSelected,
                  ]}
                  onPress={() => handleServiceTypeSelect(type)}
                >
                  <Text
                    style={[
                      styles.dropdownItemText,
                      (isEditing ? editingLog?.type : newServiceLog.type) ===
                        type && styles.dropdownItemTextSelected,
                    ]}
                  >
                    {type}
                  </Text>
                  {(isEditing ? editingLog?.type : newServiceLog.type) ===
                    type && (
                    <Ionicons name="checkmark" size={20} color="#4F46E5" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
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
  inputRow: {
    flexDirection: "row",
    gap: 12,
  },
  inputGroup: {
    flex: 1,
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: "#ffffff",
  },
  textArea: {
    height: 80,
    textAlignVertical: "top",
  },
  datePickerButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#ffffff",
    height: 44,
  },
  datePickerText: {
    fontSize: 16,
    color: "#1f2937",
  },
  dropdownButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 10,
    backgroundColor: "#ffffff",
    height: 44,
  },
  dropdownButtonText: {
    fontSize: 16,
    color: "#1f2937",
  },
  dropdownPlaceholder: {
    color: "#9ca3af",
  },
  addButton: {
    backgroundColor: "#4F46E5",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
  },
  addButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  editButtonsContainer: {
    flexDirection: "row",
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: "#6b7280",
    borderRadius: 8,
    paddingVertical: 12,
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
    paddingVertical: 12,
    alignItems: "center",
  },
  updateButtonText: {
    color: "#ffffff",
    fontWeight: "600",
    fontSize: 16,
  },
  historyItem: {
    padding: 16,
    backgroundColor: "#f9fafb",
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: "#4F46E5",
    marginBottom: 12,
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
  historyHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  metaIcon: {
    marginRight: 6,
  },
  historyDate: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1f2937",
  },
  historyCost: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#059669",
  },
  serviceType: {
    fontSize: 16,
    fontWeight: "600",
    color: "#4F46E5",
    marginVertical: 4,
  },
  historyDetails: {
    marginVertical: 8,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  colorIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  historyDetail: {
    fontSize: 12,
    color: "#6b7280",
  },
  descriptionSection: {
    flexDirection: "row",
    marginTop: 12,
    paddingTop: 12,
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
  serviceDescription: {
    fontSize: 14,
    color: "#6b7280",
    fontStyle: "italic",
    lineHeight: 20,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  dropdownModal: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    width: "100%",
    maxHeight: "70%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  dropdownHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  dropdownTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1f2937",
  },
  closeButton: {
    padding: 4,
  },
  dropdownList: {
    maxHeight: 300,
  },
  dropdownItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  dropdownItemSelected: {
    backgroundColor: "#f3f4f6",
  },
  dropdownItemText: {
    fontSize: 16,
    color: "#1f2937",
  },
  dropdownItemTextSelected: {
    color: "#4F46E5",
    fontWeight: "500",
  },
});
