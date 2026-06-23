import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { ScaledSheet, moderateScale } from "react-native-size-matters";
import InteractiveCard from '../common/InteractiveCard';

const QuickActions = () => {
  const router = useRouter();

  const handleNavigation = (path) => {
    router.push(path);
  };

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Quick Actions</Text>
      <View style={styles.quickActionsContainer}>
        <InteractiveCard delay={600} style={styles.actionItem} onPress={() => handleNavigation("/(tabs)/(dashboard)/license")}>
          <View style={[styles.actionIcon, { backgroundColor: 'rgba(79, 70, 229, 0.1)' }]}>
            <Ionicons name="card" size={moderateScale(24)} color="#4F46E5" />
          </View>
          <Text style={styles.actionText}>License</Text>
        </InteractiveCard>

        <InteractiveCard delay={700} style={styles.actionItem} onPress={() => handleNavigation("/(tabs)/(dashboard)/registration")}>
          <View style={[styles.actionIcon, { backgroundColor: 'rgba(16, 185, 129, 0.1)' }]}>
            <Ionicons name="document-text" size={moderateScale(24)} color="#10B981" />
          </View>
          <Text style={styles.actionText}>Registration</Text>
        </InteractiveCard>

        <InteractiveCard delay={800} style={styles.actionItem} onPress={() => handleNavigation("/(tabs)/(dashboard)/tax-token")}>
          <View style={[styles.actionIcon, { backgroundColor: 'rgba(245, 158, 11, 0.1)' }]}>
            <Ionicons name="receipt" size={moderateScale(24)} color="#F59E0B" />
          </View>
          <Text style={styles.actionText}>Tax Token</Text>
        </InteractiveCard>

        <InteractiveCard delay={900} style={styles.actionItem} onPress={() => handleNavigation("/(tabs)/(dashboard)/report")}>
          <View style={[styles.actionIcon, { backgroundColor: 'rgba(236, 72, 153, 0.1)' }]}>
            <Ionicons name="stats-chart" size={moderateScale(24)} color="#EC4899" />
          </View>
          <Text style={styles.actionText}>Reports</Text>
        </InteractiveCard>
      </View>
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
  quickActionsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "white",
    padding: '20@ms',
    borderRadius: '24@s',
    shadowColor: "rgba(0,0,0,0.05)",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 1,
    shadowRadius: 20,
    elevation: 5,
  },
  actionItem: {
    alignItems: "center",
  },
  actionIcon: {
    width: '56@s',
    height: '56@s',
    borderRadius: '20@s',
    justifyContent: "center",
    alignItems: "center",
    marginBottom: '8@vs',
  },
  actionText: {
    fontSize: '12@ms0.5',
    fontWeight: "600",
    color: "#1E1E2D",
  },
});

export default QuickActions;
