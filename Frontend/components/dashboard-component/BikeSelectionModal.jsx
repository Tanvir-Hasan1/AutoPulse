import React from 'react';
import { View, Text, TouchableOpacity, Modal } from 'react-native';
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Animated, { FadeInDown } from "react-native-reanimated";
import { ScaledSheet, moderateScale } from "react-native-size-matters";

const BikeSelectionModal = ({ modalVisible, setModalVisible, bikes, selectedBikeId, handleBikeSelect }) => {
  return (
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
                  size={moderateScale(24)}
                  color={(bike.id || bike._id) === selectedBikeId ? "#fff" : "#4F46E5"}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[
                  styles.modalItemTitle,
                  (bike.id || bike._id) === selectedBikeId && { color: "#fff" }
                ]}>
                  {bike.brand} {bike.model} <Text style={{ fontWeight: 'normal', fontSize: moderateScale(14) }}>({bike.year})</Text>
                </Text>
                <Text style={[
                  styles.modalItemSub,
                  (bike.id || bike._id) === selectedBikeId && { color: "rgba(255,255,255,0.8)" }
                ]}>
                  {bike.registrationNumber}
                </Text>
              </View>
              {(bike.id || bike._id) === selectedBikeId && (
                <Ionicons name="checkmark-circle" size={moderateScale(24)} color="#fff" />
              )}
            </TouchableOpacity>
          ))}
        </Animated.View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = ScaledSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "white",
    borderTopLeftRadius: '32@s',
    borderTopRightRadius: '32@s',
    padding: '24@s',
    paddingBottom: '40@vs',
    maxHeight: "80%",
  },
  modalDragHandle: {
    width: '40@s',
    height: '5@vs',
    backgroundColor: "#ddd",
    borderRadius: '3@s',
    alignSelf: "center",
    marginBottom: '20@vs',
  },
  modalTitle: {
    fontSize: '20@ms0.5',
    fontWeight: "800",
    color: "#1E1E2D",
    marginBottom: '20@vs',
  },
  modalItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: '16@ms',
    borderRadius: '16@s',
    marginBottom: '12@vs',
    backgroundColor: "#F7F9FC",
  },
  modalItemSelected: {
    backgroundColor: "#4F46E5",
  },
  modalItemIcon: {
    width: '44@s',
    height: '44@s',
    borderRadius: '12@s',
    backgroundColor: "rgba(255,255,255,0.8)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: '16@s',
  },
  modalItemTitle: {
    fontSize: '16@ms0.5',
    fontWeight: "700",
    color: "#1E1E2D",
    marginBottom: '4@vs',
  },
  modalItemSub: {
    fontSize: '13@ms0.5',
    color: "#666",
    fontWeight: "500",
  }
});

export default BikeSelectionModal;
