import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';

const ProductCard = ({ product, onPress }) => (
  <TouchableOpacity style={styles.card} onPress={() => onPress?.(product)}>
    <Image source={{ uri: product.image }} style={styles.image} />
    <Text style={styles.name}>{product.name}</Text>
    <Text style={styles.price}>TK {product.price}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  card: {
    flex: 1,
    margin: 5,
    backgroundColor: '#fff',
    borderRadius: 8,
    overflow: 'hidden',
    elevation: 3,
  },
  image: { width: '100%', height: 120 },
  name: { fontSize: 16, margin: 8 },
  price: { fontSize: 14, marginHorizontal: 8, marginBottom: 8, fontWeight: 'bold' },
});

export default ProductCard;
