# VeilRWA Technical Specifications

## Data Structures

### 1. KYC Credential Schema

```typescript
interface KYCCredential {
  userId: string;              // UUID v4
  isKYCed: boolean;            // Must be true
  country: string;             // ISO 3166-1 alpha-2 code (e.g., "US")
  isAccredited: boolean;       // Accredited investor status
  issuerAddress: string;       // Ethereum address of issuer
  issuedAt: number;            // Unix timestamp
  expiryTimestamp: number;     // Unix timestamp (typically +1 year)
  signature: {
    r: string;                 // EdDSA signature component
    s: string;                 // EdDSA signature component
  };
}
```

**Allowed Countries** (MVP):
- US, GB, SG, CH, AE (expandable)

**Credential Lifetime**: 365 days

---

### 2. Commitment Structure

```typescript
interface Commitment {
  value: string;               // bytes32 hex string
  balance: bigint;             // Private: actual deposit amount
  salt: string;                // Private: random 256-bit secret
  timestamp: number;           // When commitment was created
}

// Commitment generation:
// C = PedersenHash(balance || salt)
```

**Balance Constraints**:
- Minimum: 100 USDC (or equivalent)
- Maximum: 1,000,000 USDC (MVP limit)

---

### 3. Yield Calculation

```typescript
interface YieldClaim {
  commitment: string;          // bytes32 commitment being claimed against
  balance: bigint;             // Private: deposit amount
  salt: string;                // Private: commitment secret
  depositTimestamp: number;    // When deposit was made
  claimTimestamp: number;      // When claim is being made
  yieldRate: number;           // e.g., 500 = 5.00%
  calculatedYield: bigint;     // Y = B × (rate/10000) × (time/365 days)
  nullifier: string;           // bytes32 unique identifier for this claim
}
```

**Yield Formula**:
```
Y = B × (R / 10000) × (T / 31536000)

Where:
- B = Balance (in wei/smallest unit)
- R = Rate in basis points (500 = 5%)
- T = Time elapsed in seconds
- 31536000 = seconds in 365 days
```

**Example Calculation**:
```
Balance: 10,000 USDC (10,000 × 10^6 wei)
Rate: 5% APY (500 basis points)
Time: 30 days (2,592,000 seconds)

Y = 10,000,000,000 × (500/10000) × (2,592,000/31,536,000)
Y = 10,000,000,000 × 0.05 × 0.0822
Y = 41,095,890 wei
Y ≈ 41.10 USDC
```

---

### 4. Nullifier Generation

```typescript
// Prevents double-claiming of same yield period
nullifier = keccak256(commitment || depositTimestamp || claimTimestamp)
```

**Properties**:
- Unique per claim period
- Cannot be linked back to commitment (without secrets)
- Prevents replay attacks

---

## ZK Circuit Specifications

### Circuit 1: KYC Verification

**File**: `kyc_verification.circom`

**Template**:
```circom
template KYCVerification(maxCountries) {
    // Public inputs
    signal input issuerPubKeyX;
    signal input issuerPubKeyY;
    signal input countriesMerkleRoot;
    signal input currentTimestamp;
    signal output isValid;

    // Private inputs
    signal input userId;
    signal input country;
    signal input isAccredited;
    signal input expiryTimestamp;
    signal input signatureR;
    signal input signatureS;
    signal input countryMerkleProof[8];

    // Constraints
    component sigVerify = EdDSAVerifier();
    component merkleVerify = MerkleTreeChecker(8);
    component timeCheck = LessThan(64);
    
    // ... circuit logic
}
```

**Public Inputs** (on-chain):
- `issuerPubKeyX`, `issuerPubKeyY`: Issuer's public key (2 field elements)
- `countriesMerkleRoot`: Root of allowed countries tree
- `currentTimestamp`: Block timestamp

**Private Inputs** (stays with user):
- `userId`: User identifier
- `country`: User's country code
- `isAccredited`: Boolean flag
- `expiryTimestamp`: Credential expiry
- `signatureR`, `signatureS`: Issuer's EdDSA signature
- `countryMerkleProof`: Proof country is in allowed set

**Constraints**: ~5,000

**Verification Time**: ~50ms (browser)

---

### Circuit 2: Deposit Commitment

**File**: `deposit_commitment.circom`

**Template**:
```circom
template DepositCommitment() {
    // Public inputs
    signal input commitment;
    signal output isValid;

    // Private inputs
    signal input balance;
    signal input salt;

    // Constraints
    component hasher = Poseidon(2);
    hasher.inputs[0] <== balance;
    hasher.inputs[1] <== salt;
    
    commitment === hasher.out;
    
    // Range check: 100 <= balance <= 1000000
    component rangeCheck = RangeCheck(32);
    rangeCheck.in <== balance;
    rangeCheck.min <== 100000000; // 100 USDC in 6 decimals
    rangeCheck.max <== 1000000000000; // 1M USDC
}
```

