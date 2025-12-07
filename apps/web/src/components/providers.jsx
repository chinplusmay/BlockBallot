'use client';

import * as React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider } from 'wagmi';
import { ThemeProvider } from '@/components/theme-provider';
import { wagmiConfig } from '@/lib/wagmi-config';

// Suppress WalletConnect console errors (non-critical)
if (typeof window !== 'undefined') {
  const originalError = console.error;
  console.error = (...args) => {
    // Filter out WalletConnect "No matching key" errors
    if (
      args[0] &&
      typeof args[0] === 'object' &&
      args[0].message &&
      (args[0].message.includes('No matching key') ||
        args[0].message.includes('proposal:'))
    ) {
      // Silently ignore WalletConnect session errors
      return;
    }
    originalError.apply(console, args);
  };
}

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000, // 1 minute
        refetchOnWindowFocus: false,
      },
    },
  });
}

let browserQueryClient = undefined;

function getQueryClient() {
  if (typeof window === 'undefined') {
    // Server: always make a new query client
    return makeQueryClient();
  } else {
    // Browser: make a new query client if we don't already have one
    if (!browserQueryClient) browserQueryClient = makeQueryClient();
    return browserQueryClient;
  }
}

export function Providers({ children }) {
  const queryClient = getQueryClient();

  return (
    <ThemeProvider>
      <WagmiProvider config={wagmiConfig}>
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      </WagmiProvider>
    </ThemeProvider>
  );
}

