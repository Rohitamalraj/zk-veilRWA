import { ethers } from "hardhat";

async function main() {
  console.log("🚀 Deploying YieldClaimVerifier to Mantle Sepolia...");

  const YieldClaimVerifier = await ethers.getContractFactory("YieldClaimVerifier");
  const verifier = await YieldClaimVerifier.deploy();
  await verifier.waitForDeployment();

  const address = await verifier.getAddress();
  console.log("✅ YieldClaimVerifier deployed to:", address);
  
  // Wait for a few blocks for better verification
  console.log("⏳ Waiting for 5 confirmations...");
  await verifier.deploymentTransaction()?.wait(5);
  
  console.log("🎉 Deployment complete!");
  console.log("\n📋 Next steps:");
  console.log("1. Update VeilRWAVaultV3 to use new verifier:", address);
  console.log("2. Call vault.updateYieldVerifier('" + address + "')");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
