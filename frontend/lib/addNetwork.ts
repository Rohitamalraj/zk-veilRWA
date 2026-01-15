/**
 * Add Mantle Sepolia network to MetaMask
 */
export async function addMantleSepoliaToMetaMask() {
  if (typeof window === 'undefined' || !window.ethereum) {
    console.error('MetaMask not detected');
    return false;
  }

  try {
    await window.ethereum.request({
      method: 'wallet_addEthereumChain',
      params: [
        {
          chainId: '0x138B', // 5003 in hex
          chainName: 'Mantle Sepolia Testnet',
          nativeCurrency: {
            name: 'MNT',
            symbol: 'MNT',
            decimals: 18,
          },
          rpcUrls: ['https://rpc.sepolia.mantle.xyz'],
          blockExplorerUrls: ['https://sepolia.mantlescan.xyz'],
        },
      ],
    });
    return true;
  } catch (error) {
    console.error('Error adding Mantle Sepolia network:', error);
    return false;
  }
}

/**
 * Switch to Mantle Sepolia network
 */
export async function switchToMantleSepolia() {
  if (typeof window === 'undefined' || !window.ethereum) {
    console.error('MetaMask not detected');
    return false;
  }

  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: '0x138B' }], // 5003 in hex
    });
    return true;
  } catch (error: any) {
    // This error code indicates that the chain has not been added to MetaMask
    if (error.code === 4902) {
      return await addMantleSepoliaToMetaMask();
    }
    console.error('Error switching to Mantle Sepolia:', error);
    return false;
  }
}
