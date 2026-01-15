pragma circom 2.0.0;

include "circomlib/circuits/comparators.circom";
include "circomlib/circuits/poseidon.circom";

template KYCVerificationSimple() {
    // Private inputs
    signal input isKYCed;
    signal input countryCode;
    signal input isAccredited;
    signal input expiry;
    signal input userSecret;
    signal input credentialSalt;
    
    // Public inputs
    signal input allowedCountry;
    signal input currentTime;
    signal input issuerCommitment;
    
    // Output
    signal output isValid;
    
    // Check KYC status
    signal kycCheck;
    kycCheck <== isKYCed;
    kycCheck === 1;
    
    // Check expiry
    component expiryComparator = GreaterThan(64);
    expiryComparator.in[0] <== expiry;
    expiryComparator.in[1] <== currentTime;
    signal expiryValid;
    expiryValid <== expiryComparator.out;
    expiryValid === 1;
    
    // Check country
    signal countryMatch;
    countryMatch <== countryCode - allowedCountry;
    countryMatch === 0;
    
    // Verify credential signature
    component credHasher = Poseidon(6);
    credHasher.inputs[0] <== isKYCed;
    credHasher.inputs[1] <== countryCode;
    credHasher.inputs[2] <== isAccredited;
    credHasher.inputs[3] <== expiry;
    credHasher.inputs[4] <== userSecret;
    credHasher.inputs[5] <== credentialSalt;
    
    signal credentialHash;
    credentialHash <== credHasher.out;
    
    // Verify issuer commitment
    component issuerHasher = Poseidon(2);
    issuerHasher.inputs[0] <== credentialHash;
    issuerHasher.inputs[1] <== credentialSalt;
    
    signal computedCommitment;
    computedCommitment <== issuerHasher.out;
    computedCommitment === issuerCommitment;
    
    // All checks passed
    isValid <== 1;
}

component main {public [allowedCountry, currentTime, issuerCommitment]} = KYCVerificationSimple();
