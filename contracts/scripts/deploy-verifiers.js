import hre from "hardhat";
import dotenv from "dotenv";
dotenv.config();

async function main() {
  console.log("Deploying ZK Verifier contracts to Mantle Sepolia...\n");

  // Deploy DepositVerifier
  console.log("1. Deploying DepositVerifier...");
  const DepositVerifier = await hre.ethers.getContractFactory("DepositVerifier");
  const depositVerifier = await DepositVerifier.deploy();
  await depositVerifier.waitForDeployment();
  const depositVerifierAddress = await depositVerifier.getAddress();
  console.log(`   ✅ DepositVerifier deployed to: ${depositVerifierAddress}`);

  // Deploy YieldVerifier
  console.log("\n2. Deploying YieldVerifier...");
  const YieldVerifier = await hre.ethers.getContractFactory("YieldVerifier");
  const yieldVerifier = await YieldVerifier.deploy();
  await yieldVerifier.waitForDeployment();
  const yieldVerifierAddress = await yieldVerifier.getAddress();
  console.log(`   ✅ YieldVerifier deployed to: ${yieldVerifierAddress}`);

  // Deploy KYCVerifier
  console.log("\n3. Deploying KYCVerifier...");
  const KYCVerifier = await hre.ethers.getContractFactory("KYCVerifier");
  const kycVerifier = await KYCVerifier.deploy();
  await kycVerifier.waitForDeployment();
  const kycVerifierAddress = await kycVerifier.getAddress();
  console.log(`   ✅ KYCVerifier deployed to: ${kycVerifierAddress}`);

  console.log("\n" + "=".repeat(60));
  console.log("DEPLOYMENT SUMMARY");
  console.log("=".repeat(60));
  console.log(`DepositVerifier: ${depositVerifierAddress}`);
  console.log(`YieldVerifier:   ${yieldVerifierAddress}`);
  console.log(`KYCVerifier:     ${kycVerifierAddress}`);
  console.log("=".repeat(60));

  console.log("\n⏳ Waiting 30 seconds before verification...");
  await new Promise(resolve => setTimeout(resolve, 30000));

  console.log("\n📝 Verifying contracts on Mantle Explorer...");
  
  try {
    await hre.run("verify:verify", {
      address: depositVerifierAddress,
      constructorArguments: [],
      contract: "contracts/DepositVerifier.sol:Groth16Verifier"
    });
    console.log("✅ DepositVerifier verified");
  } catch (error) {
    console.log("⚠️  DepositVerifier verification failed:", error.message);
  }

  try {
    await hre.run("verify:verify", {
      address: yieldVerifierAddress,
      constructorArguments: [],
      contract: "contracts/YieldVerifier.sol:Groth16Verifier"
    });
    console.log("✅ YieldVerifier verified");
  } catch (error) {
    console.log("⚠️  YieldVerifier verification failed:", error.message);
  }

  try {
    await hre.run("verify:verify", {
      address: kycVerifierAddress,
      constructorArguments: [],
      contract: "contracts/KYCVerifier.sol:Groth16Verifier"
    });
    console.log("✅ KYCVerifier verified");
  } catch (error) {
    console.log("⚠️  KYCVerifier verification failed:", error.message);
  }

  console.log("\n✅ All verifiers deployed!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