**Public Inputs**:
- `commitment`: The commitment hash

**Private Inputs**:
- `balance`: Deposit amount
- `salt`: Random secret

**Constraints**: ~2,000

**Verification Time**: ~30ms

---

### Circuit 3: Yield Claim (CORE INNOVATION)

**File**: `yield_claim.circom`

**Template**:
```circom
template YieldClaim() {
    // Public inputs
    signal input commitment;
    signal input yieldRate;
    signal input timeElapsed;
    signal input nullifier;
    signal output calculatedYield;

    // Private inputs
    signal input balance;
    signal input salt;
    signal input depositTimestamp;
    signal input claimTimestamp;

    // 1. Verify commitment ownership
    component hasher = Poseidon(2);
    hasher.inputs[0] <== balance;
    hasher.inputs[1] <== salt;
    commitment === hasher.out;

    // 2. Calculate time elapsed
    signal computedTime <== claimTimestamp - depositTimestamp;
    timeElapsed === computedTime;

    // 3. Calculate yield
    // Y = (balance * yieldRate * timeElapsed) / (10000 * 31536000)
    signal intermediate1 <== balance * yieldRate;
    signal intermediate2 <== intermediate1 * timeElapsed;
    signal divisor <== 10000 * 31536000; // 315360000000
    calculatedYield <== intermediate2 / divisor;

    // 4. Generate nullifier
    component nullifierHasher = Poseidon(3);
    nullifierHasher.inputs[0] <== commitment;
    nullifierHasher.inputs[1] <== depositTimestamp;
    nullifierHasher.inputs[2] <== claimTimestamp;
    nullifier === nullifierHasher.out;

    // 5. Range checks
    component balanceCheck = RangeCheck(32);
    balanceCheck.in <== balance;
    
    component timeCheck = LessThan(64);
    timeCheck.a <== timeElapsed;
    timeCheck.b <== 31536000; // Max 1 year
}
```

**Public Inputs**:
- `commitment`: Original deposit commitment
- `yieldRate`: APY in basis points (e.g., 500)
- `timeElapsed`: Seconds since deposit
- `nullifier`: Unique claim identifier
- `calculatedYield`: Computed yield amount (output)

**Private Inputs**:
- `balance`: Original deposit amount
- `salt`: Commitment secret
- `depositTimestamp`: When deposit was made
- `claimTimestamp`: When claim is happening

**Constraints**: ~8,000

**Verification Time**: ~80ms

**Gas Cost** (on Mantle): ~180K gas (~$0.08)

---

## Smart Contract Specifications

### Contract: VeilRWAVault

**File**: `VeilRWAVault.sol`

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IVeilRWAVault {
    // Events
    event DepositCommitted(
        bytes32 indexed commitment,
        uint256 timestamp
    );
    
    event YieldClaimed(
        bytes32 indexed nullifier,
        address indexed recipient,
        uint256 yieldAmount
    );
    
    // Errors
    error InvalidProof();
    error CommitmentAlreadyExists();
    error NullifierAlreadyUsed();
    error InsufficientYieldBalance();
    
    // Functions
    function deposit(
        bytes32 commitment,
        bytes calldata zkKYCProof
    ) external;
    
    function claimYield(
        bytes32 nullifier,
        uint256 yieldAmount,
        bytes calldata zkYieldProof
    ) external;
    
    // View functions
    function isCommitmentUsed(bytes32 commitment) external view returns (bool);
    function isNullifierUsed(bytes32 nullifier) external view returns (bool);
    function getYieldRate() external view returns (uint256);
}
```

**Storage Layout**:
```solidity
contract VeilRWAVault {
    // Commitments (balance commitments)
    mapping(bytes32 => bool) public commitments;
    
    // Nullifiers (prevent double claims)
    mapping(bytes32 => bool) public nullifiers;
    
    // Configuration
    uint256 public yieldRate; // In basis points (500 = 5%)
    address public zkVerifier;
    address public kycRegistry;
    address public yieldToken; // ERC20 token for yield payments
    
    // Admin
    address public owner;
    bool public paused;
}
```

**Key Functions**:

```solidity
function deposit(bytes32 commitment, bytes calldata zkKYCProof) external {
    if (paused) revert ContractPaused();
    if (commitments[commitment]) revert CommitmentAlreadyExists();
    
    // Verify KYC proof
    bool isValid = IZKVerifier(zkVerifier).verifyKYCProof(zkKYCProof);
    if (!isValid) revert InvalidProof();
    
    // Store commitment
    commitments[commitment] = true;
    
    emit DepositCommitted(commitment, block.timestamp);
}

