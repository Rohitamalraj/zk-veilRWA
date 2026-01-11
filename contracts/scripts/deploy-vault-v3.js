import hre from "hardhat";
import dotenv from "dotenv";
dotenv.config();

async function main() {
  console.log("Deploying VeilRWAVault V3 with full ZK verification...\n");

  // Existing contract addresses
  const MOCK_RWA_TOKEN = "0x35FB06244022403dc1a0cC308E150b5744e37A6b";
  const DEPOSIT_VERIFIER = "0x20032EA6f975FbfA5aFbA329f2c2fCE51B60FE94";
  const YIELD_VERIFIER = "0x4040D46b287993060eE7f51B7c87F8bfd913508C";
  const KYC_VERIFIER = "0x870f9724047acba94885359f38cA55D639A4C564";

  const YIELD_RATE = 500; // 5%
  const MIN_DEPOSIT = hre.ethers.parseEther("100");
  const MAX_DEPOSIT = hre.ethers.parseEther("10000");

  console.log("Deploying with parameters:");
  console.log(`- Yield Token: ${MOCK_RWA_TOKEN}`);
  console.log(`- Deposit Verifier: ${DEPOSIT_VERIFIER}`);
  console.log(`- Yield Verifier: ${YIELD_VERIFIER}`);
  console.log(`- KYC Verifier: ${KYC_VERIFIER}`);
  console.log(`- Yield Rate: ${YIELD_RATE / 100}%`);
  console.log(`- Min Deposit: ${hre.ethers.formatEther(MIN_DEPOSIT)} TBILL`);
  console.log(`- Max Deposit: ${hre.ethers.formatEther(MAX_DEPOSIT)} TBILL\n`);

  const VeilRWAVault = await hre.ethers.getContractFactory("VeilRWAVaultV3");
  const vault = await VeilRWAVault.deploy(
    MOCK_RWA_TOKEN,
    DEPOSIT_VERIFIER,
    YIELD_VERIFIER,
    KYC_VERIFIER,
    YIELD_RATE,
    MIN_DEPOSIT,
    MAX_DEPOSIT
  );

  await vault.waitForDeployment();
  const vaultAddress = await vault.getAddress();

  console.log("✅ VeilRWAVaultV3 deployed to:", vaultAddress);

  console.log("\n" + "=".repeat(60));
  console.log("DEPLOYMENT COMPLETE");
  console.log("=".repeat(60));
  console.log(`VeilRWAVaultV3: ${vaultAddress}`);
  console.log("=".repeat(60));

  console.log("\n📝 Next steps:");
  console.log("1. Update frontend/lib/contracts.ts with new vault address");
  console.log("2. Test deposit with full ZK proof verification");
  console.log("3. Verify contract on Mantle Explorer\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
