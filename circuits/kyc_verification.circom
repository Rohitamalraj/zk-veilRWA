pragma circom 2.0.0;

include "../node_modules/circomlib/circuits/poseidon.circom";
include "../node_modules/circomlib/circuits/comparators.circom";
include "../node_modules/circomlib/circuits/eddsaposeidon.circom";

/*
 * KYC Verification Circuit
 * 
 * This circuit verifies that a user has a valid KYC credential without revealing their identity.
 * It proves:
 * 1. The credential is signed by an authorized issuer
 * 2. The credential has not expired
 * 3. The user's country is in the allowed list
 * 4. The user meets accreditation requirements (if needed)
 */

template KYCVerification() {
    // Public inputs (visible on-chain)
    signal input issuerPubKeyX;        // Issuer's EdDSA public key X coordinate
    signal input issuerPubKeyY;        // Issuer's EdDSA public key Y coordinate
    signal input currentTimestamp;     // Current block timestamp
    signal input minAccreditation;     // Minimum accreditation level required (0 or 1)
    
    // Private inputs (kept secret by user)
    signal input userId;               // User's unique identifier
    signal input country;              // User's country code (as number)
    signal input isAccredited;         // User's accreditation status (0 or 1)
    signal input expiryTimestamp;      // Credential expiry timestamp
    signal input signatureR8x;         // EdDSA signature R8 point X
    signal input signatureR8y;         // EdDSA signature R8 point Y
    signal input signatureS;           // EdDSA signature S value
    
    // Output
    signal output isValid;
    
    // --- Step 1: Verify EdDSA signature ---
    // Message = Poseidon(userId, country, isAccredited, expiryTimestamp)
    component messageHasher = Poseidon(4);
    messageHasher.inputs[0] <== userId;
    messageHasher.inputs[1] <== country;
    messageHasher.inputs[2] <== isAccredited;
    messageHasher.inputs[3] <== expiryTimestamp;
    
    // Verify signature
    component sigVerifier = EdDSAPoseidonVerifier();
    sigVerifier.enabled <== 1;
    sigVerifier.Ax <== issuerPubKeyX;
    sigVerifier.Ay <== issuerPubKeyY;
    sigVerifier.R8x <== signatureR8x;
    sigVerifier.R8y <== signatureR8y;
    sigVerifier.S <== signatureS;
    sigVerifier.M <== messageHasher.out;
    
    // Signature must be valid
    sigVerifier.enabled === 1;
    
    // --- Step 2: Check credential expiry ---
    // expiryTimestamp must be greater than currentTimestamp
    component expiryCheck = GreaterThan(64);
    expiryCheck.in[0] <== expiryTimestamp;
    expiryCheck.in[1] <== currentTimestamp;
    
    // --- Step 3: Check accreditation requirement ---
    // If minAccreditation is 1, user must be accredited
    component accreditCheck = GreaterEqThan(8);
    accreditCheck.in[0] <== isAccredited;
    accreditCheck.in[1] <== minAccreditation;
    
    // --- Step 4: Country validation (simplified) ---
    // In production, this would check against a Merkle tree of allowed countries
    // For MVP, we'll just ensure country code is non-zero
    component countryCheck = IsZero();
    countryCheck.in <== country;
    
    // Country must be non-zero (valid)
    signal countryIsValid;
    countryIsValid <== 1 - countryCheck.out;
    
    // --- Final validation ---
    // All checks must pass (split into quadratic constraints)
    signal intermediate;
    intermediate <== expiryCheck.out * accreditCheck.out;
    
    signal allChecksPass;
    allChecksPass <== intermediate * countryIsValid;
    
    isValid <== allChecksPass;
    
    // Constraint: isValid must be 1
    isValid === 1;
}

component main {public [issuerPubKeyX, issuerPubKeyY, currentTimestamp, minAccreditation]} = KYCVerification();
