import { useRouter } from "expo-router";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const BikesTab = ({ bikes, styles, selectedBikeId, onSelectBike }) => {
  const router = useRouter();
  // Ensure bikes is always an array
  const safeBikes = Array.isArray(bikes) ? bikes : [];

  return (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
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
            <View key={bike._id || bike.id} style={styles.bikeCard}>
              <View style={styles.bikeIconContainer}>
                <Ionicons name="bicycle" size={24} color="#6B7280" />
              </View>
              <View style={styles.bikeInfo}>
                <View style={styles.bikeHeader}>
                  <Text style={styles.bikeName}>{bike.model || bike.name}</Text>
                  {isPrimary ? (
                    <View style={styles.primaryBadge}>
                      <Text style={styles.primaryBadgeText}>Primary</Text>
                    </View>
                  ) : (
                    <TouchableOpacity
                      style={styles.setPrimaryButton}
                      onPress={() => onSelectBike && onSelectBike(bike)}
                    >
                      <Text style={styles.setPrimaryText}>Set as Primary</Text>
                    </TouchableOpacity>
                  )}
                </View>
                <Text style={styles.bikeRegistered}>
                  Registered:{" "}
                  {bike.createdAt
                    ? new Date(bike.createdAt).toLocaleDateString(undefined, {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })
                    : ""}
                </Text>
                <View style={styles.bikeDetails}>
                  <Text style={styles.bikeDetailText}>
                    {bike.registrationNumber}
                  </Text>
                </View>
              </View>
            </View>
          );
        })
      )}
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => router.push("/(auth)/OnboardingPage")}
      >
        <Ionicons name="add" size={20} color="#4F46E5" />
        <Text style={styles.addButtonText}>Add Another Bike</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default BikesTab;
