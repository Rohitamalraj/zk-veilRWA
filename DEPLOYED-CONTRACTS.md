# VeilRWA Deployed Contracts

## Mantle Sepolia Testnet (Chain ID: 5003)

### Core Contracts

| Contract | Address | Explorer |
|----------|---------|----------|
| **VeilRWAVaultV3** (CURRENT) | `0x902134f3832F9C780BEe643a11dfBb2561aC23ed` | [View](https://explorer.sepolia.mantle.xyz/address/0x902134f3832F9C780BEe643a11dfBb2561aC23ed) |
| **VeilRWAVaultV2** (Old) | `0xd9133c2CcA52e7dfFdBAEAA0B3228c9288c19E5f` | [View](https://explorer.sepolia.mantle.xyz/address/0xd9133c2CcA52e7dfFdBAEAA0B3228c9288c19E5f) |
| **MockRWAToken (TBILL)** | `0x35FB06244022403dc1a0cC308E150b5744e37A6b` | [View](https://explorer.sepolia.mantle.xyz/address/0x35FB06244022403dc1a0cC308E150b5744e37A6b) |
| **KYCRegistry** | `0x0f61cB672d345797f6A1505A282240583F902cb2` | [View](https://explorer.sepolia.mantle.xyz/address/0x0f61cB672d345797f6A1505A282240583F902cb2) |

### ZK Verifier Contracts

| Contract | Address | Explorer |
|----------|---------|----------|
| **DepositVerifier** | `0x20032EA6f975FbfA5aFbA329f2c2fCE51B60FE94` | [View](https://explorer.sepolia.mantle.xyz/address/0x20032EA6f975FbfA5aFbA329f2c2fCE51B60FE94) |
| **YieldVerifier** | `0x4040D46b287993060eE7f51B7c87F8bfd913508C` | [View](https://explorer.sepolia.mantle.xyz/address/0x4040D46b287993060eE7f51B7c87F8bfd913508C) |
| **KYCVerifier** | `0x870f9724047acba94885359f38cA55D639A4C564` | [View](https://explorer.sepolia.mantle.xyz/address/0x870f9724047acba94885359f38cA55D639A4C564) |

---

## Deployment Details

### VeilRWAVault V3 (Current - Full ZK Verification)
- **Version**: 3.0 (On-chain proof verification)
- **Deployed**: January 2026
- **Features**:
  - ✅ Full on-chain ZK proof verification via verifier contracts
  - ✅ Calls DepositVerifier.verifyProof() for deposit commitments
  - ✅ Calls YieldVerifier.verifyProof() for yield claims
  - ✅ Groth16 proof validation on every deposit/claim
  - Private deposits with Poseidon commitments
  - Yield claiming with nullifiers
  - Minimum deposit: 100 TBILL
  - Maximum deposit: 10,000 TBILL
  - Yield rate: 5% APY

### VeilRWAVault v2 (Previous)
- **Version**: 2.0 (Simplified verification)
- **Status**: Deprecated
- **Note**: Accepted proofs as bytes but didn't verify cryptographically

### ZK Proof System
- **Proof System**: Groth16
- **Circuits**: 3 circuits (KYC verification, deposit commitment, yield claim)
- **Setup**: Powers of Tau ceremony (Phase 1) + Phase 2 contributions
- **Verification**: On-chain verification via Solidity verifier contracts

### MockRWAToken (TBILL)
- **Type**: ERC20 token
- **Supply**: 1,000,000 TBILL
- **Decimals**: 18
- **Purpose**: Testing RWA yield vault

### KYCRegistry
- **Type**: Simple KYC verification contract
- **Purpose**: Store KYC verification status
- **Note**: Simplified for hackathon demo

---

## Testing

### Successful Test Transactions
- ✅ Deposit: 500 TBILL successfully deposited
- ✅ Balance decrease confirmed: 10,000 → 9,500 TBILL
- ✅ Commitment stored on-chain
- ✅ Token transfer working correctly

### Test Faucet
Get test TBILL tokens: Call `mint()` function on MockRWAToken contract

### Network Configuration
```javascript
{
  chainId: 5003,
  name: 'Mantle Sepolia',
  rpcUrl: 'https://rpc.sepolia.mantle.xyz',
  explorerUrl: 'https://explorer.sepolia.mantle.xyz'
}
```

---

## Circuit Specifications

### 1. deposit_commitment.circom
- **Constraints**: 440
- **Purpose**: Generate commitment hash from deposit amount and salt
- **Public Inputs**: commitment
- **Private Inputs**: amount, salt
- **Hash Function**: Poseidon

### 2. yield_claim.circom
- **Constraints**: 772
- **Purpose**: Prove valid yield calculation
- **Public Inputs**: yieldAmount
- **Private Inputs**: depositAmount, depositTime, currentTime
- **Logic**: Validates yield = deposit × rate × time

### 3. kyc_verification.circom
- **Constraints**: 7,757
- **Purpose**: Verify EdDSA signature on KYC credential
- **Public Inputs**: publicKey
- **Private Inputs**: signature, message
- **Signature Scheme**: EdDSA on Baby Jubjub curve

---

## Upgradeability

Current version is **not upgradeable**. All contracts are immutable once deployed.

For production, consider:
- UUPS or Transparent Proxy pattern
- Timelock for governance
- Multi-sig for admin functions

---

## Security Notes

⚠️ **HACKATHON DEMO ONLY** - Not production ready

Known limitations:
1. Simplified KYC verification (should use real credentials)
2. No formal security audit
3. Mock RWA token (not real treasury bills)
4. Centralized admin functions
5. No upgradeability
6. Limited access controls

For production deployment:
- Complete security audit
- Formal verification of ZK circuits
- Real KYC integration
- Decentralized governance
- Circuit constraint minimization
- Gas optimization

---

## Developer Resources

### Smart Contract Source
- Repository: VeilRWA
- Solidity Version: 0.8.20
- Framework: Hardhat

### Frontend
- Framework: Next.js 16
- Web3: wagmi + viem
- Wallet: Reown AppKit
- ZK Proofs: SnarkJS (browser-based)

### Circuit Development
- Language: Circom 2.2.3
- Proof System: Groth16
- Powers of Tau: Phase 1 (2^28 constraints)
- Trusted Setup: Phase 2 contributions

---

Last Updated: January 2026
