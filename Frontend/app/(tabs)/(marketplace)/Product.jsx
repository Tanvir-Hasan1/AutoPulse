import React, { useMemo } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Linking,
  ScrollView,
  Dimensions,
  FlatList,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

// Use the same product data as in index.jsx
const allProducts = [
  {
    id: "b1",
    name: "pulsar150",
    price: 900000,
    image: "https://picsum.photos/200/300?random=0",
    category: "bike",
    address: "123 Main St, Dhaka",
    phone: "01700000001",
    details: "Well maintained, single owner, 2019 model.",
  },
  {
    id: "p1",
    name: "Helmet",
    price: 40,
    image: "https://picsum.photos/200/300?random=1",
    category: "part",
    address: "456 Park Ave, Chittagong",
    phone: "01700000002",
    details: "Brand new helmet, never used.",
  },
  {
    id: "b2",
    name: "Road Bike",
    price: 550,
    image: "https://via.placeholder.com/200x150?text=Road+Bike",
    category: "bike",
    address: "789 Lake Rd, Sylhet",
    phone: "01700000003",
    details: "Lightweight frame, perfect for city rides.",
  },
  {
    id: "p2",
    name: "Bike Chain",
    price: 25,
    image: "https://via.placeholder.com/200x150?text=Chain",
    category: "part",
    address: "321 Hill St, Khulna",
    phone: "01700000004",
    details: "Durable chain, fits most bikes.",
  },
  {
    id: "b3",
    name: "Hybrid Bike",
    price: 600,
    image: "https://via.placeholder.com/200x150?text=Hybrid+Bike",
    category: "bike",
    address: "654 River Rd, Rajshahi",
    phone: "01700000005",
    details: "Hybrid bike, suitable for both city and off-road.",
  },
  {
    id: "p3",
    name: "Bike Pump",
    price: 15,
    image: "https://via.placeholder.com/200x150?text=Pump",
    category: "part",
    address: "987 Forest Ave, Barisal",
    phone: "01700000006",
    details: "Portable pump, easy to carry.",
  },
  {
    id: "b4",
    name: "Electric Bike",
    price: 1200,
    image: "https://via.placeholder.com/200x150?text=Electric+Bike",
    category: "bike",
    address: "246 Ocean Dr, Rangpur",
    phone: "01700000007",
    details: "Electric bike with long battery life.",
  },
  {
    id: "p4",
    name: "Bike Light",
    price: 20,
    image: "https://via.placeholder.com/200x150?text=Light",
    category: "part",
    address: "135 City Rd, Mymensingh",
    phone: "01700000008",
    details: "Bright LED light for night rides.",
  },
  {
    id: "b5",
    name: "Folding Bike",
    price: 300,
    image: "https://via.placeholder.com/200x150?text=Folding+Bike",
    category: "bike",
    address: "753 Green St, Comilla",
    phone: "01700000009",
    details: "Easily foldable, great for commuters.",
  },
  {
    id: "p5",
    name: "Bike Lock",
    price: 30,
    image: "https://via.placeholder.com/200x150?text=Lock",
    category: "part",
    address: "159 Blue Rd, Narayanganj",
    phone: "01700000010",
    details: "Strong lock for bike security.",
  },
  {
    id: "b6",
    name: "Kids Bike",
    price: 200,
    image: "https://via.placeholder.com/200x150?text=Kids+Bike",
    category: "bike",
    address: "852 Red Ave, Gazipur",
    phone: "01700000011",
    details: "Colorful bike for kids aged 5-8.",
  },
  {
    id: "p6",
    name: "Bike Seat",
    price: 35,
    image: "https://via.placeholder.com/200x150?text=Seat",
    category: "part",
    address: "951 Yellow St, Sylhet",
    phone: "01700000012",
    details: "Comfortable seat, easy to install.",
  },
  {
    id: "b7",
    name: "Touring Bike",
    price: 800,
    image: "https://via.placeholder.com/200x150?text=Touring+Bike",
    category: "bike",
    address: "357 White Rd, Dhaka",
    phone: "01700000013",
    details: "Perfect for long distance rides.",
  },
  {
    id: "p7",
    name: "Bike Tire",
    price: 45,
    image: "https://via.placeholder.com/200x150?text=Tire",
    category: "part",
    address: "258 Black Ave, Chittagong",
    phone: "01700000014",
    details: "High grip tire for all terrains.",
  },
  {
    id: "b8",
    name: "BMX Bike",
    price: 350,
    image: "https://via.placeholder.com/200x150?text=BMX+Bike",
    category: "bike",
    address: "654 Silver St, Khulna",
    phone: "01700000015",
    details: "Sturdy BMX for tricks and stunts.",
  },
  {
    id: "p8",
    name: "Bike Gloves",
    price: 15,
    image: "https://via.placeholder.com/200x150?text=Gloves",
    category: "part",
    address: "753 Gold Rd, Rajshahi",
    phone: "01700000016",
    details: "Comfortable gloves for long rides.",
  },
];

