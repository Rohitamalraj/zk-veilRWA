const hre = require("hardhat");

async function main() {
  console.log("\n🚀 Deploying VeilRWAVaultV3...\n");

  const signers = await hre.ethers.getSigners();
  if (signers.length === 0) {
    throw new Error("No signers available");
  }

  const deployer = signers[0];
  console.log("📝 Deploying from:", await deployer.getAddress());

  // Contract addresses
  const TOKEN_ADDRESS = "0x35FB06244022403dc1a0cC308E150b5744e37A6b";
  const DEPOSIT_VERIFIER = "0x20032EA6f975FbfA5aFbA329f2c2fCE51B60FE94";
  const YIELD_VERIFIER = "0xfE82EDaf1B490D90bc08397b7b8Fa79DD8A0A682"; // New verifier
  const KYC_VERIFIER = "0x870f9724047acba94885359f38cA55D639A4C564";

  const MIN_DEPOSIT = hre.ethers.parseEther("10"); // 10 TBILL
  const MAX_DEPOSIT = hre.ethers.parseEther("10000"); // 10,000 TBILL
  const YIELD_RATE = 500; // 5%

  console.log("📋 Configuration:");
  console.log("  Token:", TOKEN_ADDRESS);
  console.log("  Deposit Verifier:", DEPOSIT_VERIFIER);
  console.log("  Yield Verifier:", YIELD_VERIFIER, "(NEW)");
  console.log("  KYC Verifier:", KYC_VERIFIER);
  console.log("  Min Deposit:", hre.ethers.formatEther(MIN_DEPOSIT), "TBILL");
  console.log("  Max Deposit:", hre.ethers.formatEther(MAX_DEPOSIT), "TBILL");
  console.log("  Yield Rate:", YIELD_RATE / 100, "%");

  console.log("\n⏳ Deploying contract...");
  const Vault = await hre.ethers.getContractFactory("VeilRWAVaultV3");
  const vault = await Vault.deploy(
    TOKEN_ADDRESS,           // _yieldToken
    DEPOSIT_VERIFIER,        // _depositVerifier  
    YIELD_VERIFIER,          // _yieldVerifier
    KYC_VERIFIER,            // _kycVerifier
    YIELD_RATE,              // _yieldRate
    MIN_DEPOSIT,             // _minDeposit
    MAX_DEPOSIT              // _maxDeposit
  );

  await vault.waitForDeployment();
  const address = await vault.getAddress();

  console.log("✅ VeilRWAVaultV3 deployed to:", address);

  console.log("\n⏳ Waiting for 1 confirmation...");
  await vault.deploymentTransaction().wait(1);

  console.log("🎉 Deployment complete!\n");
  console.log("📋 Next steps:");
  console.log("1. Update frontend CONTRACTS.VeilRWAVault to:", address);
  console.log("2. Send some TBILL to vault for yield payouts");
  console.log("3. Test deposit and yield claim");
  console.log("\n💡 Old vault:", "0x902134f3832F9C780BEe643a11dfBb2561aC23ed");
  console.log("💡 New vault:", address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Deployment failed:", error.message);
    process.exit(1);
  });
