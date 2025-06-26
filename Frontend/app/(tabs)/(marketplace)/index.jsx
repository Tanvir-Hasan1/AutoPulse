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
  const [filtered, setFiltered] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const loadProducts = async () => {
      const data = [
        {
          id: "b1",
          name: "pulsar150",
          price: 900000,
          image: "https://picsum.photos/200/300?random=0",
          category: "bike",
          address: "123 Main St, Dhaka",
          phone: "01700000001",
          details: "Well maintained, single owner, 2019 model.",
        },
        {
          id: "p1",
          name: "Helmet",
          price: 40,
          image: "https://picsum.photos/200/300?random=1",
          category: "part",
          address: "456 Park Ave, Chittagong",
          phone: "01700000002",
          details: "Brand new helmet, never used.",
        },
        {
          id: "b2",
          name: "Road Bike",
          price: 550,
          image: "https://via.placeholder.com/200x150?text=Road+Bike",
          category: "bike",
          address: "789 Lake Rd, Sylhet",
          phone: "01700000003",
          details: "Lightweight frame, perfect for city rides.",
        },
        {
          id: "p2",
          name: "Bike Chain",
          price: 25,
          image: "https://via.placeholder.com/200x150?text=Chain",
          category: "part",
          address: "321 Hill St, Khulna",
          phone: "01700000004",
          details: "Durable chain, fits most bikes.",
        },
        {
          id: "b3",
          name: "Hybrid Bike",
          price: 600,
          image: "https://via.placeholder.com/200x150?text=Hybrid+Bike",
          category: "bike",
          address: "654 River Rd, Rajshahi",
          phone: "01700000005",
          details: "Hybrid bike, suitable for both city and off-road.",
        },
        {
          id: "p3",
          name: "Bike Pump",
          price: 15,
          image: "https://via.placeholder.com/200x150?text=Pump",
          category: "part",
          address: "987 Forest Ave, Barisal",
          phone: "01700000006",
          details: "Portable pump, easy to carry.",
        },
        {
          id: "b4",
          name: "Electric Bike",
          price: 1200,
          image: "https://via.placeholder.com/200x150?text=Electric+Bike",
          category: "bike",
          address: "246 Ocean Dr, Rangpur",
          phone: "01700000007",
          details: "Electric bike with long battery life.",
        },
        {
          id: "p4",
          name: "Bike Light",
          price: 20,
          image: "https://via.placeholder.com/200x150?text=Light",
          category: "part",
          address: "135 City Rd, Mymensingh",
          phone: "01700000008",
          details: "Bright LED light for night rides.",
        },
        {
          id: "b5",
          name: "Folding Bike",
          price: 300,
          image: "https://via.placeholder.com/200x150?text=Folding+Bike",
          category: "bike",
          address: "753 Green St, Comilla",
          phone: "01700000009",
          details: "Easily foldable, great for commuters.",
        },
        {
          id: "p5",
          name: "Bike Lock",
          price: 30,
          image: "https://via.placeholder.com/200x150?text=Lock",
          category: "part",
          address: "159 Blue Rd, Narayanganj",
          phone: "01700000010",
          details: "Strong lock for bike security.",
        },
        {
          id: "b6",
          name: "Kids Bike",
          price: 200,
          image: "https://via.placeholder.com/200x150?text=Kids+Bike",
          category: "bike",
          address: "852 Red Ave, Gazipur",
          phone: "01700000011",
          details: "Colorful bike for kids aged 5-8.",
        },
        {
          id: "p6",
          name: "Bike Seat",
          price: 35,
          image: "https://via.placeholder.com/200x150?text=Seat",
          category: "part",
          address: "951 Yellow St, Sylhet",
          phone: "01700000012",
          details: "Comfortable seat, easy to install.",
        },
        {
          id: "b7",
          name: "Touring Bike",
          price: 800,
          image: "https://via.placeholder.com/200x150?text=Touring+Bike",
          category: "bike",
          address: "357 White Rd, Dhaka",
          phone: "01700000013",
          details: "Perfect for long distance rides.",
        },
        {
          id: "p7",
          name: "Bike Tire",
          price: 45,
          image: "https://via.placeholder.com/200x150?text=Tire",
          category: "part",
          address: "258 Black Ave, Chittagong",
          phone: "01700000014",
          details: "High grip tire for all terrains.",
        },
        {
          id: "b8",
          name: "BMX Bike",
          price: 350,
          image: "https://via.placeholder.com/200x150?text=BMX+Bike",
          category: "bike",
          address: "654 Silver St, Khulna",
          phone: "01700000015",
          details: "Sturdy BMX for tricks and stunts.",
        },
        {
          id: "p8",
          name: "Bike Gloves",
          price: 15,
          image: "https://via.placeholder.com/200x150?text=Gloves",
          category: "part",
          address: "753 Gold Rd, Rajshahi",
          phone: "01700000016",
          details: "Comfortable gloves for long rides.",
        },
      ];
      setProducts(data);
      setFiltered(data);
      setIsLoading(false);
    };

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

      setFiltered(result);
    };

    if (products.length > 0) {
      filterProducts();
    }
  }, [products, search, activeTab]);

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
              params: { results: JSON.stringify(filtered) },
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