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
): Promise<{ proof: Proof; publicSignals: PublicSignals }> {
  if (!snarkjs) {
    throw new Error('SnarkJS not available on server side');
  }

  // Build Poseidon hash
  const poseidon = await buildPoseidon();
  const commitment = poseidon([amount.toString(), salt]);
  
  // Generate witness inputs
  const inputs = {
    amount: amount.toString(),
    salt: salt,
  };

  // Generate proof
  const { proof, publicSignals } = await snarkjs.groth16.fullProve(
    inputs,
    '/zkp/deposit_commitment.wasm',
    '/zkp/deposit_commitment_final.zkey'
  );

  return { proof, publicSignals };
}

/**
 * Generate a ZK proof for claiming yield
 * @param depositAmount - Original deposit amount
 * @param depositTime - Timestamp of deposit
 * @param yieldAmount - Amount of yield to claim
 * @returns Proof and public signals
 */
export async function generateYieldProof(
  depositAmount: bigint,
  depositTime: number,
  yieldAmount: bigint
): Promise<{ proof: Proof; publicSignals: PublicSignals }> {
  if (!snarkjs) {
    throw new Error('SnarkJS not available on server side');
  }

  // Generate witness inputs
  const inputs = {
    depositAmount: depositAmount.toString(),
    depositTime: depositTime.toString(),
    yieldAmount: yieldAmount.toString(),
    currentTime: Math.floor(Date.now() / 1000).toString(),
  };

  // Generate proof
  const { proof, publicSignals } = await snarkjs.groth16.fullProve(
    inputs,
    '/zkp/yield_claim.wasm',
    '/zkp/yield_claim_final.zkey'
  );

  return { proof, publicSignals };
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
