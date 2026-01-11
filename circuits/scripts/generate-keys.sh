#!/bin/bash
# Generate ZK proving and verification keys for all circuits

echo "Generating keys for deposit_commitment circuit..."
cd ../build/circuits

# Deposit Commitment Circuit
npx snarkjs groth16 setup deposit_commitment.r1cs ../../powersOfTau28_hez_final_15.ptau deposit_commitment_0000.zkey
echo "contribution text" | npx snarkjs zkey contribute deposit_commitment_0000.zkey deposit_commitment_final.zkey --name="First contribution"
npx snarkjs zkey export verificationkey deposit_commitment_final.zkey deposit_commitment_vkey.json

echo "✅ Deposit commitment keys generated"

# Yield Claim Circuit
echo "Generating keys for yield_claim circuit..."
npx snarkjs groth16 setup yield_claim.r1cs ../../powersOfTau28_hez_final_15.ptau yield_claim_0000.zkey
echo "contribution text" | npx snarkjs zkey contribute yield_claim_0000.zkey yield_claim_final.zkey --name="First contribution"
npx snarkjs zkey export verificationkey yield_claim_final.zkey yield_claim_vkey.json

echo "✅ Yield claim keys generated"

# KYC Verification Circuit (largest - may take longer)
echo "Generating keys for kyc_verification circuit..."
npx snarkjs groth16 setup kyc_verification.r1cs ../../powersOfTau28_hez_final_15.ptau kyc_verification_0000.zkey
echo "contribution text" | npx snarkjs zkey contribute kyc_verification_0000.zkey kyc_verification_final.zkey --name="First contribution"
npx snarkjs zkey export verificationkey kyc_verification_final.zkey kyc_verification_vkey.json

echo "✅ KYC verification keys generated"
echo "🎉 All keys generated successfully!"
