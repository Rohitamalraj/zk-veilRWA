const hre = require("hardhat");

async function main() {
  console.log("\n🔍 Checking commitment on-chain...\n");

  const VAULT_ADDRESS = "0x42a551B41E6B0113EDCA46E08FBb6033f29d7A49"; // Latest vault
  const COMMITMENT = "0x2e65e12ca6ee6788d09abfeba59834e7af73133414155079c29a15f8bb6eceba"; // From latest deposit

  const vault = await hre.ethers.getContractAt("VeilRWAVaultV3", VAULT_ADDRESS);

  console.log("📋 Vault:", VAULT_ADDRESS);
  console.log("📋 Commitment:", COMMITMENT);
  
  try {
    const exists = await vault.commitments(COMMITMENT);
    console.log("\n✅ Commitment exists:", exists);
    
    if (!exists) {
      console.log("\n❌ PROBLEM: Commitment not found in vault!");
      console.log("This means depositSimple didn't store the commitment properly.");
      console.log("\n💡 Solution: Use the 'deposit' function with proof verification");
    } else {
      console.log("\n✅ Commitment is valid!");
      console.log("The issue must be something else (proof verification, nullifier, etc.)");
    }
  } catch (error) {
    console.error("❌ Error checking commitment:", error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Failed:", error.message);
    process.exit(1);
  });
