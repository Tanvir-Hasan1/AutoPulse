import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LineChart, BarChart, PieChart } from "react-native-chart-kit";

const chartConfig = {
  backgroundGradientFrom: "#fff",
  backgroundGradientTo: "#fff",
  color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
  strokeWidth: 2,
  barPercentage: 0.5,
  useShadowColorFromDataset: false,
};

const { width } = Dimensions.get("window");
const CHART_WIDTH = width - 40;

const ReportPage = () => {
  const [selectedBikeId] = useState("507f1f77bcf86cd799439011");

  const bikeData = {
    _id: selectedBikeId,
    brand: "Yamaha",
    model: "R15 V4",
    year: "2023",
    registrationNumber: "DH-METRO-1234",
    odometer: 15420,
    lastServiceDate: "2024-05-15",
    lastServiceOdometer: 12800,
  };

  const fuelLogs = [
    {
      date: "2024-06-15",
      amount: 8.5,
      unitCost: 118,
      totalCost: 1003,
      odometer: 15420,
    },
    {
      date: "2024-06-01",
      amount: 7.2,
      unitCost: 116,
      totalCost: 835.2,
      odometer: 15050,
    },
    {
      date: "2024-05-18",
      amount: 8.0,
      unitCost: 115,
      totalCost: 920,
      odometer: 14650,
    },
    {
      date: "2024-05-05",
      amount: 6.8,
      unitCost: 114,
      totalCost: 775.2,
      odometer: 14280,
    },
    {
      date: "2024-04-22",
      amount: 7.5,
      unitCost: 113,
      totalCost: 847.5,
      odometer: 13920,
    },
    {
      date: "2024-04-08",
      amount: 8.2,
      unitCost: 112,
      totalCost: 918.4,
      odometer: 13580,
    },
    {
      date: "2024-03-25",
      amount: 7.8,
      unitCost: 111,
      totalCost: 865.8,
      odometer: 13200,
    },
    {
      date: "2024-03-10",
      amount: 6.9,
      unitCost: 110,
      totalCost: 759,
      odometer: 12850,
    },
  ];

  const calculateMetrics = () => {
    const totalLitres = fuelLogs.reduce((sum, log) => sum + log.amount, 0);
    const totalSpent = fuelLogs.reduce((sum, log) => sum + log.totalCost, 0);
    const avgCostPerLitre = totalSpent / totalLitres;

    const sortedLogs = [...fuelLogs].sort(
      (a, b) => new Date(a.date) - new Date(b.date)
    );
    let totalKm = 0,
      totalFuel = 0;

    for (let i = 1; i < sortedLogs.length; i++) {
      totalKm += sortedLogs[i].odometer - sortedLogs[i - 1].odometer;
      totalFuel += sortedLogs[i].amount;
    }

    const fuelEfficiency = totalKm / totalFuel;

    return {
      totalLitres: totalLitres.toFixed(1),
      totalSpent: totalSpent.toFixed(0),
      avgCostPerLitre: avgCostPerLitre.toFixed(1),
      fuelEfficiency: fuelEfficiency.toFixed(1),
    };
  };

  const getServiceStatus = () => {
    const lastServiceDate = new Date(bikeData.lastServiceDate);
    const today = new Date();
    const daysSinceService = Math.floor(
      (today - lastServiceDate) / (1000 * 60 * 60 * 24)
    );
    const kmSinceService = bikeData.odometer - bikeData.lastServiceOdometer;

    let status = "On Track";
    let color = "#4CAF50";

    if (daysSinceService > 180 || kmSinceService > 3000) {
      status = "Overdue";
      color = "#F44336";
    } else if (daysSinceService > 150 || kmSinceService > 2500) {
      status = "Due Soon";
      color = "#FF9800";
    }

    return { status, color, daysSinceService, kmSinceService };
  };

  const getMonthlyData = () => {
    const monthlyData = {};

    fuelLogs.forEach((log) => {
      const date = new Date(log.date);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
        2,
        "0"
      )}`;
      const label = date.toLocaleDateString("en-US", {
        month: "short",
        year: "2-digit",
      });

      if (!monthlyData[key]) {
        monthlyData[key] = { month: label, spending: 0, litres: 0 };
      }

      monthlyData[key].spending += log.totalCost;
      monthlyData[key].litres += log.amount;
    });

    return Object.values(monthlyData).sort((a, b) =>
      a.month.localeCompare(b.month)
    );
  };

  const getCostTrendData = () =>
    fuelLogs
      .map((log) => ({
        date: new Date(log.date).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
        unitCost: log.unitCost,
      }))
      .reverse();

  const getPieChartData = () => {
    const totalFuel = fuelLogs.reduce((sum, log) => sum + log.totalCost, 0);
    const other = totalFuel * 0.3;

    return [
      { name: "Fuel", value: totalFuel, color: "#FF6B6B" },
      { name: "Service", value: other * 0.7, color: "#4ECDC4" },
      { name: "Parts", value: other * 0.3, color: "#45B7D1" },
    ];
  };

  const metrics = calculateMetrics();
  const serviceStatus = getServiceStatus();
  const monthlyData = getMonthlyData();
  const costTrendData = getCostTrendData();
  const pieChartData = getPieChartData();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        {/* <View style={styles.header}>
          <TouchableOpacity style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Bike Report</Text>
          <TouchableOpacity style={styles.shareButton}>
            <Ionicons name="share-outline" size={24} color="#333" />
          </TouchableOpacity>
        </View> */}

        {/* Fuel Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Fuel Summary</Text>
          <View
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              justifyContent: "space-between",
            }}
          >
            <SummaryBox label="Total Fuel" value={`${metrics.totalLitres}L`} />
            <SummaryBox label="Total Spent" value={`৳${metrics.totalSpent}`} />
            <SummaryBox
              label="Avg Cost/L"
              value={`৳${metrics.avgCostPerLitre}`}
            />
            <SummaryBox label="KM/L" value={`${metrics.fuelEfficiency}`} />
          </View>
        </View>

        {/* Monthly Spending */}
        <ChartSection title="Monthly Spending">
          <BarChart
            data={{
              labels: monthlyData.map((d) => d.month),
              datasets: [{ data: monthlyData.map((d) => d.spending) }],
            }}
            width={CHART_WIDTH}
            height={220}
            chartConfig={chartConfig}
            style={{ borderRadius: 16 }}
          />
        </ChartSection>

        {/* Monthly Litres */}
        <ChartSection title="Fuel Consumption Trend">
          <LineChart
            data={{
              labels: monthlyData.map((d) => d.month),
              datasets: [{ data: monthlyData.map((d) => d.litres) }],
            }}
            width={CHART_WIDTH}
            height={220}
            chartConfig={chartConfig}
            bezier
            style={{ borderRadius: 16 }}
          />
        </ChartSection>

        {/* Pie Chart */}
        <ChartSection title="Cost Breakdown">
          <PieChart
            data={pieChartData.map((item) => ({
              name: item.name,
              population: item.value,
              color: item.color,
              legendFontColor: "#333",
              legendFontSize: 12,
            }))}
            width={CHART_WIDTH}
            height={220}
            chartConfig={chartConfig}
            accessor="population"
            backgroundColor="transparent"
            paddingLeft="15"
          />
        </ChartSection>

        {/* Fuel Price Trend */}
        <ChartSection title="Fuel Price Trend">
          <LineChart
            data={{
              labels: costTrendData.map((d) => d.date),
              datasets: [{ data: costTrendData.map((d) => d.unitCost) }],
            }}
            width={CHART_WIDTH}
            height={220}
            chartConfig={chartConfig}
            bezier
            style={{ borderRadius: 16 }}
          />
        </ChartSection>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const SummaryBox = ({ label, value }) => (
  <View
    style={{
      width: (width - 60) / 2,
      marginBottom: 12,
      padding: 16,
      backgroundColor: "#fff",
      borderRadius: 12,
      alignItems: "center",
      elevation: 2,
    }}
  >
    <Text style={{ fontSize: 18, fontWeight: "bold" }}>{value}</Text>
    <Text style={{ fontSize: 12, color: "#666" }}>{label}</Text>
  </View>
);

const ChartSection = ({ title, children }) => (
  <View style={{ padding: 20 }}>
    <Text style={{ fontSize: 18, fontWeight: "700", marginBottom: 16 }}>
      {title}
    </Text>
    <View
      style={{
        backgroundColor: "#fff",
        borderRadius: 16,
        padding: 16,
        elevation: 3,
      }}
    >
      {children}
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8f9fa" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: "#f5f5f5",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#333",
    fontFamily: "System",
  },
  shareButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: "#f5f5f5",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
    marginBottom: 16,
    fontFamily: "System",
  },
});

export default ReportPage;
