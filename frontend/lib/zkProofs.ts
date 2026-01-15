import { buildPoseidon } from 'circomlibjs';

// @ts-ignore - snarkjs types
const snarkjs = typeof window !== 'undefined' ? await import('snarkjs') : null;

export interface Proof {
  pi_a: [string, string];
  pi_b: [[string, string], [string, string]];
  pi_c: [string, string];
  protocol: string;
  curve: string;
}

export interface PublicSignals extends Array<string> {}

/**
 * Generate a ZK proof for depositing funds
 * @param amount - The amount to deposit (in wei as bigint)
 * @param salt - Random salt for commitment
 * @returns Proof and public signals
 */
export async function generateDepositProof(
  amount: bigint,
  salt: string
): Promise<{ proof: Proof; publicSignals: PublicSignals; commitment: string }> {
  if (!snarkjs) {
    throw new Error('SnarkJS not available on server side');
  }

  // Convert amount from wei to whole tokens for circuit (divide by 10^18)
  // This keeps numbers within 64-bit range for comparisons
  const amountInTokens = amount / (10n ** 18n);
  
  // Build Poseidon hash to generate commitment using TOKEN amount (not wei)
  // Circuit uses token amounts, so commitment must match
  const poseidon = await buildPoseidon();
  const F = poseidon.F;
  const commitment = poseidon([amountInTokens.toString(), salt]);
  const commitmentStr = F.toString(commitment);
  
  // Set limits in whole tokens (not wei)
  const minBalance = "100"; // 100 tokens minimum
  const maxBalance = "1000000"; // 1M tokens maximum
  
  console.log('Proof generation params:', {
    amountWei: amount.toString(),
    amountTokens: amountInTokens.toString(),
    commitment: commitmentStr,
  });
  
  // Generate witness inputs matching circuit structure
  const inputs = {
    commitment: commitmentStr,
    minBalance: minBalance,
    maxBalance: maxBalance,
    balance: amountInTokens.toString(), // Use token amount
    salt: salt,
  };

  console.log('Circuit inputs:', inputs);

  // Generate proof
  const { proof, publicSignals } = await snarkjs.groth16.fullProve(
    inputs,
    '/zkp/deposit_commitment.wasm',
    '/zkp/deposit_commitment_final.zkey'
  );

  return { proof, publicSignals, commitment: commitmentStr };
}

/**
 * Generate a ZK proof for claiming yield
 * @param balance - Original deposit balance (in tokens, not wei)
 * @param salt - Salt used in commitment
 * @param depositTimestamp - Unix timestamp of deposit
 * @param yieldAmount - Amount of yield to claim (in tokens)
 * @param nullifier - Unique nullifier for this claim
 * @returns Proof and public signals
 */
export async function generateYieldProof(
  balance: bigint,
  salt: string,
  depositTimestamp: number,
  yieldAmount: bigint,
  nullifier: string
): Promise<{ proof: Proof; publicSignals: PublicSignals; commitment: string }> {
  if (!snarkjs) {
    throw new Error('SnarkJS not available on server side');
  }

  // Convert to token amounts (divide by 10^18)
  const balanceInTokens = balance / (10n ** 18n);
  const yieldInTokens = yieldAmount / (10n ** 18n);
  
  // Build commitment using Poseidon
  const poseidon = await buildPoseidon();
  const F = poseidon.F;
  const commitment = poseidon([balanceInTokens.toString(), salt]);
  const commitmentStr = F.toString(commitment);
  
  // Circuit inputs matching YieldClaim template
  const yieldRate = "500"; // 5% APY (500 basis points)
  const currentTimestamp = Math.floor(Date.now() / 1000);
  
  console.log('Yield proof generation params:', {
    balance: balanceInTokens.toString(),
    salt,
    depositTimestamp,
    yieldAmount: yieldInTokens.toString(),
    commitment: commitmentStr,
    yieldRate,
    currentTimestamp,
    nullifier
  });
  
  const inputs = {
    commitment: commitmentStr,
    yieldRate: yieldRate,
    currentTimestamp: currentTimestamp.toString(),
    nullifier: nullifier,
    claimedYield: yieldInTokens.toString(),
    balance: balanceInTokens.toString(),
    salt: salt,
    depositTimestamp: depositTimestamp.toString()
  };

  console.log('Yield circuit inputs:', inputs);

  // Generate proof
  const { proof, publicSignals } = await snarkjs.groth16.fullProve(
    inputs,
    '/zkp/yield_claim.wasm',
    '/zkp/yield_claim_final.zkey'
  );

  return { proof, publicSignals, commitment: commitmentStr };
}

/**
 * Format a SnarkJS proof for Solidity verifier
 * Converts the proof into the calldata format expected by the verifier contract
 */
export function formatProofForSolidity(proof: Proof): {
  a: [string, string];
  b: [[string, string], [string, string]];
  c: [string, string];
} {
  return {
    a: [proof.pi_a[0], proof.pi_a[1]],
    b: [
      [proof.pi_b[0][1], proof.pi_b[0][0]], // Note: reversed for Solidity
      [proof.pi_b[1][1], proof.pi_b[1][0]]
    ],
    c: [proof.pi_c[0], proof.pi_c[1]]
  };
}

/**
 * Encode proof and public signals as bytes for contract call
 * This creates a packed bytes representation for the vault contract
 */
export function encodeProofAsBytes(
  proof: Proof,
  publicSignals: PublicSignals
): string {
  const formattedProof = formatProofForSolidity(proof);
  
  // For simplicity, we'll just encode the proof components
  // The contract will need to be updated to accept this format
  const abiCoder = new (require('ethers').AbiCoder)();
  
  return abiCoder.encode(
    ['uint256[2]', 'uint256[2][2]', 'uint256[2]', 'uint256[]'],
    [formattedProof.a, formattedProof.b, formattedProof.c, publicSignals]
  );
}

