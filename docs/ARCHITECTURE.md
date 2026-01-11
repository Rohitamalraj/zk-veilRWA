# VeilRWA Architecture

## System Overview

VeilRWA is a privacy-preserving Real-World Asset (RWA) platform built on Mantle Network that enables compliant access to yield through zero-knowledge proofs.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         User Layer                               │
│  (Web3 Wallet + Browser-based ZK Proof Generation)              │
└────────────┬────────────────────────────────────────────────────┘
             │
             ├─────► Frontend (Next.js)
             │       - KYC Flow UI
             │       - Vault Dashboard
             │       - Proof Generation Interface
             │
             ├─────► Mock KYC Issuer (Backend)
             │       - Credential Issuance
             │       - Signature Generation
             │
             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    ZK Circuit Layer                              │
│                                                                   │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────┐  │
│  │  KYC Credential  │  │    Deposit       │  │  Yield Claim │  │
│  │  Verification    │  │   Commitment     │  │    Circuit   │  │
│  │    Circuit       │  │    Circuit       │  │              │  │
│  └──────────────────┘  └──────────────────┘  └──────────────┘  │
│                                                                   │
│  Generates: Proving Keys, Verification Keys, Solidity Verifiers  │
└────────────┬────────────────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────────────┐
│                  Smart Contract Layer (Mantle)                   │
│                                                                   │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────┐  │
│  │   VeilRWAVault   │  │   ZKVerifier     │  │ KYCRegistry  │  │
│  │   - Deposits     │  │   - Groth16      │  │ - Issuers    │  │
│  │   - Commitments  │  │   - Proof Check  │  │ - Countries  │  │
│  │   - Yield Claims │  │   - Public Input │  │ - Whitelist  │  │
│  │   - Nullifiers   │  │                  │  │              │  │
│  └──────────────────┘  └──────────────────┘  └──────────────┘  │
│                                                                   │
│  ┌──────────────────┐                                            │
│  │  MockRWAToken    │  (ERC20 representing T-Bill yield)        │
│  └──────────────────┘                                            │
└─────────────────────────────────────────────────────────────────┘
```

## Core Components

### 1. Frontend (Next.js + TypeScript)

**Location**: `/app`, `/components`

**Pages**:
- `/` - Landing page ✅
- `/kyc` - KYC credential flow
- `/vault` - Vault dashboard (deposit, claim)
- `/privacy` - Privacy explanation

**Key Features**:
- Web3 wallet integration (RainbowKit/ConnectKit)
- Browser-based ZK proof generation (SnarkJS)
- Commitment generation (client-side)
- Transaction management

**Tech Stack**:
- Next.js 16 (App Router)
- wagmi + viem (Web3)
- SnarkJS (ZK proofs)
- Tailwind CSS + shadcn/ui

---

### 2. ZK Circuits (Circom)

**Location**: `/circuits`

#### Circuit 1: KYC Verification (`kyc_verification.circom`)

**Purpose**: Prove valid KYC credential without revealing identity

**Public Inputs**:
- `issuerPubKey`: Public key of KYC issuer
- `allowedCountriesRoot`: Merkle root of allowed countries
- `currentTimestamp`: Current block timestamp

**Private Inputs**:
- `kycData`: User's KYC information
- `issuerSignature`: Signature from issuer
- `userNullifier`: Privacy-preserving user identifier
- `countryMerkleProof`: Proof country is in allowed set

**Constraints**: ~5,000

**What It Proves**:
- Signature is valid from authorized issuer
- Credential is not expired
- User's country is in allowed set
- User meets accreditation requirements

---

#### Circuit 2: Deposit Commitment (`deposit_commitment.circom`)

**Purpose**: Create private commitment to deposit amount

**Public Inputs**:
- `commitment`: Pedersen hash commitment

**Private Inputs**:
- `balance`: Deposit amount
- `salt`: Random secret for commitment

**Commitment Formula**:
```
C = PedersenHash(balance || salt)
```

**Constraints**: ~2,000

**What It Proves**:
- Prover knows the preimage (balance + salt) of commitment C
- Balance is within valid range (0 < B < MAX_DEPOSIT)

---

#### Circuit 3: Yield Claim (`yield_claim.circom`) ⭐ **CORE INNOVATION**

**Purpose**: Prove correct yield calculation without revealing balance or yield amount

**Public Inputs**:
- `commitment`: Original deposit commitment
- `yieldRate`: Fixed APY (e.g., 5%)
- `timeElapsed`: Time since deposit (in seconds)
- `nullifier`: Prevents double-claiming

**Private Inputs**:
- `balance`: Original deposit amount
- `salt`: Secret from commitment
- `depositTimestamp`: When deposit was made

**Yield Formula**:
```
Y = B × (rate / 365 days) × timeElapsed
```

**Nullifier Formula**:
```
nullifier = Hash(commitment || depositTimestamp)
```

**Constraints**: ~8,000

**What It Proves**:
- Prover owns the commitment (knows balance + salt)
- Yield calculation is correct: Y = B × rate × time
- Nullifier corresponds to this specific claim
- Time elapsed is accurate

---

### 3. Smart Contracts (Solidity)

**Location**: `/contracts`

#### Contract 1: `VeilRWAVault.sol`

**Purpose**: Main vault for private deposits and yield claims

**State Variables**:
```solidity
mapping(bytes32 => bool) public commitments;
mapping(bytes32 => bool) public nullifiers;
uint256 public yieldRate; // e.g., 500 = 5%
address public zkVerifier;
address public kycRegistry;
IERC20 public yieldToken;
```

**Key Functions**:

```solidity
function deposit(
    bytes32 commitment,
    bytes calldata zkKYCProof
) external {
    // 1. Verify KYC proof via zkVerifier
    // 2. Store commitment
    // 3. Emit DepositCommitted event
}