const { width } = Dimensions.get("window");

const Product = () => {
  const { product } = useLocalSearchParams();
  const router = useRouter();
  const parsedProduct = JSON.parse(product);

  // Fallback for missing condition (for old data)
  const productCondition = parsedProduct.condition || "Unknown";

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

  // --- Related Products Section (commented out) ---
  /*
  // Find related products by category, excluding the current product
  const relatedProducts = useMemo(() => {
    return allProducts
      .filter(
        (p) =>
          p.category === parsedProduct.category && p.id !== parsedProduct.id
      )
      .slice(0, 2);
  }, [parsedProduct]);

  const handleRelatedPress = (item) => {
    router.push({
      pathname: "/(tabs)/(marketplace)/Product",
      params: { product: JSON.stringify(item) },
    });
  };

  const handleSeeAllRelated = () => {
    router.push({
      pathname: "/(tabs)/(marketplace)/RelatedProducts",
      params: { category: parsedProduct.category },
    });
  };
  */

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.bg} />
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.cardModern}>
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: parsedProduct.image }}
              style={styles.imageModern}
            />
            <View style={styles.conditionBadge}>
              <Ionicons
                name="star"
                size={14}
                color="#fff"
                style={{ marginRight: 3 }}
              />
              <Text style={styles.conditionText}>
                {productCondition
                  .replace(/_/g, " ")
                  .replace(/^./, (c) => c.toUpperCase())}
              </Text>
            </View>
          </View>
          <View style={styles.detailsModern}>
            <Text style={styles.nameModern}>{parsedProduct.name}</Text>
            <Text style={styles.priceModern}>TK {parsedProduct.price}</Text>
            <View style={styles.infoRowModern}>
              <Ionicons name="pricetag" size={18} color={colors.primary} />
              <Text style={styles.categoryModern}>
                {parsedProduct.category.charAt(0).toUpperCase() +
                  parsedProduct.category.slice(1)}
              </Text>
            </View>
            <View style={styles.infoRowModern}>
              <Ionicons name="location" size={18} color={colors.accent} />
              <Text style={styles.addressModern}>{parsedProduct.address}</Text>
            </View>
            <View style={styles.infoRowModern}>
              <Ionicons name="call" size={18} color={colors.accent} />
              <Text style={styles.phoneModern}>{parsedProduct.phone}</Text>
            </View>
            {parsedProduct.details ? (
              <View style={styles.infoRowModern}>
                <Ionicons
                  name="information-circle"
                  size={18}
                  color={colors.primary}
                />
                <Text style={styles.detailsTextModern}>
                  {parsedProduct.details}
                </Text>
              </View>
            ) : null}
            <View style={styles.buttonRowModern}>
              <TouchableOpacity
                style={styles.callButtonModern}
                onPress={handleCall}
              >
                <Ionicons
                  name="call"
                  size={20}
                  color="#fff"
                  style={{ marginRight: 6 }}
                />
                <Text style={styles.buttonTextModern}>Call</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.whatsappButtonModern}
                onPress={handleWhatsApp}
              >
                <MaterialCommunityIcons
                  name="whatsapp"
                  size={22}
                  color="#fff"
                  style={{ marginRight: 6 }}
                />
                <Text style={styles.buttonTextModern}>WhatsApp</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/*
        // Related Products Section
        <View style={styles.relatedSection}>
          <View style={styles.relatedHeader}>
            <Text style={styles.relatedTitle}>Related Products</Text>
            <TouchableOpacity
              onPress={handleSeeAllRelated}
              style={styles.plusButton}
            >
              <Ionicons name="add-circle" size={26} color={colors.primary} />
            </TouchableOpacity>
          </View>
          <FlatList
            data={relatedProducts}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.relatedCard}
                onPress={() => handleRelatedPress(item)}
              >
                <Image
                  source={{ uri: item.image }}
                  style={styles.relatedImage}
                />
                <Text style={styles.relatedName} numberOfLines={1}>
                  {item.name}
                </Text>
                <Text style={styles.relatedPrice}>TK {item.price}</Text>
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              <Text style={styles.noRelatedText}>
                No related products found.
              </Text>
            }
          />
        </View>
        */}
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
    alignItems: "center",
    paddingBottom: 32,
    paddingTop: 0,
  },
  cardModern: {
    width: "94%",
    backgroundColor: colors.card,
    borderRadius: 22,
    marginTop: 18,
    marginBottom: 18,
    alignSelf: "center",
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.13,
    shadowRadius: 12,
    elevation: 6,
    overflow: "hidden",
  },
  imageContainer: {
    width: "100%",
    height: 260,
    backgroundColor: "#e5e7eb",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  imageModern: {
    width: "100%",
    height: 260,
    resizeMode: "cover",
  },
  conditionBadge: {
    position: "absolute",
    top: 16,
    right: 16,
    backgroundColor: colors.primary,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 4,
    zIndex: 2,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  conditionText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 13,
    letterSpacing: 0.2,
  },
  detailsModern: {
    padding: 22,
    backgroundColor: colors.card,
    borderBottomLeftRadius: 22,
    borderBottomRightRadius: 22,
  },
  nameModern: {
    fontSize: 27,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 6,
    textAlign: "center",
    letterSpacing: 0.1,
  },
  priceModern: {
    fontSize: 23,
    fontWeight: "700",
    color: colors.primary,
    marginBottom: 14,
    textAlign: "center",
    letterSpacing: 0.1,
  },
  infoRowModern: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    gap: 8,
  },
  categoryModern: {
    fontSize: 16,
    color: colors.primary,
    marginLeft: 6,
  },
  addressModern: {
    fontSize: 15,
    color: colors.accent,
    marginLeft: 6,
  },
  phoneModern: {
    fontSize: 15,
    color: colors.accent,
    marginLeft: 6,
  },
  detailsTextModern: {
    fontSize: 15,
    color: colors.text,
    marginLeft: 6,
    flex: 1,
    flexWrap: "wrap",
  },
  buttonRowModern: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 22,
    gap: 16,
  },
  callButtonModern: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: colors.primary,
    paddingVertical: 13,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  whatsappButtonModern: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "#25D366",
    paddingVertical: 13,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
    shadowColor: "#25D366",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  buttonTextModern: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "bold",
    marginLeft: 4,
    letterSpacing: 0.1,
  },
  // Related section styles (unchanged)
  relatedSection: {
    width: "100%",
    marginTop: 10,
    paddingHorizontal: 18,
    paddingBottom: 20,
  },
  relatedHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    justifyContent: "space-between",
  },
  relatedTitle: {
    fontSize: 18,
    fontWeight: "bold",
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
    alignItems: "center",
    elevation: 2,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  relatedImage: {
    width: 110,
    height: 80,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: "#eee",
  },
  relatedName: {
    fontSize: 15,
    fontWeight: "500",
    color: colors.text,
    marginBottom: 2,
    textAlign: "center",
  },
  relatedPrice: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: "bold",
    textAlign: "center",
  },
  noRelatedText: {
    color: colors.accent,
    fontSize: 14,
    marginTop: 10,
  },
});

export default Product;
