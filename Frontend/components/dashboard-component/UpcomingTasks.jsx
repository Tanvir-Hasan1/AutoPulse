import React, { useState } from 'react';
import { View, Text, Modal, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from "@expo/vector-icons";
import { ScaledSheet, moderateScale } from "react-native-size-matters";
import InteractiveCard from '../common/InteractiveCard';
import api from '../../store/api';
import { useAuthStore } from '../../store/useAuthStore';

const UpcomingTasks = ({ tasks }) => {
  const selectedBikeId = useAuthStore((s) => s.selectedBikeId);
  const [modalVisible, setModalVisible] = useState(false);
  const [activeTab, setActiveTab] = useState('upcoming'); // 'upcoming' or 'completed'
  const [completedTasks, setCompletedTasks] = useState([]);
  const [loadingCompleted, setLoadingCompleted] = useState(false);

  if (!tasks || tasks.length === 0) return null;

  const fetchCompletedTasks = async () => {
    try {
      setLoadingCompleted(true);
      const data = await api.get(`/service/${selectedBikeId}`);
      // Sort by date descending
      const sorted = data.sort((a, b) => new Date(b.date) - new Date(a.date));
      setCompletedTasks(sorted);
    } catch (error) {
      console.error("Error fetching completed tasks:", error);
    } finally {
      setLoadingCompleted(false);
    }
  };

  const handleOpenModal = () => {
    setModalVisible(true);
    setActiveTab('upcoming');
    fetchCompletedTasks(); // prefetch completed tasks
  };

  const formatDate = (dateString) => {
    try {
      const d = new Date(dateString);
      return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    } catch (e) {
      return dateString;
    }
  };

  // Only show first 3 tasks in dashboard preview
  const previewTasks = tasks.slice(0, 3);

  return (
    <View style={styles.section}>
      <View style={styles.headerRow}>
        <Text style={styles.sectionTitle}>Upcoming Tasks</Text>
        <TouchableOpacity onPress={handleOpenModal} style={styles.seeAllButton}>
          <Text style={styles.seeAllText}>See All</Text>
        </TouchableOpacity>
      </View>

      {previewTasks.map((task, index) => (
        <InteractiveCard key={task.id} delay={1000 + index * 100} style={styles.taskCard}>
          <View style={styles.contentRow}>
            {/* icon */}
            <View style={styles.taskIcon}>
              <Ionicons
                name={task.type === "service" ? "build" : "water"}
                size={moderateScale(20)}
                color="#4F46E5"
              />
            </View>
            
            <View style={styles.taskInfo}>
              <Text style={styles.taskTitle} numberOfLines={1}>{task.title}</Text>
              <View style={styles.dateBadge}>
                <Ionicons name="time-outline" size={moderateScale(14)} color="#666" style={{ marginRight: moderateScale(4) }} />
                <Text style={styles.taskDue}>
                  {task.dueIn.toLowerCase().includes("due") ? task.dueIn : `Due in ${task.dueIn}`}
                </Text>
              </View>
            </View>

            <View
              style={[
                styles.priorityBadge,
                {
                  backgroundColor:
                    task.priority === "high"
                      ? "rgba(239, 68, 68, 0.1)"
                      : task.priority === "medium"
                      ? "rgba(245, 158, 11, 0.1)"
                      : "rgba(16, 185, 129, 0.1)",
                },
              ]}
            >
              <Text
                style={[
                  styles.priorityText,
                  {
                    color:
                      task.priority === "high"
                        ? "#EF4444"
                        : task.priority === "medium"
                        ? "#F59E0B"
                        : "#10B981",
                  },
                ]}
              >
                {task.priority.toUpperCase()}
              </Text>
            </View>
          </View>
        </InteractiveCard>
      ))}

      {/* See All Tasks Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>All Tasks</Text>
            <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeButton}>
              <Ionicons name="close" size={moderateScale(24)} color="#1E1E2D" />
            </TouchableOpacity>
          </View>

          {/* Segmented Tab Bar */}
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[styles.tabButton, activeTab === 'upcoming' && styles.activeTabButton]}
              onPress={() => setActiveTab('upcoming')}
            >
              <Text style={[styles.tabButtonText, activeTab === 'upcoming' && styles.activeTabButtonText]}>
                Upcoming ({tasks.length})
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tabButton, activeTab === 'completed' && styles.activeTabButton]}
              onPress={() => {
                setActiveTab('completed');
                fetchCompletedTasks();
              }}
            >
              <Text style={[styles.tabButtonText, activeTab === 'completed' && styles.activeTabButtonText]}>
                Completed ({completedTasks.length})
              </Text>
            </TouchableOpacity>
          </View>

          {/* Scrollable list */}
          <ScrollView contentContainerStyle={styles.modalList} showsVerticalScrollIndicator={false}>
            {activeTab === 'upcoming' && (
              tasks.map((task) => (
                <View key={task.id} style={styles.taskCard}>
                  <View style={styles.contentRow}>
                    <View style={styles.taskIcon}>
                      <Ionicons
                        name={task.type === "service" ? "build" : "water"}
                        size={moderateScale(20)}
                        color="#4F46E5"
                      />
                    </View>
                    
                    <View style={styles.taskInfo}>
                      <Text style={styles.taskTitle} numberOfLines={1}>{task.title}</Text>
                      <View style={styles.dateBadge}>
                        <Ionicons name="time-outline" size={moderateScale(14)} color="#666" style={{ marginRight: moderateScale(4) }} />
                        <Text style={styles.taskDue}>
                          {task.dueIn.toLowerCase().includes("due") ? task.dueIn : `Due in ${task.dueIn}`}
                        </Text>
                      </View>
                    </View>

                    <View
                      style={[
                        styles.priorityBadge,
                        {
                          backgroundColor:
                            task.priority === "high"
                              ? "rgba(239, 68, 68, 0.1)"
                              : task.priority === "medium"
                              ? "rgba(245, 158, 11, 0.1)"
                              : "rgba(16, 185, 129, 0.1)",
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.priorityText,
                          {
                            color:
                              task.priority === "high"
                                ? "#EF4444"
                                : task.priority === "medium"
                                ? "#F59E0B"
                                : "#10B981",
                          },
                        ]}
                      >
                        {task.priority.toUpperCase()}
                      </Text>
                    </View>
                  </View>
                </View>
              ))
            )}

            {activeTab === 'completed' && (
              loadingCompleted ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color="#4F46E5" />
                  <Text style={styles.loadingText}>Loading completed tasks...</Text>
                </View>
              ) : completedTasks.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <Ionicons name="checkmark-circle-outline" size={moderateScale(48)} color="#ccc" />
                  <Text style={styles.emptyText}>No completed tasks found.</Text>
                </View>
              ) : (
                completedTasks.map((log) => (
                  <View key={log._id || log.id} style={styles.completedCard}>
                    <View style={styles.completedHeader}>
                      <Text style={styles.completedTitle}>{log.serviceType}</Text>
                      <Text style={styles.completedCost}>৳{log.cost.toFixed(0)}</Text>
                    </View>
                    <View style={styles.completedMeta}>
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Ionicons name="calendar-outline" size={moderateScale(14)} color="#6B7280" style={{ marginRight: moderateScale(4) }} />
                        <Text style={styles.completedDate}>{formatDate(log.date)}</Text>
                      </View>
                      <Text style={styles.completedOdometer}>{log.odometer.toLocaleString()} km</Text>
                    </View>
                  </View>
                ))
              )
            )}
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
};

