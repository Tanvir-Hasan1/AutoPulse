import { Redirect } from "expo-router";
import { useAuthStore } from "../store/useAuthStore";

export default function Index() {
  const token = useAuthStore((s) => s.accessToken);
  const bikes = useAuthStore((s) => s.bikes);

  if (token) {
    // Already logged in — go to dashboard or onboarding
    if (bikes && bikes.length > 0) {
      return <Redirect href="/(tabs)" />;
    }
    return <Redirect href="/(auth)/OnboardingPage" />;
  }

  return <Redirect href="/(auth)/LoginPage" />;
}
