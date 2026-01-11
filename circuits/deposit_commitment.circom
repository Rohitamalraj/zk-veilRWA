pragma circom 2.0.0;

include "../node_modules/circomlib/circuits/poseidon.circom";
include "../node_modules/circomlib/circuits/comparators.circom";

/*
 * Deposit Commitment Circuit
 * 
 * This circuit creates a commitment to a deposit amount without revealing the actual balance.
 * It proves:
 * 1. The commitment is correctly formed: C = Poseidon(balance, salt)
 * 2. The balance is within valid range (min to max)
 * 3. The user knows the preimage (balance and salt) of the commitment
 */

template DepositCommitment() {
    // Public inputs (visible on-chain)
    signal input commitment;           // The commitment hash to verify
    signal input minBalance;           // Minimum allowed deposit (e.g., 100 USDC)
    signal input maxBalance;           // Maximum allowed deposit (e.g., 1M USDC)
    
    // Private inputs (kept secret by user)
    signal input balance;              // Actual deposit amount
    signal input salt;                 // Random secret for commitment
    
    // Output
    signal output isValid;
    
    // --- Step 1: Generate commitment ---
    component commitmentHasher = Poseidon(2);
    commitmentHasher.inputs[0] <== balance;
    commitmentHasher.inputs[1] <== salt;
    
    // Verify commitment matches
    signal commitmentMatch;
    commitmentMatch <== commitment - commitmentHasher.out;
    commitmentMatch === 0;
    
    // --- Step 2: Range check on balance ---
    // Check balance >= minBalance
    component minCheck = GreaterEqThan(64);
    minCheck.in[0] <== balance;
    minCheck.in[1] <== minBalance;
    
    // Check balance <= maxBalance
    component maxCheck = LessEqThan(64);
    maxCheck.in[0] <== balance;
    maxCheck.in[1] <== maxBalance;
    
    // --- Step 3: Validate balance is positive ---
    component positiveCheck = GreaterThan(64);
    positiveCheck.in[0] <== balance;
    positiveCheck.in[1] <== 0;
    
    // --- Final validation ---
    signal intermediate;
    intermediate <== minCheck.out * maxCheck.out;
    
    signal allChecksPass;
    allChecksPass <== intermediate * positiveCheck.out;
    
    isValid <== allChecksPass;
    
    // Constraint: isValid must be 1
    isValid === 1;
}

component main {public [commitment, minBalance, maxBalance]} = DepositCommitment();
