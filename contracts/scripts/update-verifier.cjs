const hre = require("hardhat");

async function main() {
  console.log("\n🔄 Updating VeilRWAVaultV3 verifier...\n");

  const vaultAddress = "0x902134f3832F9C780BEe643a11dfBb2561aC23ed";
  const newVerifierAddress = "0xfE82EDaf1B490D90bc08397b7b8Fa79DD8A0A682";

  const signers = await hre.ethers.getSigners();
  if (signers.length === 0) {
    throw new Error("No signers available");
  }

  const deployer = signers[0];
  console.log("📝 Calling from:", await deployer.getAddress());

  // Get vault contract
  const vault = await hre.ethers.getContractAt("VeilRWAVaultV3", vaultAddress);

  // Check current verifier
  const currentVerifier = await vault.yieldVerifier();
  console.log("📌 Current verifier:", currentVerifier);
  console.log("🎯 New verifier:    ", newVerifierAddress);

  if (currentVerifier.toLowerCase() === newVerifierAddress.toLowerCase()) {
    console.log("\n✅ Verifier already up to date!");
    return;
  }

  // Update verifier
  console.log("\n⏳ Sending transaction...");
  const tx = await vault.setYieldVerifier(newVerifierAddress);
  console.log("📡 Transaction hash:", tx.hash);

  console.log("⏳ Waiting for confirmation...");
  const receipt = await tx.wait(3);
  console.log("✅ Transaction confirmed in block:", receipt.blockNumber);

  // Verify update
  const updatedVerifier = await vault.yieldVerifier();
  console.log("\n📋 Updated verifier:", updatedVerifier);

  if (updatedVerifier.toLowerCase() === newVerifierAddress.toLowerCase()) {
    console.log("🎉 Verifier update successful!\n");
    console.log("📋 Next: Test yield claim on frontend");
  } else {
    console.log("❌ Verification failed - verifier not updated");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Update failed:", error.message);
    process.exit(1);
  });