function claimYield(
    bytes32 nullifier,
    uint256 yieldAmount,
    bytes calldata zkYieldProof
) external {
    if (paused) revert ContractPaused();
    if (nullifiers[nullifier]) revert NullifierAlreadyUsed();
    
    // Verify yield proof
    bool isValid = IZKVerifier(zkVerifier).verifyYieldProof(
        zkYieldProof,
        yieldAmount,
        yieldRate,
        nullifier
    );
    if (!isValid) revert InvalidProof();
    
    // Mark nullifier as used
    nullifiers[nullifier] = true;
    
    // Transfer yield tokens
    IERC20(yieldToken).transfer(msg.sender, yieldAmount);
    
    emit YieldClaimed(nullifier, msg.sender, yieldAmount);
}
```

---

## API Specifications (Backend)

### Endpoint 1: Submit KYC

```
POST /api/kyc/submit
Content-Type: application/json

Request:
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "country": "US",
  "isAccredited": true,
  "dateOfBirth": "1990-01-01"
}

Response (200 OK):
{
  "applicationId": "uuid-v4",
  "status": "pending",
  "estimatedTime": "2 minutes"
}
```

### Endpoint 2: Get Credential

```
POST /api/kyc/credential
Content-Type: application/json

Request:
{
  "applicationId": "uuid-v4"
}

Response (200 OK):
{
  "credential": {
    "userId": "uuid-v4",
    "isKYCed": true,
    "country": "US",
    "isAccredited": true,
    "issuerAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0",
    "issuedAt": 1704067200,
    "expiryTimestamp": 1735689600,
    "signature": {
      "r": "0x1234...",
      "s": "0x5678..."
    }
  },
  "issuerPublicKey": {
    "x": "0xabcd...",
    "y": "0xef01..."
  }
}
```

### Endpoint 3: Get Issuer Public Key

```
GET /api/kyc/issuer-key

Response (200 OK):
{
  "publicKey": {
    "x": "0xabcd...",
    "y": "0xef01..."
  },
  "address": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0"
}
```

---

## Configuration

### Mantle Network Config

```typescript
const mantleTestnet = {
  id: 5003,
  name: 'Mantle Sepolia Testnet',
  network: 'mantle-sepolia',
  nativeCurrency: {
    decimals: 18,
    name: 'MNT',
    symbol: 'MNT',
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.sepolia.mantle.xyz'],
    },
    public: {
      http: ['https://rpc.sepolia.mantle.xyz'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Mantle Sepolia Explorer',
      url: 'https://explorer.sepolia.mantle.xyz',
    },
  },
  testnet: true,
};
```

### Environment Variables

```bash
# Frontend (.env.local)
NEXT_PUBLIC_MANTLE_RPC_URL=https://rpc.sepolia.mantle.xyz
NEXT_PUBLIC_VAULT_CONTRACT_ADDRESS=0x...
NEXT_PUBLIC_VERIFIER_CONTRACT_ADDRESS=0x...
NEXT_PUBLIC_KYC_BACKEND_URL=http://localhost:4000

# Backend (.env)
PORT=4000
ISSUER_PRIVATE_KEY=0x...
ISSUER_ADDRESS=0x...
JWT_SECRET=...
```

---

## Testing Requirements

### Circuit Tests
- [ ] KYC verification with valid credential
- [ ] KYC verification with expired credential (should fail)
- [ ] KYC verification with invalid signature (should fail)
- [ ] Commitment generation with various balances
- [ ] Yield calculation correctness (multiple scenarios)
- [ ] Nullifier uniqueness

### Contract Tests
- [ ] Deposit with valid proof
- [ ] Deposit with invalid proof (should revert)
- [ ] Deposit with duplicate commitment (should revert)
- [ ] Claim yield with valid proof
- [ ] Claim yield with invalid proof (should revert)
- [ ] Claim yield with used nullifier (should revert)
- [ ] Pause/unpause functionality

### Integration Tests
- [ ] End-to-end KYC flow
- [ ] End-to-end deposit flow
- [ ] End-to-end claim flow
- [ ] Multiple users simultaneously
- [ ] Edge cases (min/max balances)

---

## Performance Targets

| Metric | Target | Actual (TBD) |
|--------|--------|--------------|
| Proof generation (browser) | <30s | - |
| Proof verification (on-chain) | <200K gas | - |
| Frontend page load | <2s | - |
| API response time | <500ms | - |
| Circuit constraint count | <10K per circuit | - |

---

*These specifications guide the implementation of VeilRWA's privacy-preserving RealFi platform.*
