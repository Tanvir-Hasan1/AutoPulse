import React from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Switch,
  Platform,
  StyleSheet,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { Ionicons } from "@expo/vector-icons";

const colors = {
  primary: "#4F46E5",
  text: "#1f2937",
  textSecondary: "#6B7280",
  border: "#d1d5db",
  bg: "#f8fafc",
  card: "#ffffff",
  error: "#EF4444",
};

export default function MarketplaceFilterModal({
  visible,
  onClose,
  onClearAll,
  filterPriceMin,
  setFilterPriceMin,
  filterPriceMax,
  setFilterPriceMax,
  filterLocation,
  setFilterLocation,
  filterCondition,
  setFilterCondition,
  filterSortBy,
  setFilterSortBy,
  filterWithImages,
  setFilterWithImages,
  filterNegotiable,
  setFilterNegotiable,
  filterKeywords,
  setFilterKeywords,
  conditionOptions,
  sortOptions,
  onApply,
}) {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Modal Header */}
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={onClose} style={styles.modalCloseButton}>
              <Ionicons name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Filter Products</Text>
            <TouchableOpacity
              onPress={onClearAll}
              style={styles.modalClearButton}
            >
              <Text style={styles.modalClearText}>Clear All</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.modalScrollView}
            showsVerticalScrollIndicator={false}
          >
            {/* Price Range Section */}
            <View style={styles.filterSection}>
              <Text style={styles.sectionTitle}>Price Range</Text>
              <View style={styles.priceRow}>
                <View style={styles.priceInputContainer}>
                  <Text style={styles.inputLabel}>Min Price</Text>
                  <TextInput
                    placeholder="0"
                    style={styles.priceInput}
                    keyboardType="numeric"
                    value={filterPriceMin}
                    onChangeText={setFilterPriceMin}
                    placeholderTextColor="#9CA3AF"
                  />
                </View>
                <View style={styles.priceSeparator}>
                  <Text style={styles.priceSeparatorText}>to</Text>
                </View>
                <View style={styles.priceInputContainer}>
                  <Text style={styles.inputLabel}>Max Price</Text>
                  <TextInput
                    placeholder="∞"
                    style={styles.priceInput}
                    keyboardType="numeric"
                    value={filterPriceMax}
                    onChangeText={setFilterPriceMax}
                    placeholderTextColor="#9CA3AF"
                  />
                </View>
              </View>
            </View>

            {/* Location Section */}
            <View style={styles.filterSection}>
              <Text style={styles.sectionTitle}>Location</Text>
              <View style={styles.inputContainer}>
                <Ionicons
                  name="location-outline"
                  size={20}
                  color="#6B7280"
                  style={styles.inputIcon}
                />
                <TextInput
                  placeholder="Enter city or area"
                  style={styles.input}
                  value={filterLocation}
                  onChangeText={setFilterLocation}
                  placeholderTextColor="#9CA3AF"
                />
              </View>
            </View>

            {/* Condition Section */}
            <View style={styles.filterSection}>
              <Text style={styles.sectionTitle}>Condition</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={filterCondition}
                  onValueChange={setFilterCondition}
                  style={styles.picker}
                >
                  {conditionOptions.map((option) => (
                    <Picker.Item
                      key={option.value}
                      label={option.label}
                      value={option.value}
                    />
                  ))}
                </Picker>
              </View>
            </View>

            {/* Sort Section */}
            <View style={styles.filterSection}>
              <Text style={styles.sectionTitle}>Sort By</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={filterSortBy}
                  onValueChange={setFilterSortBy}
                  style={styles.picker}
                >
                  {sortOptions.map((option) => (
                    <Picker.Item
                      key={option.value}
                      label={option.label}
                      value={option.value}
                    />
                  ))}
                </Picker>
              </View>
            </View>

            {/* Keywords Section */}
            <View style={styles.filterSection}>
              <Text style={styles.sectionTitle}>Keywords in Description</Text>
              <View style={styles.inputContainer}>
                <Ionicons
                  name="text-outline"
                  size={20}
                  color="#6B7280"
                  style={styles.inputIcon}
                />
                <TextInput
                  placeholder="e.g., mountain, road, carbon"
                  style={styles.input}
                  value={filterKeywords}
                  onChangeText={setFilterKeywords}
                  placeholderTextColor="#9CA3AF"
                />
              </View>
            </View>

            {/* Toggle Options Section */}
            <View style={styles.filterSection}>
              <Text style={styles.sectionTitle}>Additional Options</Text>

              <View style={styles.toggleRow}>
                <View style={styles.toggleInfo}>
                  <Ionicons name="image-outline" size={22} color="#6B7280" />
                  <View style={styles.toggleTextContainer}>
                    <Text style={styles.toggleTitle}>With Images Only</Text>
                    <Text style={styles.toggleSubtitle}>
                      Show products with photos
                    </Text>
                  </View>
                </View>
                <Switch
                  value={filterWithImages}
                  onValueChange={setFilterWithImages}
                  trackColor={{ false: "#E5E7EB", true: "#C7D2FE" }}
                  thumbColor={filterWithImages ? colors.primary : "#9CA3AF"}
                />
              </View>

              <View style={styles.toggleRow}>
                <View style={styles.toggleInfo}>
                  <Ionicons name="cash-outline" size={22} color="#6B7280" />
                  <View style={styles.toggleTextContainer}>
                    <Text style={styles.toggleTitle}>Negotiable Price</Text>
                    <Text style={styles.toggleSubtitle}>
                      Open to price discussion
                    </Text>
                  </View>
                </View>
                <Switch
                  value={filterNegotiable}
                  onValueChange={setFilterNegotiable}
                  trackColor={{ false: "#E5E7EB", true: "#C7D2FE" }}
                  thumbColor={filterNegotiable ? colors.primary : "#9CA3AF"}
                />
              </View>
            </View>
          </ScrollView>

          {/* Modal Footer */}
          <View style={styles.modalFooter}>
            <TouchableOpacity style={styles.applyButton} onPress={onApply}>
              <Text style={styles.applyButtonText}>Apply Filters</Text>
              <Ionicons
                name="checkmark"
                size={20}
                color="#fff"
                style={{ marginLeft: 8 }}
              />
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
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "90%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  modalCloseButton: {
    padding: 4,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.text,
    letterSpacing: -0.3,
  },
  modalClearButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  modalClearText: {
    color: colors.primary,
    fontWeight: "600",
    fontSize: 16,
  },
  modalScrollView: {
    paddingHorizontal: 24,
    paddingVertical: 8,
  },
  filterSection: {
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 12,
    letterSpacing: -0.2,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
  },
  priceInputContainer: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.textSecondary,
    marginBottom: 8,
  },
  priceInput: {
    backgroundColor: colors.bg,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: colors.text,
  },
  priceSeparator: {
    paddingHorizontal: 16,
    paddingBottom: 14,
  },
  priceSeparatorText: {
    fontSize: 16,
    color: colors.textSecondary,
    fontWeight: "500",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.bg,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.text,
  },
  pickerContainer: {
    backgroundColor: colors.bg,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    overflow: "hidden",
  },
  picker: {
    height: 50,
  },
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  toggleInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  toggleTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  toggleTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 2,
  },
  toggleSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  modalFooter: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  applyButton: {
    backgroundColor: colors.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 12,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  applyButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
});