function claimYield(
    bytes32 nullifier,
    bytes calldata zkYieldProof
) external {
    // 1. Verify yield proof via zkVerifier
    // 2. Check nullifier not used
    // 3. Mark nullifier as spent
    // 4. Transfer yield tokens to msg.sender
    // 5. Emit YieldClaimed event
}
```

**Events**:
```solidity
event DepositCommitted(bytes32 indexed commitment, uint256 timestamp);
event YieldClaimed(bytes32 indexed nullifier, address indexed recipient);
```

---

#### Contract 2: `ZKVerifier.sol`

**Purpose**: Verify ZK proofs on-chain

**Generated from Circuits**: Auto-generated Solidity verifiers from Circom

**Key Functions**:
```solidity
function verifyKYCProof(
    uint256[2] memory a,
    uint256[2][2] memory b,
    uint256[2] memory c,
    uint256[] memory publicInputs
) public view returns (bool);

function verifyYieldProof(
    uint256[2] memory a,
    uint256[2][2] memory b,
    uint256[2] memory c,
    uint256[] memory publicInputs
) public view returns (bool);
```

---

#### Contract 3: `KYCRegistry.sol`

**Purpose**: Manage authorized KYC issuers and allowed jurisdictions

**State Variables**:
```solidity
mapping(address => bool) public authorizedIssuers;
mapping(uint256 => bool) public allowedCountries; // ISO country codes
bytes32 public countriesMerkleRoot;
```

**Key Functions**:
```solidity
function addIssuer(address issuer) external onlyOwner;
function removeIssuer(address issuer) external onlyOwner;
function updateCountriesMerkleRoot(bytes32 newRoot) external onlyOwner;
```

---

#### Contract 4: `MockRWAToken.sol`

**Purpose**: Simple ERC20 for testing (represents T-Bill yield)

**Features**:
- Standard ERC20
- Owner can mint (for funding vault)
- Represents yield payments

---

### 4. Backend (Mock KYC Issuer)

**Location**: `/backend`

**Tech Stack**: Node.js + Express (or Python + FastAPI)

**API Endpoints**:

```
POST /api/kyc/submit
- Accept user data (off-chain)
- Perform mock verification
- Return application ID

POST /api/kyc/credential
- Issue signed KYC credential
- Return credential + issuer signature
- Format: JSON with EdDSA signature

GET /api/kyc/issuer-key
- Return issuer public key
```

**Credential Format**:
```json
{
  "userId": "uuid",
  "isKYCed": true,
  "country": "US",
  "isAccredited": true,
  "expiryTimestamp": 1704067200,
  "issuerSignature": "0x..."
}
```

---

## Data Flow

### Flow 1: User Onboarding & Deposit

```
1. User submits KYC info → Backend
2. Backend issues signed credential → User
3. User generates ZK-KYC proof (browser)
4. User creates commitment: C = Hash(balance, salt)
5. User submits deposit(C, zkProof) → Smart Contract
6. Contract verifies proof → Stores commitment
```

### Flow 2: Yield Claim

```
1. Time passes (user accumulates yield)
2. User calculates yield: Y = B × rate × time
3. User generates ZK yield proof (browser)
   - Inputs: balance, salt, time
   - Outputs: proof of correct calculation
