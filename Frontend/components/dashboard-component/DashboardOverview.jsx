import React from 'react';
import { View, Text, Dimensions } from 'react-native';
import { Ionicons } from "@expo/vector-icons";
import { ScaledSheet, moderateScale } from "react-native-size-matters";
import * as Progress from 'react-native-progress';
import InteractiveCard from '../common/InteractiveCard';

const { width } = Dimensions.get("window");

const DashboardOverview = ({ 
  currentStatus, 
  loading, 
  kmToService, 
  serviceProgress, 
  nextServiceDue, 
  lastServiceKm, 
  totalKm, 
  upcomingTasksCount 
}) => {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Overview</Text>
      {currentStatus && !loading ? (
        <View>
          {/* Next Service Full Width Card */}
          <InteractiveCard delay={100} style={[styles.statusCard, { width: '100%', marginBottom: moderateScale(16) }]}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <View style={{ flex: 1, paddingRight: moderateScale(16) }}>
                <Text style={styles.statusLabel}>Next Service</Text>
                <Text style={[styles.statusValue, { fontSize: moderateScale(24), marginTop: moderateScale(4) }]}>
                  {kmToService.toLocaleString()} <Text style={{ fontSize: moderateScale(14), color: '#888', fontWeight: '500' }}>km left</Text>
                </Text>
              </View>
              <View style={[styles.iconWrapper, { backgroundColor: 'rgba(156, 39, 176, 0.1)', height: moderateScale(50), width: moderateScale(50), borderRadius: moderateScale(16) }]}>
                <Ionicons name="construct" size={moderateScale(24)} color="#9C27B0" />
              </View>
            </View>
            <View style={{ marginTop: moderateScale(16) }}>
              <Progress.Bar
                progress={serviceProgress}
                width={null}
                height={moderateScale(8)}
                color={serviceProgress > 0.8 ? '#FF4B4B' : serviceProgress > 0.5 ? '#FF9800' : '#4CAF50'}
                unfilledColor="#f0f0f0"
                borderWidth={0}
                borderRadius={moderateScale(4)}
              />
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: moderateScale(8) }}>
                <Text style={{ fontSize: moderateScale(12), color: '#aaa', fontWeight: '500' }}>{lastServiceKm.toLocaleString()} km</Text>
                <Text style={{ fontSize: moderateScale(12), color: '#aaa', fontWeight: '500' }}>{nextServiceDue.toLocaleString()} km</Text>
              </View>
            </View>
          </InteractiveCard>

          {/* Grid Cards */}
          <View style={styles.statusGrid}>
            <InteractiveCard delay={200} style={styles.statusCard}>
              <View style={[styles.iconWrapper, { backgroundColor: 'rgba(33, 150, 243, 0.1)' }]}>
                <Ionicons name="trending-up" size={moderateScale(24)} color="#2196F3" />
              </View>
              <Text style={styles.statusValue}>{currentStatus.fuelEconomy ?? "--"}</Text>
              <Text style={styles.statusLabel}>Avg KM/L</Text>
            </InteractiveCard>

            <InteractiveCard delay={300} style={styles.statusCard}>
              <View style={[styles.iconWrapper, { backgroundColor: 'rgba(233, 30, 99, 0.1)' }]}>
                <Ionicons name="cash" size={moderateScale(24)} color="#E91E63" />
              </View>
              <Text style={styles.statusValue}>৳{currentStatus.costPerKm ?? "--"}</Text>
              <Text style={styles.statusLabel}>Per KM</Text>
            </InteractiveCard>

            <InteractiveCard delay={400} style={styles.statusCard}>
              <View style={[styles.iconWrapper, { backgroundColor: 'rgba(255, 152, 0, 0.1)' }]}>
                <Ionicons name="speedometer" size={moderateScale(24)} color="#FF9800" />
              </View>
              <Text style={styles.statusValue}>{totalKm.toLocaleString()}</Text>
              <Text style={styles.statusLabel}>Total KM</Text>
            </InteractiveCard>

            <InteractiveCard delay={500} style={styles.statusCard}>
              <View style={[styles.iconWrapper, { backgroundColor: 'rgba(76, 175, 80, 0.1)' }]}>
                <Ionicons name="calendar" size={moderateScale(24)} color="#4CAF50" />
              </View>
              <Text style={styles.statusValue}>{upcomingTasksCount}</Text>
              <Text style={styles.statusLabel}>Pending Tasks</Text>
            </InteractiveCard>
          </View>
        </View>
      ) : (
        <Text style={{ color: "#aaa" }}>Fetching data...</Text>
      )}
    </View>
  );
};

const styles = ScaledSheet.create({
  section: {
    paddingHorizontal: '20@s',
    marginTop: '24@vs',
  },
  sectionTitle: {
    fontSize: '18@ms0.5',
    fontWeight: "700",
    color: "#1E1E2D",
    marginBottom: '16@vs',
    letterSpacing: -0.5,
  },
  statusGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  statusCard: {
    backgroundColor: "white",
    padding: '16@ms',
    borderRadius: '20@s',
    width: (width - moderateScale(56)) / 2,
    marginBottom: '16@vs',
    shadowColor: "rgba(0,0,0,0.05)",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 4,
  },
  iconWrapper: {
    width: '44@s',
    height: '44@s',
    borderRadius: '14@s',
    justifyContent: "center",
    alignItems: "center",
    marginBottom: '16@vs',
  },
  statusValue: {
    fontSize: '22@ms0.5',
    fontWeight: "800",
    color: "#1E1E2D",
    marginBottom: '4@vs',
  },
  statusLabel: {
    fontSize: '13@ms0.5',
    color: "#888",
    fontWeight: "500",
  },
});

export default DashboardOverview;
