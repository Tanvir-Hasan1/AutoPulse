import { useLocalSearchParams, useRouter } from "expo-router";
import { View, Text, FlatList, StyleSheet, StatusBar } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ProductCard from "../../components/marketplace-component/ProductCard";
import { API_URL } from "../../config";

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

const numColumns = 2;

export default function SearchResults() {
  const { results } = useLocalSearchParams();
  const router = useRouter();

  // Parse products from params (passed as JSON string)
  let products = [];
  try {
    products = JSON.parse(results).map((p) => ({
      ...p,
      image: p.productImage
        ? `${API_URL}/api/products/image/${p._id || p.id}`
        : p.image || "https://via.placeholder.com/200x150?text=No+Image",
      name: p.productName || p.name,
      price: p.price,
      category: p.category,
      address: p.address,
      phone: p.phoneNumber || p.phone,
      details: p.details,
      id: p._id || p.id,
    }));
  } catch {
    products = [];
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.bg} />
      <Text style={styles.title}>Search Results</Text>
      <FlatList
        data={products}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ProductCard
            product={item}
            onPress={() =>
              router.push({
                pathname: "/(tabs)/(marketplace)/Product",
                params: { product: JSON.stringify(item), related: JSON.stringify(products) },
              })
            }
          />
        )}
        numColumns={numColumns}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No products found.</Text>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginVertical: 18,
    color: colors.text,
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