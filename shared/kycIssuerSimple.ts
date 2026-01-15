/**
 * Simplified KYC Issuer (Hash-Based)
 * 
 * Works with kyc_simple.circom circuit
 * Uses Poseidon hash-based signatures instead of EdDSA
 */

import { buildPoseidon } from 'circomlibjs';

export interface KYCCredential {
  isKYCed: number;              // Always 1 for valid credentials
  countryCode: number;          // ISO 3166-1 numeric
  isAccredited: number;         // 0 or 1
  expiry: number;               // Unix timestamp
  userSecret: string;           // Unique per user
  credentialSalt: string;       // Random salt from issuer
}

export interface KYCSignature {
  issuerCommitment: string;     // Poseidon(credentialHash, salt)
}

export interface SignedKYCCredential {
  credential: KYCCredential;
  signature: KYCSignature;
}

/**
 * Generate a unique user secret from wallet address
 */
function generateUserSecret(walletAddress: string): string {
  // Use wallet address as seed
  const addressNum = BigInt(walletAddress);
  return addressNum.toString();
}

/**
 * Generate random salt
 */
function generateSalt(): string {
  // Generate random 32 bytes
  const randomBytes = new Uint8Array(32);
  
  // Browser environment
  if (typeof window !== 'undefined' && window.crypto) {
    window.crypto.getRandomValues(randomBytes);
  } 
  // Node.js environment with Web Crypto API
  else if (typeof globalThis !== 'undefined' && globalThis.crypto) {
    globalThis.crypto.getRandomValues(randomBytes);
  }
  // Fallback: pseudo-random (NOT SECURE - for testing only)
  else {
    console.warn('Using insecure random number generation - for testing only!');
    for (let i = 0; i < 32; i++) {
      randomBytes[i] = Math.floor(Math.random() * 256);
    }
  }
  
  const saltBigInt = BigInt('0x' + Array.from(randomBytes).map(b => b.toString(16).padStart(2, '0')).join(''));
  return saltBigInt.toString();
}

/**
 * Issue a KYC credential with hash-based signature
 */
export async function issueKYCCredential(
  walletAddress: string,
  countryCode: number,
  isAccredited: boolean
): Promise<SignedKYCCredential> {
  const poseidon = await buildPoseidon();
  
  // Generate user secret and salt
  const userSecret = generateUserSecret(walletAddress);
  const credentialSalt = generateSalt();
  
  // Create credential (valid for 1 year)
  const credential: KYCCredential = {
    isKYCed: 1,
    countryCode,
    isAccredited: isAccredited ? 1 : 0,
    expiry: Math.floor(Date.now() / 1000) + (365 * 24 * 60 * 60),
    userSecret,
    credentialSalt,
  };
  
  // Create credential hash: Poseidon(isKYCed, countryCode, isAccredited, expiry, userSecret, salt)
  const credentialHash = poseidon([
    BigInt(credential.isKYCed),
    BigInt(credential.countryCode),
    BigInt(credential.isAccredited),
    BigInt(credential.expiry),
    BigInt(credential.userSecret),
    BigInt(credential.credentialSalt)
  ]);
  
  // Create issuer commitment: Poseidon(credentialHash, salt)
  const issuerCommitment = poseidon([
    credentialHash,
    BigInt(credential.credentialSalt)
  ]);
  
  const signature: KYCSignature = {
    issuerCommitment: poseidon.F.toString(issuerCommitment)
  };
  
  return {
    credential,
    signature
  };
}

/**
 * Allowed countries (ISO 3166-1 numeric codes)
 */
export const ALLOWED_COUNTRIES = {
  USA: 840,
  UK: 826,
  CANADA: 124,
  GERMANY: 276,
  FRANCE: 250,
  JAPAN: 392,
  SINGAPORE: 702,
  SWITZERLAND: 756,
};

/**
 * Example usage
 */
export async function issueCredentialExample() {
  const credential = await issueKYCCredential(
    '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb5',
    ALLOWED_COUNTRIES.USA,
    true  // Accredited
  );
  
  console.log('Issued KYC Credential:', JSON.stringify(credential, null, 2));
  return credential;
}

// For testing in Node.js (commented out to avoid module issues in browser)
// if (typeof require !== 'undefined' && require.main === module) {
//   issueCredentialExample().then(() => console.log('Done'));
// }
