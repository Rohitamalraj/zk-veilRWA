const hre = require("hardhat");

async function main() {
  console.log("🚀 Deploying YieldClaimVerifier to Mantle Sepolia...");
  
  try {
    // Get signers
    const signers = await hre.ethers.getSigners();
    console.log("Available signers:", signers.length);
    
    if (signers.length === 0) {
      throw new Error("No signers available. Check PRIVATE_KEY in .env");
    }
    
    const deployer = signers[0];
    const deployerAddress = await deployer.getAddress();
    console.log("Deploying with account:", deployerAddress);

    const Verifier = await hre.ethers.getContractFactory("Groth16Verifier");
    console.log("Contract factory created, deploying...");
    
    const verifier = await Verifier.deploy();
    console.log("Waiting for deployment...");
    
    await verifier.waitForDeployment();

    const address = await verifier.getAddress();
    console.log("✅ YieldClaimVerifier deployed to:", address);
    
    // Wait for a few confirmations
    console.log("⏳ Waiting for 5 confirmations...");
    const tx = verifier.deploymentTransaction();
    if (tx) {
      await tx.wait(5);
    }
    
    console.log("🎉 Deployment complete!");
    console.log("\n📋 Contract Address:", address);
    console.log("\n📋 Next steps:");
    console.log("1. Verify contract on explorer");
    console.log("2. Update VeilRWAVaultV3 to use new verifier");
    console.log("3. Call vault.updateYieldVerifier('" + address + "')");
    
  } catch (error) {
    console.error("❌ Deployment failed:", error.message);
    throw error;
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
