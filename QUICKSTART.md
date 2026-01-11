# VeilRWA - Quick Start Guide

## 🚀 Current Status
- ✅ Contracts: Compiled and ready
- ✅ Backend API: Running on port 4000
- ✅ Frontend: Landing page live
- ⏳ ZK Circuits: Need compilation
- ⏳ Deployment: Not yet on testnet

---

## 📋 Immediate Next Steps

### 1. Compile ZK Circuits (Priority: HIGH)

**Problem:** Npm circom is outdated (v0.5.46)  
**Solution:** Download Circom 2.x binary

#### Windows Installation:
```powershell
# Download Circom 2.2.0 for Windows
Invoke-WebRequest -Uri "https://github.com/iden3/circom/releases/download/v2.2.0/circom-windows-amd64.exe" -OutFile "circom.exe"

# Move to a directory in PATH
Move-Item circom.exe C:\Windows\System32\circom.exe

# Verify installation
circom --version  # Should show v2.2.0
```

#### Compile Circuits:
```bash
cd D:\Projects\Mantle\veilrwa-app

# Create output directory
mkdir -p build/circuits

# Compile KYC circuit
circom circuits/kyc_verification.circom --r1cs --wasm --sym -o build/circuits

# Compile Commitment circuit
circom circuits/deposit_commitment.circom --r1cs --wasm --sym -o build/circuits

# Compile Yield circuit (most important)
circom circuits/yield_claim.circom --r1cs --wasm --sym -o build/circuits
```

#### Generate Keys:
```bash
# Download Powers of Tau (one-time)
wget https://hermez.s3-eu-west-1.amazonaws.com/powersOfTau28_hez_final_15.ptau -O build/pot15.ptau

# Generate proving keys for each circuit
snarkjs groth16 setup build/circuits/kyc_verification.r1cs build/pot15.ptau build/kyc_0000.zkey
snarkjs zkey contribute build/kyc_0000.zkey build/kyc_final.zkey --name="Contribution" -v

# Repeat for other circuits...

# Export Solidity verifiers
snarkjs zkey export solidityverifier build/kyc_final.zkey contracts/KYCVerifier.sol
```

---

### 2. Deploy Contracts to Mantle Testnet

#### Get Testnet Tokens:
```
1. Get wallet address from MetaMask
2. Visit: https://faucet.sepolia.mantle.xyz/
3. Request testnet MNT
```

#### Create Deployment Script:
```javascript
// scripts/deploy.js
import { ethers } from "hardhat";

async function main() {
  console.log("Deploying to Mantle Sepolia...");

  // Deploy KYCRegistry
  const KYCRegistry = await ethers.getContractFactory("KYCRegistry");
  const registry = await KYCRegistry.deploy();
  await registry.waitForDeployment();
  console.log("KYCRegistry:", await registry.getAddress());

  // Deploy MockRWAToken
  const MockRWAToken = await ethers.getContractFactory("MockRWAToken");
  const token = await MockRWAToken.deploy();
  await token.waitForDeployment();
  console.log("MockRWAToken:", await token.getAddress());

  // Deploy VeilRWAVault
  const VeilRWAVault = await ethers.getContractFactory("VeilRWAVault");
  const vault = await VeilRWAVault.deploy(
    await token.getAddress(),
    await registry.getAddress()
  );
  await vault.waitForDeployment();
  console.log("VeilRWAVault:", await vault.getAddress());

  // Fund vault
  await token.mint(await vault.getAddress(), ethers.parseEther("1000000"));
  console.log("✅ Vault funded with 1M tokens");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
```

#### Deploy:
```bash
cd D:\Projects\Mantle\veilrwa-contracts

# Create .env file
echo "PRIVATE_KEY=your_private_key_here" > .env
echo "MANTLE_RPC_URL=https://rpc.sepolia.mantle.xyz" >> .env

# Deploy
npx hardhat run scripts/deploy.js --network mantleTestnet
```

---

### 3. Build Vault Frontend Page

#### Install Web3 Dependencies:
```bash
cd D:\Projects\Mantle\veilrwa-app
npm install wagmi viem @rainbow-me/rainbowkit snarkjs --legacy-peer-deps
```

#### Create Vault Page:
```typescript
// app/vault/page.tsx
'use client';

import { useState } from 'react';
import { useAccount, useWriteContract } from 'wagmi';
import { parseEther } from 'viem';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

export default function VaultPage() {
  const { address, isConnected } = useAccount();
  const { writeContract } = useWriteContract();
  const [amount, setAmount] = useState('');

  const handleDeposit = async () => {
    // 1. Generate commitment
    const commitment = '0x' + '0'.repeat(64); // TODO: Real commitment

    // 2. Generate ZK proof
    const proof = '0x'; // TODO: Generate with SnarkJS

    // 3. Call contract
    writeContract({
      address: '0x...VaultAddress',
      abi: VaultABI,
      functionName: 'deposit',
      args: [parseEther(amount), commitment, proof],
    });
  };

  return (
    <div className="container mx-auto p-6">
      <Card className="p-6">
        <h1 className="text-2xl font-bold mb-4">Private Vault</h1>
        
        {isConnected ? (
          <div className="space-y-4">
            <Input
              type="number"
              placeholder="Amount to deposit"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
            <Button onClick={handleDeposit}>
              Deposit Privately
            </Button>
          </div>
        ) : (
          <p>Please connect your wallet</p>
        )}
      </Card>
    </div>
  );
}
```

