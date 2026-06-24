import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  StyleSheet,
  Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { BarChart, LineChart, PieChart } from "react-native-chart-kit";

const monthNames = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

const FullscreenChartModal = ({
  visible,
  onClose,
  fullscreenChart,
  visiblePieData = [],
  pieData = [],
  fuelPriceTrend = [],
  fuelConsumptionTrend = [],
  monthlyExpenseTrend = [],
  themeColors = {},
}) => {
  const screenWidth = Dimensions.get("window").width;
  const screenHeight = Dimensions.get("window").height;

  // Landscape calculations for fullscreen modal preview
  const landscapeWidth = screenHeight - 80;
  const landscapeHeight = screenWidth - 32;
  const landscapeChartWidth = landscapeWidth - 40;
  const landscapeChartHeight = landscapeHeight - 85;

  const chartConfig = {
    backgroundGradientFrom: themeColors.cardBackground,
    backgroundGradientTo: themeColors.cardBackground,
    backgroundGradientFromOpacity: 0,
    backgroundGradientToOpacity: 0,
    color: (opacity = 1) => `rgba(37, 99, 235, ${opacity})`,
    labelColor: () => themeColors.chartText,
    strokeWidth: 2,
    barPercentage: 0.5,
    decimalPlaces: 0,
    propsForDots: {
      r: "4",
      strokeWidth: "1",
      stroke: "#2563EB",
    },
  };

  const lineChartConfig = {
    ...chartConfig,
  };

  const barChartConfig = {
    ...chartConfig,
    color: (opacity = 1) => `rgba(16, 185, 129, ${opacity})`, // Green bars for consumption
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View
          style={[
            styles.fullscreenModalContainer,
            {
              backgroundColor: themeColors.cardBackground,
              width: landscapeWidth,
              height: landscapeHeight,
            },
          ]}
        >
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: themeColors.title }]}>
              {fullscreenChart?.title}
            </Text>
            <TouchableOpacity
              style={[styles.closeButton, { backgroundColor: themeColors.border }]}
              onPress={onClose}
            >
              <Ionicons name="close" size={20} color={themeColors.textPrimary} />
            </TouchableOpacity>
          </View>

          <View style={styles.modalContent}>
            {fullscreenChart?.type === "ratio" && visiblePieData.length > 0 && (
              <View style={styles.modalPieRowLayout}>
                <View style={styles.modalPieWrapper}>
                  <PieChart
                    data={visiblePieData}
                    width={landscapeChartWidth * 0.55}
                    height={landscapeChartHeight}
                    chartConfig={{
                      ...chartConfig,
                      color: (opacity = 1) => `rgba(37, 99, 235, ${opacity})`,
                    }}
                    accessor="population"
                    backgroundColor="transparent"
                    paddingLeft="15"
                    hasLegend={false}
                  />
                </View>
                <View style={styles.modalLegendContainer}>
                  {pieData.map((item, idx) => (
                    <View key={idx} style={styles.modalLegendRow}>
                      <View style={[styles.legendDot, { backgroundColor: item.color }]} />
                      <View>
                        <Text style={[styles.modalLegendLabel, { color: themeColors.textSecondary }]}>{item.name}</Text>
                        <Text style={[styles.modalLegendVal, { color: themeColors.textPrimary }]}>
                          {item.population.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 2 })} BDT
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {fullscreenChart?.type === "price" && fuelPriceTrend.length > 0 && (
              <LineChart
                data={{
                  labels: fuelPriceTrend.map((d) => {
                    const parts = d.date.split("-");
                    const monthIndex = parseInt(parts[1], 10) - 1;
                    return `${monthNames[monthIndex]} ${parts[2]}`;
                  }),
                  datasets: [{ data: fuelPriceTrend.map((d) => d.unitCost) }],
                }}
                width={landscapeChartWidth}
                height={landscapeChartHeight}
                chartConfig={{
                  ...lineChartConfig,
                  backgroundGradientFrom: themeColors.cardBackground,
                  backgroundGradientTo: themeColors.cardBackground,
                  decimalPlaces: 1,
                }}
                bezier
                style={styles.modalChart}
              />
            )}

            {fullscreenChart?.type === "consumption" && fuelConsumptionTrend.length > 0 && (
              <BarChart
                data={{
                  labels: fuelConsumptionTrend.map((d) => {
                    const parts = d.month.split("-");
                    return monthNames[parseInt(parts[1], 10) - 1];
                  }),
                  datasets: [{ data: fuelConsumptionTrend.map((d) => d.litres) }],
                }}
                width={landscapeChartWidth}
                height={landscapeChartHeight}
                chartConfig={{
                  ...barChartConfig,
                  backgroundGradientFrom: themeColors.cardBackground,
                  backgroundGradientTo: themeColors.cardBackground,
                  decimalPlaces: 1,
                }}
                style={styles.modalChart}
              />
            )}

            {fullscreenChart?.type === "expense" && monthlyExpenseTrend.length > 0 && (
              <LineChart
                data={{
                  labels: monthlyExpenseTrend.map((d) => {
                    const parts = d.month.split("-");
                    return monthNames[parseInt(parts[1], 10) - 1];
                  }),
                  datasets: [{ data: monthlyExpenseTrend.map((d) => d.spending) }],
                }}
                width={landscapeChartWidth}
                height={landscapeChartHeight}
                chartConfig={{
                  ...lineChartConfig,
                  backgroundGradientFrom: themeColors.cardBackground,
                  backgroundGradientTo: themeColors.cardBackground,
                  decimalPlaces: 1,
                }}
                bezier
                style={styles.modalChart}
              />
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  fullscreenModalContainer: {
    borderRadius: 16,
    padding: 20,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    transform: [{ rotate: "90deg" }],
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "800",
  },
  closeButton: {
    borderRadius: 20,
    padding: 6,
  },
  modalContent: {
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  modalPieRowLayout: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
  },
  modalPieWrapper: {
    flex: 1.2,
    alignItems: "center",
    justifyContent: "center",
  },
  modalLegendContainer: {
    flex: 1,
    justifyContent: "center",
    paddingLeft: 10,
  },
  modalLegendRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 4,
    marginRight: 8,
  },
  modalLegendLabel: {
    fontSize: 12,
    fontWeight: "500",
  },
  modalLegendVal: {
    fontSize: 14,
    fontWeight: "700",
  },
  modalChart: {
    marginLeft: -10,
    borderRadius: 16,
  },
});

export default FullscreenChartModal;
