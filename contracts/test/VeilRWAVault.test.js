const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("VeilRWAVault", function () {
  let vault;
  let mockToken;
  let kycRegistry;
  let owner;
  let user1;
  let user2;

  const YIELD_RATE = 500; // 5%
  const MIN_DEPOSIT = ethers.parseUnits("100", 6); // 100 USDC
  const MAX_DEPOSIT = ethers.parseUnits("1000000", 6); // 1M USDC

  beforeEach(async function () {
    [owner, user1, user2] = await ethers.getSigners();

    // Deploy MockRWAToken
    const MockRWAToken = await ethers.getContractFactory("MockRWAToken");
    mockToken = await MockRWAToken.deploy("Mock USDC", "mUSDC", 6);
    await mockToken.waitForDeployment();

    // Deploy KYCRegistry
    const KYCRegistry = await ethers.getContractFactory("KYCRegistry");
    kycRegistry = await KYCRegistry.deploy();
    await kycRegistry.waitForDeployment();

    // Deploy VeilRWAVault (zkVerifier address is placeholder for now)
    const VeilRWAVault = await ethers.getContractFactory("VeilRWAVault");
    vault = await VeilRWAVault.deploy(
      await mockToken.getAddress(),
      owner.address, // placeholder for zkVerifier
      await kycRegistry.getAddress(),
      YIELD_RATE,
      MIN_DEPOSIT,
      MAX_DEPOSIT
    );
    await vault.waitForDeployment();

    // Fund vault with tokens
    const fundAmount = ethers.parseUnits("100000", 6);
    await mockToken.transfer(await vault.getAddress(), fundAmount);
  });

  describe("Deployment", function () {
    it("Should set the correct yield rate", async function () {
      expect(await vault.yieldRate()).to.equal(YIELD_RATE);
    });

    it("Should set the correct token address", async function () {
      expect(await vault.yieldToken()).to.equal(await mockToken.getAddress());
    });

    it("Should have the correct initial balance", async function () {
      const balance = await vault.getVaultBalance();
      expect(balance).to.equal(ethers.parseUnits("100000", 6));
    });
  });

  describe("Deposits", function () {
    it("Should accept a valid commitment", async function () {
      const commitment = ethers.keccak256(ethers.toUtf8Bytes("test_commitment"));
      const emptyProof = "0x";

      await expect(vault.connect(user1).deposit(commitment, emptyProof))
        .to.emit(vault, "DepositCommitted")
        .withArgs(commitment, await ethers.provider.getBlock("latest").then(b => b.timestamp + 1));
    });

    it("Should reject duplicate commitments", async function () {
      const commitment = ethers.keccak256(ethers.toUtf8Bytes("test_commitment"));
      const emptyProof = "0x";

      await vault.connect(user1).deposit(commitment, emptyProof);
      await expect(vault.connect(user2).deposit(commitment, emptyProof))
        .to.be.revertedWithCustomError(vault, "CommitmentAlreadyExists");
    });

    it("Should mark commitment as used", async function () {
      const commitment = ethers.keccak256(ethers.toUtf8Bytes("test_commitment"));
      const emptyProof = "0x";

      await vault.connect(user1).deposit(commitment, emptyProof);
      expect(await vault.isCommitmentUsed(commitment)).to.equal(true);
    });
  });

  describe("Yield Claims", function () {
    it("Should allow claiming yield with valid proof", async function () {
      const nullifier = ethers.keccak256(ethers.toUtf8Bytes("test_nullifier"));
      const yieldAmount = ethers.parseUnits("50", 6);
      const emptyProof = "0x";

      const initialBalance = await mockToken.balanceOf(user1.address);

      await expect(vault.connect(user1).claimYield(nullifier, yieldAmount, emptyProof))
        .to.emit(vault, "YieldClaimed");

      const finalBalance = await mockToken.balanceOf(user1.address);
      expect(finalBalance - initialBalance).to.equal(yieldAmount);
    });

    it("Should reject double claims", async function () {
      const nullifier = ethers.keccak256(ethers.toUtf8Bytes("test_nullifier"));
      const yieldAmount = ethers.parseUnits("50", 6);
      const emptyProof = "0x";

      await vault.connect(user1).claimYield(nullifier, yieldAmount, emptyProof);
      await expect(vault.connect(user1).claimYield(nullifier, yieldAmount, emptyProof))
        .to.be.revertedWithCustomError(vault, "NullifierAlreadyUsed");
    });

    it("Should mark nullifier as used", async function () {
      const nullifier = ethers.keccak256(ethers.toUtf8Bytes("test_nullifier"));
      const yieldAmount = ethers.parseUnits("50", 6);
      const emptyProof = "0x";

      await vault.connect(user1).claimYield(nullifier, yieldAmount, emptyProof);
      expect(await vault.isNullifierUsed(nullifier)).to.equal(true);
    });
  });

  describe("Admin Functions", function () {
    it("Should allow owner to update yield rate", async function () {
      const newRate = 600;
      await expect(vault.setYieldRate(newRate))
        .to.emit(vault, "YieldRateUpdated")
        .withArgs(YIELD_RATE, newRate);
      expect(await vault.yieldRate()).to.equal(newRate);
    });

    it("Should allow owner to pause", async function () {
      await vault.pause();
      const commitment = ethers.keccak256(ethers.toUtf8Bytes("test"));
      await expect(vault.connect(user1).deposit(commitment, "0x"))
        .to.be.revertedWithCustomError(vault, "EnforcedPause");
    });

    it("Should prevent non-owner from admin functions", async function () {
      await expect(vault.connect(user1).setYieldRate(600))
        .to.be.revertedWithCustomError(vault, "OwnableUnauthorizedAccount");
    });
  });
});
