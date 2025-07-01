import React, { useMemo } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, StatusBar, Linking, ScrollView, Dimensions, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const Product = () => {
  const { product, related } = useLocalSearchParams();
  const router = useRouter();
  const parsedProduct = JSON.parse(product);

  // Related products: if passed via params, parse and use, else empty array
  const relatedProducts = useMemo(() => {
    if (related) {
      try {
        const arr = JSON.parse(related);
        // Exclude current product
        return arr.filter(
          (p) =>
            (p.category === parsedProduct.category || p.category === parsedProduct.category?.toLowerCase()) &&
            p.id !== parsedProduct.id
        ).slice(0, 2);
      } catch {
        return [];
      }
    }
    return [];
  }, [related, parsedProduct]);

  const handleCall = () => {
    if (parsedProduct.phone) {
      Linking.openURL(`tel:${parsedProduct.phone}`);
    }
  };

  const handleWhatsApp = () => {
    if (parsedProduct.phone) {
      const phone = parsedProduct.phone.replace(/\D/g, "");
      const url = `https://wa.me/${phone}`;
      Linking.openURL(url);
    }
  };

  const handleRelatedPress = (item) => {
    router.push({
      pathname: "/(tabs)/(marketplace)/Product",
      params: { product: JSON.stringify(item), related },
    });
  };

  const handleSeeAllRelated = () => {
    router.push({
      pathname: "/(tabs)/(marketplace)/RelatedProducts",
      params: { category: parsedProduct.category },
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.bg} />
      <ScrollView contentContainerStyle={styles.scroll}>
        <Image source={{ uri: parsedProduct.image }} style={styles.image} />
        <View style={styles.details}>
          <Text style={styles.name}>{parsedProduct.name}</Text>
          <Text style={styles.price}>TK {parsedProduct.price}</Text>
          <View style={styles.infoRow}>
            <Ionicons name="pricetag" size={18} color={colors.primary} />
            <Text style={styles.category}>
              {parsedProduct.category?.charAt(0).toUpperCase() + parsedProduct.category?.slice(1)}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="location" size={18} color={colors.accent} />
            <Text style={styles.address}>{parsedProduct.address}</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="call" size={18} color={colors.accent} />
            <Text style={styles.phone}>{parsedProduct.phone}</Text>
          </View>
          {parsedProduct.details ? (
            <View style={styles.infoRow}>
              <Ionicons name="information-circle" size={18} color={colors.primary} />
              <Text style={styles.detailsText}>{parsedProduct.details}</Text>
            </View>
          ) : null}
          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.callButton} onPress={handleCall}>
              <Ionicons name="call" size={20} color="#fff" style={{ marginRight: 6 }} />
              <Text style={styles.buttonText}>Call</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.whatsappButton} onPress={handleWhatsApp}>
              <MaterialCommunityIcons name="whatsapp" size={22} color="#fff" style={{ marginRight: 6 }} />
              <Text style={styles.buttonText}>WhatsApp</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Related Products Section */}
        <View style={styles.relatedSection}>
          <View style={styles.relatedHeader}>
            <Text style={styles.relatedTitle}>Related Products</Text>
            <TouchableOpacity onPress={handleSeeAllRelated} style={styles.plusButton}>
              <Ionicons name="add-circle" size={26} color={colors.primary} />
            </TouchableOpacity>
          </View>
          <FlatList
            data={relatedProducts}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.relatedCard} onPress={() => handleRelatedPress(item)}>
                <Image source={{ uri: item.image }} style={styles.relatedImage} />
                <Text style={styles.relatedName} numberOfLines={1}>{item.name}</Text>
                <Text style={styles.relatedPrice}>TK {item.price}</Text>
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              <Text style={styles.noRelatedText}>No related products found.</Text>
            }
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const colors = {
  primary: "#4F46E5",
  text: "#1f2937",
  bg: "#f8fafc",
  accent: "#6B7280",
  card: "#ffffff",
  shadow: "#00000010",
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  scroll: {
    alignItems: 'center',
    paddingBottom: 32,
    paddingTop: 0,
  },
  image: {
    width: width,
    height: 300,
    resizeMode: 'cover',
    borderRadius: 0,
    marginBottom: 0,
    backgroundColor: colors.card,
  },
  details: {
    width: '100%',
    backgroundColor: colors.card,
    borderRadius: 0,
    padding: 22,
    marginTop: 0,
    marginBottom: 20,
    elevation: 2,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.10,
    shadowRadius: 4,
  },
  name: {
    fontSize: 26,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  price: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 16,
    textAlign: 'center',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 8,
  },
  category: {
    fontSize: 16,
    color: colors.primary,
    marginLeft: 6,
  },
  address: {
    fontSize: 15,
    color: colors.accent,
    marginLeft: 6,
  },
  phone: {
    fontSize: 15,
    color: colors.accent,
    marginLeft: 6,
  },
  detailsText: {
    fontSize: 15,
    color: colors.text,
    marginLeft: 6,
    flex: 1,
    flexWrap: 'wrap',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
    gap: 16,
  },
  callButton: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  whatsappButton: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#25D366',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  buttonText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  // Related section styles
  relatedSection: {
    width: '100%',
    marginTop: 10,
    paddingHorizontal: 18,
    paddingBottom: 20,
  },
  relatedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    justifyContent: 'space-between',
  },
  relatedTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  plusButton: {
    marginLeft: 8,
  },
  relatedCard: {
    width: 140,
    backgroundColor: colors.card,
    borderRadius: 12,
    marginRight: 14,
    padding: 10,
    alignItems: 'center',
    elevation: 2,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.10,
    shadowRadius: 4,
  },
  relatedImage: {
    width: 110,
    height: 80,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: '#eee',
  },
  relatedName: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 2,
    textAlign: 'center',
  },
  relatedPrice: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  noRelatedText: {
    color: colors.accent,
    fontSize: 14,
    marginTop: 10,
  },
});

export default Product;