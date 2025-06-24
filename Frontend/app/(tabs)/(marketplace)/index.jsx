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
import { SafeAreaView } from "react-native-safe-area-context";
import ProductCard from "../../components/ProductCard";
import { useRouter } from "expo-router";

export default function Marketplace() {
  const [activeTab, setActiveTab] = useState("all");
  const [search, setSearch] = useState("");
  const [products, setProducts] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [isLoading, setIsLoading] = useState(true); // Added loading state
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
        },
        {
          id: "p1",
          name: "Helmet",
          price: 40,
          image: "https://picsum.photos/200/300?random=1",
          category: "part",
        },
        {
          id: "b2",
          name: "Road Bike",
          price: 550,
          image: "https://via.placeholder.com/200x150?text=Road+Bike",
          category: "bike",
        },
        {
          id: "p2",
          name: "Bike Chain",
          price: 25,
          image: "https://via.placeholder.com/200x150?text=Chain",
          category: "part",
        },
        {
          id: "b3",
          name: "Hybrid Bike",
          price: 600,
          image: "https://via.placeholder.com/200x150?text=Hybrid+Bike",
          category: "bike",
        },
        {
          id: "p3",
          name: "Bike Pump",
          price: 15,
          image: "https://via.placeholder.com/200x150?text=Pump",
          category: "part",
        },
        {
          id: "b4",
          name: "Electric Bike",
          price: 1200,
          image: "https://via.placeholder.com/200x150?text=Electric+Bike",
          category: "bike",
        },
        {
          id: "p4",
          name: "Bike Light",
          price: 20,
          image: "https://via.placeholder.com/200x150?text=Light",
          category: "part",
        },
        {
          id: "b5",
          name: "Folding Bike",
          price: 300,
          image: "https://via.placeholder.com/200x150?text=Folding+Bike",
          category: "bike",
        },
        {
          id: "p5",
          name: "Bike Lock",
          price: 30,
          image: "https://via.placeholder.com/200x150?text=Lock",
          category: "part",
        },
        {
          id: "b6",
          name: "Kids Bike",
          price: 200,
          image: "https://via.placeholder.com/200x150?text=Kids+Bike",
          category: "bike",
        },
        {
          id: "p6",
          name: "Bike Seat",
          price: 35,
          image: "https://via.placeholder.com/200x150?text=Seat",
          category: "part",
        },
        {
          id: "b7",
          name: "Touring Bike",
          price: 800,
          image: "https://via.placeholder.com/200x150?text=Touring+Bike",
          category: "bike",
        },
        {
          id: "p7",
          name: "Bike Tire",
          price: 45,
          image: "https://via.placeholder.com/200x150?text=Tire",
          category: "part",
        },
        {
          id: "b8",
          name: "BMX Bike",
          price: 350,
          image: "https://via.placeholder.com/200x150?text=BMX+Bike",
          category: "bike",
        },
        {
          id: "p8",
          name: "Bike Gloves",
          price: 15,
          image: "https://via.placeholder.com/200x150?text=Gloves",
          category: "part",
        },
      ];
      setProducts(data);
      setFiltered(data); // Set filtered directly to ensure initial render
      setIsLoading(false); // Update loading state
      console.log('Initial Products:', data); // Debug log
    };

    loadProducts();
  }, []);

  useEffect(() => {
    console.log('Filtering - Products:', products.length, 'Search:', search, 'ActiveTab:', activeTab); // Debug log
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
      console.log('Filtered Products:', result); // Debug log
    };

    if (products.length > 0) { // Only filter if products are loaded
      filterProducts();
    }
  }, [products, search, activeTab]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.bg} />

      <Text style={styles.title}>Marketplace</Text>

      {/* Search Bar */}
      <TextInput
        placeholder="Search products..."
        value={search}
        onChangeText={setSearch}
        style={styles.searchBox}
      />

      {/* Tabs */}
      <View style={styles.tabContainer}>
        {[
          { id: "all", label: "All", icon: "apps" },
          { id: "bike", label: "Bikes", icon: "bicycle" },
          { id: "part", label: "Parts", icon: "construct" },
        ].map((item) => (
          <TouchableOpacity
            key={item.id}
            style={[styles.tab, activeTab === item.id && styles.activeTab]}
            onPress={() => setActiveTab(item.id)}
          >
            <Ionicons
              name={item.icon}
              size={20}
              color={activeTab === item.id ? colors.active : colors.accent}
            />
            <Text
              style={[
                styles.tabText,
                activeTab === item.id && styles.activeTabText,
              ]}
            >
              {item.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

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
                console.log('Navigating to Product:', item); // Debug log
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
    marginHorizontal: 16,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: colors.card,
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: colors.tabBg,
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
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  tabText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: "500",
    color: colors.accent,
  },
  activeTab: {
    backgroundColor: colors.card,
    elevation: 2,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  activeTabText: {
    color: colors.active,
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
});