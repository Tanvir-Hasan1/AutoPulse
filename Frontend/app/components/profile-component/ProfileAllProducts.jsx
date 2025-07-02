import { useState } from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import ProductCard from "../marketplace-component/ProductCard";

export default function ProfileAllProducts() {
  const router = useRouter();
  const { productsJson } = useLocalSearchParams();
  const allProducts = productsJson ? JSON.parse(productsJson) : [];
  const [search, setSearch] = useState("");

  const filtered = allProducts.filter(
    (p) =>
      p.productName?.toLowerCase().includes(search.toLowerCase()) ||
      p.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>All My Products</Text>
      <View style={styles.searchBarContainer}>
        <TextInput
          style={styles.searchBox}
          placeholder="Search products..."
          value={search}
          onChangeText={setSearch}
        />
      </View>
      <FlatList
        data={filtered}
        keyExtractor={(item) => item._id || item.id}
        renderItem={({ item }) => <ProductCard product={item} />}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No products found.</Text>
        }
        contentContainerStyle={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
    paddingTop: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginVertical: 18,
    color: "#1f2937",
  },
  searchBarContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#d1d5db",
    marginHorizontal: 16,
    marginBottom: 12,
    paddingHorizontal: 12,
    height: 44,
  },
  searchBox: {
    flex: 1,
    fontSize: 16,
    color: "#1f2937",
    backgroundColor: "transparent",
  },
  list: {
    paddingHorizontal: 10,
    paddingBottom: 20,
  },
  emptyText: {
    color: "#9CA3AF",
    fontSize: 15,
    marginTop: 20,
    textAlign: "center",
  },
});
