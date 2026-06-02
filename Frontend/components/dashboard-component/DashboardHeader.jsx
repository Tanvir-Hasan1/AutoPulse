import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Animated, { FadeInUp } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { ScaledSheet, moderateScale } from "react-native-size-matters";

const DashboardHeader = ({ userName, selectedBike, setModalVisible }) => {
  return (
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
            <Ionicons name="chevron-down-circle" size={moderateScale(20)} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.registerNumberText}>
            {selectedBike.registrationNumber}
          </Text>
        </View>
        <TouchableOpacity 
          style={styles.notificationBtn}
          onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
        >
          <Ionicons name="notifications" size={moderateScale(22)} color="#fff" />
          <View style={styles.notificationDot} />
        </TouchableOpacity>
      </SafeAreaView>
    </Animated.View>
  );
};

const styles = ScaledSheet.create({
  header: {
    backgroundColor: "#1E1E2D",
    borderBottomLeftRadius: '32@s',
    borderBottomRightRadius: '32@s',
    paddingBottom: '30@vs',
    paddingTop: '10@vs',
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
    paddingHorizontal: '24@s',
    paddingTop: '20@vs',
  },
  headerLeft: {
    flex: 1,
  },
  greetingText: {
    fontSize: '16@ms0.5',
    color: "rgba(255, 255, 255, 0.7)",
    marginBottom: '8@vs',
    fontWeight: "500",
  },
  bikeSelector: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: '4@vs',
  },
  bikeSelectorTextContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: '8@s',
  },
  bikeBrandModel: {
    fontSize: '24@ms0.5',
    fontWeight: "800",
    color: "#ffffff",
    marginRight: '8@s',
  },
  bikeYearBadge: {
    backgroundColor: "rgba(255,255,255,0.15)",
    color: "#fff",
    fontSize: '12@ms0.5',
    fontWeight: "600",
    paddingHorizontal: '8@s',
    paddingVertical: '3@vs',
    borderRadius: '8@s',
    overflow: "hidden",
  },
  registerNumberText: {
    fontSize: '14@ms0.5',
    color: "#4F46E5",
    fontWeight: "600",
    letterSpacing: 1,
    backgroundColor: "rgba(79, 70, 229, 0.15)",
    alignSelf: "flex-start",
    paddingHorizontal: '10@s',
    paddingVertical: '4@vs',
    borderRadius: '6@s',
    marginTop: '6@vs',
  },
  notificationBtn: {
    width: '44@s',
    height: '44@s',
    borderRadius: '22@s',
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  notificationDot: {
    position: "absolute",
    top: '12@s',
    right: '12@s',
    width: '8@s',
    height: '8@s',
    borderRadius: '4@s',
    backgroundColor: "#FF4B4B",
    borderWidth: 1,
    borderColor: "#1E1E2D",
  },
});

export default DashboardHeader;
