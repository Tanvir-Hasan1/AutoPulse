import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  Alert,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function FuelServiceTracker() {
  const [activeTab, setActiveTab] = useState("meter");
  const [fuelLevel, setFuelLevel] = useState(65);
  const [showFuelDatePicker, setShowFuelDatePicker] = useState(false);
  const [showServiceDatePicker, setShowServiceDatePicker] = useState(false);

  const [fuelLogs, setFuelLogs] = useState([
    {
      id: 1,
      date: "2024-03-15",
      amount: 5.2,
      cost: 260,
      mileage: 42.5,
      odometer: 12500,
    },
    {
      id: 2,
      date: "2024-03-08",
      amount: 4.8,
      cost: 240,
      mileage: 43.2,
      odometer: 12300,
    },
  ]);

  const [serviceLogs, setServiceLogs] = useState([
    {
      id: 1,
      date: "2024-02-20",
      type: "Engine Oil Change",
      cost: 800,
      odometer: 12000,
      nextService: 13000,
      description: "Changed engine oil and filter",
    },
    {
      id: 2,
      date: "2024-01-15",
      type: "General Service",
      cost: 1200,
      odometer: 11500,
      nextService: 12500,
      description: "Complete bike service and chain cleaning",
    },
  ]);

  const [newFuelLog, setNewFuelLog] = useState({
    date: new Date().toISOString().split("T")[0],
    amount: "",
    costPerLiter: "", // Changed from 'cost' to 'costPerLiter'
    odometer: "",
  });

  const [newServiceLog, setNewServiceLog] = useState({
    date: new Date().toISOString().split("T")[0],
    type: "",
    cost: "",
    odometer: "",
    nextService: "",
    description: "",
  });

  const formatDate = (date) => {
    return date.toISOString().split("T")[0];
  };

  const formatDisplayDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const generateDateOptions = () => {
    const dates = [];
    const today = new Date();

    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      dates.push(date);
    }

    return dates;
  };
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

  const handleAddFuelLog = () => {
    if (!newFuelLog.amount || !newFuelLog.cost || !newFuelLog.odometer) {
      Alert.alert("Error", "Please fill all fuel log fields");
      return;
    }

    const amount = parseFloat(newFuelLog.amount);
    const cost = parseFloat(newFuelLog.cost);
    const odometer = parseFloat(newFuelLog.odometer);

    // Calculate mileage based on previous entry
    let mileage = 0;
    if (fuelLogs.length > 0) {
      const lastLog = fuelLogs[0];
      const distance = odometer - lastLog.odometer;
      mileage = distance / amount;
    }

    const newLog = {
      id: Date.now(),
      date: newFuelLog.date,
      amount,
      cost,
      mileage: Math.max(0, mileage),
      odometer,
    };

    setFuelLogs([newLog, ...fuelLogs]);
    setNewFuelLog({
      date: new Date().toISOString().split("T")[0],
      amount: "",
      cost: "",
      odometer: "",
    });

    // Update fuel level (assuming 15L tank capacity)
    setFuelLevel(Math.min(100, fuelLevel + (amount / 15) * 100));
    Alert.alert("Success", "Fuel entry added successfully!");
  };

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

  const calculateAvgMileage = () => {
    if (fuelLogs.length === 0) return 0;
    const validMileages = fuelLogs.filter((log) => log.mileage > 0);
    if (validMileages.length === 0) return 0;
    const sum = validMileages.reduce((acc, log) => acc + log.mileage, 0);
    return (sum / validMileages.length).toFixed(1);
  };

  const calculateCostPerKm = () => {
    if (fuelLogs.length === 0) return 0;
    const totalCost = fuelLogs.reduce((acc, log) => acc + log.cost, 0);
    const totalDistance = fuelLogs.reduce(
      (acc, log) => acc + log.amount * log.mileage,
      0
    );
    return totalDistance > 0 ? (totalCost / totalDistance).toFixed(2) : 0;
  };

  const FuelMeter = () => (
    <ScrollView style={styles.tabContent}>
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
    </ScrollView>
  );

  const FuelLog = () => (
    <ScrollView style={styles.tabContent}>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Add Fuel Entry</Text>
        <Text style={styles.cardDescription}>
          Record your fuel refill details
        </Text>

        <View style={styles.inputContainer}>
          <View style={styles.inputRow}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Date</Text>
              <TouchableOpacity
                style={styles.datePickerButton}
                onPress={() => setShowFuelDatePicker(true)}
              >
                <Text style={styles.datePickerText}>
                  {formatDisplayDate(newFuelLog.date)}
                </Text>
                <Ionicons name="calendar" size={20} color="#6b7280" />
              </TouchableOpacity>
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Fuel Amount (L)</Text>
              <TextInput
                style={styles.input}
                value={newFuelLog.amount}
                onChangeText={(text) =>
                  setNewFuelLog({ ...newFuelLog, amount: text })
                }
                placeholder="0.0"
                keyboardType="numeric"
              />
            </View>
          </View>

          <View style={styles.inputRow}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Total Cost (BDT)</Text>
              <TextInput
                style={styles.input}
                value={newFuelLog.cost}
                onChangeText={(text) =>
                  setNewFuelLog({ ...newFuelLog, cost: text })
                }
                placeholder="0.00"
                keyboardType="numeric"
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
                placeholder="0"
                keyboardType="numeric"
              />
            </View>
          </View>

          <TouchableOpacity style={styles.addButton} onPress={handleAddFuelLog}>
            <Text style={styles.addButtonText}>Add Fuel Entry</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Fuel History</Text>
        <View style={styles.historyContainer}>
          {fuelLogs.map((log) => (
            <View key={log.id} style={styles.historyItem}>
              <View style={styles.historyHeader}>
                <Text style={styles.historyDate}>{log.date}</Text>
                <Text style={styles.historyCost}>
                  BDT {log.cost.toFixed(2)}
                </Text>
              </View>
              <View style={styles.historyDetails}>
                <Text style={styles.historyDetail}>
                  Amount: {log.amount.toFixed(1)}L
                </Text>
                <Text style={styles.historyDetail}>
                  Mileage: {log.mileage.toFixed(1)} km/L
                </Text>
                <Text style={styles.historyDetail}>
                  Odometer: {log.odometer} km
                </Text>
              </View>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );

  const DatePickerModal = ({ visible, onClose, onSelect, title }) => (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{title}</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#6b7280" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.dateList}>
            {generateDateOptions().map((date, index) => (
              <TouchableOpacity
                key={index}
                style={styles.dateOption}
                onPress={() => {
                  onSelect(formatDate(date));
                  onClose();
                }}
              >
                <Text style={styles.dateOptionText}>
                  {formatDisplayDate(formatDate(date))}
                </Text>
                <Text style={styles.dateOptionDay}>
                  {date.toLocaleDateString("en-IN", { weekday: "short" })}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  const ServiceLog = () => (
    <ScrollView style={styles.tabContent}>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Add Service Entry</Text>
        <Text style={styles.cardDescription}>
          Record your bike service details
        </Text>

        <View style={styles.inputContainer}>
          <View style={styles.inputRow}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Date</Text>
              <TouchableOpacity
                style={styles.datePickerButton}
                onPress={() => setShowServiceDatePicker(true)}
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
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Service History</Text>
        <View style={styles.historyContainer}>
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
      </View>
    </ScrollView>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Fuel & Service Management</Text>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "meter" && styles.activeTab]}
          onPress={() => setActiveTab("meter")}
        >
          <Ionicons
            name="speedometer"
            size={20}
            color={activeTab === "meter" ? "#4F46E5" : "#9CA3AF"}
          />
          <Text
            style={[
              styles.tabText,
              activeTab === "meter" && styles.activeTabText,
            ]}
          >
            Fuel Meter
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === "fuel" && styles.activeTab]}
          onPress={() => setActiveTab("fuel")}
        >
          <Ionicons
            name="car"
            size={20}
            color={activeTab === "fuel" ? "#4F46E5" : "#9CA3AF"}
          />
          <Text
            style={[
              styles.tabText,
              activeTab === "fuel" && styles.activeTabText,
            ]}
          >
            Fuel Log
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === "service" && styles.activeTab]}
          onPress={() => setActiveTab("service")}
        >
          <Ionicons
            name="construct"
            size={20}
            color={activeTab === "service" ? "#4F46E5" : "#9CA3AF"}
          />
          <Text
            style={[
              styles.tabText,
              activeTab === "service" && styles.activeTabText,
            ]}
          >
            Service Log
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === "meter" && <FuelMeter />}
      {activeTab === "fuel" && <FuelLog />}
      {activeTab === "service" && <ServiceLog />}

      <DatePickerModal
        visible={showFuelDatePicker}
        onClose={() => setShowFuelDatePicker(false)}
        onSelect={(date) => setNewFuelLog({ ...newFuelLog, date })}
        title="Select Fuel Date"
      />

      <DatePickerModal
        visible={showServiceDatePicker}
        onClose={() => setShowServiceDatePicker(false)}
        onSelect={(date) => setNewServiceLog({ ...newServiceLog, date })}
        title="Select Service Date"
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginVertical: 20,
    color: "#1f2937",
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#e5e7eb",
    margin: 16,
    borderRadius: 8,
    padding: 4,
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  activeTab: {
    backgroundColor: "#ffffff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tabText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: "500",
    color: "#9CA3AF",
  },
  activeTabText: {
    color: "#4F46E5",
  },
  tabContent: {
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
  inputContainer: {
    gap: 16,
  },
  inputRow: {
    flexDirection: "row",
    gap: 12,
  },
  inputGroup: {
    flex: 1,
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
    marginTop: 8,
  },
  addButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  historyContainer: {
    gap: 12,
  },
  historyItem: {
    padding: 16,
    backgroundColor: "#f9fafb",
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: "#4F46E5",
  },
  historyHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
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
  historyDetails: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginTop: 4,
  },
  historyDetail: {
    fontSize: 12,
    color: "#6b7280",
  },
  serviceType: {
    fontSize: 16,
    fontWeight: "600",
    color: "#4F46E5",
    marginBottom: 4,
  },
  serviceDescription: {
    fontSize: 14,
    color: "#6b7280",
    marginTop: 8,
    fontStyle: "italic",
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
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "70%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1f2937",
  },
  dateList: {
    paddingHorizontal: 20,
  },
  dateOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  dateOptionText: {
    fontSize: 16,
    color: "#1f2937",
  },
  dateOptionDay: {
    fontSize: 14,
    color: "#6b7280",
  },
});
