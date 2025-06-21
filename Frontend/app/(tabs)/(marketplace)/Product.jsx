import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';

const Product = () => {
  const { product } = useLocalSearchParams();
  const parsedProduct = JSON.parse(product);

  const handleBuy = () => {
    alert(`Proceeding to buy ${parsedProduct.name} for $${parsedProduct.price}`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8fafc" />
      <View style={styles.content}>
        <Image source={{ uri: parsedProduct.image }} style={styles.image} />
        <Text style={styles.name}>{parsedProduct.name}</Text>
        <Text style={styles.price}>${parsedProduct.price}</Text>
        <Text style={styles.category}>
          Category: {parsedProduct.category.charAt(0).toUpperCase() + parsedProduct.category.slice(1)}
        </Text>
        <TouchableOpacity style={styles.buyButton} onPress={handleBuy}>
          <Text style={styles.buyButtonText}>Buy Now</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
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
    color: '#1f2937',
    marginBottom: 10,
  },
  price: {
    fontSize: 20,
    fontWeight: '600',
    color: '#4F46E5',
    marginBottom: 10,
  },
  category: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 20,
  },
  buyButton: {
    backgroundColor: '#4F46E5',
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 8,
  },
  buyButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default Product;