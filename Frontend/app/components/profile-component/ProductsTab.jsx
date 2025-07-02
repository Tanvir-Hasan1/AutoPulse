import { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  ToastAndroid,
} from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { API_BASE_URL } from "../../config";
import { useNavigation } from "@react-navigation/native";
import { useRouter } from "expo-router";

const ProductsTab = ({
  products,
  styles,
  getProductImageUrl,
  onProductDeleted,
}) => {
  const navigation = useNavigation();
  const router = useRouter();
  const [showActions, setShowActions] = useState({});
  const [deletingId, setDeletingId] = useState(null);

  const handleLongPress = (productId) => {
    setShowActions((prev) => ({ ...prev, [productId]: true }));
  };

  const handleCloseActions = (productId) => {
    setShowActions((prev) => ({ ...prev, [productId]: false }));
  };

  const handleEdit = (product) => {
    try {
      // Use expo-router navigation for stack inside (profile)
      router.push({
        pathname: "/(tabs)/(profile)/EditProduct",
        params: {
          productId: product._id || product.id,
          productData: JSON.stringify(product),
        },
      });
    } catch (error) {
      console.log("Navigation error:", error);
      // Fallback to React Navigation if expo-router fails
      try {
        navigation.navigate("EditProduct", {
          product: product,
          productId: product._id || product.id,
        });
      } catch (navError) {
        console.log("React Navigation error:", navError);
        Alert.alert("Navigation Error", "Could not open edit screen");
      }
    }
  };

  const handleDelete = async (productId) => {
    setDeletingId(productId);
    let deleteFailed = false;
    try {
      const res = await fetch(
        `${API_BASE_URL}/marketplace/delete-product/${productId}`,
        {
          method: "DELETE",
        }
      );
      let data = {};
      try {
        data = await res.json();
      } catch (jsonErr) {
        console.log("Failed to parse JSON response:", jsonErr);
      }
      console.log("Delete response:", res.status, data);
      if (res.ok && data.message?.includes("success")) {
        ToastAndroid.show("Product deleted successfully", ToastAndroid.SHORT);
        if (onProductDeleted) onProductDeleted(productId);
      } else {
        deleteFailed = true;
        Alert.alert(
          "Delete Failed",
          data.message || `Could not delete product. [${res.status}]`
        );
      }
    } catch (err) {
      deleteFailed = true;
      console.log("Delete error:", err);
      Alert.alert(
        "Delete Failed",
        `Could not delete product. [${err?.message || err}]`
      );
    }
    setDeletingId(null);
    // Only close actions if delete did not fail
    if (!deleteFailed) {
      setShowActions((prev) => ({ ...prev, [productId]: false }));
    }
  };

  return (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>My Listed Products</Text>
        <Text style={styles.sectionDescription}>
          Products you have posted for sale
        </Text>
      </View>
      {products.map((product) => (
        <TouchableOpacity
          key={product._id || product.id}
          style={[
            styles.productCard,
            {
              flexDirection: "row",
              alignItems: "center",
              position: "relative",
            },
          ]}
          onLongPress={() => handleLongPress(product._id || product.id)}
          activeOpacity={0.85}
        >
          <View
            style={[
              styles.productImageContainer,
              {
                width: 90,
                height: 90,
                minWidth: 90,
                minHeight: 90,
                justifyContent: "center",
                alignItems: "center",
              },
            ]}
          >
            {product.productImage && (product._id || product.id) ? (
              <Image
                source={{
                  uri: getProductImageUrl
                    ? getProductImageUrl(product._id || product.id)
                    : product.image,
                }}
                style={{
                  width: 86,
                  height: 86,
                  borderRadius: 12,
                  backgroundColor: "#f3f4f6",
                }}
                resizeMode="cover"
              />
            ) : (
              <Ionicons name="cube" size={48} color="#9CA3AF" />
            )}
          </View>
          <View
            style={[
              styles.productInfo,
              { flex: 1, marginLeft: 22, justifyContent: "center" },
            ]}
          >
            <Text style={styles.productName} numberOfLines={1}>
              {product.productName || product.name}
            </Text>
            <Text style={styles.productCategory} numberOfLines={1}>
              {product.category}
            </Text>
            <Text style={styles.productPrice}>TK {product.price}</Text>
            {product.condition && (
              <Text style={{ fontSize: 12, color: "#6B7280", marginTop: 2 }}>
                Condition:{" "}
                {product.condition
                  .replace(/_/g, " ")
                  .replace(/^./, (c) => c.toUpperCase())}
              </Text>
            )}
            {product.address && (
              <Text
                style={{ fontSize: 12, color: "#6B7280", marginTop: 2 }}
                numberOfLines={1}
              >
                {product.address}
              </Text>
            )}
          </View>
          {showActions[product._id || product.id] && (
            <View
              style={{
                position: "absolute",
                top: 8,
                right: 8,
                flexDirection: "row",
                zIndex: 10,
              }}
            >
              <TouchableOpacity
                onPress={() => handleDelete(product._id || product.id)}
                disabled={deletingId === (product._id || product.id)}
                style={{ marginRight: 12 }}
              >
                <MaterialIcons name="delete" size={28} color="#EF4444" />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleEdit(product)}
                style={{ marginRight: 2 }}
              >
                <MaterialIcons name="edit" size={28} color="#6366F1" />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleCloseActions(product._id || product.id)}
              >
                <Ionicons name="close-circle" size={28} color="#9CA3AF" />
              </TouchableOpacity>
            </View>
          )}
        </TouchableOpacity>
      ))}
      <TouchableOpacity style={styles.viewAllButton}>
        <Text style={styles.viewAllText}>View All My Products</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default ProductsTab;
