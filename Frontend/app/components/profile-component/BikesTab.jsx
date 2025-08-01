import React, { useState, useEffect } from "react";
import { useRouter } from "expo-router";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  TextInput,
  Modal,
  StyleSheet,
  RefreshControl, // <-- import this
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { API_BASE_URL } from "../../config";

const BikesTab = ({
  bikes,
  styles,
  selectedBikeId,
  onSelectBike,
  onBikeUpdated,
  onBikeDeleted,
}) => {
  const router = useRouter();
  const [editingBike, setEditingBike] = useState(null);
  const [editBrand, setEditBrand] = useState("");
  const [editModel, setEditModel] = useState("");
  const [editYear, setEditYear] = useState("");
  const [editRegNum, setEditRegNum] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [loadingUpdate, setLoadingUpdate] = useState(false);
  const [loadingDeleteId, setLoadingDeleteId] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // Local bikes state for instant frontend update
  const [localBikes, setLocalBikes] = useState(bikes);

  // Sync localBikes with bikes prop
  useEffect(() => {
    setLocalBikes(bikes);
  }, [bikes]);

  // Redirect to onboarding if no bikes are present
  useEffect(() => {
    if (localBikes.length === 0) {
      router.replace("/(auth)/OnboardingPage");
    }
  }, [localBikes]);

  // Open modal and set bike info
  const openEditModal = (bike) => {
    setEditingBike(bike);
    setEditBrand(bike.brand || "");
    setEditModel(bike.model || "");
    setEditYear(bike.year ? String(bike.year) : "");
    setEditRegNum(bike.registrationNumber || "");
    setModalVisible(true);
  };

  // Update bike handler with local state update
  const handleUpdateBike = async () => {
    setLoadingUpdate(true);
    try {
      const response = await fetch(`${API_BASE_URL}/bikes/update`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingBike._id,
          brand: editBrand,
          model: editModel,
          year: editYear,
          registrationNumber: editRegNum,
        }),
      });
      const data = await response.json();
      setLoadingUpdate(false);
      if (response.ok && data.bike) {
        Alert.alert("Success", "Bike updated successfully!");
        setModalVisible(false);
        setEditingBike(null);
        // Update local bikes state
        setLocalBikes((prev) =>
          prev.map((b) => (b._id === data.bike._id ? data.bike : b))
        );
        if (onBikeUpdated) await onBikeUpdated(); // <-- refresh bikes from server
      } else {
        Alert.alert("Error", data.message || "Failed to update bike.");
      }
    } catch (error) {
      setLoadingUpdate(false);
      Alert.alert("Error", "Network error. Please try again.");
    }
  };

  // Delete bike handler using product tab mechanism (optimistic update)
  const handleDeleteBike = async (bike) => {
    Alert.alert("Delete Bike", "Are you sure you want to delete this bike?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          setLoadingDeleteId(bike._id);
          // Optimistically remove bike from UI
          setLocalBikes((prev) => prev.filter((b) => b._id !== bike._id));
          try {
            const response = await fetch(`${API_BASE_URL}/bikes/delete`, {
              method: "DELETE",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ id: bike._id }),
            });
            const data = await response.json();
            setLoadingDeleteId(null);
            if (response.ok) {
              Alert.alert("Deleted", "Bike deleted successfully!");
              if (onBikeDeleted) onBikeDeleted();
              if (onBikeUpdated) await onBikeUpdated(); // <-- refresh bikes from server
            } else {
              // If failed, restore bike to UI
              setLocalBikes((prev) => [...prev, bike]);
              Alert.alert("Error", data.message || "Failed to delete bike.");
            }
          } catch (error) {
            setLoadingDeleteId(null);
            // If failed, restore bike to UI
            setLocalBikes((prev) => [...prev, bike]);
            Alert.alert("Error", "Network error. Please try again.");
          }
        },
      },
    ]);
  };

  const safeBikes = Array.isArray(localBikes) ? localBikes : [];

  // Refresh handler
  const onRefresh = async () => {
    setRefreshing(true);
    try {
      // You can call a parent fetch function or reload bikes here
      if (typeof onBikeUpdated === "function") {
        await onBikeUpdated();
      }
    } catch (e) {
      // Optionally show error
    }
    setRefreshing(false);
  };

  return (
    <>
      <ScrollView
        style={styles.tabContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Your Bikes</Text>
          <Text style={styles.sectionDescription}>
            Manage your registered bikes
          </Text>
        </View>
        {safeBikes.length === 0 ? (
          <View style={{ alignItems: "center", marginVertical: 24 }}>
            <Text style={{ color: "#6B7280" }}>No bikes registered yet.</Text>
          </View>
        ) : (
          safeBikes.map((bike) => {
            const isPrimary = selectedBikeId === bike._id;
            return (
              <View key={bike._id || bike.id} style={bikeCardStyles.card}>
                <View style={bikeCardStyles.iconContainer}>
                  <Ionicons name="bicycle" size={32} color="#4F46E5" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={bikeCardStyles.modelText}>
                    {bike.model || bike.name}
                  </Text>
                  <Text style={bikeCardStyles.infoText}>
                    Reg#: {bike.registrationNumber}
                  </Text>
                  <Text style={bikeCardStyles.infoText}>
                    Year: {bike.year || "N/A"}
                  </Text>
                  <Text style={bikeCardStyles.infoText}>
                    Registered:{" "}
                    {bike.createdAt
                      ? new Date(bike.createdAt).toLocaleDateString(undefined, {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })
                      : ""}
                  </Text>
                  <View style={bikeCardStyles.actionRow}>
                    {isPrimary ? (
                      <View style={bikeCardStyles.primaryBadge}>
                        <Text style={bikeCardStyles.primaryBadgeText}>
                          Primary
                        </Text>
                      </View>
                    ) : (
                      <TouchableOpacity
                        style={bikeCardStyles.setPrimaryButton}
                        onPress={() => onSelectBike && onSelectBike(bike)}
                      >
                        <Text style={bikeCardStyles.setPrimaryText}>
                          Set as Primary
                        </Text>
                      </TouchableOpacity>
                    )}
                    <TouchableOpacity
                      style={bikeCardStyles.editButton}
                      onPress={() => openEditModal(bike)}
                    >
                      <Ionicons
                        name="create-outline"
                        size={16}
                        color="#4F46E5"
                        style={{ marginRight: 4 }}
                      />
                      <Text style={bikeCardStyles.editText}>Edit</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={bikeCardStyles.deleteButton}
                      onPress={() => handleDeleteBike(bike)}
                      disabled={loadingDeleteId === bike._id}
                    >
                      <Ionicons
                        name="trash-outline"
                        size={16}
                        color="#ef4444"
                        style={{ marginRight: 4 }}
                      />
                      <Text style={bikeCardStyles.deleteText}>
                        {loadingDeleteId === bike._id
                          ? "Deleting..."
                          : "Delete"}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            );
          })
        )}
        <TouchableOpacity
          style={styles.addButton}
          onPress={async () => {
            await router.push("/(auth)/OnboardingPage");
            if (typeof onBikeUpdated === "function") {
              await onBikeUpdated(); // Refetch bikes after returning from onboarding
            }
          }}
        >
          <Ionicons name="add" size={20} color="#4F46E5" />
          <Text style={styles.addButtonText}>Add Another Bike</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Edit Bike Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={modalStyles.overlay}>
          <View style={modalStyles.modal}>
            <Text style={modalStyles.header}>Edit Bike</Text>
            <Text style={modalStyles.label}>Brand</Text>
            <TextInput
              style={modalStyles.input}
              value={editBrand}
              onChangeText={setEditBrand}
              placeholder="Enter brand"
            />
            <Text style={modalStyles.label}>Model</Text>
            <TextInput
              style={modalStyles.input}
              value={editModel}
              onChangeText={setEditModel}
              placeholder="Enter model"
            />
            <Text style={modalStyles.label}>Year</Text>
            <TextInput
              style={modalStyles.input}
              value={editYear}
              onChangeText={setEditYear}
              placeholder="Enter year"
              keyboardType="numeric"
            />
            <Text style={modalStyles.label}>Registration Number</Text>
            <TextInput
              style={modalStyles.input}
              value={editRegNum}
              onChangeText={setEditRegNum}
              placeholder="Enter registration number"
            />
            <TouchableOpacity
              style={[modalStyles.button, loadingUpdate && { opacity: 0.6 }]}
              onPress={handleUpdateBike}
              disabled={loadingUpdate}
            >
              <Text style={modalStyles.buttonText}>
                {loadingUpdate ? "Updating..." : "Update"}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={modalStyles.closeButton}
              onPress={() => {
                setModalVisible(false);
                setEditingBike(null);
              }}
              disabled={loadingUpdate}
            >
              <Text style={modalStyles.closeButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
};

const bikeCardStyles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    marginVertical: 12,
    marginHorizontal: 8,
    padding: 18,
    shadowColor: "#4F46E5",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08, // minimal shadow
    shadowRadius: 8,
    elevation: 1,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E0E7FF",
  },
  iconContainer: {
    backgroundColor: "#EEF2FF",
    borderRadius: 50,
    padding: 16,
    marginRight: 16,
  },
  modelText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 2,
  },
  infoText: {
    color: "#6B7280",
    marginBottom: 2,
  },
  actionRow: {
    flexDirection: "row",
    marginTop: 8,
    flexWrap: "wrap",
  },
  primaryBadge: {
    backgroundColor: "#22c55e",
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginRight: 8,
    marginBottom: 6,
  },
  primaryBadgeText: {
    color: "#fff",
    fontWeight: "bold",
  },
  setPrimaryButton: {
    backgroundColor: "#E0E7FF",
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginRight: 8,
    marginBottom: 6,
  },
  setPrimaryText: {
    color: "#4F46E5",
    fontWeight: "bold",
  },
  editButton: {
    backgroundColor: "#F3F4F6",
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginRight: 8,
    marginBottom: 6,
    flexDirection: "row",
    alignItems: "center",
  },
  editText: {
    color: "#4F46E5",
    fontWeight: "bold",
  },
  deleteButton: {
    backgroundColor: "#FEE2E2",
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  deleteText: {
    color: "#ef4444",
    fontWeight: "bold",
  },
});

const modalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  modal: {
    width: "90%",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 24,
    elevation: 5,
    alignItems: "center",
  },
  header: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 24,
    color: "#1f2937",
  },
  label: {
    fontSize: 16,
    alignSelf: "flex-start",
    marginTop: 12,
    color: "#374151",
  },
  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
    backgroundColor: "#fff",
    width: "100%",
  },
  button: {
    backgroundColor: "#4F46E5",
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
    alignItems: "center",
    width: "100%",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  closeButton: {
    marginTop: 12,
    alignItems: "center",
    width: "100%",
  },
  closeButtonText: {
    color: "#4F46E5",
    fontWeight: "bold",
    fontSize: 16,
  },
});

export default BikesTab;
