import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from "@expo/vector-icons";
import { ScaledSheet, moderateScale } from "react-native-size-matters";
import InteractiveCard from '../common/InteractiveCard';

const RecentActivities = ({ activities }) => {
  if (!activities || activities.length === 0) return null;

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Recent Activity</Text>
        <Text style={styles.seeAllText}>See All</Text>
      </View>
      {activities.map((activity, index) => (
        <InteractiveCard key={activity.id} delay={1500 + index * 100} style={styles.activityCard}>
          <View style={styles.contentRow}>
            {/* icon */}
            <View
              style={[
                styles.activityIcon,
                {
                  backgroundColor:
                    activity.type === "fuel"
                      ? "rgba(16, 185, 129, 0.1)"
                      : "rgba(245, 158, 11, 0.1)",
                },
              ]}
            >
              <Ionicons
                name={activity.type === "fuel" ? "water" : "build"}
                size={moderateScale(20)}
                color={activity.type === "fuel" ? "#10B981" : "#F59E0B"}
              />
            </View>
            <View style={styles.activityInfo}>
              <Text style={styles.activityTitle}>{activity.description}</Text>
              <Text style={styles.activityDate}>{activity.date}</Text>
            </View>
            <Text
              style={[
                styles.activityAmount,
                { color: activity.type === "fuel" ? "#10B981" : "#F59E0B" },
              ]}
            >
              {activity.amount}
            </Text>
          </View>
        </InteractiveCard>
      ))}
    </View>
  );
};

const styles = ScaledSheet.create({
  section: {
    paddingHorizontal: '20@s',
    marginTop: '24@vs',
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: '16@vs',
  },
  sectionTitle: {
    fontSize: '18@ms0.5',
    fontWeight: "700",
    color: "#1E1E2D",
    letterSpacing: -0.5,
  },
  seeAllText: {
    color: "#4F46E5",
    fontWeight: "600",
    fontSize: '14@ms0.5',
  },
  activityCard: {
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
  activityIcon: {
    width: '44@s',
    height: '44@s',
    borderRadius: '14@s',
    justifyContent: "center",
    alignItems: "center",
    marginBottom: '8@vs',
  },
  activityInfo: {
    flex: 1,
    marginLeft: '10@s',
    marginRight: '16@s',
  },
  activityTitle: {
    fontSize: '15@ms0.5',
    fontWeight: "700",
    color: "#1E1E2D",
    marginBottom: '4@vs',
  },
  activityDate: {
    fontSize: '13@ms0.5',
    color: "#888",
    fontWeight: "500",
  },
  activityAmount: {
    fontSize: '16@ms0.5',
    fontWeight: "800",
  },
});

export default RecentActivities;
