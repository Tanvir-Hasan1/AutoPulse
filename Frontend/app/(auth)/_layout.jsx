// _layout.jsx
import { Stack } from "expo-router";

export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="LoginPage" />
      <Stack.Screen name="SignupPage" />
      <Stack.Screen name="ForgotPasswordPage" />
      <Stack.Screen name="ResetPasswordPage" />
      <Stack.Screen name="OnboardingPage" />
    </Stack>
  );
}