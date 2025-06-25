import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';

const Product = () => {
  const { product } = useLocalSearchParams();
  const parsedProduct = JSON.parse(product);

  const handleBuy = () => {
    alert(`Proceeding to buy ${parsedProduct.name} for TK ${parsedProduct.price}`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.bg} />
      <View style={styles.content}>
        <Image source={{ uri: parsedProduct.image }} style={styles.image} />
        <Text style={styles.name}>{parsedProduct.name}</Text>
        <Text style={styles.price}>TK {parsedProduct.price}</Text>
        <Text style={styles.category}>
          Category: {parsedProduct.category.charAt(0).toUpperCase() + parsedProduct.category.slice(1)}
        </Text>
        <Text style={styles.address}>Address: {parsedProduct.address}</Text>
        <Text style={styles.phone}>Phone: {parsedProduct.phone}</Text>
        <TouchableOpacity style={styles.buyButton} onPress={handleBuy}>
          <Text style={styles.buyButtonText}>Buy Now</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

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
  },
  content: {
    flex: 1,
    alignItems: 'center',
    padding: 20,
  },
  image: {
    width: '100%',
    height: 300,
    borderRadius: 10,
    marginBottom: 20,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 10,
  },
  price: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.primary,
    marginBottom: 10,
  },
  category: {
    fontSize: 16,
    color: colors.accent,
    marginBottom: 5,
  },
  address: {
    fontSize: 15,
    color: colors.accent,
    marginBottom: 5,
  },
  phone: {
    fontSize: 15,
    color: colors.accent,
    marginBottom: 20,
  },
  buyButton: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 8,
  },
  buyButtonText: {
    color: colors.card,
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default Product;