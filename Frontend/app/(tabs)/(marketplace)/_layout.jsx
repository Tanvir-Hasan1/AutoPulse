import { Stack } from 'expo-router';

export default function MarketplaceLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: '#f8fafc' },
        headerTintColor: '#1f2937',
        headerTitleStyle: { fontWeight: 'bold' },
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="Product" options={{ title: 'Product Details' }} />
      <Stack.Screen name="PostProduct" options={{ title: 'Post Product' }} />
      <Stack.Screen name="SearchResults" options={{ title: 'Search Results' }} />
    </Stack>
  );
}