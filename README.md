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
3. **ZK Yield Claims** - Prove correctness without revealing amounts

All deployed on **Mantle Network**, where low fees make on-chain ZK verification viable.

---

## 🔑 What the ZK Proof Asserts

The zero-knowledge proof enforces:

1. ✅ The prover holds a **valid, unexpired KYC credential** signed by issuer X
2. ✅ Credential attributes satisfy **regulatory rules** (jurisdiction, accreditation)
3. ✅ The prover owns a **commitment C** corresponding to a deposited balance B
4. ✅ **Yield Y is computed correctly** as Y = B × r × t
5. ✅ **No information** about B, Y, or identity is revealed

**This is not just zk-login — this is zk-correctness for yield.**

---

## 🏗️ Architecture

```
User → Frontend (Next.js) → ZK Circuits (Circom) → Smart Contracts (Mantle)
  ↓                                                         ↓
Mock KYC Issuer ←─────────────────────────────→ VeilRWA Vault
```

### Core Components

- **Frontend**: Next.js 16 + TypeScript + wagmi + SnarkJS
- **ZK Circuits**: Circom (3 circuits: KYC, Commitment, Yield)
- **Smart Contracts**: Solidity on Mantle testnet
- **Backend**: Mock KYC issuer (Node.js/Express)

See [ARCHITECTURE.md](./docs/ARCHITECTURE.md) for detailed system design.

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or pnpm
- MetaMask (with Mantle testnet configured)

### Installation

```bash
# Clone the repository
git clone https://github.com/your-org/veilrwa-app.git
cd veilrwa-app

# Install dependencies
npm install --legacy-peer-deps

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the landing page.

---

## 📋 MVP Features

### 1. ZK-KYC Credential

- Off-chain issuance by mock KYC provider
- Attributes: `isKYCed`, `country`, `isAccredited`, `expiryTimestamp`
- User generates ZK proof of eligibility
- **No identity or wallet linking on-chain**

### 2. Private RWA Deposit

- User deposits funds into vault
- Balance stored as **commitment**: `C = Hash(balance, salt)`
- On-chain contract never sees:
  - Actual balance ✗
  - User identity ✗

### 3. ZK Yield Claim ⭐ **CORE DIFFERENTIATOR**

User submits ZK proof that:
- They own a valid commitment
- Time elapsed = t
- Yield = f(balance, t)

Contract verifies proof and pays yield **without revealing balance or yield amount**.

---

## 🎬 Demo Flow (5 Minutes)

1. **User completes off-chain KYC** → gets credential (30s)
2. **User generates ZK proof** → vault access granted (60s)
3. **User deposits into private RWA vault** → commitment stored (60s)
4. ⏱️ **Time passes** (simulated)
5. **User submits ZK yield proof** → receives yield (90s)
6. **Show contract state** → only commitments visible, no balance/identity (30s)

Judges instantly get it. ✨

---

## 🌟 Why Mantle Network?

VeilRWA is only practical because of Mantle:

| Feature | Benefit |
|---------|---------|
| ⚡ **Low Gas** | ZK verification ~$0.08 vs $40 on L1 |
| 🚀 **High Throughput** | Consumer-grade UX for proof submissions |
| 🔧 **EVM Compatible** | Easy Solidity verifier deployment |
| 🏦 **RealFi Narrative** | Institutional DeFi ecosystem fit |

---

## 📊 Comparison

| Feature | Current RWA | VeilRWA |
|---------|------------|---------|
| Access Control | Wallet whitelist | ZK proof |
| Identity | On-chain linkage | Never disclosed |
| Balances | Public | Commitment-based |
| Yield | Transparent | ZK correctness proof |
| Integration | One-off | Reusable layer |

**VeilRWA is infrastructure, not a single vault.**

---

## 🛠️ Tech Stack

| Component | Technology |
|-----------|------------|
| Frontend | Next.js 16, TypeScript, Tailwind CSS |
| Web3 | wagmi, viem, RainbowKit |
| ZK Proofs | Circom, SnarkJS (Groth16) |
| Smart Contracts | Solidity 0.8.20, Hardhat |
| Backend | Node.js, Express |
| Network | Mantle Sepolia Testnet |

---

## 📁 Project Structure

```
veilrwa-app/
├── app/              # Next.js pages
├── components/       # React components
│   ├── ui/          # shadcn/ui components
│   ├── kyc/         # KYC flow components
│   └── vault/       # Vault dashboard components
├── contracts/        # Solidity smart contracts
│   ├── VeilRWAVault.sol
│   ├── ZKVerifier.sol
│   └── KYCRegistry.sol
├── circuits/         # Circom ZK circuits
│   ├── kyc_verification.circom
│   ├── deposit_commitment.circom
│   └── yield_claim.circom
├── backend/          # Mock KYC issuer API
├── lib/             # Utility functions
├── hooks/           # Custom React hooks
├── docs/            # Documentation
└── test/            # Tests
```

---

## 🧪 Testing

```bash
# Run frontend tests
npm run test

# Run contract tests
cd contracts && npx hardhat test

# Run circuit tests
cd circuits && npm run test
```

---

## 🚀 Deployment

### Smart Contracts

```bash
cd contracts
npx hardhat deploy --network mantle-testnet
```

### Frontend

```bash
npm run build
# Deploy to Vercel/Netlify
```

---

## 📚 Documentation

- [Architecture](./docs/ARCHITECTURE.md) - System design and data flow
- [Specifications](./docs/SPECIFICATIONS.md) - Technical specs and schemas
- [Development Roadmap](../VeilRWA-Development-Roadmap.md) - Phase-by-phase plan

---

## 🔐 Security

**MVP Disclaimer**: This is a hackathon prototype using mock/simulated RWAs.

- No custody of real regulated assets
- Designed to integrate with licensed issuers
- Security audit required before mainnet

**Production Path**:
1. Professional security audit
2. Integration with licensed KYC provider
3. Real RWA tokenization partner
4. Mainnet deployment with insurance

---

## 🎯 Roadmap

### ✅ Phase 1: Foundation (Days 1-2)
- [x] Project structure
- [x] Landing page
- [x] Architecture design

### 🔄 Phase 2: ZK Circuits (Days 3-5)
- [ ] KYC verification circuit
- [ ] Deposit commitment circuit
- [ ] Yield claim circuit

### ⏳ Phase 3: Smart Contracts (Days 5-8)
- [ ] VeilRWA Vault
- [ ] ZK Verifier
- [ ] Deploy to Mantle testnet

### ⏳ Phase 4-8: Implementation & Demo
- [ ] Backend API
- [ ] Frontend integration
- [ ] End-to-end testing
- [ ] Documentation & demo video

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
