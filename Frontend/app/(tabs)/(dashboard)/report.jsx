import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Dimensions,
  RefreshControl,
} from "react-native";
import { useUser } from "../../contexts/UserContext";
import { Ionicons } from "@expo/vector-icons";
import { LineChart, BarChart, PieChart } from "react-native-chart-kit";
import { API_BASE_URL } from '../../../config';

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
  const { user } = useUser();
  const bikeId = user.selectedBikeId;
  const [refreshing, setRefreshing] = useState(false);

  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchReportData = async () => {
    if (!bikeId) return;
    setLoading(true);
    setError(null);
    fetch(`${API_BASE_URL}/dashboard/bikes/${bikeId}/report`)
      .then((res) => res.json())
      .then((data) => {
        setReport(data);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to fetch report.");
        setLoading(false);
        setRefreshing(false);
      });
  };

  useEffect(() => {
    fetchReportData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bikeId]);

  if (loading) return <Text style={styles.loadingText}>Loading...</Text>;
  if (error) return <Text style={styles.errorText}>{error}</Text>;
  if (!report) return null;

  // Helper to ensure array and not null
  const safeArray = (arr) => (Array.isArray(arr) ? arr : []);
  // Helper to ensure number
  const safeNumber = (n) => (typeof n === "number" && !isNaN(n) ? n : 0);

  const {
    bikeData = {},
    fuelLogs = [],
    totalFuel,
    totalSpend,
    avgCostPerLitre,
    fuelEfficiency,
    monthlySpending,
    fuelConsumptionTrend,
    costBreakdown,
    fuelPriceTrend,
  } = report || {};

  // Sanitize all data
  const _fuelConsumptionTrend = safeArray(fuelConsumptionTrend);
  const _costBreakdown = safeArray(costBreakdown);
  const _fuelPriceTrend = safeArray(fuelPriceTrend);
  const _monthlySpending = safeNumber(monthlySpending);
  const _totalFuel = safeNumber(totalFuel);
  const _totalSpend = safeNumber(totalSpend);
  const _avgCostPerLitre = safeNumber(avgCostPerLitre);
  const _fuelEfficiency = safeNumber(fuelEfficiency);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={async () => {
              setRefreshing(true);
              await fetchReportData();
              setRefreshing(false);
            }}
          />
        }
      >
        {/* Bike Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Bike Info</Text>
          {bikeData && bikeData.brand ? (
            <View style={styles.bikeInfoContainer}>
              <Text style={styles.bikeInfoText}>
                <Ionicons name="bicycle" size={18} color="#007AFF" />{" "}
                {bikeData.brand} {bikeData.model} ({bikeData.year})
              </Text>
              <Text style={styles.bikeInfoText}>
                <Ionicons name="pricetag" size={16} color="#007AFF" />{" "}
                Registration: {bikeData.registrationNumber}
              </Text>
              <Text style={styles.bikeInfoText}>
                <Ionicons name="speedometer" size={16} color="#007AFF" />{" "}
                Odometer: {bikeData.odometer} km
              </Text>
              <Text style={styles.bikeInfoText}>
                <Ionicons name="calendar" size={16} color="#007AFF" /> Last
                Service: {bikeData.lastServiceDate || "--"}
              </Text>
              <Text style={styles.bikeInfoText}>
                <Ionicons name="navigate" size={16} color="#007AFF" /> Last
                Service Odo: {bikeData.lastServiceOdometer || "--"}
              </Text>
            </View>
          ) : (
            <Text style={styles.bikeInfoText}>No bike data available.</Text>
          )}
        </View>

        {/* Fuel Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Fuel Summary</Text>
          <View style={styles.summaryRow}>
            <SummaryBox label="Total Fuel" value={`${totalFuel}L`} />
            <SummaryBox label="Total Spent" value={`৳${totalSpend}`} />
            <SummaryBox label="Avg Cost/L" value={`৳${avgCostPerLitre}`} />
            <SummaryBox label="KM/L" value={`${fuelEfficiency}`} />
          </View>
        </View>

        {/* Monthly Spending (Bar Chart) */}
        <ChartSection title="Monthly Spending (৳)">
          {_fuelConsumptionTrend.length > 0 &&
          _fuelConsumptionTrend.some((d) => typeof d.litres === "number") ? (
            <BarChart
              data={{
                labels: _fuelConsumptionTrend.map((d) => d.month || ""),
                datasets: [
                  {
                    data: _fuelConsumptionTrend.map((d) =>
                      safeNumber(d.litres)
                    ),
                  },
                ],
              }}
              width={CHART_WIDTH}
              height={220}
              chartConfig={chartConfig}
              style={{ borderRadius: 16 }}
            />
          ) : (
            <Text style={styles.noDataText}>No data available.</Text>
          )}
          <Text style={styles.monthlyTotalText}>
            Last 30 days: ৳{_monthlySpending}
          </Text>
        </ChartSection>

        {/* Fuel Consumption Trend (Line Chart) */}
        <ChartSection title="Fuel Consumption Trend (L)">
          {_fuelConsumptionTrend.length > 0 &&
          _fuelConsumptionTrend.some((d) => typeof d.litres === "number") ? (
            <LineChart
              data={{
                labels: _fuelConsumptionTrend.map((d) => d.month || ""),
                datasets: [
                  {
                    data: _fuelConsumptionTrend.map((d) =>
                      safeNumber(d.litres)
                    ),
                  },
                ],
              }}
              width={CHART_WIDTH}
              height={220}
              chartConfig={chartConfig}
              bezier
              style={{ borderRadius: 16 }}
            />
          ) : (
            <Text style={styles.noDataText}>No data available.</Text>
          )}
        </ChartSection>

        {/* Pie Chart: Cost Breakdown */}
        <ChartSection title="Cost Breakdown">
          {_costBreakdown.length > 0 &&
          _costBreakdown.some(
            (item) => typeof item.value === "number" && item.value > 0
          ) ? (
            <PieChart
              data={_costBreakdown.map((item) => ({
                name: item.name || "",
                population: safeNumber(item.value),
                color:
                  item.name === "Fuel"
                    ? "#FF6B6B"
                    : item.name === "Service"
                    ? "#4ECDC4"
                    : "#45B7D1",
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
          ) : (
            <Text style={styles.noDataText}>No data available.</Text>
          )}
        </ChartSection>

        {/* Fuel Price Trend (Line Chart) */}
        <ChartSection title="Fuel Price Trend (৳/L)">
          {_fuelPriceTrend.length > 0 &&
          _fuelPriceTrend.some((d) => typeof d.unitCost === "number") ? (
            <LineChart
              data={{
                labels: _fuelPriceTrend.map((d) => d.date || ""),
                datasets: [
                  {
                    data: _fuelPriceTrend.map((d) => safeNumber(d.unitCost)),
                  },
                ],
              }}
              width={CHART_WIDTH}
              height={220}
              chartConfig={chartConfig}
              bezier
              style={{ borderRadius: 16 }}
            />
          ) : (
            <Text style={styles.noDataText}>No data available.</Text>
          )}
        </ChartSection>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const SummaryBox = ({ label, value }) => (
  <View style={styles.summaryBox}>
    <Text style={styles.summaryValue}>{value ?? "--"}</Text>
    <Text style={styles.summaryLabel}>{label}</Text>
  </View>
);

const ChartSection = ({ title, children }) => (
  <View style={styles.chartSection}>
    <Text style={styles.chartSectionTitle}>{title}</Text>
    <View style={styles.chartContainer}>{children}</View>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8f9fa" },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
    marginBottom: 16,
    fontFamily: "System",
  },
  bikeInfoContainer: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 16,
    marginBottom: 8,
    elevation: 2,
  },
  bikeInfoText: {
    fontSize: 15,
    marginBottom: 2,
    color: "#444",
    fontFamily: "System",
  },
  summaryRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  summaryBox: {
    width: (width - 60) / 2,
    marginBottom: 12,
    padding: 16,
    backgroundColor: "#fff",
    borderRadius: 12,
    alignItems: "center",
    elevation: 2,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: "bold",
  },
  summaryLabel: {
    fontSize: 12,
    color: "#666",
  },
  chartSection: {
    padding: 20,
  },
  chartSectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 16,
  },
  chartContainer: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    elevation: 3,
  },
  monthlyTotalText: {
    marginTop: 8,
    textAlign: "right",
    color: "#2196F3",
    fontWeight: "bold",
  },
  loadingText: {
    fontSize: 16,
    color: "#666",
    marginTop: 40,
    textAlign: "center",
  },
  errorText: {
    fontSize: 16,
    color: "#F44336",
    marginTop: 40,
    textAlign: "center",
  },
  noDataText: {
    fontSize: 15,
    color: "#999",
    textAlign: "center",
    paddingVertical: 32,
  },
});

export default ReportPage;
