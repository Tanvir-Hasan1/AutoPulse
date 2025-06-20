// app/(tabs)/(dashboard)/_layout.jsx
import { Stack, useGlobalSearchParams } from "expo-router";

export default function DashboardLayout() {
  return (
    <Stack
      screenOptions={({ route }) => ({
        headerShown: route.name !== "index", // ❗ hide header for Dashboard only
        headerTitle: "",
        headerBackTitleVisible: false,
      })}
    />
  );
}
