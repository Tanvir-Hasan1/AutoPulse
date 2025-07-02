import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
  Platform,
  StatusBar,
  RefreshControl,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { SafeAreaView } from "react-native-safe-area-context";

import ProductCard from "../../components/marketplace-component/ProductCard";
import { useRouter } from "expo-router";

import MarketplaceFilterModal from "../../components/marketplace-component/MarketplaceFilterModal";
import { API_BASE_URL } from "../../config";

const categoryOptions = [
  { label: "All", value: "all" },
  { label: "Accessories", value: "accessories" },
  { label: "Bike", value: "bike" },
  { label: "Tires", value: "tires" },
  { label: "Chains", value: "chains" },
  { label: "Sprockets", value: "sprockets" },
  { label: "Brake Pads", value: "brake_pads" },
  { label: "Pedals", value: "pedals" },
  { label: "Handlebars", value: "handlebars" },
  { label: "Seats", value: "seats" },
  { label: "Inner Tubes", value: "inner_tubes" },
  { label: "Cranksets", value: "cranksets" },
  { label: "Derailleurs", value: "derailleurs" },
  { label: "Other", value: "other" },
];

const conditionOptions = [
  { label: "Any Condition", value: "all" },
  { label: "Brand New", value: "new" },
  { label: "Like New", value: "like_new" },
  { label: "Good", value: "good" },
  { label: "Fair", value: "fair" },
  { label: "Poor", value: "poor" },
];

const sortOptions = [
  { label: "Most Recent", value: "newest" },
  { label: "Oldest First", value: "oldest" },
  { label: "Price: Low to High", value: "price_asc" },
  { label: "Price: High to Low", value: "price_desc" },
  { label: "Name: A to Z", value: "name_asc" },
  { label: "Name: Z to A", value: "name_desc" },
];

