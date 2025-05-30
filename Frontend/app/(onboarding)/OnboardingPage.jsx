// import { Picker } from "@react-native-picker/picker";
// import { useNavigation } from "@react-navigation/native";
// import { useState } from "react";
// import {
//   Button,
//   Image,
//   ScrollView,
//   StyleSheet,
//   Text,
//   TextInput,
//   View,
// } from "react-native";

// const BIKE_BRANDS = [
//   "Royal Enfield",
//   "Bajaj",
//   "Hero",
//   "Honda",
//   "TVS",
//   "Yamaha",
//   "KTM",
//   "Suzuki",
//   "Jawa",
//   "Other",
// ];

// const BIKE_MODELS = {
//   "Royal Enfield": [
//     "Classic 350",
//     "Bullet 350",
//     "Meteor 350",
//     "Himalayan",
//     "Continental GT",
//     "Interceptor 650",
//   ],
//   Bajaj: ["Pulsar 150", "Pulsar 180", "Pulsar 220", "Dominar 400", "Avenger"],
//   Hero: ["Splendor", "HF Deluxe", "Passion Pro", "Glamour", "Xtreme 160R"],
//   Honda: ["Shine", "Unicorn", "Hornet 2.0", "CB350", "CB500X"],
//   TVS: ["Apache RTR 160", "Apache RTR 200", "Raider", "Ronin", "Jupiter"],
//   Yamaha: ["FZ", "MT-15", "R15", "FZ25", "Fascino"],
//   KTM: [
//     "Duke 125",
//     "Duke 200",
//     "Duke 390",
//     "RC 200",
//     "RC 390",
//     "Adventure 390",
//   ],
//   Suzuki: ["Gixxer", "Access 125", "Burgman Street", "V-Strom SX", "Hayabusa"],
//   Jawa: ["Jawa", "Forty Two", "Perak"],
//   Other: ["Custom"],
// };

// export default function OnboardingScreen() {
//   const navigation = useNavigation();
//   const [step, setStep] = useState(1);

//   const [bikeData, setBikeData] = useState({
//     brand: "",
//     model: "",
//     year: "",
//     registrationNumber: "",
//     odometer: "",
//   });

//   const handleChange = (field, value) => {
//     setBikeData((prev) => ({
//       ...prev,
//       [field]: value,
//       ...(field === "brand" && { model: "" }), // Reset model if brand changes
//     }));
//   };

//   const handleNext = () => {
//     if (step < 3) {
//       setStep(step + 1);
//     } else {
//       // TODO: Save data to backend if needed
//       navigation.navigate("Home"); // Go to home or dashboard
//     }
//   };

//   const handleBack = () => {
//     if (step > 1) {
//       setStep(step - 1);
//     }
//   };

//   const isStepComplete = () => {
//     if (step === 1) return bikeData.brand && bikeData.model;
//     if (step === 2) return bikeData.year && bikeData.registrationNumber;
//     if (step === 3) return bikeData.odometer;
//     return false;
//   };

//   return (
//     <ScrollView contentContainerStyle={styles.container}>
//       <Text style={styles.title}>Step {step} of 3</Text>
//       {step === 1 && (
//         <>
//           <Text style={styles.label}>Bike Brand</Text>
//           <Picker
//             selectedValue={bikeData.brand}
//             onValueChange={(value) => handleChange("brand", value)}
//           >
//             <Picker.Item label="Select brand" value="" />
//             {BIKE_BRANDS.map((brand) => (
//               <Picker.Item key={brand} label={brand} value={brand} />
//             ))}
//           </Picker>

//           <Text style={styles.label}>Bike Model</Text>
//           <Picker
//             selectedValue={bikeData.model}
//             enabled={bikeData.brand !== ""}
//             onValueChange={(value) => handleChange("model", value)}
//           >
//             <Picker.Item label="Select model" value="" />
//             {bikeData.brand &&
//               BIKE_MODELS[bikeData.brand]?.map((model) => (
//                 <Picker.Item key={model} label={model} value={model} />
//               ))}
//           </Picker>

//           <Image
//             source={require("../assets/placeholder.png")} // use your actual image here
//             style={styles.image}
//           />
//         </>
//       )}

//       {step === 2 && (
//         <>
//           <Text style={styles.label}>Manufacturing Year</Text>
//           <Picker
//             selectedValue={bikeData.year}
//             onValueChange={(value) => handleChange("year", value)}
//           >
//             <Picker.Item label="Select year" value="" />
//             {Array.from(
//               { length: 25 },
//               (_, i) => new Date().getFullYear() - i
//             ).map((year) => (
//               <Picker.Item
//                 key={year}
//                 label={year.toString()}
//                 value={year.toString()}
//               />
//             ))}
//           </Picker>

//           <Text style={styles.label}>Registration Number</Text>
//           <TextInput
//             style={styles.input}
//             placeholder="e.g. KA-01-AB-1234"
//             value={bikeData.registrationNumber}
//             onChangeText={(text) => handleChange("registrationNumber", text)}
//           />
//         </>
//       )}

//       {step === 3 && (
//         <>
//           <Text style={styles.label}>Odometer Reading (km)</Text>
//           <TextInput
//             style={styles.input}
//             keyboardType="numeric"
//             placeholder="e.g. 12345"
//             value={bikeData.odometer}
//             onChangeText={(text) => handleChange("odometer", text)}
//           />
//         </>
//       )}

//       <View style={styles.buttonRow}>
//         <Button title="Back" onPress={handleBack} disabled={step === 1} />
//         <Button
//           title={step === 3 ? "Complete" : "Next"}
//           onPress={handleNext}
//           disabled={!isStepComplete()}
//         />
//       </View>
//     </ScrollView>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     padding: 24,
//     justifyContent: "center",
//     flexGrow: 1,
//   },
//   title: {
//     fontSize: 22,
//     fontWeight: "bold",
//     marginBottom: 16,
//     textAlign: "center",
//   },
//   label: {
//     fontWeight: "500",
//     marginTop: 12,
//   },
//   input: {
//     borderWidth: 1,
//     borderColor: "#ccc",
//     padding: 8,
//     marginTop: 4,
//     borderRadius: 6,
//   },
//   image: {
//     width: "100%",
//     height: 150,
//     resizeMode: "contain",
//     marginTop: 20,
//   },
//   buttonRow: {
//     marginTop: 24,
//     flexDirection: "row",
//     justifyContent: "space-between",
//   },
// });
