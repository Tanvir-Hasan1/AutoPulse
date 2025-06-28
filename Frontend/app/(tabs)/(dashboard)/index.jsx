import { useState, useEffect } from "react";
import { Link } from "expo-router";
import { useUser, selectBike } from "../../contexts/UserContext";

import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  Modal,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { API_BASE_URL } from "../../config";

const { width } = Dimensions.get("window");

export const unstable_settings = {
  initialRouteName: "index", // optional
};
export const hideHeader = true;

const Dashboard = () => {
  const { user, selectBike } = useUser();
  const userId = user?.userId || user?.id;
  const userName = user?.name;
  console.log("##Dashboard:", user);
  const [refreshing, setRefreshing] = useState(false);

  // Demo quick actions with updated license action
  const quickActions = [
    {
      id: 1,
      title: "License",
      icon: "card-outline",
      color: "#4CAF50",
      href: "/(tabs)/(dashboard)/license", // Custom onPress instead of href
    },
    {
      id: 2,
      title: "Registration",
      icon: "document-text-outline",
      color: "#FF9800",
      href: "/(tabs)/(dashboard)/registration",
    },
    {
      id: 3,
      title: "Tax Token",
      icon: "cash-outline",
      color: "#2196F3",
      href: "/(tabs)/(dashboard)/tax-token",
    },
    {
      id: 4,
      title: "Reports",
      icon: "analytics",
      color: "#9C27B0",
      href: "/(tabs)/(dashboard)/report",
    },
  ];

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high":
        return "#F44336";
      case "medium":
        return "#FF9800";
      case "low":
        return "#4CAF50";
      default:
        return "#757575";
    }
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case "fuel":
        return "car";
      case "service":
        return "construct";
      default:
        return "information-circle";
    }
  };

  // Dashboard Header
  const [selectedBikeId, setSelectedBikeId] = useState(user.selectedBikeId);
  const [modalVisible, setModalVisible] = useState(false);

  const selectedBike =
    user?.bikes?.find(
      (bike) => bike.id === selectedBikeId || bike._id === selectedBikeId
    ) || user?.bikes?.[0];

  const handleBikeSelect = (bikeId) => {
    setSelectedBikeId(bikeId); // 🚀 Use selectedBikeId for future API calls
    selectBike(bikeId);
    setModalVisible(false);
  };

  //Other data
  const [currentStatus, setCurrentStatus] = useState(null);
  const [upcomingTasks, setUpcomingTasks] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchDashboardData = async () => {
    if (!selectedBikeId) return;
    setLoading(true);
    setError(null);
    try {
      const [statusData, tasksData, activitiesData] = await Promise.all([
        fetch(`${API_BASE_URL}/dashboard/bikes/${selectedBikeId}/status`).then(
          (res) => res.json()
        ),
        fetch(
          `${API_BASE_URL}/dashboard/bikes/${selectedBikeId}/upcoming-tasks`
        ).then((res) => res.json()),
        fetch(
          `${API_BASE_URL}/dashboard/bikes/${selectedBikeId}/recent-activities`
        ).then((res) => res.json()),
      ]);
      setCurrentStatus(statusData);
      setUpcomingTasks(tasksData);
      setRecentActivities(activitiesData);
    } catch (err) {
      setError("Failed to fetch dashboard data.");
    }
    setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => {
    fetchDashboardData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedBikeId]);

  // useEffect(() => {
  //   if (!selectedBikeId) return;

  //   setLoading(true);
  //   setError(null);

  //   // Fetch all dashboard data in parallel
  //   Promise.all([
  //     fetch(`${API_BASE_URL}/dashboard/bikes/${selectedBikeId}/status`).then(
  //       (res) => res.json()
  //     ),
  //     fetch(
  //       `${API_BASE_URL}/dashboard/bikes/${selectedBikeId}/upcoming-tasks`
  //     ).then((res) => res.json()),
  //     fetch(
  //       `${API_BASE_URL}/dashboard/bikes/${selectedBikeId}/recent-activities`
  //     ).then((res) => res.json()),
  //   ])
  //     .then(([statusData, tasksData, activitiesData]) => {
  //       setCurrentStatus(statusData);
  //       setUpcomingTasks(tasksData);
  //       setRecentActivities(activitiesData);
  //       setLoading(false);
  //     })
  //     .catch((err) => {
  //       setError("Failed to fetch dashboard data.");
  //       setLoading(false);
  //     });
  // }, [selectedBikeId]);

  // Defensive rendering for required objects
  if (!user || !user.bikes || user.bikes.length === 0)
    return (
      <SafeAreaView style={styles.container}>
        <Text style={{ margin: 20 }}>No bikes found for this user.</Text>
      </SafeAreaView>
    );

  if (!selectedBike) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={{ margin: 20 }}>No bike selected.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              fetchDashboardData();
            }}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.welcomeText}>Welcome {userName}</Text>
            <TouchableOpacity
              onPress={() => setModalVisible(true)}
              style={{ flexDirection: "row", alignItems: "center" }}
            >
              <Text style={styles.bikeInfo}>
                {selectedBike.brand} {selectedBike.model} ({selectedBike.year})
              </Text>
              <Ionicons
                name="chevron-down"
                size={16}
                color="#333"
                style={{ marginLeft: 4 }}
              />
            </TouchableOpacity>
            <Text style={styles.registerNumber}>
              {selectedBike.registrationNumber}
            </Text>
          </View>
          <TouchableOpacity style={styles.notificationIcon}>
            <Ionicons name="notifications-outline" size={24} color="#333" />
          </TouchableOpacity>
        </View>

        {/* Bike Selection Modal */}
        <Modal visible={modalVisible} transparent animationType="fade">
          <TouchableOpacity
            style={{
              flex: 1,
              backgroundColor: "rgba(0,0,0,0.4)",
              justifyContent: "center",
              alignItems: "center",
            }}
            onPress={() => setModalVisible(false)}
            activeOpacity={1}
          >
            <View
              style={{
                backgroundColor: "white",
                padding: 16,
                borderRadius: 8,
                width: 300,
              }}
            >
              <Text
                style={{ fontSize: 16, fontWeight: "bold", marginBottom: 10 }}
              >
                Select Your Bike
              </Text>
              {user.bikes.map((bike) => (
                <TouchableOpacity
                  key={bike.id || bike._id}
                  onPress={() => handleBikeSelect(bike.id || bike._id)}
                  style={{ paddingVertical: 10 }}
                >
                  <Text>
                    {bike.brand} {bike.model} ({bike.year})
                  </Text>
                  <Text style={{ fontSize: 12, color: "#555" }}>
                    {bike.registrationNumber}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </TouchableOpacity>
        </Modal>

        {/* Current Status Cards */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Current Status</Text>
          {currentStatus && !loading ? (
            <View style={styles.statusGrid}>
              <View style={[styles.statusCard, styles.fuelCard]}>
                <View style={styles.statusHeader}>
                  <Ionicons name="car" size={24} color="#4CAF50" />
                  <Text style={styles.statusValue}>
                    {currentStatus.fuelLevel ?? "--"}%
                  </Text>
                </View>
                <Text style={styles.statusLabel}>Fuel Level</Text>
                <View style={styles.fuelBar}>
                  <View
                    style={[
                      styles.fuelBarFill,
                      {
                        width: `${
                          currentStatus.fuelLevel ? currentStatus.fuelLevel : 0
                        }%`,
                      },
                    ]}
                  />
                </View>
              </View>

              <View style={styles.statusCard}>
                <View style={styles.statusHeader}>
                  <Ionicons name="trending-up" size={24} color="#2196F3" />
                  <Text style={styles.statusValue}>
                    {currentStatus.fuelEconomy ?? "--"}
                  </Text>
                </View>
                <Text style={styles.statusLabel}>Fuel Economy (km/l)</Text>
              </View>

              <View style={styles.statusCard}>
                <View style={styles.statusHeader}>
                  <Ionicons name="cash" size={24} color="#E91E63" />
                  <Text style={styles.statusValue}>
                    ৳{currentStatus.costPerKm ?? "--"}
                  </Text>
                </View>
                <Text style={styles.statusLabel}>Cost per KM</Text>
              </View>

              <View style={styles.statusCard}>
                <View style={styles.statusHeader}>
                  <Ionicons name="speedometer" size={24} color="#FF9800" />
                  <Text style={styles.statusValue}>
                    {currentStatus.totalKm
                      ? currentStatus.totalKm.toLocaleString()
                      : "--"}
                  </Text>
                </View>
                <Text style={styles.statusLabel}>Total KM</Text>
              </View>

              <View style={styles.statusCard}>
                <View style={styles.statusHeader}>
                  <Ionicons name="construct" size={24} color="#9C27B0" />
                  <Text style={styles.statusValue}>
                    {currentStatus.nextServiceDue && currentStatus.totalKm
                      ? currentStatus.nextServiceDue - currentStatus.totalKm
                      : "--"}
                  </Text>
                </View>
                <Text style={styles.statusLabel}>KM to Service</Text>
              </View>
            </View>
          ) : (
            <Text style={{ color: "#aaa" }}>No entry found.</Text>
          )}
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActionsGrid}>
            {quickActions.map((action) => (
              <Link key={action.id} href={action.href} asChild>
                <TouchableOpacity style={styles.quickActionCard}>
                  <View
                    style={[
                      styles.quickActionIcon,
                      { backgroundColor: action.color },
                    ]}
                  >
                    <Ionicons name={action.icon} size={24} color="white" />
                  </View>
                  <Text style={styles.quickActionText}>{action.title}</Text>
                </TouchableOpacity>
              </Link>
            ))}
          </View>
        </View>

        {/* Upcoming Tasks */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Upcoming Tasks</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          {upcomingTasks && upcomingTasks.length > 0 ? (
            upcomingTasks.map((task) => (
              <View key={task.id || task._id} style={styles.taskCard}>
                <View style={styles.taskInfo}>
                  <View style={styles.taskHeader}>
                    <Text style={styles.taskTitle}>{task.title}</Text>
                    <View
                      style={[
                        styles.priorityBadge,
                        { backgroundColor: getPriorityColor(task.priority) },
                      ]}
                    >
                      <Text style={styles.priorityText}>
                        {task.priority?.toUpperCase()}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.taskDetails}>
                    <Ionicons name="time-outline" size={16} color="#666" />
                    <Text style={styles.taskDue}>Due in {task.dueIn}</Text>
                  </View>
                </View>
                <TouchableOpacity style={styles.taskAction}>
                  <Ionicons name="chevron-forward" size={20} color="#666" />
                </TouchableOpacity>
              </View>
            ))
          ) : (
            <Text style={{ color: "#aaa" }}>No entry found.</Text>
          )}
        </View>

        {/* Recent Activities */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Activities</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          {recentActivities && recentActivities.length > 0 ? (
            recentActivities.map((activity) => (
              <View
                key={activity.id || activity._id}
                style={styles.activityCard}
              >
                <View style={styles.activityIcon}>
                  <Ionicons
                    name={getActivityIcon(activity.type)}
                    size={20}
                    color="#666"
                  />
                </View>
                <View style={styles.activityInfo}>
                  <Text style={styles.activityDescription}>
                    {activity.description}
                  </Text>
                  <Text style={styles.activityDate}>{activity.date}</Text>
                </View>
                <Text style={styles.activityAmount}>{activity.amount}</Text>
              </View>
            ))
          ) : (
            <Text style={{ color: "#aaa" }}>No entry found.</Text>
          )}
        </View>

        {/* Bottom spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    padding: 20,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  bikeInfo: {
    fontSize: 16,
    color: "#666",
    marginBottom: 2,
  },
  registerNumber: {
    fontSize: 14,
    color: "#999",
    fontWeight: "500",
  },
  notificationIcon: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: "#f5f5f5",
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  seeAllText: {
    color: "#2196F3",
    fontSize: 14,
    fontWeight: "500",
  },
  statusGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  statusCard: {
    backgroundColor: "white",
    padding: 16,
    borderRadius: 12,
    width: (width - 60) / 2,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  fuelCard: {
    width: width - 40,
  },
  statusHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  statusValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  statusLabel: {
    fontSize: 12,
    color: "#666",
    marginBottom: 8,
  },
  fuelBar: {
    height: 6,
    backgroundColor: "#e0e0e0",
    borderRadius: 3,
    overflow: "hidden",
  },
  fuelBarFill: {
    height: "100%",
    backgroundColor: "#4CAF50",
    borderRadius: 3,
  },
  quickActionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  quickActionCard: {
    alignItems: "center",
    width: (width - 60) / 2,
    marginBottom: 16,
  },
  quickActionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  quickActionText: {
    fontSize: 14,
    color: "#333",
    fontWeight: "500",
    textAlign: "center",
  },
  taskCard: {
    backgroundColor: "white",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  taskInfo: {
    flex: 1,
  },
  taskHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    flex: 1,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  priorityText: {
    color: "white",
    fontSize: 10,
    fontWeight: "bold",
  },
  taskDetails: {
    flexDirection: "row",
    alignItems: "center",
  },
  taskDue: {
    fontSize: 14,
    color: "#666",
    marginLeft: 4,
  },
  taskAction: {
    padding: 8,
  },
  activityCard: {
    backgroundColor: "white",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f5f5f5",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  activityInfo: {
    flex: 1,
  },
  activityDescription: {
    fontSize: 16,
    color: "#333",
    fontWeight: "500",
    marginBottom: 4,
  },
  activityDate: {
    fontSize: 14,
    color: "#666",
  },
  activityAmount: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#4CAF50",
  },
  bottomSpacing: {
    height: 20,
  },
  // License Overlay Styles
  licenseOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  licenseContainer: {
    width: width * 0.95,
    height: "90%",
    backgroundColor: "#000",
    borderRadius: 12,
    overflow: "hidden",
    position: "relative",
  },
  closeButton: {
    position: "absolute",
    top: 16,
    left: 16,
    zIndex: 10,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    borderRadius: 20,
    padding: 8,
  },
  licenseScrollContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  licenseImage: {
    width: width * 0.9,
    height: "100%",
    maxHeight: 600,
  },
  // Loading Overlay Styles
  loadingOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  loadingContainer: {
    backgroundColor: "white",
    padding: 24,
    borderRadius: 12,
    alignItems: "center",
    minWidth: 150,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#333",
    fontWeight: "500",
  },
});

export default Dashboard;