---

### 4. Test End-to-End Flow

#### Manual Test Checklist:
```
□ Connect wallet to Mantle Sepolia
□ Navigate to /kyc page
□ Submit KYC application
□ Receive credential from backend
□ Navigate to /vault page
□ Enter deposit amount (e.g., 100 tokens)
□ Frontend generates commitment
□ Frontend generates KYC proof
□ Click "Deposit" button
□ Transaction confirmed on Mantle
□ Check commitment stored on-chain
□ Wait 1 minute (for testing)
□ Click "Claim Yield" button
□ Frontend generates yield proof
□ Transaction confirmed
□ Receive yield tokens in wallet
□ Verify nullifier stored (no double-claim)
```

---

## 🔧 Troubleshooting

### Issue: "Cannot find module 'circomlib'"
**Solution:**
```bash
cd D:\Projects\Mantle\veilrwa-app
npm install circomlib --legacy-peer-deps
```

### Issue: "Hardhat only supports ESM projects"
**Solution:** Already fixed - use separate `veilrwa-contracts` directory

### Issue: "Transaction reverted"
**Solution:** Check:
- Wallet has testnet MNT
- Token approval granted
- KYC proof is valid format
- Not using duplicate nullifier

### Issue: "Proof generation timeout"
**Solution:**
- Use smaller circuits for testing
- Generate proofs in Web Worker
- Show loading indicator

---

## 📊 Testing Commands

```bash
# Test backend API
curl http://localhost:4000/api/kyc/issuer-key

# Test contract compilation
cd veilrwa-contracts && npx hardhat compile

# Test frontend dev server
cd veilrwa-app && npm run dev

# Test circuit compilation
circom --version  # Should be v2.x.x
```

---

## 🎯 Demo Script for Judges

### Opening (30 seconds)
"VeilRWA solves a $10B problem: How do you earn yield on Real World Assets while maintaining privacy? Current solutions force users to reveal their identity, balance, and transactions on-chain."

### Problem (30 seconds)
"Institutions want privacy. Regulators want compliance. Traditional DeFi can't provide both. If I earn $50K yield on T-Bills, everyone can see my balance, my earnings, and link it to my identity."

### Solution (60 seconds)
"VeilRWA uses zero-knowledge proofs to prove you're eligible for yield WITHOUT revealing who you are or how much you have. Watch this:

1. [Click KYC] - I prove I'm accredited without revealing my identity
2. [Click Deposit] - I deposit $100K, stored as a commitment on Mantle
3. [Click Claim] - I prove I earned $5K yield without revealing my balance

The smart contract only sees: 'Someone eligible claimed correct yield.' That's it."

### Innovation (45 seconds)
"Here's what makes this special: Our ZK circuit proves the math is correct - that yield equals balance times rate times time - without revealing ANY of those numbers. We use Poseidon hashing and Groth16 SNARKs, compiled to Solidity verifiers running on Mantle's ultra-low gas fees."

### Impact (30 seconds)
"This unlocks $10B in RWA capital that won't touch DeFi today due to privacy concerns. Institutions can now earn on-chain yield while maintaining compliance and privacy. And it's only possible on Mantle thanks to low verification costs."

### Closing (15 seconds)
"VeilRWA: Private yield for Real World Assets. Try it at veilrwa.demo"

**Total: ~3 minutes**

---

## 📁 Important Files Reference

| File | Purpose | Status |
|------|---------|--------|
| `contracts/VeilRWAVault.sol` | Main vault contract | ✅ Compiled |
| `circuits/yield_claim.circom` | Core ZK circuit | ⏳ Need compile |
| `backend/server.js` | KYC API | ✅ Running |
| `app/page.tsx` | Landing page | ✅ Live |
| `ARCHITECTURE.md` | System design | ✅ Complete |
| `DEVELOPMENT-STATUS.md` | This report | ✅ Complete |

---

## 🎓 Learning Resources

**ZK Proofs:**
- Circom Documentation: https://docs.circom.io/
- SnarkJS Guide: https://github.com/iden3/snarkjs

**Mantle Network:**
- Testnet RPC: https://rpc.sepolia.mantle.xyz
- Faucet: https://faucet.sepolia.mantle.xyz
- Explorer: https://sepolia.mantlescan.xyz

**Smart Contract Security:**
- OpenZeppelin Contracts: https://docs.openzeppelin.com/contracts/
- Consensys Best Practices: https://consensys.github.io/smart-contract-best-practices/

---

**Last Updated:** January 10, 2026  
**Project Status:** 75% Complete  
**Est. Time to MVP:** 2-3 days
