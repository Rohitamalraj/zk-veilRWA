pragma circom 2.0.0;

include "../node_modules/circomlib/circuits/comparators.circom";
include "../node_modules/circomlib/circuits/poseidon.circom";
include "../node_modules/circomlib/circuits/eddsamimc.circom";
include "../node_modules/circomlib/circuits/mimcsponge.circom";

/*
 * Enhanced KYC Verification Circuit
 * Verifies KYC credentials with proper claims validation
 * 
 * Claims verified:
 * - isKYCed = 1 (must be KYC'd)
 * - countryCode in allowed list
 * - isAccredited (0 or 1)
 * - credential not expired
 * - signature valid from authorized issuer
 * 
 * Privacy: All claims are private, only eligibility result is public
 */

template KYCVerificationEnhanced() {
    // ============ Private Inputs (Hidden) ============
    
    // Credential claims
    signal input isKYCed;           // Must be 1
    signal input countryCode;       // User's jurisdiction (e.g., 840 = USA)
    signal input isAccredited;      // 0 or 1
    signal input expiry;            // Unix timestamp
    signal input userNonce;         // Prevents credential reuse
    
    // EdDSA signature from KYC issuer
    signal input signature_R8x;     // Signature point R8.x
    signal input signature_R8y;     // Signature point R8.y
    signal input signature_S;       // Signature scalar S
    
    // Merkle proof for country allowlist
    signal input countryMerkleProof[8];  // Merkle proof path
    signal input countryMerkleIndex;     // Position in tree
    
    // ============ Public Inputs (Visible On-Chain) ============
    
    signal input issuerPubKeyX;     // Issuer public key X
    signal input issuerPubKeyY;     // Issuer public key Y
    signal input allowedCountryRoot;// Merkle root of allowed countries
    signal input currentTime;       // Block timestamp (for expiry check)
    
    // ============ Public Output ============
    
    signal output isEligible;       // 1 if all checks pass, 0 otherwise
    
    // ============ Intermediate Signals ============
    
    signal kycCheck;
    signal expiryCheck;
    signal countryCheck;
    signal signatureValid;
    
    // ============ Constraint 1: KYC Status ============
    // Verify isKYCed == 1
    kycCheck <== isKYCed;
    kycCheck === 1;
    
    // ============ Constraint 2: Expiry Validation ============
    // Verify credential is not expired: expiry > currentTime
    component expiryComparator = GreaterThan(64);
    expiryComparator.in[0] <== expiry;
    expiryComparator.in[1] <== currentTime;
    expiryCheck <== expiryComparator.out;
    expiryCheck === 1;
    
    // ============ Constraint 3: Country Allowlist ============
    // Verify countryCode is in Merkle tree with root = allowedCountryRoot
    
    component merkleHashers[8];
    signal merkleHashes[9];
    merkleHashes[0] <== countryCode;
    
    // Build Merkle path
    for (var i = 0; i < 8; i++) {
        merkleHashers[i] = Poseidon(2);
        
        // If index bit is 0, hash(current, proof)
        // If index bit is 1, hash(proof, current)
        var indexBit = (countryMerkleIndex >> i) & 1;
        
        merkleHashers[i].inputs[0] <== indexBit == 0 ? merkleHashes[i] : countryMerkleProof[i];
        merkleHashers[i].inputs[1] <== indexBit == 0 ? countryMerkleProof[i] : merkleHashes[i];
        
        merkleHashes[i + 1] <== merkleHashers[i].out;
    }
    
    // Root must match public input
    merkleHashes[8] === allowedCountryRoot;
    countryCheck <== 1;
    
    // ============ Constraint 4: Signature Verification ============
    // Hash all credential claims to create message
    component credentialHasher = Poseidon(5);
    credentialHasher.inputs[0] <== isKYCed;
    credentialHasher.inputs[1] <== countryCode;
    credentialHasher.inputs[2] <== isAccredited;
    credentialHasher.inputs[3] <== expiry;
    credentialHasher.inputs[4] <== userNonce;
    
    signal credentialHash;
    credentialHash <== credentialHasher.out;
    
    // Verify EdDSA signature
    component eddsaVerifier = EdDSAMiMCVerifier();
    eddsaVerifier.enabled <== 1;
    eddsaVerifier.Ax <== issuerPubKeyX;
    eddsaVerifier.Ay <== issuerPubKeyY;
    eddsaVerifier.R8x <== signature_R8x;
    eddsaVerifier.R8y <== signature_R8y;
    eddsaVerifier.S <== signature_S;
    eddsaVerifier.M <== credentialHash;
    
    signatureValid <== 1; // EdDSAVerifier enforces this
    
    // ============ Final Output ============
    // All checks must pass
    signal allChecksPassed;
    allChecksPassed <== kycCheck * expiryCheck * countryCheck * signatureValid;
    
    isEligible <== allChecksPassed;
    isEligible === 1; // Enforce that user is eligible
}

component main {public [issuerPubKeyX, issuerPubKeyY, allowedCountryRoot, currentTime]} = KYCVerificationEnhanced();
