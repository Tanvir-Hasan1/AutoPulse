import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

const YearlyCostsBreakdown = ({ monthlyCosts = {} }) => {
  if (!monthlyCosts || Object.keys(monthlyCosts).length === 0) return null;

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Yearly Costs Breakdown</Text>
      {Object.keys(monthlyCosts).sort((a, b) => b.localeCompare(a)).map((year) => (
        <View key={year} style={styles.yearContainer}>
          <View style={styles.yearHeaderRow}>
            <Text style={styles.yearText}>{year}</Text>
            <View style={styles.yearLine} />
          </View>
          
          {monthlyCosts[year].map((item, idx) => (
            <View key={idx} style={styles.costRow}>
              <View style={styles.monthCol}>
                <Text style={styles.monthNameText}>{item.month}</Text>
              </View>
              
              <View style={styles.boxesCol}>
                {/* Fuel Box */}
                <View style={[styles.costBox, styles.fuelCostBox]}>
                  <MaterialCommunityIcons name="gas-station-outline" size={16} color="#2563EB" style={styles.costBoxIcon} />
                  <View>
                    <Text style={styles.costBoxLabel}>Fueling</Text>
                    <Text style={styles.costBoxValue}>৳{item.fuel.toLocaleString()}</Text>
                  </View>
                </View>
                
                {/* Service Box */}
                <View style={[styles.costBox, styles.serviceCostBox]}>
                  <Ionicons name="construct-outline" size={16} color="#10B981" style={styles.costBoxIcon} />
                  <View>
                    <Text style={styles.costBoxLabel}>Service</Text>
                    <Text style={styles.costBoxValue}>৳{item.service.toLocaleString()}</Text>
                  </View>
                </View>
              </View>
            </View>
          ))}
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 12,
    letterSpacing: 0.3,
  },
  yearContainer: {
    marginBottom: 16,
  },
  yearHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  yearText: {
    fontSize: 16,
    fontWeight: "800",
    color: "#1F2937",
    marginRight: 8,
  },
  yearLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#E5E7EB",
  },
  costRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  monthCol: {
    width: 50,
  },
  monthNameText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#4B5563",
  },
  boxesCol: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  costBox: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
  },
  fuelCostBox: {
    backgroundColor: "#EFF6FF",
    borderColor: "#DBEAFE",
  },
  serviceCostBox: {
    backgroundColor: "#ECFDF5",
    borderColor: "#D1FAE5",
  },
  costBoxIcon: {
    marginRight: 8,
  },
  costBoxLabel: {
    fontSize: 9,
    fontWeight: "600",
    color: "#6B7280",
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
  costBoxValue: {
    fontSize: 13,
    fontWeight: "700",
    color: "#1F2937",
  },
});

export default YearlyCostsBreakdown;
