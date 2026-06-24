import { Ionicons } from "@expo/vector-icons";
import { useState, useEffect } from "react";
import {
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Pressable,
} from "react-native";
import * as Haptics from "expo-haptics";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import CalendarModal from "../../components/CalendarModal";
import FuelLog from "../../components/FuelLog";
import ServiceLog from "../../components/ServiceLog";
import formatDisplayDate from "../utils/dateHelpers";
import { useAuthStore } from "../../store/useAuthStore";

export default function FuelServiceTracker() {
  const bikeId = useAuthStore((s) => s.selectedBikeId);
  const [activeTab, setActiveTab] = useState("fuel");

  const [containerWidth, setContainerWidth] = useState(0);
  const activeTabTranslateX = useSharedValue(0);

  useEffect(() => {
    activeTabTranslateX.value = withSpring(activeTab === "fuel" ? 0 : 1, {
      damping: 20,
      stiffness: 250,
      overshootClamping: true,
    });
  }, [activeTab]);

  const animatedPillStyle = useAnimatedStyle(() => {
    const tabWidth = (containerWidth - 8) / 2;
    return {
      transform: [
        {
          translateX: activeTabTranslateX.value * tabWidth,
        },
      ],
    };
  });

  const fuelTabScale = useSharedValue(1);
  const serviceTabScale = useSharedValue(1);

  const fuelTabStyle = useAnimatedStyle(() => {
    const targetScale = activeTab === "fuel" ? 1.04 : 0.96;
    return {
      transform: [
        {
          scale: withSpring(fuelTabScale.value * targetScale, {
            damping: 15,
            stiffness: 250,
            overshootClamping: true,
          }),
        },
      ],
    };
  });

  const serviceTabStyle = useAnimatedStyle(() => {
    const targetScale = activeTab === "service" ? 1.04 : 0.96;
    return {
      transform: [
        {
          scale: withSpring(serviceTabScale.value * targetScale, {
            damping: 15,
            stiffness: 250,
            overshootClamping: true,
          }),
        },
      ],
    };
  });

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

      <View
        style={styles.tabContainer}
        onLayout={(e) => setContainerWidth(e.nativeEvent.layout.width)}
      >
        {containerWidth > 0 && (
          <Animated.View
            style={[
              styles.activeTabPill,
              {
                width: (containerWidth - 8) / 2,
              },
              animatedPillStyle,
            ]}
          />
        )}

        <Pressable
          style={styles.tab}
          onPressIn={() => {
            fuelTabScale.value = withSpring(0.92, { damping: 10 });
          }}
          onPressOut={() => {
            fuelTabScale.value = withSpring(1, { damping: 10 });
          }}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setActiveTab("fuel");
          }}
        >
          <Animated.View style={[styles.tabContent, fuelTabStyle]}>
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
          </Animated.View>
        </Pressable>

        <Pressable
          style={styles.tab}
          onPressIn={() => {
            serviceTabScale.value = withSpring(0.92, { damping: 10 });
          }}
          onPressOut={() => {
            serviceTabScale.value = withSpring(1, { damping: 10 });
          }}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setActiveTab("service");
          }}
        >
          <Animated.View style={[styles.tabContent, serviceTabStyle]}>
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
          </Animated.View>
        </Pressable>
      </View>

      <View style={{ flex: 1 }}>
        <View
          style={{ display: activeTab === "fuel" ? "flex" : "none", flex: 1 }}
        >
          <FuelLog
            bikeId={bikeId}
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
            bikeId={bikeId}
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
    position: "relative",
    height: 48,
    overflow: "hidden",
  },
  tab: {
    flex: 1,
    borderRadius: 6,
    zIndex: 1,
    height: "100%",
  },
  tabContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    height: "100%",
  },
  tabText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: "500",
    color: "#9CA3AF",
  },
  activeTabPill: {
    position: "absolute",
    top: 4,
    bottom: 4,
    left: 4,
    backgroundColor: "#ffffff",
    borderRadius: 6,
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
