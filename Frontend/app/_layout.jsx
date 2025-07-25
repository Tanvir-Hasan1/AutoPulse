import { Stack } from "expo-router";
import { UserProvider } from "./contexts/UserContext";
import Toast from "react-native-toast-message";
import { View } from "react-native";

export default function RootLayout() {
  return (
    <UserProvider>
      <View style={{ flex: 1 }}>
        <Stack>
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="index" options={{ headerShown: false }} />
        </Stack>
        <Toast />
      </View>
    </UserProvider>
  );
}
