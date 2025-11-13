import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import { useState } from 'react';

export default function RootLayout() {
  // Create QueryClient instance
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 5, // Data stays fresh for 5 minutes
        retry: 1, // Retry failed requests once
      },
    },
  }));

  return (
    <QueryClientProvider client={queryClient}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="(create-request)/(steps)" />
        <Stack.Screen name="(user-auth)" options={{ presentation: 'modal' }}/>
        <Stack.Screen name="(report)" />
      </Stack>
    </QueryClientProvider>
  );
}