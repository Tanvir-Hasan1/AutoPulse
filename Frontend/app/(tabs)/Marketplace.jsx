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
import ProductCard from "../components/ProductCard";

export default function Marketplace() {
  const [activeTab, setActiveTab] = useState("all");
  const [search, setSearch] = useState("");
  const [products, setProducts] = useState([]);
  const [filtered, setFiltered] = useState([]);

  useEffect(() => {
    const loadProducts = async () => {
      const data = [
        {
          id: "b1",
          name: "Mountain Bike",
          price: 400,
          image: "https://via.placeholder.com/200x150?text=Mountain+Bike",
          category: "bike",
        },
        {
          id: "p1",
          name: "Helmet",
          price: 40,
          image: "https://via.placeholder.com/200x150?text=Helmet",
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
      ];
      setProducts(data);
      setFiltered(data);
    };

    loadProducts();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [search, activeTab]);

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

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#f8fafc"
      />

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
        ].map(({ id, label, icon }) => (
          <TouchableOpacity
            key={id}
            style={[styles.tab, activeTab === id && styles.activeTab]}
            onPress={() => setActiveTab(id)}
          >
            <Ionicons
              name={icon}
              size={20}
              color={activeTab === id ? "#4F46E5" : "#9CA3AF"}
            />
            <Text
              style={[
                styles.tabText,
                activeTab === id && styles.activeTabText,
              ]}
            >
              {label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Product Grid */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <ProductCard product={item} />}
        numColumns={2}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <Text style={{ textAlign: "center", marginTop: 20, color: "#999" }}>
            No products found.
          </Text>
        }
      />
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
  searchBox: {
    height: 40,
    borderColor: "#d1d5db",
    borderWidth: 1,
    marginHorizontal: 16,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: "#ffffff",
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
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  tabText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: "500",
    color: "#9CA3AF",
  },
  activeTab: {
    backgroundColor: "#ffffff",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  activeTabText: {
    color: "#4F46E5",
  },
  list: {
    paddingHorizontal: 10,
    paddingBottom: 20,
  },
});