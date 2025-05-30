import { Stack } from "expo-router";

export default function AuthLayout() {
  return (
    <Stack>
      <Stack.Screen name="LoginPage" options={{ title: "Login" }} />
      <Stack.Screen name="SrignupPage" options={{ title: "Sign up" }} />
      <Stack.Screen
        name="ForgotPasswordPage"
        options={{ title: "Forgot Password" }}
      />
    </Stack>
  );
}
