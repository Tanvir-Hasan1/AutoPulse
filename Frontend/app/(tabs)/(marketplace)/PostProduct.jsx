import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Platform,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { useRouter } from "expo-router";

const categories = [
  { label: "Bike", value: "bike" },
  { label: "Tires", value: "tires" },
  { label: "Chains", value: "chains" },
  { label: "Sprockets", value: "sprockets" },
  { label: "Brake Pads", value: "brake_pads" },
  { label: "Pedals", value: "pedals" },
  { label: "Handlebars", value: "handlebars" },
  { label: "Seats", value: "seats" },
  { label: "Inner Tubes", value: "inner_tubes" },
  { label: "Cranksets", value: "cranksets" },
  { label: "Derailleurs", value: "derailleurs" },
];

export default function PostProduct() {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [image, setImage] = useState("");
  const [category, setCategory] = useState(categories[0].value);
  const [address, setAddress] = useState("");
  const [details, setDetails] = useState("");
  const router = useRouter();

  const handleSubmit = () => {
    const newProduct = {
      name,
      price: parseFloat(price),
      image,
      category,
      address,
      details,
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
      <View
        style={
          Platform.OS === "android"
            ? styles.pickerAndroid
            : styles.pickerIOS
        }
      >
        <Picker
          selectedValue={category}
          onValueChange={(itemValue) => setCategory(itemValue)}
          style={{ width: "100%" }}
        >
          {categories.map((cat) => (
            <Picker.Item key={cat.value} label={cat.label} value={cat.value} />
          ))}
        </Picker>
      </View>
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
  pickerAndroid: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    marginBottom: 15,
    backgroundColor: "#fff",
    overflow: "hidden",
  },
  pickerIOS: {
    marginBottom: 15,
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