/**
 * Verify a proof client-side before submitting to chain
 * This can save gas by catching invalid proofs early
 */
export async function verifyDepositProof(
  proof: Proof,
  publicSignals: PublicSignals
): Promise<boolean> {
  if (!snarkjs) {
    throw new Error('SnarkJS not available on server side');
  }

  const vkey = await fetch('/zkp/deposit_commitment_vkey.json').then(r => r.json());
  return await snarkjs.groth16.verify(vkey, publicSignals, proof);
}

/**
 * Verify a yield proof client-side
 */
export async function verifyYieldProof(
  proof: Proof,
  publicSignals: PublicSignals
): Promise<boolean> {
  if (!snarkjs) {
    throw new Error('SnarkJS not available on server side');
  }

  const vkey = await fetch('/zkp/yield_claim_vkey.json').then(r => r.json());
  return await snarkjs.groth16.verify(vkey, publicSignals, proof);
}

/**
 * Generate a random salt for commitments
 */
export function generateRandomSalt(): string {
  // Generate a random 32-byte value
  const randomBytes = new Uint8Array(32);
  if (typeof window !== 'undefined' && window.crypto) {
    window.crypto.getRandomValues(randomBytes);
  } else {
    // Fallback for testing
    for (let i = 0; i < 32; i++) {
      randomBytes[i] = Math.floor(Math.random() * 256);
    }
  }
  
  // Convert to BigInt string
  const saltBigInt = BigInt('0x' + Array.from(randomBytes).map(b => b.toString(16).padStart(2, '0')).join(''));
  return saltBigInt.toString();
}
/**
 * Generate a ZK proof for KYC verification (Simplified)
 * Uses kyc_simple.circom with hash-based verification
 */
export async function generateKYCProofSimple(
  credential: {
    isKYCed: number;
    countryCode: number;
    isAccredited: number;
    expiry: number;
    userSecret: string;
    credentialSalt: string;
  },
  allowedCountry: number,
  currentTime: number,
  issuerCommitment: string
): Promise<{ proof: Proof; publicSignals: PublicSignals }> {
  if (!snarkjs) {
    throw new Error('SnarkJS not available on server side');
  }

  const inputs = {
    // Private inputs
    isKYCed: credential.isKYCed.toString(),
    countryCode: credential.countryCode.toString(),
    isAccredited: credential.isAccredited.toString(),
    expiry: credential.expiry.toString(),
    userSecret: credential.userSecret.toString(),
    credentialSalt: credential.credentialSalt.toString(),
    // Public inputs
    allowedCountry: allowedCountry.toString(),
    currentTime: currentTime.toString(),
    issuerCommitment: issuerCommitment.toString(),
  };

  console.log('Generating KYC proof with inputs:', inputs);

  const { proof, publicSignals } = await snarkjs.groth16.fullProve(
    inputs,
    '/zkp/kyc_simple.wasm',
    '/zkp/kyc_simple_final.zkey'
  );

  console.log('KYC proof generated:', proof);
  console.log('Public signals:', publicSignals);

  return { proof, publicSignals };
}

/**
 * Verify a simplified KYC proof client-side
 */
export async function verifyKYCProofSimple(
  proof: Proof,
  publicSignals: PublicSignals
): Promise<boolean> {
  if (!snarkjs) {
    throw new Error('SnarkJS not available on server side');
  }

  const vkey = await fetch('/zkp/kyc_simple_vkey.json').then(r => r.json());
  return await snarkjs.groth16.verify(vkey, publicSignals, proof);
}

/**
 * Generate a ZK proof for KYC verification (Legacy EdDSA)
 * @deprecated Use generateKYCProofSimple instead
 */
export async function generateKYCProof(
  userId: string,
  country: number,
  isAccredited: number,
  expiryTimestamp: number,
  signatureR8x: string,
  signatureR8y: string,
  signatureS: string,
  issuerPubKeyX: string,
  issuerPubKeyY: string,
  currentTimestamp: number,
  minAccreditation: number
): Promise<{ proof: Proof; publicSignals: PublicSignals }> {
  if (!snarkjs) {
    throw new Error('SnarkJS not available on server side');
  }

  // Generate witness inputs
  const inputs = {
    // Public inputs
    issuerPubKeyX: issuerPubKeyX.toString(),
    issuerPubKeyY: issuerPubKeyY.toString(),
    currentTimestamp: currentTimestamp.toString(),
    minAccreditation: minAccreditation.toString(),
    // Private inputs
    userId: userId.toString(),
    country: country.toString(),
    isAccredited: isAccredited.toString(),
    expiryTimestamp: expiryTimestamp.toString(),
    signatureR8x: signatureR8x.toString(),
    signatureR8y: signatureR8y.toString(),
    signatureS: signatureS.toString(),
  };

  console.log('Generating KYC proof with inputs:', inputs);

  // Generate proof
  const { proof, publicSignals } = await snarkjs.groth16.fullProve(
    inputs,
    '/zkp/kyc_verification.wasm',
    '/zkp/kyc_verification_final.zkey'
  );

  console.log('KYC proof generated:', proof);
  console.log('Public signals:', publicSignals);

  return { proof, publicSignals };
}

/**
 * Verify a KYC proof client-side
 */
export async function verifyKYCProof(
  proof: Proof,
  publicSignals: PublicSignals
): Promise<boolean> {
  if (!snarkjs) {
    throw new Error('SnarkJS not available on server side');
  }

  const vkey = await fetch('/zkp/kyc_verification_vkey.json').then(r => r.json());
  return await snarkjs.groth16.verify(vkey, publicSignals, proof);
}