export default function Marketplace() {
  const [activeTab, setActiveTab] = useState("all");
  const [search, setSearch] = useState("");
  const [products, setProducts] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filterModalVisible, setFilterModalVisible] = useState(false);

  // Enhanced filter states
  const [filterPriceMin, setFilterPriceMin] = useState("");
  const [filterPriceMax, setFilterPriceMax] = useState("");
  const [filterLocation, setFilterLocation] = useState("");
  const [filterCondition, setFilterCondition] = useState("all");
  const [filterSortBy, setFilterSortBy] = useState("newest");
  const [filterWithImages, setFilterWithImages] = useState(false);
  const [filterNegotiable, setFilterNegotiable] = useState(false);
  const [filterRadius, setFilterRadius] = useState("");
  const [filterKeywords, setFilterKeywords] = useState("");

  const router = useRouter();

  const loadProducts = async (showRefreshIndicator = false) => {
    try {
      if (showRefreshIndicator) {
        setRefreshing(true);
      } else {
        setIsLoading(true);
      }

      const response = await fetch(`${API_BASE_URL}/marketplace/products`);
      const json = await response.json();
      if (json.products && Array.isArray(json.products)) {
        // Map API data to UI data
        const mapped = json.products.map((p) => ({
          id: p._id,
          name: p.productName,
          price: p.price,
          image:
            p.productImage && p._id
              ? `${API_BASE_URL}/marketplace/product-image/${p._id}${
                  p.updatedAt ? `?t=${new Date(p.updatedAt).getTime()}` : ""
                }`
              : null,
          category: p.category,
          address: p.address,
          phone: p.phoneNumber,
          details: p.details,
          createdAt: p.createdAt,
          updatedAt: p.updatedAt,
          condition: p.condition || "good",
          negotiable: p.negotiable || false,
        }));
        setProducts(mapped);
        setFiltered(mapped);
      } else {
        setProducts([]);
        setFiltered([]);
      }
    } catch (err) {
      setProducts([]);
      setFiltered([]);
    } finally {
      if (showRefreshIndicator) {
        setRefreshing(false);
      } else {
        setIsLoading(false);
      }
    }
  };

  const onRefresh = () => {
    loadProducts(true);
  };

  const clearAllFilters = () => {
    setFilterPriceMin("");
    setFilterPriceMax("");
    setFilterLocation("");
    setFilterCondition("all");
    setFilterSortBy("newest");
    setFilterWithImages(false);
    setFilterNegotiable(false);
    setFilterRadius("");
    setFilterKeywords("");
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filterPriceMin !== "") count++;
    if (filterPriceMax !== "") count++;
    if (filterLocation !== "") count++;
    if (filterCondition !== "all") count++;
    if (filterSortBy !== "newest") count++;
    if (filterWithImages) count++;
    if (filterNegotiable) count++;
    if (filterRadius !== "") count++;
    if (filterKeywords !== "") count++;
    return count;
  };

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    const filterProducts = () => {
      let result = products;

      if (activeTab !== "all") {
        result = result.filter((p) => p.category === activeTab);
      }

      if (search.trim() !== "") {
        result = result.filter((p) =>
          p.name.toLowerCase().includes(search.toLowerCase())
        );
      }

      // Filter by price range
      if (filterPriceMin !== "") {
        result = result.filter(
          (p) => Number(p.price) >= Number(filterPriceMin)
        );
      }
      if (filterPriceMax !== "") {
        result = result.filter(
          (p) => Number(p.price) <= Number(filterPriceMax)
        );
      }

      // Filter by location/address
      if (filterLocation.trim() !== "") {
        result = result.filter(
          (p) =>
            p.address &&
            p.address.toLowerCase().includes(filterLocation.toLowerCase())
        );
      }

      // Filter by condition
      if (filterCondition !== "all") {
        result = result.filter((p) => p.condition === filterCondition);
      }

      // Filter by images
      if (filterWithImages) {
        result = result.filter((p) => p.image !== null);
      }

      // Filter by negotiable
      if (filterNegotiable) {
        result = result.filter((p) => p.negotiable === true);
      }

      // Filter by keywords in details
      if (filterKeywords.trim() !== "") {
        result = result.filter(
          (p) =>
            p.details &&
            p.details.toLowerCase().includes(filterKeywords.toLowerCase())
        );
      }

      // Sort results
      switch (filterSortBy) {
        case "oldest":
          result.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
          break;
        case "price_asc":
          result.sort((a, b) => Number(a.price) - Number(b.price));
          break;
        case "price_desc":
          result.sort((a, b) => Number(b.price) - Number(a.price));
          break;
        case "name_asc":
          result.sort((a, b) => a.name.localeCompare(b.name));
          break;
        case "name_desc":
          result.sort((a, b) => b.name.localeCompare(a.name));
          break;
        case "newest":
        default:
          result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          break;
      }

      setFiltered(result);
    };

    filterProducts();
  }, [
    products,
    search,
    activeTab,
    filterPriceMin,
    filterPriceMax,
    filterLocation,
    filterCondition,
    filterSortBy,
    filterWithImages,
    filterNegotiable,
    filterKeywords,
  ]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.bg} />

      <Text style={styles.title}>Marketplace</Text>

      {/* Search Bar */}
      <View style={styles.searchRow}>
        <View style={styles.searchBarContainer}>
          <Ionicons
            name="search"
            size={20}
            color="#9CA3AF"
            style={{ marginLeft: 10 }}
          />
          <TextInput
            placeholder="Search products..."
            value={search}
            onChangeText={setSearch}
            style={styles.searchBox}
            placeholderTextColor="#9CA3AF"
          />
          {search.length > 0 && (
            <TouchableOpacity
              onPress={() => setSearch("")}
              style={styles.clearButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="close-circle" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity
          style={styles.searchButton}
          onPress={() => {
            router.push({
              pathname: "/(tabs)/(marketplace)/SearchResults",
              params: { results: JSON.stringify(filtered) },
            });
          }}
        >
          <Text style={styles.searchButtonText}>Search</Text>
        </TouchableOpacity>
      </View>

      {/* Category Dropdown & Filter Button */}
      <View style={styles.categoryRow}>
        <View style={{ flex: 1 }}>
          <View
            style={
              Platform.OS === "android"
                ? styles.pickerAndroid
                : styles.pickerIOS
            }
          >
            <Picker
              selectedValue={activeTab}
              onValueChange={(itemValue) => setActiveTab(itemValue)}
              style={{ width: "100%" }}
            >
              {categoryOptions.map((cat) => (
                <Picker.Item
                  key={cat.value}
                  label={cat.label}
                  value={cat.value}
                />
              ))}
            </Picker>
          </View>
        </View>
        <TouchableOpacity
          style={[
            styles.filterButton,
            getActiveFiltersCount() > 0 && styles.filterButtonActive,
          ]}
          onPress={() => setFilterModalVisible(true)}
        >
          <Ionicons
            name="filter"
            size={22}
            color={getActiveFiltersCount() > 0 ? "#fff" : "#4F46E5"}
          />
          <Text
            style={[
              styles.filterButtonText,
              getActiveFiltersCount() > 0 && styles.filterButtonTextActive,
            ]}
          >
            Filter
          </Text>
          {getActiveFiltersCount() > 0 && (
            <View style={styles.filterBadge}>
              <Text style={styles.filterBadgeText}>
                {getActiveFiltersCount()}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Enhanced Filter Modal (extracted as component) */}
      <MarketplaceFilterModal
        visible={filterModalVisible}
        onClose={() => setFilterModalVisible(false)}
        onClearAll={clearAllFilters}
        filterPriceMin={filterPriceMin}
        setFilterPriceMin={setFilterPriceMin}
        filterPriceMax={filterPriceMax}
        setFilterPriceMax={setFilterPriceMax}
        filterLocation={filterLocation}
        setFilterLocation={setFilterLocation}
        filterCondition={filterCondition}
        setFilterCondition={setFilterCondition}
        filterSortBy={filterSortBy}
        setFilterSortBy={setFilterSortBy}
        filterWithImages={filterWithImages}
        setFilterWithImages={setFilterWithImages}
        filterNegotiable={filterNegotiable}
        setFilterNegotiable={setFilterNegotiable}
        filterKeywords={filterKeywords}
        setFilterKeywords={setFilterKeywords}
        conditionOptions={conditionOptions}
        sortOptions={sortOptions}
        onApply={() => setFilterModalVisible(false)}
      />

      {/* Floating Action Button for Post Product */}
      <TouchableOpacity
        style={styles.fab}
        activeOpacity={0.85}
        onPress={() => router.push("/(tabs)/(marketplace)/PostProduct")}
      >
        <Ionicons
          name="add-circle"
          size={36}
          color="#fff"
          style={{ marginRight: 6 }}
        />
        <Text style={styles.fabText}>Post Product</Text>
      </TouchableOpacity>

      {/* Product Grid */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading products...</Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ProductCard
              product={item}
              onPress={() => {
                router.push({
                  pathname: "/(tabs)/(marketplace)/Product",
                  params: { product: JSON.stringify(item) },
                });
              }}
            />
          )}
          numColumns={numColumns}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="search-outline" size={48} color="#9CA3AF" />
              <Text style={styles.emptyText}>No products found</Text>
              <Text style={styles.emptySubtext}>
                Try adjusting your filters or search terms
              </Text>
            </View>
          }
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          }
        />
      )}
    </SafeAreaView>
  );
}

