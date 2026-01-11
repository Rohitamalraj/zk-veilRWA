# VeilRWA Deployed Contracts

**Network:** Mantle Sepolia Testnet  
**Chain ID:** 5003  
**RPC URL:** https://rpc.sepolia.mantle.xyz  
**Explorer:** https://sepolia.mantlescan.xyz  
**Deployed:** January 10, 2026  
**Deployer:** 0x2c32743B801B9c3d53099334e2ac5a8DA39498bC

---

## Contract Addresses

### KYCRegistry
**Address:** `0x0f61cB672d345797f6A1505A282240583F902cb2`  
**Explorer:** https://sepolia.mantlescan.xyz/address/0x0f61cB672d345797f6A1505A282240583F902cb2  
**Purpose:** Manages authorized KYC issuers and country whitelist

### MockRWAToken (TBILL)
**Address:** `0x35FB06244022403dc1a0cC308E150b5744e37A6b`  
**Explorer:** https://sepolia.mantlescan.xyz/address/0x35FB06244022403dc1a0cC308E150b5744e37A6b  
**Purpose:** ERC20 token for yield payments (T-Bill Yield Token)  
**Symbol:** TBILL  
**Decimals:** 18  
**Initial Vault Funding:** 1,000,000 tokens

### VeilRWAVault
**Address:** `0x4aa35B5410dfce8358C721c5B4C7b0c0c6C3CD98`  
**Explorer:** https://sepolia.mantlescan.xyz/address/0x4aa35B5410dfce8358C721c5B4C7b0c0c6C3CD98  
**Purpose:** Main vault for private deposits and yield claims  
**Yield Rate:** 500 (5% APY)  
**Min Deposit:** 100 TBILL  
**Max Deposit:** 1,000,000 TBILL  
**Balance:** 1,000,000 TBILL  
**Note:** ZK Verifier currently set to deployer address (placeholder)

---

## Configuration

### KYC Registry Settings
- **Allowed Countries:** 840 (US) - pre-configured in constructor
- **Additional Countries Available:** 826 (GB), 702 (SG), 756 (CH), 784 (AE)

### Vault Settings
- Yield Rate: 5% APY
- Deposits and claims currently use placeholder ZK verification
- Pausable by owner for emergency situations
- ReentrancyGuard enabled on all sensitive functions

---

## Integration for Frontend

```typescript
// contracts.ts
export const CONTRACTS = {
  KYCRegistry: {
    address: "0x0f61cB672d345797f6A1505A282240583F902cb2",
    abi: [...], // Import from artifacts
  },
  MockRWAToken: {
    address: "0x35FB06244022403dc1a0cC308E150b5744e37A6b",
    abi: [...],
  },
  VeilRWAVault: {
    address: "0x4aa35B5410dfce8358C721c5B4C7b0c0c6C3CD98",
    abi: [...],
  },
};

export const MANTLE_SEPOLIA = {
  id: 5003,
  name: "Mantle Sepolia",
  network: "mantle-sepolia",
  nativeCurrency: { name: "MNT", symbol: "MNT", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://rpc.sepolia.mantle.xyz"] },
  },
  blockExplorers: {
    default: {
      name: "Mantle Explorer",
      url: "https://sepolia.mantlescan.xyz",
    },
  },
  testnet: true,
};
```

---

## Next Steps

1. ✅ Circuits compiled  (3/3 complete)
2. ✅ Contracts deployed (3/3 deployed)
3. ⏳ Generate and deploy ZK verifiers from circuits
4. ⏳ Update vault's zkVerifier address
5. ⏳ Build frontend vault page
6. ⏳ Test end-to-end deposit flow
7. ⏳ Test end-to-end claim flow

---

## Gas Usage

| Contract | Deployment Gas | Cost (MNT) |
|----------|---------------|------------|
| KYCRegistry | ~450,000 | ~0.045 |
| MockRWAToken | ~900,000 | ~0.090 |
| VeilRWAVault | ~1,500,000 | ~0.150 |
| Token Minting | ~50,000 | ~0.005 |
| **Total** | ~2,900,000 | **~0.29 MNT** |

**Remaining Balance:** ~3.62 MNT

---

*Contracts are ready for integration. ZK verifiers pending circuit compilation and Solidity export.*
