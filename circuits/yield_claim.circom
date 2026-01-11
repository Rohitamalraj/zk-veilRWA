pragma circom 2.0.0;

include "../node_modules/circomlib/circuits/poseidon.circom";
include "../node_modules/circomlib/circuits/comparators.circom";

/*
 * Yield Claim Circuit (CORE INNOVATION)
 * 
 * This circuit proves correct yield calculation without revealing the balance or yield amount.
 * It proves:
 * 1. The prover owns the commitment (knows balance and salt)
 * 2. Time elapsed is correctly calculated
 * 3. Yield is computed correctly: Y = B × (rate / 10000) × (timeElapsed / 365 days)
 * 4. Generates a unique nullifier to prevent double-claiming
 */

template YieldClaim() {
    // Public inputs (visible on-chain)
    signal input commitment;           // Original deposit commitment
    signal input yieldRate;            // Yield rate in basis points (e.g., 500 = 5%)
    signal input currentTimestamp;     // Current time for claim
    signal input nullifier;            // Unique identifier for this claim
    signal input claimedYield;         // Yield amount being claimed (to be verified)
    
    // Private inputs (kept secret by user)
    signal input balance;              // Original deposit amount
    signal input salt;                 // Secret from commitment
    signal input depositTimestamp;     // When the deposit was made
    
    // Output (public)
    signal output isValid;
    
    // --- Step 1: Verify commitment ownership ---
    component commitmentHasher = Poseidon(2);
    commitmentHasher.inputs[0] <== balance;
    commitmentHasher.inputs[1] <== salt;
    
    signal commitmentMatch;
    commitmentMatch <== commitment - commitmentHasher.out;
    commitmentMatch === 0;
    
    // --- Step 2: Calculate time elapsed ---
    signal timeElapsed;
    timeElapsed <== currentTimestamp - depositTimestamp;
    
    // Ensure time is positive and reasonable (less than 1 year in seconds)
    component timePositiveCheck = GreaterThan(64);
    timePositiveCheck.in[0] <== timeElapsed;
    timePositiveCheck.in[1] <== 0;
    
    component timeReasonableCheck = LessEqThan(64);
    timeReasonableCheck.in[0] <== timeElapsed;
    timeReasonableCheck.in[1] <== 31536000; // 365 days in seconds
    
    // --- Step 3: Calculate and verify yield ---
    // Formula: Y = (balance × yieldRate × timeElapsed) / (10000 × 31536000)
    // We verify: claimedYield * (10000 * 31536000) === balance * yieldRate * timeElapsed
    
    signal intermediate1;
    intermediate1 <== balance * yieldRate;
    
    signal intermediate2;
    intermediate2 <== intermediate1 * timeElapsed;
    
    // Divisor = 10000 × 31536000 = 315,360,000,000
    signal divisor;
    divisor <== 315360000000;
    
    // Verify the claimed yield is correct
    signal verification;
    verification <== claimedYield * divisor;
    verification === intermediate2;
    
    // --- Step 4: Generate and verify nullifier ---
    // nullifier = Poseidon(commitment, depositTimestamp, currentTimestamp)
    component nullifierHasher = Poseidon(3);
    nullifierHasher.inputs[0] <== commitment;
    nullifierHasher.inputs[1] <== depositTimestamp;
    nullifierHasher.inputs[2] <== currentTimestamp;
    
    signal nullifierMatch;
    nullifierMatch <== nullifier - nullifierHasher.out;
    nullifierMatch === 0;
    
    // --- Step 4: Validate deposit timestamp ---
    // depositTimestamp must be less than currentTimestamp
    component timestampOrderCheck = LessThan(64);
    timestampOrderCheck.in[0] <== depositTimestamp;
    timestampOrderCheck.in[1] <== currentTimestamp;
    
    // --- Step 5: Validate yield is reasonable ---
    // Yield should not exceed the original balance (sanity check)
    component yieldReasonableCheck = LessEqThan(64);
    yieldReasonableCheck.in[0] <== claimedYield;
    yieldReasonableCheck.in[1] <== balance;
    
    // --- Final validation ---
    signal check1;
    check1 <== timePositiveCheck.out * timeReasonableCheck.out;
    
    signal check2;
    check2 <== check1 * timestampOrderCheck.out;
    
    signal allChecksPass;
    allChecksPass <== check2 * yieldReasonableCheck.out;
    
    isValid <== allChecksPass;
    
    // Constraint: isValid must be 1
    isValid === 1;
}

component main {public [commitment, yieldRate, currentTimestamp, nullifier, claimedYield]} = YieldClaim();
