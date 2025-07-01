import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet, Dimensions, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { API_URL } from "../../config";

const { width } = Dimensions.get('window');

export default function RelatedProducts() {
  const { category } = useLocalSearchParams();
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_URL}/api/products`);
        const json = await res.json();
        const data = (json.products || []).map((p) => ({
          ...p,
          image: p.productImage
            ? `${API_URL}/api/products/image/${p._id}`
            : "https://via.placeholder.com/200x150?text=No+Image",
          name: p.productName || p.name,
          price: p.price,
          category: p.category,
          address: p.address,
          phone: p.phoneNumber,
          details: p.details,
          id: p._id,
        }));
        setProducts(data);
      } catch (e) {
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const related = useMemo(() => {
    return products.filter((p) => p.category === category);
  }, [products, category]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>All Related Products</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#4F46E5" style={{ marginTop: 30 }} />
      ) : (
        <FlatList
          data={related}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() =>
                router.push({
                  pathname: "/(tabs)/(marketplace)/Product",
                  params: { product: JSON.stringify(item), related: JSON.stringify(products) },
                })
              }
            >
              <Image source={{ uri: item.image }} style={styles.image} />
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.price}>TK {item.price}</Text>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No related products found.</Text>
          }
        />
      )}
    </View>
  );
}

const colors = {
  primary: "#4F46E5",
  text: "#1f2937",
  bg: "#f8fafc",
  accent: "#6B7280",
  card: "#ffffff",
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
    paddingTop: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 18,
    color: colors.text,
  },
  list: {
    paddingHorizontal: 10,
    paddingBottom: 20,
  },
  card: {
    flex: 1,
    margin: 8,
    backgroundColor: colors.card,
    borderRadius: 10,
    alignItems: "center",
    padding: 12,
    elevation: 2,
  },
  image: {
    width: width / 2.5,
    height: 110,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: "#eee",
  },
  name: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 4,
    textAlign: "center",
  },
  price: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: "bold",
    textAlign: "center",
  },
  emptyText: {
    color: colors.accent,
    fontSize: 15,
    marginTop: 20,
    textAlign: "center",
  },
});