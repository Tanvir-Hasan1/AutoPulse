import { Ionicons } from "@expo/vector-icons";
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Calendar } from "react-native-calendars";

export default function CalendarModal({
  visible,
  onClose,
  onSelect,
  title,
  selectedDate,
}) {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{title}</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#6b7280" />
            </TouchableOpacity>
          </View>

          <Calendar
            onDayPress={(day) => {
              onSelect(day.dateString);
              onClose();
            }}
            markedDates={{
              [selectedDate]: {
                selected: true,
                selectedColor: "#4F46E5",
                selectedTextColor: "#ffffff",
              },
            }}
            theme={{
              backgroundColor: "#ffffff",
              calendarBackground: "#ffffff",
              textSectionTitleColor: "#6b7280",
              selectedDayBackgroundColor: "#4F46E5",
              selectedDayTextColor: "#ffffff",
              todayTextColor: "#4F46E5",
              dayTextColor: "#1f2937",
              textDisabledColor: "#d1d5db",
              dotColor: "#4F46E5",
              selectedDotColor: "#ffffff",
              arrowColor: "#4F46E5",
              monthTextColor: "#1f2937",
              indicatorColor: "#4F46E5",
              textDayFontFamily: "System",
              textMonthFontFamily: "System",
              textDayHeaderFontFamily: "System",
              textDayFontWeight: "400",
              textMonthFontWeight: "600",
              textDayHeaderFontWeight: "500",
              textDayFontSize: 16,
              textMonthFontSize: 18,
              textDayHeaderFontSize: 14,
            }}
            maxDate={new Date().toISOString().split("T")[0]}
            style={styles.calendar}
          />

          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={styles.todayButton}
              onPress={() => {
                const today = new Date().toISOString().split("T")[0];
                onSelect(today);
                onClose();
              }}
            >
              <Text style={styles.todayButtonText}>Today</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    width: "90%",
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1f2937",
  },
  calendar: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  modalFooter: {
    padding: 20,
    alignItems: "center",
  },
  todayButton: {
    backgroundColor: "#f3f4f6",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  todayButtonText: {
    color: "#4F46E5",
    fontSize: 16,
    fontWeight: "500",
  },
});
