const hre = require("hardhat");

async function main() {
  console.log("\n💸 Sending TBILL to new vault...\n");

  const signers = await hre.ethers.getSigners();
  const deployer = signers[0];

  const TOKEN_ADDRESS = "0x35FB06244022403dc1a0cC308E150b5744e37A6b";
  const NEW_VAULT = "0x332dca53aC3C7b86bCb7F9f58E2d6b8284705231"; // Latest - simple claim
  const AMOUNT = hre.ethers.parseEther("1000"); // Send 1000 TBILL for yield payouts

  console.log("From:", await deployer.getAddress());
  console.log("To:", NEW_VAULT);
  console.log("Amount:", hre.ethers.formatEther(AMOUNT), "TBILL");

  const token = await hre.ethers.getContractAt("IERC20", TOKEN_ADDRESS);

  console.log("\n⏳ Transferring...");
  const tx = await token.transfer(NEW_VAULT, AMOUNT);
  console.log("📡 Transaction:", tx.hash);

  await tx.wait(2);
  console.log("✅ Transfer complete!\n");

  const vaultBalance = await token.balanceOf(NEW_VAULT);
  console.log("📊 Vault balance:", hre.ethers.formatEther(vaultBalance), "TBILL");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Failed:", error.message);
    process.exit(1);
  });