const styles = ScaledSheet.create({
  section: {
    paddingHorizontal: '20@s',
    marginTop: '24@vs',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16@vs',
  },
  sectionTitle: {
    fontSize: '18@ms0.5',
    fontWeight: "700",
    color: "#1E1E2D",
    letterSpacing: -0.5,
  },
  seeAllButton: {
    paddingVertical: '4@vs',
    paddingHorizontal: '8@s',
  },
  seeAllText: {
    color: "#4F46E5",
    fontWeight: "600",
    fontSize: '14@ms0.5',
  },
  taskCard: {
    flexDirection: "column",
    alignItems: "flex-start",
    backgroundColor: "white",
    padding: '16@ms',
    borderRadius: '20@s',
    marginBottom: '12@vs',
    shadowColor: "rgba(0,0,0,0.03)",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 3,
  },
  contentRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    width: "100%",
    marginTop: '8@vs',
  },
  taskIcon: {
    width: '44@s',
    height: '44@s',
    borderRadius: '14@s',
    backgroundColor: "rgba(79, 70, 229, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: '8@vs',
  },
  taskInfo: {
    flex: 1,
    marginLeft: '10@s',
    marginRight: '16@s',
  },
  taskTitle: {
    fontSize: '15@ms0.5',
    fontWeight: "700",
    color: "#1E1E2D",
    marginBottom: '8@vs',
  },
  priorityBadge: {
    paddingHorizontal: '10@s',
    paddingVertical: '4@vs',
    borderRadius: '8@s',
  },
  priorityText: {
    fontSize: '10@ms0.5',
    fontWeight: "800",
  },
  dateBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    alignSelf: "flex-start",
    paddingHorizontal: '10@s',
    paddingVertical: '4@vs',
    borderRadius: '8@s',
  },
  taskDue: {
    fontSize: '13@ms0.5',
    color: "#666",
    fontWeight: "600",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "#F7F9FC",
    paddingTop: '20@vs',
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: '20@s',
    paddingBottom: '16@vs',
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  modalTitle: {
    fontSize: '20@ms0.5',
    fontWeight: "800",
    color: "#1E1E2D",
    letterSpacing: -0.5,
  },
  closeButton: {
    padding: '4@ms',
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#E5E7EB",
    borderRadius: '12@s',
    padding: '4@ms',
    marginHorizontal: '20@s',
    marginVertical: '16@vs',
  },
  tabButton: {
    flex: 1,
    paddingVertical: '10@vs',
    alignItems: "center",
    borderRadius: '8@s',
  },
  activeTabButton: {
    backgroundColor: "white",
    shadowColor: "rgba(0,0,0,0.05)",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 2,
  },
  tabButtonText: {
    fontSize: '14@ms0.5',
    fontWeight: "600",
    color: "#6B7280",
  },
  activeTabButtonText: {
    color: "#4F46E5",
    fontWeight: "700",
  },
  modalList: {
    paddingHorizontal: '20@s',
    paddingBottom: '40@vs',
  },
  completedCard: {
    backgroundColor: "white",
    padding: '16@ms',
    borderRadius: '20@s',
    marginBottom: '12@vs',
    borderLeftWidth: 4,
    borderLeftColor: "#10B981",
    shadowColor: "rgba(0,0,0,0.03)",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 2,
  },
  completedHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: '6@vs',
  },
  completedTitle: {
    fontSize: '15@ms0.5',
    fontWeight: "700",
    color: "#1E1E2D",
  },
  completedCost: {
    fontSize: '15@ms0.5',
    fontWeight: "800",
    color: "#10B981",
  },
  completedMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  completedDate: {
    fontSize: '12@ms0.5',
    color: "#6B7280",
    fontWeight: "500",
  },
  completedOdometer: {
    fontSize: '12@ms0.5',
    color: "#4F46E5",
    fontWeight: "600",
  },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: '60@vs',
  },
  loadingText: {
    fontSize: '14@ms0.5',
    color: "#6B7280",
    fontWeight: "500",
    marginTop: '12@vs',
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: '60@vs',
  },
  emptyText: {
    fontSize: '14@ms0.5',
    color: "#888",
    fontWeight: "500",
    marginTop: '8@vs',
  },
});

export default UpcomingTasks;
