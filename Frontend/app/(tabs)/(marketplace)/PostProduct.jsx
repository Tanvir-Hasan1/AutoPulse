import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";

export default function PostProduct() {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [image, setImage] = useState("");
  const [category, setCategory] = useState("");
  const [address, setAddress] = useState("");
  const [details, setDetails] = useState(""); // New field
  const router = useRouter();

  const handleSubmit = () => {
    const newProduct = {
      name,
      price: parseFloat(price),
      image,
      category,
      address,
      details, // Include details
    };

    // Send the product as JSON (you can use fetch here if connecting to API)
    console.log("Posting Product JSON:", JSON.stringify(newProduct));
    Alert.alert("Success", "Product posted!");
    router.back();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Post a Product</Text>
      <TextInput
        placeholder="Product Name"
        style={styles.input}
        value={name}
        onChangeText={setName}
      />
      <TextInput
        placeholder="Price"
        style={styles.input}
        keyboardType="numeric"
        value={price}
        onChangeText={setPrice}
      />
      <TextInput
        placeholder="Image URL"
        style={styles.input}
        value={image}
        onChangeText={setImage}
      />
      <TextInput
        placeholder="Category (bike or part)"
        style={styles.input}
        value={category}
        onChangeText={setCategory}
      />
      <TextInput
        placeholder="Address"
        style={styles.input}
        value={address}
        onChangeText={setAddress}
      />
      <TextInput
        placeholder="Details"
        style={[styles.input, { height: 80 }]}
        value={details}
        onChangeText={setDetails}
        multiline
      />

      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>Submit Product</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    marginBottom: 15,
    borderRadius: 8,
    padding: 10,
    backgroundColor: "#fff",
  },
  button: {
    backgroundColor: "#4F46E5",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});
