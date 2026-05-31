import { Link } from "expo-router";
import { useEffect, useState } from "react";
import api from "../../../store/api";
import { useAuthStore } from "../../../store/useAuthStore";

import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import {
  Dimensions,
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Pressable
} from "react-native";
import Animated, { FadeInDown, FadeInUp, useSharedValue, useAnimatedStyle, withSpring } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Progress from 'react-native-progress';

const { width } = Dimensions.get("window");

export const unstable_settings = {
  initialRouteName: "index",
};
export const hideHeader = true;

// Animated button with scale and haptic feedback
const InteractiveCard = ({ children, onPress, style, delay = 0 }) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.96);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  return (
    <Animated.View entering={FadeInDown.delay(delay).springify()} style={style}>
      <Animated.View style={animatedStyle}>
        <Pressable
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          onPress={(e) => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            if (onPress) onPress(e);
          }}
        >
          {children}
        </Pressable>
      </Animated.View>
    </Animated.View>
  );
};


const Dashboard = () => {
  const userId = useAuthStore((s) => s.userId);
  const userName = useAuthStore((s) => s.name);
  const bikes = useAuthStore((s) => s.bikes);
  const selectedBikeId = useAuthStore((s) => s.selectedBikeId);
  const selectBike = useAuthStore((s) => s.selectBike);
  const getSelectedBike = useAuthStore((s) => s.getSelectedBike);
  const [refreshing, setRefreshing] = useState(false);

  const quickActions = [
    {
      id: 1,
      title: "License",
      icon: "card-outline",
      colors: ["#11998e", "#38ef7d"], // Gradient fallback colors
      color: "#38ef7d",
      href: "/(tabs)/(dashboard)/license",
    },
    {
      id: 2,
      title: "Registration",
      icon: "document-text-outline",
      colors: ["#ff9966", "#ff5e62"],
      color: "#ff5e62",
      href: "/(tabs)/(dashboard)/registration",
    },
    {
      id: 3,
      title: "Tax Token",
      icon: "cash-outline",
      colors: ["#4facfe", "#00f2fe"],
      color: "#4facfe",
      href: "/(tabs)/(dashboard)/tax-token",
    },
    {
      id: 4,
      title: "Reports",
      icon: "analytics",
      colors: ["#a18cd1", "#fbc2eb"],
      color: "#a18cd1",
      href: "/(tabs)/(dashboard)/report",
    },
  ];

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case "high":
        return "#FF4B4B";
      case "medium":
        return "#FF9800";
      case "low":
        return "#4CAF50";
      default:
        return "#757575";
    }
  };

  const getActivityIcon = (type) => {
    switch (type?.toLowerCase()) {
      case "fuel":
        return "car";
      case "service":
        return "construct";
      default:
        return "information-circle";
    }
  };

  const [modalVisible, setModalVisible] = useState(false);

  const selectedBike =
    bikes?.find(
      (bike) => bike.id === selectedBikeId || bike._id === selectedBikeId
    ) || bikes?.[0];

  const handleBikeSelect = (bikeId) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    selectBike(bikeId);
    setModalVisible(false);
  };

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
        api.get(`/dashboard/bikes/${selectedBikeId}/status`),
        api.get(`/dashboard/bikes/${selectedBikeId}/upcoming-tasks`),
        api.get(`/dashboard/bikes/${selectedBikeId}/recent-activities`),
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
  }, [selectedBikeId]);

  if (!bikes || bikes.length === 0)
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

  // Calculate progress for next service
  const totalKm = currentStatus?.totalKm || 0;
  const nextServiceDue = currentStatus?.nextServiceDue || 0;
  const serviceProgress = nextServiceDue > 0 ? Math.min(totalKm / nextServiceDue, 1) : 0;
  const kmToService = nextServiceDue - totalKm > 0 ? nextServiceDue - totalKm : 0;

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setRefreshing(true);
              fetchDashboardData();
            }}
            tintColor="#4F46E5"
          />
        }
      >
        {/* Header - Curved Dark */}
        <Animated.View entering={FadeInUp.duration(600)} style={styles.header}>
          <SafeAreaView edges={["top"]} style={styles.headerContent}>
            <View style={styles.headerLeft}>
              <Text style={styles.greetingText}>Hello, {userName?.split(' ')[0]} 👋</Text>

              <TouchableOpacity
                onPress={() => {
                  Haptics.selectionAsync();
                  setModalVisible(true);
                }}
                style={styles.bikeSelector}
                activeOpacity={0.7}
              >
                <View style={styles.bikeSelectorTextContainer}>
                  <Text style={styles.bikeBrandModel}>
                    {selectedBike.brand} {selectedBike.model}
                  </Text>
                  <Text style={styles.bikeYearBadge}>{selectedBike.year}</Text>
                </View>
                <Ionicons name="chevron-down-circle" size={20} color="#fff" />
              </TouchableOpacity>
              <Text style={styles.registerNumberText}>
                {selectedBike.registrationNumber}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.notificationBtn}
              onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
            >
              <Ionicons name="notifications" size={22} color="#fff" />
              <View style={styles.notificationDot} />
            </TouchableOpacity>
          </SafeAreaView>
        </Animated.View>

        {/* Current Status Cards */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Overview</Text>
          {currentStatus && !loading ? (
            <View>
              {/* Next Service Full Width Card */}
              <InteractiveCard delay={100} style={[styles.statusCard, { width: '100%', marginBottom: 16 }]}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <View style={{ flex: 1, paddingRight: 16 }}>
                    <Text style={styles.statusLabel}>Next Service</Text>
                    <Text style={[styles.statusValue, { fontSize: 24, marginTop: 4 }]}>
                      {kmToService.toLocaleString()} <Text style={{ fontSize: 14, color: '#888', fontWeight: '500' }}>km left</Text>
                    </Text>
                  </View>
                  <View style={[styles.iconWrapper, { backgroundColor: 'rgba(156, 39, 176, 0.1)', height: 50, width: 50, borderRadius: 16 }]}>
                    <Ionicons name="construct" size={24} color="#9C27B0" />
                  </View>
                </View>
                <View style={{ marginTop: 16 }}>
                  <Progress.Bar
                    progress={serviceProgress}
                    width={null}
                    height={8}
                    color={serviceProgress > 0.8 ? '#FF4B4B' : serviceProgress > 0.5 ? '#FF9800' : '#4CAF50'}
                    unfilledColor="#f0f0f0"
                    borderWidth={0}
                    borderRadius={4}
                  />
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }}>
                    <Text style={{ fontSize: 12, color: '#aaa', fontWeight: '500' }}>0 km</Text>
                    <Text style={{ fontSize: 12, color: '#aaa', fontWeight: '500' }}>{nextServiceDue.toLocaleString()} km</Text>
                  </View>
                </View>
              </InteractiveCard>

              {/* Grid Cards */}
              <View style={styles.statusGrid}>
                <InteractiveCard delay={200} style={styles.statusCard}>
                  <View style={[styles.iconWrapper, { backgroundColor: 'rgba(33, 150, 243, 0.1)' }]}>
                    <Ionicons name="trending-up" size={24} color="#2196F3" />
                  </View>
                  <Text style={styles.statusValue}>{currentStatus.fuelEconomy ?? "--"}</Text>
                  <Text style={styles.statusLabel}>Avg KM/L</Text>
                </InteractiveCard>

                <InteractiveCard delay={300} style={styles.statusCard}>
                  <View style={[styles.iconWrapper, { backgroundColor: 'rgba(233, 30, 99, 0.1)' }]}>
                    <Ionicons name="cash" size={24} color="#E91E63" />
                  </View>
                  <Text style={styles.statusValue}>৳{currentStatus.costPerKm ?? "--"}</Text>
                  <Text style={styles.statusLabel}>Per KM</Text>
                </InteractiveCard>

                <InteractiveCard delay={400} style={styles.statusCard}>
                  <View style={[styles.iconWrapper, { backgroundColor: 'rgba(255, 152, 0, 0.1)' }]}>
                    <Ionicons name="speedometer" size={24} color="#FF9800" />
                  </View>
                  <Text style={styles.statusValue}>{totalKm.toLocaleString()}</Text>
                  <Text style={styles.statusLabel}>Total KM</Text>
                </InteractiveCard>

                <InteractiveCard delay={500} style={styles.statusCard}>
                  <View style={[styles.iconWrapper, { backgroundColor: 'rgba(76, 175, 80, 0.1)' }]}>
                    <Ionicons name="calendar" size={24} color="#4CAF50" />
                  </View>
                  <Text style={styles.statusValue}>{upcomingTasks.length}</Text>
                  <Text style={styles.statusLabel}>Pending Tasks</Text>
                </InteractiveCard>
              </View>
            </View>
          ) : (
            <Text style={{ color: "#aaa" }}>Fetching data...</Text>
          )}
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActionsGrid}>
            {quickActions.map((action, index) => (
              <Animated.View key={action.id} entering={FadeInDown.delay(300 + (index * 100)).springify()} style={{ width: '23%' }}>
                <Link href={action.href} asChild>
                  <Pressable
                    onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
                    style={styles.quickActionCard}
                  >
                    <View style={[styles.quickActionIcon, { backgroundColor: action.color + '15' }]}>
                      <Ionicons name={action.icon} size={26} color={action.color} />
                    </View>
                    <Text style={styles.quickActionText} numberOfLines={1}>{action.title}</Text>
                  </Pressable>
                </Link>
              </Animated.View>
            ))}
          </View>
        </View>

        {/* Upcoming Tasks */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Upcoming Tasks</Text>
            <TouchableOpacity onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          {upcomingTasks && upcomingTasks.length > 0 ? (
            upcomingTasks.map((task, index) => (
              <InteractiveCard key={task.id || task._id} delay={500 + (index * 100)} style={styles.taskCard}>
                <View style={styles.taskInfo}>
                  <View style={styles.taskHeader}>
                    <Text style={styles.taskTitle}>{task.title}</Text>
                    <View
                      style={[
                        styles.priorityBadge,
                        { backgroundColor: getPriorityColor(task.priority) + '20' }, // 20 hex alpha
                      ]}
                    >
                      <Text style={[styles.priorityText, { color: getPriorityColor(task.priority) }]}>
                        {task.priority?.toUpperCase()}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.taskDetails}>
                    <Ionicons name="time-outline" size={16} color="#888" />
                    <Text style={styles.taskDue}>Due in {task.dueIn}</Text>
                  </View>
                </View>
                <View style={styles.taskAction}>
                  <Ionicons name="chevron-forward" size={20} color="#ccc" />
                </View>
              </InteractiveCard>
            ))
          ) : (
            <View style={styles.emptyCard}>
              <Ionicons name="checkmark-circle-outline" size={32} color="#ddd" />
              <Text style={styles.emptyText}>All caught up on tasks!</Text>
            </View>
          )}
        </View>

        {/* Recent Activities */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Activities</Text>
            <TouchableOpacity onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          {recentActivities && recentActivities.length > 0 ? (
            recentActivities.map((activity, index) => (
              <Animated.View key={activity.id || activity._id} entering={FadeInDown.delay(700 + (index * 100)).springify()} style={styles.activityCard}>
                <View style={styles.activityIcon}>
                  <Ionicons
                    name={getActivityIcon(activity.type)}
                    size={22}
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
              </Animated.View>
            ))
          ) : (
            <View style={styles.emptyCard}>
              <Ionicons name="time-outline" size={32} color="#ddd" />
              <Text style={styles.emptyText}>No recent activities.</Text>
            </View>
          )}
        </View>

      </ScrollView>

      {/* Bike Selection Modal */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <TouchableOpacity
          style={styles.modalOverlay}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setModalVisible(false);
          }}
          activeOpacity={1}
        >
          <Animated.View entering={FadeInDown.duration(300).springify()} style={styles.modalContent}>
            <View style={styles.modalDragHandle} />
            <Text style={styles.modalTitle}>Select Your Bike</Text>
            {bikes.map((bike) => (
              <TouchableOpacity
                key={bike.id || bike._id}
                onPress={() => handleBikeSelect(bike.id || bike._id)}
                style={[
                  styles.modalItem,
                  (bike.id || bike._id) === selectedBikeId && styles.modalItemSelected
                ]}
              >
                <View style={styles.modalItemIcon}>
                  <Ionicons
                    name="bicycle"
                    size={24}
                    color={(bike.id || bike._id) === selectedBikeId ? "#fff" : "#4F46E5"}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[
                    styles.modalItemTitle,
                    (bike.id || bike._id) === selectedBikeId && { color: "#fff" }
                  ]}>
                    {bike.brand} {bike.model} <Text style={{ fontWeight: 'normal', fontSize: 14 }}>({bike.year})</Text>
                  </Text>
                  <Text style={[
                    styles.modalItemSub,
                    (bike.id || bike._id) === selectedBikeId && { color: "rgba(255,255,255,0.8)" }
                  ]}>
                    {bike.registrationNumber}
                  </Text>
                </View>
                {(bike.id || bike._id) === selectedBikeId && (
                  <Ionicons name="checkmark-circle" size={24} color="#fff" />
                )}
              </TouchableOpacity>
            ))}
          </Animated.View>
        </TouchableOpacity>
      </Modal>

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F9FC",
  },
  header: {
    backgroundColor: "#1E1E2D",
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    paddingBottom: 30,
    paddingTop: 10,
    shadowColor: "#4F46E5",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  headerLeft: {
    flex: 1,
  },
  greetingText: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.7)",
    marginBottom: 8,
    fontWeight: "500",
  },
  bikeSelector: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  bikeSelectorTextContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 8,
  },
  bikeBrandModel: {
    fontSize: 24,
    fontWeight: "800",
    color: "#ffffff",
    marginRight: 8,
  },
  bikeYearBadge: {
    backgroundColor: "rgba(255,255,255,0.15)",
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    overflow: "hidden",
  },
  registerNumberText: {
    fontSize: 14,
    color: "#4F46E5",
    fontWeight: "600",
    letterSpacing: 1,
    backgroundColor: "rgba(79, 70, 229, 0.15)",
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    marginTop: 6,
  },
  notificationBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  notificationDot: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#FF4B4B",
    borderWidth: 1,
    borderColor: "#1E1E2D",
  },
  section: {
    paddingHorizontal: 20,
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1E1E2D",
    marginBottom: 16,
    letterSpacing: -0.5,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  seeAllText: {
    color: "#4F46E5",
    fontSize: 14,
    fontWeight: "600",
  },
  statusGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  statusCard: {
    backgroundColor: "white",
    padding: 16,
    borderRadius: 20,
    width: (width - 56) / 2,
    marginBottom: 16,
    shadowColor: "rgba(0,0,0,0.05)",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 4,
  },
  iconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  statusValue: {
    fontSize: 22,
    fontWeight: "800",
    color: "#1E1E2D",
    marginBottom: 4,
  },
  statusLabel: {
    fontSize: 13,
    color: "#888",
    fontWeight: "500",
  },
  quickActionsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  quickActionCard: {
    alignItems: "center",
  },
  quickActionIcon: {
    width: 60,
    height: 60,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  quickActionText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#1E1E2D",
    textAlign: "center",
  },
  taskCard: {
    backgroundColor: "white",
    padding: 16,
    borderRadius: 20,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "rgba(0,0,0,0.03)",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 3,
  },
  taskInfo: {
    flex: 1,
  },
  taskHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start", // changed from center to flex-start so long text wraps nicely
    marginBottom: 8,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1E1E2D",
    flex: 1,
    marginRight: 8,
  },
  priorityBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginLeft: 8,
  },
  priorityText: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  taskDetails: {
    flexDirection: "row",
    alignItems: "center",
  },
  taskDue: {
    fontSize: 13,
    color: "#888",
    marginLeft: 6,
    fontWeight: "500",
  },
  taskAction: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F7F9FC",
    justifyContent: "center",
    alignItems: "center",
  },
  activityCard: {
    backgroundColor: "white",
    padding: 16,
    borderRadius: 20,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "rgba(0,0,0,0.03)",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 3,
  },
  activityIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: "#F7F9FC",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  activityInfo: {
    flex: 1,
  },
  activityDescription: {
    fontSize: 15,
    color: "#1E1E2D",
    fontWeight: "600",
    marginBottom: 4,
  },
  activityDate: {
    fontSize: 13,
    color: "#888",
    fontWeight: "500",
  },
  activityAmount: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1E1E2D",
  },
  emptyCard: {
    backgroundColor: "white",
    padding: 30,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#eee",
    borderStyle: "dashed",
  },
  emptyText: {
    marginTop: 12,
    fontSize: 15,
    color: "#888",
    fontWeight: "500",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "white",
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 24,
    paddingBottom: 40,
    maxHeight: "80%",
  },
  modalDragHandle: {
    width: 40,
    height: 5,
    backgroundColor: "#ddd",
    borderRadius: 3,
    alignSelf: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#1E1E2D",
    marginBottom: 20,
  },
  modalItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    backgroundColor: "#F7F9FC",
  },
  modalItemSelected: {
    backgroundColor: "#4F46E5",
  },
  modalItemIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.8)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  modalItemTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1E1E2D",
    marginBottom: 4,
  },
  modalItemSub: {
    fontSize: 13,
    color: "#666",
    fontWeight: "500",
  }
});

export default Dashboard;
