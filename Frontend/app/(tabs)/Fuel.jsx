import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  Platform,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import CalendarModal from "../components/CalendarModal";
import FuelLog from "../components/FuelLog";
import ServiceLog from "../components/ServiceLog";
import { formatDisplayDate } from "../utils/dateHelpers";

export default function FuelServiceTracker() {
  const [activeTab, setActiveTab] = useState("fuel");

  const [fuelLevel, setFuelLevel] = useState(65);
  const [showFuelDatePicker, setShowFuelDatePicker] = useState(false);
  const [showServiceDatePicker, setShowServiceDatePicker] = useState(false);

  const [fuelLogs, setFuelLogs] = useState([]);
  const [serviceLogs, setServiceLogs] = useState([]);

  const [newFuelLog, setNewFuelLog] = useState({
    date: new Date().toISOString().split("T")[0],
    amount: "",
    unitCost: "",
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

  const handleFuelDateSelect = (date) => {
    setNewFuelLog({ ...newFuelLog, date });
  };

  const handleServiceDateSelect = (date) => {
    setNewServiceLog({ ...newServiceLog, date });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle={Platform.OS === "android" ? "dark-content" : "dark-content"}
        backgroundColor="#f8fafc"
      />

      <Text style={styles.title}>Fuel & Service Management</Text>

      <View style={styles.tabContainer}>
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

      <View style={{ flex: 1 }}>
        <View
          style={{ display: activeTab === "fuel" ? "flex" : "none", flex: 1 }}
        >
          <FuelLog
            fuelLogs={fuelLogs}
            setFuelLogs={setFuelLogs}
            newFuelLog={newFuelLog}
            setNewFuelLog={setNewFuelLog}
            setFuelLevel={setFuelLevel}
            fuelLevel={fuelLevel}
            showDatePicker={showFuelDatePicker}
            openDatePicker={() => setShowFuelDatePicker(true)}
            formatDisplayDate={formatDisplayDate}
          />
        </View>
        <View
          style={{
            display: activeTab === "service" ? "flex" : "none",
            flex: 1,
          }}
        >
          <ServiceLog
            serviceLogs={serviceLogs}
            setServiceLogs={setServiceLogs}
            newServiceLog={newServiceLog}
            setNewServiceLog={setNewServiceLog}
            showDatePicker={showServiceDatePicker}
            openDatePicker={() => setShowServiceDatePicker(true)}
            formatDisplayDate={formatDisplayDate}
          />
        </View>
      </View>

      <CalendarModal
        visible={showFuelDatePicker}
        onClose={() => setShowFuelDatePicker(false)}
        onSelect={handleFuelDateSelect}
        title="Select Fuel Date"
        selectedDate={newFuelLog.date}
      />

      <CalendarModal
        visible={showServiceDatePicker}
        onClose={() => setShowServiceDatePicker(false)}
        onSelect={handleServiceDateSelect}
        title="Select Service Date"
        selectedDate={newServiceLog.date}
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
  tabText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: "500",
    color: "#9CA3AF",
  },
  activeTab: {
    backgroundColor: "#ffffff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  activeTabText: {
    color: "#4F46E5",
  },
});