4. User submits claimYield(nullifier, zkProof) → Contract
5. Contract verifies:
   - Proof is valid
   - Nullifier not used
6. Contract transfers yield tokens → User
7. Contract marks nullifier as spent
```

---

## Security Considerations

### ZK Circuit Security
- Trusted setup required (Powers of Tau ceremony)
- Constraint system must be sound (no invalid proofs accepted)
- Range checks on all numeric inputs
- Nullifier uniqueness prevents double-spending

### Smart Contract Security
- Reentrancy guards on all state-changing functions
- Pausable in case of emergency
- Access control for admin functions
- No direct balance exposure

### Privacy Guarantees
- Commitments reveal nothing about balance
- Nullifiers don't link to commitments (without secret)
- On-chain observer sees only:
  - Commitment hashes
  - Proof verifications (pass/fail)
  - Nullifier hashes
  - No identity, balance, or yield amounts

---

## Gas Optimization (Mantle-Specific)

**Why Mantle**:
- ZK proof verification: ~200K gas per proof
- On Ethereum L1: ~$40 at 100 gwei
- On Mantle: ~$0.10 (400x cheaper)

**Optimizations**:
- Batch multiple claims if possible
- Use Groth16 (smallest proof size)
- Optimize circuit constraint count
- Cache verification keys on-chain

---

## Scalability

**Current MVP**:
- Single yield vault
- Fixed 5% APY
- Supports ~1000 concurrent users

**Future Scaling**:
- Multiple vault types (T-Bills, bonds, etc.)
- Dynamic yield rates
- Rollup aggregation for proof verification
- Recursive proofs for batching

---

## Compliance Architecture

**Current MVP**: Mock KYC, simulated RWAs

**Production Path**:
1. Integrate licensed KYC provider (e.g., Parallel Markets, Securitize)
2. On-chain credential registry (issuer attestations)
3. Optional regulator view key (separate encryption)
4. Real T-Bill tokenization partner

**Regulatory Alignment**:
- KYC at credential issuance (off-chain)
- No on-chain PII
- Selective disclosure via ZK
- Audit trail via nullifiers (encrypted mapping available to regulator)

---

## Tech Stack Summary

| Layer | Technology | Purpose |
|-------|------------|---------|
| Frontend | Next.js 16 + TypeScript | User interface |
| Web3 | wagmi + viem | Wallet + contract interaction |
| ZK Proofs | Circom + SnarkJS | Circuit definition + browser proving |
| Smart Contracts | Solidity + Hardhat | On-chain logic |
| Network | Mantle Testnet/Mainnet | L2 deployment |
| Backend | Node.js + Express | Mock KYC issuer |
| Storage | IPFS (future) | Off-chain data |

---

## Development Phases

**Phase 1 (Days 1-2)**: Foundation ✅ In Progress
- Project structure
- Architecture design
- Specifications

**Phase 2 (Days 3-5)**: ZK Circuits
- Write Circom circuits
- Compile and test
- Generate verifiers

**Phase 3 (Days 5-8)**: Smart Contracts
- Write Solidity contracts
- Unit tests
- Deploy to Mantle testnet

**Phase 4 (Days 7-9)**: Backend
- Mock KYC issuer API
- Credential signing

**Phase 5 (Days 9-12)**: Frontend
- KYC flow UI
- Vault dashboard
- Proof generation integration

**Phase 6 (Days 12-14)**: Integration & Testing
- End-to-end testing
- Performance optimization
- Security review

**Phase 7 (Days 14-16)**: Documentation & Demo
- Technical docs
- Video demo
- Pitch materials

**Phase 8 (Days 16-17)**: Submission
- GitHub repo
- Live demo
- Hackathon submission

---

## Success Metrics

**MVP Goals**:
- ✅ Working ZK proof generation (<30s)
- ✅ Gas cost <200K per verification
- ✅ End-to-end demo (KYC → Deposit → Claim)
- ✅ Zero balance/identity leakage

**Judge Win Conditions**:
- Novel ZK application (yield correctness, not just identity)
- Institutional-grade solution
- Clear Mantle advantage
- Complete, working demo
- Professional documentation

---

*This architecture enables VeilRWA to deliver "Compliance without surveillance" for the next generation of institutional DeFi.*
