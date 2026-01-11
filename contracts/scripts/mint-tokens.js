import hre from "hardhat";

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Minting tokens to:", deployer.address);

  // MockRWAToken address from deployment
  const tokenAddress = "0x35FB06244022403dc1a0cC308E150b5744e37A6b";
  
  const MockRWAToken = await hre.ethers.getContractAt("MockRWAToken", tokenAddress);

  // Mint 10,000 TBILL tokens to deployer
  const mintAmount = hre.ethers.parseEther("10000");
  console.log("Minting 10,000 TBILL tokens...");
  
  const tx = await MockRWAToken.mint(deployer.address, mintAmount);
  await tx.wait();
  
  console.log("✅ Minted 10,000 TBILL tokens");
  console.log("Transaction hash:", tx.hash);
  
  // Check balance
  const balance = await MockRWAToken.balanceOf(deployer.address);
  console.log("New balance:", hre.ethers.formatEther(balance), "TBILL");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
