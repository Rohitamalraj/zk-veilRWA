'use client';

import { createAppKit } from '@reown/appkit/react';
import { WagmiProvider, type Config, cookieToInitialState } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';
import { wagmiAdapter, projectId, mantleSepolia } from '@/config/wagmi';
import { NetworkGuard } from '@/components/NetworkGuard';
import { mantleSepoliaTestnet } from '@reown/appkit/networks';

// Create query client
const queryClient = new QueryClient();

// Set up metadata
const metadata = {
  name: 'VeilRWA',
  description: 'Privacy-Preserving RWA Yield Platform',
  url: 'http://localhost:3000',
  icons: ['https://avatars.githubusercontent.com/u/179229932'],
};

// Create the modal
const modal = createAppKit({
  adapters: [wagmiAdapter],
  projectId,
  networks: [mantleSepoliaTestnet],
  metadata,
  features: {
    analytics: true,
  },
  themeMode: 'dark',
  themeVariables: {
    '--w3m-accent': '#1E88E5',
  },
});

export function Web3Provider({ 
  children, 
  cookies 
}: { 
  children: ReactNode
  cookies: string | null 
}) {
  const initialState = cookieToInitialState(
    wagmiAdapter.wagmiConfig as Config, 
    cookies
  );

  return (
    <WagmiProvider 
      config={wagmiAdapter.wagmiConfig as Config} 
      initialState={initialState}
    >
      <QueryClientProvider client={queryClient}>
        <NetworkGuard>
          {children}
        </NetworkGuard>
      </QueryClientProvider>
    </WagmiProvider>
  );
}