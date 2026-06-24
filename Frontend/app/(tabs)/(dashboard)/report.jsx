import React, { useEffect, useState } from "react";
import {
  Dimensions,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
  TouchableOpacity,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import api from "../../../store/api";
import { useAuthStore } from "../../../store/useAuthStore";
import Reports from "../../../components/dashboard-component/reports";
import YearlyCostsBreakdown from "../../../components/dashboard-component/reports/YearlyCostsBreakdown";
import BikeSelectionModal from "../../../components/dashboard-component/BikeSelectionModal";
import * as Haptics from "expo-haptics";

const { width } = Dimensions.get("window");

const themeColors = {
  cardBackground: "#FFFFFF",
  chartText: "#4B5563",
  title: "#1F2937",
  textPrimary: "#1F2937",
  textSecondary: "#6B7280",
  dotInactive: "#D1D5DB",
  border: "#E5E7EB",
};

const ReportPage = () => {
  const bikeId = useAuthStore((s) => s.selectedBikeId);
  const bikes = useAuthStore((s) => s.bikes);
  const selectBike = useAuthStore((s) => s.selectBike);
  const [refreshing, setRefreshing] = useState(false);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all");
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [bikeModalVisible, setBikeModalVisible] = useState(false);

  const handleBikeSelect = (newBikeId) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    selectBike(newBikeId);
    setBikeModalVisible(false);
  };

  const fetchReportData = async (filterVal = filter) => {
    if (!bikeId) return;
    setLoading(true);
    setError(null);
    api.get(`/dashboard/bikes/${bikeId}/report?filter=${filterVal}`)
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
    fetchReportData(filter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bikeId, filter]);

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={styles.loadingText}>Loading reports...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.center]}>
        <Ionicons name="alert-circle-outline" size={48} color="#EF4444" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchReportData}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!report) return null;

  // Helpers to sanitize input
  const safeArray = (arr) => (Array.isArray(arr) ? arr : []);
  const safeNumber = (n) => (typeof n === "number" && !isNaN(n) ? n : 0);

  const {
    bikeData = {},
    totalFuel = 0,
    totalSpend = 0,
    avgCostPerLitre = 0,
    fuelEfficiency = 0,
    fuelConsumptionTrend = [],
    costBreakdown = [],
    fuelPriceTrend = [],
    monthlyExpenseTrend = [],
    monthlyCosts = {},
  } = report || {};

  const _fuelConsumptionTrend = safeArray(fuelConsumptionTrend);
  const _costBreakdown = safeArray(costBreakdown);
  const _fuelPriceTrend = safeArray(fuelPriceTrend);
  const _monthlyExpenseTrend = safeArray(monthlyExpenseTrend);

  // Formatting pie data for Reports slider legends
  const colors = ["#2563EB", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6"];
  const formattedPieData = _costBreakdown.map((item, idx) => ({
    name: item.name || "",
    population: safeNumber(item.value),
    color: colors[idx % colors.length],
    legendFontColor: "#333",
    legendFontSize: 12,
  }));

  const visiblePieData = formattedPieData.filter((item) => item.population > 0);

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            colors={["#2563EB"]}
            tintColor="#2563EB"
            onRefresh={async () => {
              setRefreshing(true);
              await fetchReportData();
              setRefreshing(false);
            }}
          />
        }
      >
        {/* Bike Selector Bar */}
        {bikeData && bikeData.brand && (
          <View style={styles.selectorSection}>
            <TouchableOpacity
              style={styles.bikeSelectorCard}
              onPress={() => {
                Haptics.selectionAsync();
                setBikeModalVisible(true);
              }}
              activeOpacity={0.7}
            >
              <View style={styles.bikeSelectorDetails}>
                <View style={styles.bikeIconBg}>
                  <Ionicons name="bicycle" size={18} color="#2563EB" />
                </View>
                <Text style={styles.selectedBikeText}>
                  {bikeData.brand} {bikeData.model}
                </Text>
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{bikeData.year}</Text>
                </View>
              </View>
              <Ionicons name="chevron-down" size={20} color="#2563EB" />
            </TouchableOpacity>
          </View>
        )}

        {/* Bike Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Bike Info</Text>
          {bikeData && bikeData.brand ? (
            <View style={styles.bikeInfoContainer}>
              <View style={styles.bikeHeader}>
                <Ionicons name="bicycle" size={22} color="#2563EB" />
                <Text style={styles.bikeName}>
                  {bikeData.brand} {bikeData.model}
                </Text>
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{bikeData.year}</Text>
                </View>
              </View>

              <View style={styles.divider} />

              <View style={styles.infoRow}>
                <View style={styles.infoCol}>
                  <Text style={styles.infoLabel}>Registration</Text>
                  <Text style={styles.infoVal}>{bikeData.registrationNumber || "--"}</Text>
                </View>
                <View style={styles.infoCol}>
                  <Text style={styles.infoLabel}>Odometer</Text>
                  <Text style={styles.infoVal}>{bikeData.odometer ? `${bikeData.odometer} km` : "--"}</Text>
                </View>
              </View>

              <View style={styles.infoRow}>
                <View style={styles.infoCol}>
                  <Text style={styles.infoLabel}>Last Service Date</Text>
                  <Text style={styles.infoVal}>{bikeData.lastServiceDate || "--"}</Text>
                </View>
                <View style={styles.infoCol}>
                  <Text style={styles.infoLabel}>Last Service Odo</Text>
                  <Text style={styles.infoVal}>{bikeData.lastServiceOdometer ? `${bikeData.lastServiceOdometer} km` : "--"}</Text>
                </View>
              </View>
            </View>
          ) : (
            <View style={styles.bikeInfoContainer}>
              <Text style={styles.noBikeText}>No bike data available.</Text>
            </View>
          )}
        </View>

        {/* Fuel Summary */}
        <View style={styles.section}>
          <View style={styles.headerRow}>
            <Text style={[styles.sectionTitle, { marginBottom: 0 }]}>Fuel Summary</Text>
            <TouchableOpacity
              style={styles.dropdownButton}
              onPress={() => setDropdownVisible(true)}
            >
              <Text style={styles.dropdownButtonText}>
                {filter === "all"
                  ? "All"
                  : filter === "this_year"
                  ? "This Year"
                  : "Previous Year"}
              </Text>
              <Ionicons name="chevron-down" size={16} color="#2563EB" />
            </TouchableOpacity>
          </View>
          <View style={styles.summaryGrid}>
            <View style={styles.summaryBox}>
              <MaterialCommunityIcons name="gas-station-outline" size={20} color="#2563EB" style={styles.boxIcon} />
              <Text style={styles.summaryValue}>{totalFuel ?? 0}L</Text>
              <Text style={styles.summaryLabel}>Total Fuel</Text>
            </View>
            <View style={styles.summaryBox}>
              <Ionicons name="cash-outline" size={20} color="#10B981" style={styles.boxIcon} />
              <Text style={styles.summaryValue}>৳{totalSpend ?? 0}</Text>
              <Text style={styles.summaryLabel}>Total Spent</Text>
            </View>
            <View style={styles.summaryBox}>
              <Ionicons name="pricetag-outline" size={20} color="#F59E0B" style={styles.boxIcon} />
              <Text style={styles.summaryValue}>৳{avgCostPerLitre ?? 0}</Text>
              <Text style={styles.summaryLabel}>Avg Cost/L</Text>
            </View>
            <View style={styles.summaryBox}>
              <Ionicons name="speedometer-outline" size={20} color="#EF4444" style={styles.boxIcon} />
              <Text style={styles.summaryValue}>{fuelEfficiency ?? 0}</Text>
              <Text style={styles.summaryLabel}>KM/L</Text>
            </View>
          </View>
        </View>

        {/* Performance Analytics Slider */}
        <View style={{ paddingTop: 16 }}>
          <Text style={[styles.sectionTitle, { paddingHorizontal: 20 }]}>Performance Analytics</Text>
          <Reports
            visiblePieData={visiblePieData}
            fuelPriceTrend={_fuelPriceTrend}
            fuelConsumptionTrend={_fuelConsumptionTrend}
            monthlyExpenseTrend={_monthlyExpenseTrend}
            pieData={formattedPieData}
            themeColors={themeColors}
          />
        </View>

        {/* Yearly Costs Breakdown Section */}
        <YearlyCostsBreakdown monthlyCosts={monthlyCosts} />

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Select Filter Dropdown Sheet */}
      <Modal
        visible={dropdownVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setDropdownVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalDismiss}
            activeOpacity={1}
            onPress={() => setDropdownVisible(false)}
          />
          <View style={styles.bottomSheet}>
            <View style={styles.bottomSheetHeader}>
              <View style={styles.bottomSheetIndicator} />
              <Text style={styles.bottomSheetTitle}>Select Fuel Range</Text>
            </View>

            <TouchableOpacity
              style={[
                styles.bottomSheetItem,
                filter === "all" && styles.bottomSheetItemActive,
              ]}
              onPress={() => {
                setFilter("all");
                setDropdownVisible(false);
              }}
            >
              <Text
                style={[
                  styles.bottomSheetItemText,
                  filter === "all" && styles.bottomSheetItemTextActive,
                ]}
              >
                All Time
              </Text>
              {filter === "all" && <Ionicons name="checkmark-circle" size={20} color="#2563EB" />}
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.bottomSheetItem,
                filter === "this_year" && styles.bottomSheetItemActive,
              ]}
              onPress={() => {
                setFilter("this_year");
                setDropdownVisible(false);
              }}
            >
              <Text
                style={[
                  styles.bottomSheetItemText,
                  filter === "this_year" && styles.bottomSheetItemTextActive,
                ]}
              >
                This Year ({new Date().getFullYear()})
              </Text>
              {filter === "this_year" && <Ionicons name="checkmark-circle" size={20} color="#2563EB" />}
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.bottomSheetItem,
                filter === "prev_year" && styles.bottomSheetItemActive,
              ]}
              onPress={() => {
                setFilter("prev_year");
                setDropdownVisible(false);
              }}
            >
              <Text
                style={[
                  styles.bottomSheetItemText,
                  filter === "prev_year" && styles.bottomSheetItemTextActive,
                ]}
              >
                Previous Year ({new Date().getFullYear() - 1})
              </Text>
              {filter === "prev_year" && <Ionicons name="checkmark-circle" size={20} color="#2563EB" />}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <BikeSelectionModal
        modalVisible={bikeModalVisible}
        setModalVisible={setBikeModalVisible}
        bikes={bikes}
        selectedBikeId={bikeId}
        handleBikeSelect={handleBikeSelect}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  dropdownButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EFF6FF",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#DBEAFE",
    gap: 4,
  },
  dropdownButtonText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#2563EB",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    justifyContent: "flex-end",
  },
  modalDismiss: {
    flex: 1,
  },
  bottomSheet: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingBottom: 40,
    paddingTop: 12,
  },
  bottomSheetHeader: {
    alignItems: "center",
    marginBottom: 20,
  },
  bottomSheetIndicator: {
    width: 40,
    height: 4,
    backgroundColor: "#E5E7EB",
    borderRadius: 2,
    marginBottom: 12,
  },
  bottomSheetTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1F2937",
  },
  bottomSheetItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  bottomSheetItemActive: {},
  bottomSheetItemText: {
    fontSize: 15,
    fontWeight: "500",
    color: "#4B5563",
  },
  bottomSheetItemTextActive: {
    color: "#2563EB",
    fontWeight: "700",
  },
  center: {
    justifyContent: "center",
    alignItems: "center",
  },
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
  bikeInfoContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    shadowColor: "rgba(0,0,0,0.02)",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  bikeHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  bikeName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1F2937",
    marginLeft: 10,
    flex: 1,
  },
  badge: {
    backgroundColor: "#EFF6FF",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#2563EB",
  },
  divider: {
    height: 1,
    backgroundColor: "#F3F4F6",
    marginVertical: 12,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 6,
  },
  infoCol: {
    width: "48%",
  },
  infoLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: "#9CA3AF",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  infoVal: {
    fontSize: 14,
    fontWeight: "700",
    color: "#374151",
  },
  noBikeText: {
    fontSize: 14,
    color: "#9CA3AF",
    textAlign: "center",
  },
  summaryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  summaryBox: {
    width: (width - 56) / 2,
    marginBottom: 16,
    padding: 16,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    alignItems: "center",
    shadowColor: "rgba(0,0,0,0.02)",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  boxIcon: {
    marginBottom: 8,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: "800",
    color: "#1F2937",
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 11,
    color: "#9CA3AF",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  loadingText: {
    fontSize: 15,
    color: "#4B5563",
    marginTop: 12,
    fontWeight: "500",
  },
  errorText: {
    fontSize: 15,
    color: "#EF4444",
    marginTop: 12,
    textAlign: "center",
    paddingHorizontal: 20,
    fontWeight: "500",
  },
  retryButton: {
    marginTop: 16,
    backgroundColor: "#2563EB",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
  },
  retryText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
  selectorSection: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 4,
  },
  bikeSelectorCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "rgba(0,0,0,0.02)",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 3,
  },
  bikeSelectorDetails: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  bikeIconBg: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#EFF6FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  selectedBikeText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1F2937",
    marginRight: 8,
  },
});

export default ReportPage;
