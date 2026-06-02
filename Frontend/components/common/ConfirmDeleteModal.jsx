import React from 'react';
import { View, Text, TouchableOpacity, Modal } from 'react-native';
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeInDown, FadeOutDown } from "react-native-reanimated";
import { ScaledSheet, moderateScale } from "react-native-size-matters";

const ConfirmDeleteModal = ({ visible, onClose, onConfirm, title, message }) => {
  if (!visible) return null;
  
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <Animated.View 
          entering={FadeInDown.duration(300).springify()} 
          exiting={FadeOutDown.duration(200)}
          style={styles.modalContainer}
        >
          <View style={styles.iconContainer}>
            <Ionicons name="trash-outline" size={moderateScale(32)} color="#EF4444" />
          </View>
          <Text style={styles.title}>{title || "Confirm Delete"}</Text>
          <Text style={styles.message}>
            {message || "Are you sure you want to delete this? This action cannot be undone."}
          </Text>
          
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.deleteButton} onPress={onConfirm}>
              <Text style={styles.deleteText}>Delete</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = ScaledSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "85%",
    backgroundColor: "white",
    borderRadius: '24@s',
    padding: '24@s',
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  iconContainer: {
    width: '64@s',
    height: '64@s',
    borderRadius: '32@s',
    backgroundColor: "rgba(239, 68, 68, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: '16@vs',
  },
  title: {
    fontSize: '20@ms0.5',
    fontWeight: "800",
    color: "#1E1E2D",
    marginBottom: '8@vs',
    textAlign: "center",
  },
  message: {
    fontSize: '14@ms0.5',
    color: "#666",
    textAlign: "center",
    marginBottom: '24@vs',
    lineHeight: '20@ms',
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  cancelButton: {
    flex: 1,
    backgroundColor: "#F3F4F6",
    paddingVertical: '12@vs',
    borderRadius: '12@s',
    alignItems: "center",
    marginRight: '8@s',
  },
  cancelText: {
    color: "#4B5563",
    fontSize: '15@ms0.5',
    fontWeight: "700",
  },
  deleteButton: {
    flex: 1,
    backgroundColor: "#EF4444",
    paddingVertical: '12@vs',
    borderRadius: '12@s',
    alignItems: "center",
    marginLeft: '8@s',
  },
  deleteText: {
    color: "white",
    fontSize: '15@ms0.5',
    fontWeight: "700",
  },
});

export default ConfirmDeleteModal;
