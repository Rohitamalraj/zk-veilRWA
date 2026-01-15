'use client';

import { useEffect } from 'react';
import { useAccount, useSwitchChain } from 'wagmi';
import { mantleSepolia } from '@/config/wagmi';
import { switchToMantleSepolia } from '@/lib/addNetwork';

export function NetworkGuard({ children }: { children: React.ReactNode }) {
  const { chainId, isConnected } = useAccount();
  const { switchChain } = useSwitchChain();

  useEffect(() => {
    async function checkAndSwitchNetwork() {
      if (!isConnected) return;

      // If not on Mantle Sepolia
      if (chainId && chainId !== mantleSepolia.id) {
        console.log(`Wrong network detected: ${chainId}. Switching to Mantle Sepolia...`);
        
        try {
          // Try wagmi's switchChain first
          if (switchChain) {
            switchChain({ chainId: mantleSepolia.id });
          } else {
            // Fallback to direct MetaMask call
            await switchToMantleSepolia();
          }
        } catch (error) {
          console.error('Failed to switch network:', error);
          // Try direct MetaMask call as fallback
          await switchToMantleSepolia();
        }
      }
    }

    checkAndSwitchNetwork();
  }, [chainId, isConnected, switchChain]);

  return <>{children}</>;
}
