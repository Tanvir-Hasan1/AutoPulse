// app/(tabs)/(dashboard)/_layout.jsx
import { Stack } from "expo-router";

export default function DashboardLayout() {
  return (
    <Stack
      screenOptions={{
        headerBackTitleVisible: false,
        headerStyle: {
          backgroundColor: "#FFFFFF",
        },
        headerTintColor: "#1E1E2D",
        headerTitleStyle: {
          fontWeight: "700",
        },
        headerShadowVisible: false, // Clean design
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="license"
        options={{
          headerShown: true,
          headerTitle: "License",
        }}
      />
      <Stack.Screen
        name="registration"
        options={{
          headerShown: true,
          headerTitle: "Registration",
        }}
      />
      <Stack.Screen
        name="tax-token"
        options={{
          headerShown: true,
          headerTitle: "Tax Token",
        }}
      />
      <Stack.Screen
        name="report"
        options={{
          headerShown: true,
          headerTitle: "Reports",
        }}
      />
    </Stack>
  );
}

