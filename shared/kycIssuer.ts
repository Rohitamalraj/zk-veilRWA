/**
 * KYC Issuer Script (MVP)
 * 
 * This generates mock KYC credentials with EdDSA signatures.
 * In production, this would be replaced with a proper KYC provider API.
 * 
 * Uses the existing deployed kyc_verification.circom circuit.
 */

import { buildEddsa, buildBabyjub } from 'circomlibjs';
import { poseidon } from 'circomlibjs';

export interface KYCCredential {
  userId: string;               // Unique user identifier
  country: number;              // ISO 3166-1 numeric
  isAccredited: number;         // 0 or 1
  expiryTimestamp: number;      // Unix timestamp
}

export interface EdDSASignature {
  R8: [string, string];         // Point on curve [x, y]
  S: string;                    // Signature S value
}

export interface SignedKYCCredential {
  credential: KYCCredential;
  signature: EdDSASignature;
  issuerPubKey: [string, string]; // [x, y]
}

// Mock issuer private key (for development only!)
// In production, this would be stored securely in HSM
let ISSUER_PRIVATE_KEY: Buffer;
let eddsa: any;
let babyJub: any;

async function initCrypto() {
  if (!eddsa) {
    eddsa = await buildEddsa();
    babyJub = await buildBabyjub();
    // Generate a deterministic key for development
    // In production: use proper key management
    const prvKey = Buffer.from('0001020304050607080910111213141516171819202122232425262728293031', 'hex');
    ISSUER_PRIVATE_KEY = prvKey;
  }
}

/**
 * Generate a KYC credential for a user
 */
export async function issueKYCCredential(
  walletAddress: string,
  countryCode: number,
  isAccredited: boolean
): Promise<SignedKYCCredential> {
  await initCrypto();

  // Generate user ID from wallet address
  const userId = BigInt(walletAddress).toString();

  // Create credential (valid for 1 year)
  const credential: KYCCredential = {
    userId,
    country: countryCode,
    isAccredited: isAccredited ? 1 : 0,
    expiryTimestamp: Math.floor(Date.now() / 1000) + (365 * 24 * 60 * 60), // 1 year
  };

  // Hash the credential (message to sign)
  const F = babyJub.F;
  const message = poseidon([
    F.toObject(BigInt(credential.userId)),
    F.toObject(BigInt(credential.country)),
    F.toObject(BigInt(credential.isAccredited)),
    F.toObject(BigInt(credential.expiryTimestamp))
  ]);

  // Sign with EdDSA
  const signature = eddsa.signPoseidon(ISSUER_PRIVATE_KEY, message);

  // Get public key
  const pubKey = eddsa.prv2pub(ISSUER_PRIVATE_KEY);

  return {
    credential,
    signature: {
      R8: [
        F.toString(signature.R8[0]),
        F.toString(signature.R8[1])
      ],
      S: signature.S.toString()
    },
    issuerPubKey: [
      F.toString(pubKey[0]),
      F.toString(pubKey[1])
    ]
  };
}

/**
 * Verify a KYC credential signature (for testing)
 */
export async function verifyKYCSignature(signed: SignedKYCCredential): Promise<boolean> {
  await initCrypto();

  const F = babyJub.F;
  const message = poseidon([
    F.toObject(BigInt(signed.credential.userId)),
    F.toObject(BigInt(signed.credential.country)),
    F.toObject(BigInt(signed.credential.isAccredited)),
    F.toObject(BigInt(signed.credential.expiryTimestamp))
  ]);

  const signature = {
    R8: [
      F.e(signed.signature.R8[0]),
      F.e(signed.signature.R8[1])
    ],
    S: BigInt(signed.signature.S)
  };

  const pubKey = [
    F.e(signed.issuerPubKey[0]),
    F.e(signed.issuerPubKey[1])
  ];

  return eddsa.verifyPoseidon(message, signature, pubKey);
}

/**
 * Mock issuer for development
 */
export const MOCK_ISSUER = {
  name: 'VeilRWA KYC (Dev)',
  allowedCountries: {
    USA: 840,
    UK: 826,
    CANADA: 124,
    GERMANY: 276,
    FRANCE: 250,
    JAPAN: 392,
    SINGAPORE: 702,
    SWITZERLAND: 756
  }
};

/**
 * Example usage
 */
export async function issueCredentialExample() {
  const signed = await issueKYCCredential(
    '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb5',
    840, // USA
    true  // Accredited
  );
  
  console.log('Issued KYC Credential:', JSON.stringify(signed, null, 2));
  
  // Verify it works
  const isValid = await verifyKYCSignature(signed);
  console.log('Signature valid:', isValid);
  
  return signed;
}
