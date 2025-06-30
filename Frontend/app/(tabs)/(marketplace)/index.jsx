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
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { SafeAreaView } from "react-native-safe-area-context";
import ProductCard from "../../components/marketplace-component/ProductCard";
import { useRouter } from "expo-router";
import { API_BASE_URL } from "../../config";

// Set your backend API URL here
const API_URL = `${API_BASE_URL}/products`;

const categoryOptions = [
  { label: "All", value: "all" },
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
  { label: "Parts", value: "part" },
];

export default function Marketplace() {
  const [activeTab, setActiveTab] = useState("all");
  const [search, setSearch] = useState("");
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Fetch products from backend API with filters
  useEffect(() => {
    const loadProducts = async () => {
      setIsLoading(true);
      try {
        let url = `${API_URL}?category=${activeTab}`;
        if (search.trim() !== "") {
          url += `&search=${encodeURIComponent(search)}`;
        }
        const res = await fetch(url);
        const data = await res.json();
        setProducts(data);
      } catch (err) {
        setProducts([]);
      }
      setIsLoading(false);
    };

    loadProducts();
  }, [activeTab, search]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.bg} />

      <Text style={styles.title}>Marketplace</Text>

      {/* Search Bar */}
      <View style={{ flexDirection: "row", alignItems: "center", marginHorizontal: 16 }}>
        <TextInput
          placeholder="Search products..."
          value={search}
          onChangeText={setSearch}
          style={[styles.searchBox, { flex: 1, marginRight: 8 }]}
        />
        {search.length > 0 && (
          <TouchableOpacity
            onPress={() => setSearch("")}
            style={{
              position: "absolute",
              right: 50,
              padding: 8,
              zIndex: 1,
            }}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="close-circle" size={20} color="#9CA3AF" />
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={styles.searchButton}
          onPress={() => {
            router.push({
              pathname: "/(tabs)/(marketplace)/SearchResults",
              params: { results: JSON.stringify(products) },
            });
          }}
        >
          <Ionicons name="search" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Category Dropdown */}
      <View style={Platform.OS === "android" ? styles.pickerAndroid : styles.pickerIOS}>
        <Picker
          selectedValue={activeTab}
          onValueChange={(itemValue) => setActiveTab(itemValue)}
          style={{ width: "100%" }}
        >
          {categoryOptions.map((cat) => (
            <Picker.Item key={cat.value} label={cat.label} value={cat.value} />
          ))}
        </Picker>
      </View>

      <TouchableOpacity
        style={styles.postButton}
        onPress={() => router.push("/(tabs)/(marketplace)/PostProduct")}
      >
        <Text style={styles.postButtonText}>+ Post a Product</Text>
      </TouchableOpacity>

      {/* Product Grid */}
      {isLoading ? (
        <Text style={styles.emptyText}>Loading products...</Text>
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => item._id || item.id}
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
            <Text style={styles.emptyText}>
              No products found.
            </Text>
          }
        />
      )}
    </SafeAreaView>
  );
}

const numColumns = 2;

const colors = {
  primary: "#4F46E5",
  accent: "#9CA3AF",
  active: "#4F46E5",
  text: "#1f2937",
  border: "#d1d5db",
  bg: "#f8fafc",
  card: "#ffffff",
  tabBg: "#e5e7eb",
  shadow: "#000",
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginVertical: 20,
    color: colors.text,
  },
  searchBox: {
    height: 40,
    borderColor: colors.border,
    borderWidth: 1,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: colors.card,
  },
  searchButton: {
    backgroundColor: colors.primary,
    padding: 9,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  pickerAndroid: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    margin: 16,
    backgroundColor: "#fff",
    overflow: "hidden",
  },
  pickerIOS: {
    margin: 16,
    backgroundColor: "#fff",
  },
  list: {
    paddingHorizontal: 10,
    paddingBottom: 20,
  },
  emptyText: {
    textAlign: "center",
    marginTop: 20,
    color: colors.accent,
  },
  postButton: {
    backgroundColor: colors.primary,
    margin: 16,
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  postButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});