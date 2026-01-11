'use client';

import { createAppKit } from '@reown/appkit/react';
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import { WagmiProvider, type Config } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';

// Define Mantle Sepolia network (official config from docs)
const mantleSepolia = {
  id: 5003,
  name: 'Mantle Sepolia Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'MNT',
    symbol: 'MNT',
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.sepolia.mantle.xyz'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Mantle Sepolia Explorer',
      url: 'https://sepolia.mantlescan.xyz',
    },
  },
  testnet: true,
};

// Reown Cloud project ID
const projectId = process.env.NEXT_PUBLIC_REOWN_PROJECT_ID || 'YOUR_PROJECT_ID';

// Create wagmi config
const wagmiAdapter = new WagmiAdapter({
  networks: [mantleSepolia],
  projectId,
});

// Create AppKit instance
createAppKit({
  adapters: [wagmiAdapter],
  networks: [mantleSepolia],
  projectId,
  metadata: {
    name: 'VeilRWA',
    description: 'Privacy-Preserving RWA Yield Platform',
    url: 'https://veilrwa.app',
    icons: ['https://veilrwa.app/logo.png'],
  },
  features: {
    analytics: false,
  },
});

const queryClient = new QueryClient();

export function Web3Provider({ children }: { children: ReactNode }) {
  return (
    <WagmiProvider config={wagmiAdapter.wagmiConfig as Config}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  );
}
