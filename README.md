# VeilRWA

**Privacy-Preserving, ZK-Compliant Access to Real-World Yield on Mantle**

[![Built with Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org/)
[![Solidity](https://img.shields.io/badge/Solidity-^0.8.20-blue?logo=solidity)](https://soliditylang.org/)
[![Mantle Network](https://img.shields.io/badge/Mantle-Network-green)](https://mantle.xyz/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> **Compliance without surveillance.** Private yield for compliant RealFi.

---

## 🥇 One-Sentence Pitch

VeilRWA enables compliant access to real-world yield on Mantle using zero-knowledge proofs — proving eligibility and yield entitlement without revealing identity, balances, or strategies.

---

## 🎯 The Problem

In 2025, RWAs hit a wall:

- **Institutions must do KYC/AML** ✓
- **Users don't want on-chain identity or position exposure** ✗

Current RWA protocols rely on:
- Wallet whitelists → Permanent identity linkage
- Transparent balances → Position exposure
- Public yields → Strategy disclosure

👉 **Compliance today = privacy loss**  
👉 **Privacy today = non-compliance**

This conflict is now the **#1 blocker** for institutional RealFi adoption.

---

## 💡 The Solution

**VeilRWA** is a ZK-Compliant RWA Access & Yield Layer that provides:

1. **ZK-KYC** - Selective disclosure of compliance attributes
2. **Private RWA Deposits** - Commitment-based balance privacy
3. **ZK Yield Claims** - Cryptographically verified yield without revealing amounts

All deployed on **Mantle Network**, where low fees make on-chain ZK verification economically viable.

---

## 🔑 What the ZK Proof Asserts

The zero-knowledge proof enforces:

1. ✅ The prover holds a **valid, unexpired KYC credential** signed by issuer X
2. ✅ Credential attributes satisfy **regulatory rules** (jurisdiction, accreditation)
3. ✅ The prover owns a **commitment C** corresponding to a deposited balance B
4. ✅ **Yield Y is computed correctly** as Y = B × r × t using verifiable calculations
5. ✅ **No information** about B, Y, or identity is revealed to public blockchain

**This is not just zk-login — this is zk-correctness for yield calculation and compliance.**

---

## 🏗️ Architecture

```
User → Frontend (Next.js) → ZK Circuits (Circom) → Smart Contracts (Mantle)
  ↓              ↓                   ↓                      ↓
SnarkJS    ZK Proof Gen      Groth16 Verifier    Commitment Storage
                                                         ↓
                                              VeilRWA Vault (Mantle Sepolia)
```

### Core Components

- **Frontend**: Next.js 14 + TypeScript + wagmi v2 + SnarkJS for client-side ZK proof generation
- **ZK Circuits**: Circom 2.0 (3 circuits: KYC verification, Deposit commitment, Yield calculation)
- **Smart Contracts**: Solidity 0.8.20 on Mantle Sepolia with on-chain Groth16 verification
- **ZK System**: Groth16 proving system with Poseidon hashing for gas-efficient on-chain verification

---

## 🚀 Live Demo

**Deployed Contracts (Mantle Sepolia Testnet)**:
- Vault: `0x332dca53aC3C7b86bCb7F9f58E2d6b8284705231`
- TBILL Token: `0x35FB06244022403dc1a0cC308E150b5744e37A6b`
- Yield Verifier: `0xfE82EDaf1B490D90bc08397b7b8Fa79DD8A0A682`

**Try it**: [https://veilrwa.vercel.app](https://veilrwa.vercel.app)

---

## 📋 Features

### 1. ZK-KYC Credential System

- EdDSA-signed credentials issued off-chain
- Attributes: `isKYCed`, `country`, `isAccredited`, `expiryTimestamp`
- Zero-knowledge proof of eligibility without revealing identity
- **On-chain**: Only proof verification, never PII

### 2. Private RWA Deposits

- Commitment-based deposits using Poseidon hashing
- Balance stored as: `C = Poseidon(balance, salt)`
- On-chain contract storage:
  - ✅ Commitment hash exists: `true`
  - ❌ Actual balance: **NEVER STORED**
  - ❌ User identity: **NEVER LINKED**

### 3. ZK Yield Claims ⭐ **CORE INNOVATION**

**Zero-Knowledge Yield Verification**:
- Circuit proves: `Y = B × rate × time / (10000 × 365 days)`
- Verifies time elapsed calculation correctness
- Confirms commitment ownership via Poseidon hash matching
- Validates yield amount matches mathematical formula

**Smart Contract Verification**:
- On-chain Groth16 verifier validates ZK proof
- Checks nullifier uniqueness (prevents double-claiming)
- Transfers yield tokens upon successful verification
- **Never sees actual deposit balance**
---

## 🎬 Demo Flow

1. **Connect Wallet** → MetaMask connects to Mantle Sepolia (10s)
2. **Approve Tokens** → Allow vault to access TBILL tokens (15s)
3. **Private Deposit** → Generate ZK commitment, deposit 100 TBILL (30s)
   - On-chain: Only commitment hash visible (`0x1e025b...`)
   - Balance: **Cryptographically hidden**
4. ⏱️ **Time Passes** → Accrue 5% APY yield (simulated for demo)
5. **Generate ZK Proof** → Client-side proof of yield calculation (45s)
6. **Claim Yield** → Submit proof, receive 5 TBILL (20s)
   - Contract verifies proof on-chain
   - Never sees your 100 TBILL balance
7. **Verify Privacy** → Check Mantlescan
   - ✅ Commitment exists
   - ❌ Balance not visible
   - ✅ Yield transferred without revealing deposit

**Total Demo Time: 2 minutes**

---

## 🌟 Why Mantle Network?

VeilRWA is only economically viable because of Mantle:

| Feature | Benefit |
|---------|---------|
| ⚡ **Low Gas** | ZK proof verification ~$0.05 vs $40+ on Ethereum L1 |
| 🚀 **High Throughput** | Consumer-grade UX for frequent proof submissions |
| 🔧 **EVM Compatible** | Groth16 verifier deploys seamlessly |
| 🏦 **RealFi Narrative** | Perfect fit for institutional DeFi ecosystem |
| 💰 **Cost-Effective ZK** | Makes privacy practical for retail users |

**Gas Cost Comparison**:
- Ethereum L1: ~2M gas @ 50 gwei = $120/claim
- Mantle: ~200K gas @ 0.02 gwei = **$0.05/claim** ✅

---

## 📊 Comparison with Existing Solutions

| Feature | Traditional RWA | Aztec/Railgun | **VeilRWA** |
|---------|----------------|---------------|-------------|
| Access Control | Wallet whitelist | No compliance | ZK-KYC proof |
| Identity | On-chain linked | Anonymous only | Compliant & private |
| Balances | Fully public | Shielded pools | Commitment-based |
| Yield Calculation | Transparent | N/A | ZK correctness proof |
| Integration | One-off silos | General privacy | RWA-specific layer |
| Compliance | ✅ Yes | ❌ No | ✅ Yes |
| Privacy | ❌ No | ✅ Yes | ✅ Yes |

**VeilRWA = First privacy layer specifically designed for compliant RealFi**

---

## 🛠️ Tech Stack

| Component | Technology | Purpose |
|-----------|------------|---------|
| Frontend | Next.js 14, TypeScript | React framework with SSR |
| Styling | Tailwind CSS, shadcn/ui | Modern UI components |
| Web3 | wagmi v2, viem | Ethereum interactions |
| Wallet | RainbowKit/AppKit | Multi-wallet support |
| ZK Proofs | Circom 2.0, SnarkJS | Circuit compilation & proof generation |
| Proving System | Groth16 | Small proofs, fast verification |
| Hash Function | Poseidon | ZK-friendly hashing |
| Smart Contracts | Solidity 0.8.20 | EVM-compatible contracts |
| Development | Hardhat | Contract testing & deployment |
| Network | Mantle Sepolia | L2 testnet deployment |

---

## 🔬 ZK Circuit Details

### 1. Deposit Commitment Circuit
**Purpose**: Generate commitment hash for private balance storage

**Inputs**:
- `balance` (private): Deposit amount in wei
- `salt` (private): Random secret for uniqueness

**Outputs**:
- `commitment`: Poseidon hash of (balance, salt)

**Constraints**: 250

### 2. Yield Claim Circuit
**Purpose**: Prove correct yield calculation without revealing balance

**Private Inputs**:
- `balance`: Original deposit amount
- `salt`: Secret from commitment
- `depositTimestamp`: When deposit was made

**Public Inputs**:
- `commitment`: Stored commitment hash
- `yieldRate`: APY in basis points (500 = 5%)
- `currentTimestamp`: Current time
- `nullifier`: One-time claim identifier
- `claimedYield`: Amount being claimed

**Outputs**:
- `isValid`: 1 if all validations pass

**Verification**:
1. Poseidon(balance, salt) matches commitment
2. Time calculation is correct
3. Yield formula: `Y = (balance × yieldRate × timeElapsed) / (10000 × 31536000)`
4. Claimed amount matches calculated yield
5. Timestamps are valid (deposit < current)

**Constraints**: ~2500

### 3. KYC Verification Circuit  
**Purpose**: Prove credential validity without revealing identity

**Private Inputs**:
- `userSecret`, `credentialSalt`, `countryCode`, `isAccredited`, `expiry`

**Public Inputs**:
- `issuerCommitment`: Verifier's public commitment
- `allowedCountry`: Required jurisdiction
- `currentTime`: For expiry check

**Outputs**:
- `isValid`: 1 if credential valid and not expired

**Constraints**: ~1800

---

## 📁 Project Structure

```
veilrwa-app/
├── frontend/
│   ├── app/              # Next.js 14 app directory
│   │   ├── page.tsx     # Landing page
│   │   ├── vault/       # Vault dashboard
│   │   └── kyc-test/    # KYC testing interface
│   ├── components/       # React components
│   │   ├── ui/          # shadcn/ui components
│   │   └── sections/    # Page sections
│   ├── lib/             # Utility functions
│   │   ├── zkProofs.ts  # ZK proof generation
│   │   └── contracts.ts # Contract ABIs & addresses
│   └── public/zkp/      # Compiled circuits & keys
├── contracts/
│   ├── contracts/
│   │   ├── VeilRWAVaultV3.sol      # Main vault with ZK verification
│   │   ├── YieldClaimVerifier.sol  # Groth16 verifier for yield
│   │   └── KYCVerifierSimple.sol   # Groth16 verifier for KYC
│   ├── scripts/         # Deployment scripts
│   └── test/            # Contract tests
├── circuits/
│   ├── deposit_commitment.circom   # Commitment hash circuit
│   ├── yield_claim.circom          # Yield calculation circuit
│   └── kyc_simple.circom           # KYC verification circuit
└── shared/              # Shared TypeScript types
```

---

## 🧪 Testing

### Run All Tests
```bash
# Frontend tests
npm run test

# Contract tests  
cd contracts && npx hardhat test

# ZK circuit tests
cd circuits && npm run test:circuits
```

### Key Test Scenarios
- ✅ Commitment generation and verification
- ✅ Yield calculation correctness
- ✅ Nullifier uniqueness enforcement
- ✅ Proof verification on-chain
- ✅ Time-based yield accrual

---

## 🚀 Deployment

### Smart Contracts (Mantle Sepolia)

**Current Deployment**:
```
VeilRWAVaultV3: 0x332dca53aC3C7b86bCb7F9f58E2d6b8284705231
MockRWAToken (TBILL): 0x35FB06244022403dc1a0cC308E150b5744e37A6b
YieldClaimVerifier: 0xfE82EDaf1B490D90bc08397b7b8Fa79DD8A0A682
DepositVerifier: 0x20032EA6f975FbfA5aFbA329f2c2fCE51B60FE94
KYCVerifier: 0x870f9724047acba94885359f38cA55D639A4C564
```

**Deploy New Instance**:
```bash
cd contracts
npx hardhat run scripts/deploy-vault-v3.cjs --network mantleTestnet
npx hardhat run scripts/fund-vault.cjs --network mantleTestnet
```

### Frontend

```bash
npm run build
# Deploy to Vercel/Netlify
```

**Environment Variables Required**:
```env
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=your_project_id
NEXT_PUBLIC_MANTLE_RPC_URL=https://rpc.sepolia.mantle.xyz
```

---

## 📚 Documentation

### Technical Deep Dive

**How Zero-Knowledge Yield Works**:

1. **Deposit Phase**:
   - User deposits 100 TBILL
   - Client generates: `commitment = Poseidon(100, randomSalt)`
   - On-chain storage: `commitments[0x1e025b...] = true`
   - Balance: **Never stored on-chain**

2. **Accrual Phase**:
   - Time passes (e.g., 1 year)
   - Yield accrues: 100 × 5% = 5 TBILL
   - User's balance remains cryptographically hidden

3. **Claim Phase**:
   - User generates ZK proof proving:
     - Poseidon(balance, salt) = stored commitment ✓
     - time_elapsed = current_time - deposit_time ✓
     - yield = balance × rate × time / (10000 × 31536000) ✓
     - claimed_amount = calculated_yield ✓
   - Proof generation: ~2-3 seconds client-side
   - Proof size: ~200 bytes

4. **Verification Phase**:
   - Smart contract verifies Groth16 proof on-chain
   - Gas cost: ~200K gas (~$0.05 on Mantle)
   - Contract checks:
     - Proof is valid ✓
     - Nullifier not used before ✓
     - Vault has sufficient balance ✓
   - Transfers 5 TBILL to user
   - **Never learns the 100 TBILL deposit amount**

**Privacy Guarantees**:
- ✅ Balance privacy: On-chain storage only shows commitment hashes
- ✅ Computation privacy: Yield calculation done in ZK circuit
- ✅ Transaction privacy: Claimed amount verified without revealing deposit
- ✅ Identity privacy: No KYC data stored on-chain

---

## 🔐 Security

**Production Readiness**:
- ✅ Groth16 proving system (industry standard)
- ✅ Poseidon hashing (ZK-optimized)
- ✅ Nullifier system prevents double-claims
- ✅ ReentrancyGuard on all state-changing functions
- ✅ Pausable emergency stop mechanism

**Security Considerations**:
- Circuit constraints have been tested for correctness
- On-chain verifier automatically generated from trusted setup
- Commitment uniqueness enforced by cryptographic hashing
- Time-based calculations validated in ZK circuit

**Audits & Next Steps**:
- Current: Hackathon prototype with functional ZK proofs
- Planned: Professional security audit before mainnet
- Required: Integration with licensed KYC provider
- Future: Insurance coverage for vault assets

---

## 🎯 Roadmap

### ✅ Phase 1: Foundation (Completed)
- [x] Project architecture and design
- [x] Landing page and UI/UX
- [x] Smart contract structure

### ✅ Phase 2: ZK Circuits (Completed)
- [x] KYC verification circuit (Circom)
- [x] Deposit commitment circuit (Poseidon hash)
- [x] Yield claim circuit (Groth16 proofs)
- [x] Circuit compilation and key generation

### ✅ Phase 3: Smart Contracts (Completed)
- [x] VeilRWA Vault with ZK verification
- [x] Groth16 verifier contracts
- [x] Deployment to Mantle Sepolia
- [x] Contract testing and validation

### ✅ Phase 4: Integration (Completed)
- [x] Frontend ZK proof generation (SnarkJS)
- [x] Wallet integration (wagmi v2)
- [x] End-to-end testing
- [x] Demo video and documentation

### 🔄 Phase 5: Production (Next Steps)
- [ ] Security audit by professional firm
- [ ] Integration with licensed KYC provider
- [ ] Mainnet deployment on Mantle
- [ ] Partnership with RWA tokenization platforms
- [ ] Insurance and compliance framework

---

## 🤝 Contributing

This is a hackathon project. Contributions welcome post-hackathon!

---

## 📄 License

MIT License - see [LICENSE](./LICENSE) for details

---

## 🏆 Hackathon Submission

**Built for**: Mantle Global Hackathon 2025  
**Track**: ZK & Privacy  
**Team**: [Your Team Name]

---

## 💬 Contact

- **Website**: [veilrwa.xyz](https://veilrwa.xyz) (TBD)
- **Twitter**: [@VeilRWA](https://twitter.com/VeilRWA) (TBD)
- **Discord**: [Join our community](https://discord.gg/veilrwa) (TBD)

---

## 🎯 One-Liners for Judges

> **"Compliance without surveillance."**

> **"Private yield for compliant RealFi."**

> **"ZK proofs turn RWAs into programmable, private assets."**

> **"VeilRWA is the missing privacy layer for institutional DeFi."**

---

**Built with ❤️ for Mantle Global Hackathon 2025**
