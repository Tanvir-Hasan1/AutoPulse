import { ScrollView, StyleSheet, View } from "react-native";

export default function Stories() {
  return (
    <View>
      <ScrollView horizontal={true} contentContainerStyle={styles.scrollview}>
        <View style={[styles.box1, styles.common]}></View>
        <View style={[styles.box2, styles.common]}></View>
        <View style={[styles.box3, styles.common]}></View>
        <View style={[styles.box1, styles.common]}></View>
        <View style={[styles.box2, styles.common]}></View>
        <View style={[styles.box3, styles.common]}></View>
        <View style={[styles.box1, styles.common]}></View>
        <View style={[styles.box3, styles.common]}></View>
        <View style={[styles.box2, styles.common]}></View>
        <View style={[styles.box3, styles.common]}></View>
        <View style={[styles.box1, styles.common]}></View>
        <View style={[styles.box2, styles.common]}></View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  box1: {
    backgroundColor: "red",
    flexShrink: 1,
  },
  box2: {
    backgroundColor: "green",
  },
  box3: {
    backgroundColor: "blue",
  },
  common: {
    height: 50,
    width: 50,
    borderRadius: 50,
    borderColor: "white",
    borderWidth: 1,
  },
  scrollview: {
    gap: 10,
    backgroundColor: "gray",
    height: 70,
    alignItems: "center",
    backgroundColor: "gray",
  },
});
