import { Ionicons } from "@expo/vector-icons";
import React, { useState, useEffect, useCallback } from "react";
import { useUser } from "../../contexts/UserContext";
import {
  Platform,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
  RefreshControl,
  TextInput,
} from "react-native";
import ProfileCard from "../../components/profile-component/ProfileCard";
import BikesTab from "../../components/profile-component/BikesTab";
import ProductsTab from "../../components/profile-component/ProductsTab";
import { API_BASE_URL } from '../../../config';
import DocumentsTab from "../../components/profile-component/DocumentsTab";
import SettingsTab from "../../components/profile-component/SettingsTab";
import { useRouter } from "expo-router";

export default function ProfileView() {
  const [activeTab, setActiveTab] = useState("bikes");
  const router = useRouter();

  const { user, updateUser, selectBike } = useUser();
  console.log("User Context:", user?.selectedBikeId);

  const bikes = user?.bikes || [];
  const selectedBikeId = user?.selectedBikeId;

  // Refetch bikes for refresh button
  const fetchBikes = useCallback(async () => {
    const userId = user?.userId;
    if (!userId) return;

    try {
      const response = await fetch(`${API_BASE_URL}/bikes/user/${userId}`);
      if (!response.ok) throw new Error("Failed to fetch bikes");
      const data = await response.json();

      if (data && Array.isArray(data.bikes)) {
        updateUser((prev) => ({
          ...prev,
          bikes: data.bikes,
          selectedBikeId:
            prev.selectedBikeId ||
            (data.bikes.length > 0 ? data.bikes[0]._id : null),
        }));
      }
    } catch (err) {
      console.error("Error fetching bikes:", err);
    }
  }, [updateUser]); // Remove user from dependencies, use closure instead

  // Handler to set a bike as primary
  const handleSelectBike = (bike) => {
    if (!bike || !bike._id) return;
    console.log("Set as Primary clicked for bike:", bike);
    selectBike(bike._id);
    // TODO: Optionally, make an API call to persist this change in backend
  };

  const [products, setProducts] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  // State to track bike changes
  const [bikeChangeCounter, setBikeChangeCounter] = useState(0);

  // Handler for bike changes (update/delete)
  const handleBikeChange = useCallback(
    async (updatedBike = null) => {
      setRefreshing(true);
      try {
        if (updatedBike) {
          // Immediately update the local state
          updateUser((prev) => ({
            ...prev,
            bikes: prev.bikes.map((bike) =>
              bike._id === updatedBike._id ? updatedBike : bike
            ),
          }));
        }
        // Then fetch the latest data
        await fetchBikes();
      } finally {
        setRefreshing(false);
      }
    },
    [fetchBikes, updateUser]
  );

  // Initial bikes fetch
  useEffect(() => {
    let mounted = true;
    const initializeData = async () => {
      if (user?.userId && mounted) {
        await fetchBikes();
      }
    };
    initializeData();
    return () => {
      mounted = false;
    };
  }, [user?.userId]); // Removed fetchBikes from dependencies

  const fetchProducts = useCallback(async () => {
    const userId = user?.userId;
    if (!userId) return;

    try {
      const res = await fetch(`${API_BASE_URL}/marketplace/products/${userId}`);
      const data = await res.json();
      if (data && Array.isArray(data.products)) {
        setProducts(data.products);
      } else {
        setProducts([]);
      }
    } catch (err) {
      console.error("Error fetching products:", err);
      setProducts([]);
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    const loadProducts = async () => {
      if (user?.userId && mounted) {
        await fetchProducts();
      }
    };
    loadProducts();
    return () => {
      mounted = false;
    };
  }, [user?.userId, fetchProducts]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchProducts();
    setRefreshing(false);
  };

  const documents = [
    {
      id: 1,
      name: "Registration Certificate (RC)",
      description: "Vehicle registration document",
      isUploaded: true,
      iconName: "document-text",
      iconColor: "#3B82F6",
      iconBg: "#DBEAFE",
    },
    {
      id: 2,
      name: "Driving License",
      description: "Two wheeler license document",
      isUploaded: true,
      iconName: "card",
      iconColor: "#10B981",
      iconBg: "#D1FAE5",
    },
    {
      id: 3,
      name: "Tax Token",
      description: "Road tax certificate document",
      isUploaded: false,
      iconName: "receipt",
      iconColor: "#F97316",
      iconBg: "#FED7AA",
    },
  ];

  const [notificationSettings, setNotificationSettings] = useState({
    maintenance: true,
    fuel: true,
    marketplace: false,
    performance: true,
    documents: true,
  });

  const toggleNotification = (key) => {
    setNotificationSettings((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  // Add Edit Profile button above the profile card
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle={Platform.OS === "android" ? "dark-content" : "dark-content"}
        backgroundColor="#f8fafc"
      />

      <Text style={styles.title}>Your Profile</Text>

      <ProfileCard
        user={user}
        styles={styles}
        onEditProfile={() => router.push("/(tabs)/(profile)/editProfile")}
      />

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "bikes" && styles.activeTab]}
          onPress={() => setActiveTab("bikes")}
        >
          <Ionicons
            name="bicycle"
            size={18}
            color={activeTab === "bikes" ? "#4F46E5" : "#9CA3AF"}
          />
          <Text
            style={[
              styles.tabText,
              activeTab === "bikes" && styles.activeTabText,
            ]}
          >
            Bikes
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === "products" && styles.activeTab]}
          onPress={() => setActiveTab("products")}
        >
          <Ionicons
            name="cube"
            size={18}
            color={activeTab === "products" ? "#4F46E5" : "#9CA3AF"}
          />
          <Text
            style={[
              styles.tabText,
              activeTab === "products" && styles.activeTabText,
            ]}
          >
            Products
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === "documents" && styles.activeTab]}
          onPress={() => setActiveTab("documents")}
        >
          <Ionicons
            name="document-text"
            size={18}
            color={activeTab === "documents" ? "#4F46E5" : "#9CA3AF"}
          />
          <Text
            style={[
              styles.tabText,
              activeTab === "documents" && styles.activeTabText,
            ]}
          >
            Docs
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === "settings" && styles.activeTab]}
          onPress={() => setActiveTab("settings")}
        >
          <Ionicons
            name="settings"
            size={18}
            color={activeTab === "settings" ? "#4F46E5" : "#9CA3AF"}
          />
          <Text
            style={[
              styles.tabText,
              activeTab === "settings" && styles.activeTabText,
            ]}
          >
            Settings
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.contentContainer}>
        <ScrollView
          style={{ flex: 1 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={async () => {
                setRefreshing(true);
                await Promise.all([fetchBikes(), fetchProducts()]);
                setRefreshing(false);
              }}
            />
          }
        >
          {activeTab === "bikes" && (
            <BikesTab
              bikes={bikes}
              styles={styles}
              selectedBikeId={selectedBikeId}
              onSelectBike={handleSelectBike}
              onBikeChange={handleBikeChange}
            />
          )}
          {activeTab === "products" && (
            <ProductsTab
              products={products}
              styles={styles}
              getProductImageUrl={(productId) =>
                `${API_BASE_URL}/marketplace/product-image/${productId}`
              }
              onProductDeleted={handleRefresh}
            />
          )}
          {activeTab === "documents" && (
            <DocumentsTab documents={documents} styles={styles} />
          )}
          {activeTab === "settings" && (
            <SettingsTab
              notificationSettings={notificationSettings}
              toggleNotification={toggleNotification}
              styles={styles}
            />
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginVertical: 20,
    color: "#1f2937",
  },
  profileCard: {
    backgroundColor: "#ffffff",
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#E5E7EB",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#4B5563",
  },
  userName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 4,
  },
  joinDate: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 12,
  },
  bikeBadgeContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    marginBottom: 16,
  },
  bikeBadge: {
    backgroundColor: "#F3F4F6",
    borderColor: "#D1D5DB",
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 4,
    margin: 4,
  },
  bikeBadgeText: {
    fontSize: 12,
    color: "#4B5563",
  },
  editButton: {
    borderColor: "#D1D5DB",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: "transparent",
  },
  editButtonText: {
    color: "#374151",
    fontWeight: "500",
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#e5e7eb",
    margin: 16,
    borderRadius: 8,
    padding: 4,
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    paddingHorizontal: 6,
    borderRadius: 6,
  },
  tabText: {
    marginLeft: 6,
    fontSize: 12,
    fontWeight: "500",
    color: "#9CA3AF",
  },
  activeTab: {
    backgroundColor: "#ffffff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  activeTabText: {
    color: "#4F46E5",
  },
  contentContainer: {
    flex: 1,
  },
  tabContent: {
    flex: 1,
    backgroundColor: "#ffffff",
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    padding: 16,
  },
  sectionHeader: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 4,
  },
  sectionDescription: {
    fontSize: 14,
    color: "#6B7280",
  },
  bikeCard: {
    flexDirection: "row",
    padding: 16,
    borderColor: "#E5E7EB",
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 12,
  },
  bikeIconContainer: {
    width: 60,
    height: 60,
    backgroundColor: "#F9FAFB",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  bikeInfo: {
    flex: 1,
  },
  bikeHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  bikeName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    flex: 1,
  },
  primaryBadge: {
    backgroundColor: "#DBEAFE",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  primaryBadgeText: {
    fontSize: 12,
    color: "#1D4ED8",
    fontWeight: "500",
  },
  setPrimaryButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  setPrimaryText: {
    fontSize: 12,
    color: "#6B7280",
  },
  bikeRegistered: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 8,
  },
  bikeDetails: {
    flexDirection: "row",
  },
  bikeDetailText: {
    fontSize: 14,
    color: "#1F2937",
    marginRight: 16,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderColor: "#D1D5DB",
    borderWidth: 1,
    borderRadius: 8,
    backgroundColor: "transparent",
  },
  addButtonText: {
    marginLeft: 8,
    fontSize: 16,
    color: "#4F46E5",
    fontWeight: "500",
  },
  productCard: {
    flexDirection: "row",
    padding: 16,
    borderColor: "#E5E7EB",
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 12,
  },
  productImageContainer: {
    width: 60,
    height: 60,
    backgroundColor: "#F9FAFB",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  productInfo: {
    flex: 1,
  },
  productHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  productTitleContainer: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 4,
  },
  productCategory: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 8,
  },
  productMetrics: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginRight: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "500",
  },
  viewCount: {
    fontSize: 12,
    color: "#6B7280",
  },
  productActions: {
    alignItems: "flex-end",
  },
  productPrice: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 4,
  },
  soldPrice: {
    textDecorationLine: "line-through",
    color: "#9CA3AF",
  },
  actionButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  actionButtonText: {
    fontSize: 12,
    color: "#4F46E5",
  },
  disabledButton: {
    opacity: 0.5,
  },
  disabledText: {
    color: "#9CA3AF",
  },
  viewAllButton: {
    padding: 16,
    borderColor: "#D1D5DB",
    borderWidth: 1,
    borderRadius: 8,
    backgroundColor: "transparent",
    alignItems: "center",
  },
  viewAllText: {
    fontSize: 16,
    color: "#374151",
    fontWeight: "500",
  },
  documentCard: {
    padding: 16,
    borderColor: "#E5E7EB",
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 16,
  },
  documentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  documentInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  documentIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  documentDetails: {
    flex: 1,
  },
  documentName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 2,
  },
  documentDescription: {
    fontSize: 14,
    color: "#6B7280",
  },
  uploadStatus: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  uploadedStatus: {
    backgroundColor: "#D1FAE5",
    borderColor: "#A7F3D0",
  },
  notUploadedStatus: {
    backgroundColor: "#FEF3C7",
    borderColor: "#FDE68A",
  },
  uploadStatusText: {
    fontSize: 12,
    fontWeight: "500",
  },
  uploadedText: {
    color: "#047857",
  },
  notUploadedText: {
    color: "#92400E",
  },
  documentActions: {
    flexDirection: "row",
    gap: 8,
  },
  documentButton: {
    flex: 1,
    padding: 10,
    borderColor: "#D1D5DB",
    borderWidth: 1,
    borderRadius: 6,
    alignItems: "center",
    backgroundColor: "transparent",
  },
  documentButtonText: {
    fontSize: 14,
    color: "#374151",
    fontWeight: "500",
  },
  settingsContainer: {
    gap: 20,
  },
  settingItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  settingInfo: {
    flex: 1,
    marginRight: 12,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#1F2937",
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: "#6B7280",
  },
  settingsFooter: {
    marginTop: 24,
    gap: 12,
  },
  settingsButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderColor: "#D1D5DB",
    borderWidth: 1,
    borderRadius: 8,
    backgroundColor: "transparent",
  },
  settingsButtonText: {
    marginLeft: 8,
    fontSize: 16,
    color: "#4F46E5",
    fontWeight: "500",
  },
  signOutButton: {
    borderColor: "#FCA5A5",
    backgroundColor: "#FEF2F2",
  },
  signOutText: {
    marginLeft: 8,
    fontSize: 16,
    color: "#EF4444",
    fontWeight: "500",
  },
});
