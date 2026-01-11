# Generate ZK proving and verification keys for all circuits
Write-Host "Starting key generation process..." -ForegroundColor Green

# Change to build/circuits directory where the compiled circuits are
cd D:\Projects\Mantle\veilrwa-app\build\circuits

# Check if powersOfTau file exists
if (!(Test-Path "..\..\circuits\powersOfTau28_hez_final_15.ptau")) {
    Write-Host "ERROR: powersOfTau28_hez_final_15.ptau not found!" -ForegroundColor Red
    exit 1
}

# Deposit Commitment Circuit (smallest - ~440 constraints)
Write-Host "`n1/3 Generating keys for deposit_commitment circuit..." -ForegroundColor Cyan
npx snarkjs groth16 setup deposit_commitment.r1cs ..\..\circuits\powersOfTau28_hez_final_15.ptau deposit_commitment_0000.zkey
"contribution text" | npx snarkjs zkey contribute deposit_commitment_0000.zkey deposit_commitment_final.zkey --name="First contribution"
npx snarkjs zkey export verificationkey deposit_commitment_final.zkey deposit_commitment_vkey.json
Write-Host "✅ Deposit commitment keys generated" -ForegroundColor Green

# Yield Claim Circuit (medium - ~772 constraints)
Write-Host "`n2/3 Generating keys for yield_claim circuit..." -ForegroundColor Cyan
npx snarkjs groth16 setup yield_claim.r1cs ..\..\circuits\powersOfTau28_hez_final_15.ptau yield_claim_0000.zkey
"contribution text" | npx snarkjs zkey contribute yield_claim_0000.zkey yield_claim_final.zkey --name="First contribution"
npx snarkjs zkey export verificationkey yield_claim_final.zkey yield_claim_vkey.json
Write-Host "✅ Yield claim keys generated" -ForegroundColor Green

# KYC Verification Circuit (largest - ~7757 constraints)
Write-Host "`n3/3 Generating keys for kyc_verification circuit (this will take longer)..." -ForegroundColor Cyan
npx snarkjs groth16 setup kyc_verification.r1cs ..\..\circuits\powersOfTau28_hez_final_15.ptau kyc_verification_0000.zkey
"contribution text" | npx snarkjs zkey contribute kyc_verification_0000.zkey kyc_verification_final.zkey --name="First contribution"
npx snarkjs zkey export verificationkey kyc_verification_final.zkey kyc_verification_vkey.json
Write-Host "✅ KYC verification keys generated" -ForegroundColor Green

Write-Host "`n🎉 All keys generated successfully!" -ForegroundColor Green
Write-Host "Keys saved in: D:\Projects\Mantle\veilrwa-app\build\circuits\" -ForegroundColor Yellow
