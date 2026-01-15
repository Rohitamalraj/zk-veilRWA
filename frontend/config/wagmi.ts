import { cookieStorage, createStorage } from '@wagmi/core'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { mantleSepoliaTestnet } from '@reown/appkit/networks'

// Get projectId from environment
export const projectId = process.env.NEXT_PUBLIC_REOWN_PROJECT_ID || 'b56e18d47c72ab683b10814fe9495694'

if (!projectId) {
  throw new Error('Project ID is not defined')
}

// Use official Reown network definitions
export const mantleSepolia = mantleSepoliaTestnet
export const networks = [mantleSepoliaTestnet]

// Set up the Wagmi Adapter with proper SSR support
export const wagmiAdapter = new WagmiAdapter({
  storage: createStorage({
    storage: cookieStorage
  }),
  ssr: true,
  projectId,
  networks
})

export const config = wagmiAdapter.wagmiConfig
