import hre from "hardhat";

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);

  // Deploy MockRWAToken (reuse existing if needed)
  const tokenAddress = "0x35FB06244022403dc1a0cC308E150b5744e37A6b"; // Existing token
  console.log("Using existing MockRWAToken at:", tokenAddress);

  // Deploy new VeilRWAVault with fixed deposit logic
  const VeilRWAVault = await hre.ethers.getContractFactory("VeilRWAVault");
  const vault = await VeilRWAVault.deploy(
    tokenAddress, // yieldToken
    deployer.address, // zkVerifier (placeholder)
    "0x0f61cB672d345797f6A1505A282240583F902cb2", // kycRegistry (existing)
    500, // 5% APY
    hre.ethers.parseEther("100"), // minDeposit
    hre.ethers.parseEther("1000000") // maxDeposit
  );

  await vault.waitForDeployment();
  const vaultAddress = await vault.getAddress();

  console.log("✅ New VeilRWAVault deployed at:", vaultAddress);

  // Fund vault with tokens
  const token = await hre.ethers.getContractAt("MockRWAToken", tokenAddress);
  const fundTx = await token.transfer(vaultAddress, hre.ethers.parseEther("1000000"));
  await fundTx.wait();
  console.log("✅ Vault funded with 1,000,000 TBILL");

  console.log("\n📝 Update .env with new vault address:");
  console.log(`VEILRWA_VAULT_ADDRESS=${vaultAddress}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
