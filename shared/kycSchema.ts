/**
 * KYC Credential Schema
 * 
 * This defines the structure of KYC credentials issued by authorized providers
 */

export interface KYCCredential {
  // Core claims
  isKYCed: boolean;           // Always true for valid credentials
  countryCode: number;        // ISO 3166-1 numeric code (e.g., 840 = USA)
  isAccredited: boolean;      // Accredited investor status
  expiry: number;             // Unix timestamp
  
  // Anti-replay
  userSecret: string;         // Unique identifier (hash of user wallet + nonce)
  
  // Issuer data
  issuedAt: number;          // Unix timestamp
  issuerName: string;        // Human-readable issuer name
  credentialId: string;      // Unique credential ID
}

export interface KYCSignature {
  salt: string;              // Random salt from issuer
  commitment: string;        // Hash commitment
}

export interface SignedKYCCredential {
  credential: KYCCredential;
  signature: KYCSignature;
}

/**
 * Allowed countries for MVP (ISO 3166-1 numeric codes)
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
} as const;

/**
 * Default credential expiry (1 year)
 */
export const DEFAULT_EXPIRY_DAYS = 365;

/**
 * MVP: Single allowed country
 */
export const MVP_ALLOWED_COUNTRY = ALLOWED_COUNTRIES.USA;
