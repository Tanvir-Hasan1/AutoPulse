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
} from "react-native";

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
  const handleAddServiceLog = () => {
    if (!newServiceLog.type || !newServiceLog.cost || !newServiceLog.odometer) {
      Alert.alert("Error", "Please fill required service log fields");
      return;
    }

    const newLog = {
      id: Date.now(),
      date: newServiceLog.date,
      type: newServiceLog.type,
      cost: parseFloat(newServiceLog.cost),
      odometer: parseFloat(newServiceLog.odometer),
      nextService: newServiceLog.nextService
        ? parseFloat(newServiceLog.nextService)
        : null,
      description: newServiceLog.description,
    };

    setServiceLogs([newLog, ...serviceLogs]);
    setNewServiceLog({
      date: new Date().toISOString().split("T")[0],
      type: "",
      cost: "",
      odometer: "",
      nextService: "",
      description: "",
    });

    Alert.alert("Success", "Service entry added successfully!");
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <ScrollView
        keyboardShouldPersistTaps="always"
        contentContainerStyle={styles.container}
      >
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Add Service Entry</Text>
          <Text style={styles.cardDescription}>
            Record your bike service details
          </Text>

          <View style={styles.inputRow}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Date</Text>
              <TouchableOpacity
                style={styles.datePickerButton}
                onPress={openDatePicker}
              >
                <Text style={styles.datePickerText}>
                  {formatDisplayDate(newServiceLog.date)}
                </Text>
                <Ionicons name="calendar" size={20} color="#6b7280" />
              </TouchableOpacity>
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Service Type *</Text>
              <View style={styles.pickerContainer}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {serviceTypes.map((type) => (
                    <TouchableOpacity
                      key={type}
                      style={[
                        styles.serviceTypeButton,
                        newServiceLog.type === type &&
                          styles.serviceTypeButtonActive,
                      ]}
                      onPress={() =>
                        setNewServiceLog({ ...newServiceLog, type })
                      }
                    >
                      <Text
                        style={[
                          styles.serviceTypeText,
                          newServiceLog.type === type &&
                            styles.serviceTypeTextActive,
                        ]}
                      >
                        {type}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </View>
          </View>

          <View style={styles.inputRow}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Cost (BDT) *</Text>
              <TextInput
                style={styles.input}
                value={newServiceLog.cost}
                onChangeText={(text) =>
                  setNewServiceLog({ ...newServiceLog, cost: text })
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
                value={newServiceLog.odometer}
                onChangeText={(text) =>
                  setNewServiceLog({ ...newServiceLog, odometer: text })
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
              value={newServiceLog.nextService}
              onChangeText={(text) =>
                setNewServiceLog({ ...newServiceLog, nextService: text })
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
              value={newServiceLog.description}
              onChangeText={(text) =>
                setNewServiceLog({ ...newServiceLog, description: text })
              }
              placeholder="Service details..."
              multiline
              numberOfLines={3}
            />
          </View>

          <TouchableOpacity
            style={styles.addButton}
            onPress={handleAddServiceLog}
          >
            <Text style={styles.addButtonText}>Add Service Entry</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Service History</Text>
          {serviceLogs.map((log) => (
            <View key={log.id} style={styles.historyItem}>
              <View style={styles.historyHeader}>
                <Text style={styles.historyDate}>{log.date}</Text>
                <Text style={styles.historyCost}>
                  BDT {log.cost.toFixed(2)}
                </Text>
              </View>
              <Text style={styles.serviceType}>{log.type}</Text>
              <View style={styles.historyDetails}>
                <Text style={styles.historyDetail}>
                  Odometer: {log.odometer} km
                </Text>
                {log.nextService && (
                  <Text style={styles.historyDetail}>
                    Next Service: {log.nextService} km
                  </Text>
                )}
              </View>
              {log.description && (
                <Text style={styles.serviceDescription}>{log.description}</Text>
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
    paddingVertical: 12,
    backgroundColor: "#ffffff",
  },
  datePickerText: {
    fontSize: 16,
    color: "#1f2937",
  },
  pickerContainer: {
    marginTop: 8,
  },
  serviceTypeButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#f3f4f6",
    marginRight: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  serviceTypeButtonActive: {
    backgroundColor: "#4F46E5",
    borderColor: "#4F46E5",
  },
  serviceTypeText: {
    fontSize: 12,
    color: "#6b7280",
    fontWeight: "500",
  },
  serviceTypeTextActive: {
    color: "#ffffff",
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
  historyItem: {
    padding: 16,
    backgroundColor: "#f9fafb",
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: "#4F46E5",
    marginBottom: 12,
  },
  historyHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
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
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  historyDetail: {
    fontSize: 12,
    color: "#6b7280",
  },
  serviceDescription: {
    fontSize: 14,
    color: "#6b7280",
    marginTop: 8,
    fontStyle: "italic",
  },
});
