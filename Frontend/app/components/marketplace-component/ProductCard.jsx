import React from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";

// Add cache-busting to image URL if product.updatedAt exists
const ProductCard = ({ product, onPress }) => {
  let imageUrl = product.image;
  if (product.updatedAt) {
    imageUrl = `${product.image}?t=${new Date(product.updatedAt).getTime()}`;
  }
  return (
    <TouchableOpacity style={styles.card} onPress={() => onPress?.(product)}>
      <Image source={{ uri: imageUrl }} style={styles.image} />
      <Text style={styles.name}>{product.name}</Text>
      <Text style={styles.price}>TK {product.price}</Text>
      <Text style={styles.address}>{product.address}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    margin: 5,
    backgroundColor: "#fff",
    borderRadius: 8,
    overflow: "hidden",
    elevation: 3,
  },
  image: {
    width: "100%",
    height: 120,
    resizeMode: "cover",
  },
  name: {
    fontSize: 16,
    fontWeight: "500",
    marginHorizontal: 8,
    marginTop: 8,
    color: "#1f2937",
  },
  price: {
    fontSize: 13,
    marginHorizontal: 8,
    marginBottom: 4,
    fontWeight: "bold",
    color: "#111827",
  },
  address: {
    fontSize: 12,
    marginHorizontal: 8,
    marginBottom: 8,
    color: "#6B7280",
  },
});

export default ProductCard;
