import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const ProductsTab = ({ products, styles }) => (
  <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>My Listed Products</Text>
      <Text style={styles.sectionDescription}>
        Products you have posted for sale
      </Text>
    </View>
    {products.map((product) => (
      <View key={product.id} style={styles.productCard}>
        <View style={styles.productImageContainer}>
          <Ionicons name="cube" size={24} color="#6B7280" />
        </View>
        <View style={styles.productInfo}>
          <View style={styles.productHeader}>
            <View style={styles.productTitleContainer}>
              <Text style={styles.productName}>{product.name}</Text>
              <Text style={styles.productCategory}>
                {product.category} • Posted {product.postedDate}
              </Text>
              <View style={styles.productMetrics}>
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: product.statusColor + "20" },
                  ]}
                >
                  <Text
                    style={[styles.statusText, { color: product.statusColor }]}
                  >
                    {product.status}
                  </Text>
                </View>
                <Text style={styles.viewCount}>{product.views} views</Text>
              </View>
            </View>
            <View style={styles.productActions}>
              <Text
                style={[
                  styles.productPrice,
                  product.isSold && styles.soldPrice,
                ]}
              >
                {product.price}
              </Text>
              <TouchableOpacity
                style={[
                  styles.actionButton,
                  product.isSold && styles.disabledButton,
                ]}
                disabled={product.isSold}
              >
                <Text
                  style={[
                    styles.actionButtonText,
                    product.isSold && styles.disabledText,
                  ]}
                >
                  {product.status === "Sold"
                    ? "Sold"
                    : product.status === "Expired"
                    ? "Relist"
                    : "Edit"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    ))}
    <TouchableOpacity style={styles.viewAllButton}>
      <Text style={styles.viewAllText}>View All My Products</Text>
    </TouchableOpacity>
  </ScrollView>
);

export default ProductsTab;