const numColumns = 2;

const colors = {
  primary: "#4F46E5",
  primaryLight: "#6366F1",
  accent: "#9CA3AF",
  active: "#4F46E5",
  text: "#1f2937",
  textSecondary: "#6B7280",
  border: "#d1d5db",
  bg: "#f8fafc",
  card: "#ffffff",
  tabBg: "#e5e7eb",
  shadow: "#000",
  success: "#10B981",
  warning: "#F59E0B",
  error: "#EF4444",
};

const styles = StyleSheet.create({
  fab: {
    position: "absolute",
    right: 10,
    bottom: 10,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 3,
    paddingHorizontal: 7,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 1,
    elevation: 1,
    zIndex: 100,
  },
  fabText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 10,
    letterSpacing: 0.05,
  },
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    textAlign: "center",
    marginVertical: 20,
    color: colors.text,
    letterSpacing: -0.5,
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
    marginBottom: 4,
    gap: 8,
  },
  searchBarContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
    height: 48,
    position: "relative",
  },
  searchBox: {
    flex: 1,
    height: 48,
    fontSize: 16,
    paddingHorizontal: 12,
    color: colors.text,
    backgroundColor: "transparent",
  },
  clearButton: {
    position: "absolute",
    right: 12,
    padding: 4,
    zIndex: 2,
  },
  searchButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  searchButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
    letterSpacing: 0.5,
  },
  categoryRow: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 8,
    gap: 12,
  },
  pickerAndroid: {
    backgroundColor: colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden",
    height: 48,
    justifyContent: "center",
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  pickerIOS: {
    backgroundColor: colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden",
    height: 48,
    justifyContent: "center",
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EEF2FF",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
    position: "relative",
  },
  filterButtonActive: {
    backgroundColor: colors.primary,
    shadowColor: colors.primary,
    shadowOpacity: 0.3,
  },
  filterButtonText: {
    color: colors.primary,
    fontWeight: "700",
    marginLeft: 8,
    fontSize: 15,
    letterSpacing: 0.3,
  },
  filterButtonTextActive: {
    color: "#fff",
  },
  filterBadge: {
    position: "absolute",
    top: -4,
    right: -4,
    backgroundColor: colors.error,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  filterBadgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
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
  postButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});
