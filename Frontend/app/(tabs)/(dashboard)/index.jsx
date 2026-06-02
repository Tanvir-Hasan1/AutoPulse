import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { ScaledSheet } from "react-native-size-matters";

import api from "../../../store/api";
import { useAuthStore } from "../../../store/useAuthStore";

import DashboardHeader from "../../../components/dashboard-component/DashboardHeader";
import DashboardOverview from "../../../components/dashboard-component/DashboardOverview";
import QuickActions from "../../../components/dashboard-component/QuickActions";
import UpcomingTasks from "../../../components/dashboard-component/UpcomingTasks";
import RecentActivities from "../../../components/dashboard-component/RecentActivities";
import BikeSelectionModal from "../../../components/dashboard-component/BikeSelectionModal";

export const unstable_settings = {
  initialRouteName: "index",
};
export const hideHeader = true;

const Dashboard = () => {
  const userName = useAuthStore((s) => s.name);
  const bikes = useAuthStore((s) => s.bikes);
  const selectedBikeId = useAuthStore((s) => s.selectedBikeId);
  const selectBike = useAuthStore((s) => s.selectBike);

  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [currentStatus, setCurrentStatus] = useState(null);
  const [upcomingTasks, setUpcomingTasks] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const selectedBike =
    bikes?.find(
      (bike) => bike.id === selectedBikeId || bike._id === selectedBikeId
    ) || bikes?.[0];

  const handleBikeSelect = (bikeId) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    selectBike(bikeId);
    setModalVisible(false);
  };

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
  const lastServiceKm = currentStatus?.lastServiceKm || 0;

  const totalInterval = nextServiceDue - lastServiceKm;
  const currentIntervalProgress = totalKm - lastServiceKm;
  const serviceProgress =
    totalInterval > 0
      ? Math.max(0, Math.min(currentIntervalProgress / totalInterval, 1))
      : 0;
  const kmToService =
    nextServiceDue - totalKm > 0 ? nextServiceDue - totalKm : 0;

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
        <DashboardHeader
          userName={userName}
          selectedBike={selectedBike}
          setModalVisible={setModalVisible}
        />

        <DashboardOverview
          currentStatus={currentStatus}
          loading={loading}
          kmToService={kmToService}
          serviceProgress={serviceProgress}
          nextServiceDue={nextServiceDue}
          lastServiceKm={lastServiceKm}
          totalKm={totalKm}
          upcomingTasksCount={upcomingTasks?.length || 0}
        />

        <QuickActions />

        <UpcomingTasks tasks={upcomingTasks} />

        <RecentActivities activities={recentActivities} />
      </ScrollView>

      <BikeSelectionModal
        modalVisible={modalVisible}
        setModalVisible={setModalVisible}
        bikes={bikes}
        selectedBikeId={selectedBikeId}
        handleBikeSelect={handleBikeSelect}
      />
    </View>
  );
};

const styles = ScaledSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F9FC",
  },
});

export default Dashboard;
