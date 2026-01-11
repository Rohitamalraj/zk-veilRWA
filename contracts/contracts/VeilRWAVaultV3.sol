// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "./IGroth16Verifier.sol";

/**
 * @title VeilRWAVault
 * @notice Main vault contract for privacy-preserving RWA deposits and yield claims
 * @dev Uses zero-knowledge proofs to verify deposits and yield calculations without revealing sensitive data
 */
contract VeilRWAVaultV3 is Ownable, ReentrancyGuard, Pausable {
    // ============ State Variables ============
    
    /// @notice Mapping of commitment hashes to their existence
    mapping(bytes32 => bool) public commitments;
    
    /// @notice Mapping of nullifiers to prevent double-claiming
    mapping(bytes32 => bool) public nullifiers;
    
    /// @notice Yield rate in basis points (e.g., 500 = 5%)
    uint256 public yieldRate;
    
    /// @notice Address of the deposit verifier contract
    address public depositVerifier;
    
    /// @notice Address of the yield verifier contract
    address public yieldVerifier;
    
    /// @notice Address of the KYC verifier contract
    address public kycVerifier;
    
    /// @notice ERC20 token used for yield payments
    IERC20 public yieldToken;
    
    /// @notice Minimum deposit amount
    uint256 public minDeposit;
    
    /// @notice Maximum deposit amount
    uint256 public maxDeposit;
    
    // ============ Events ============
    
    event DepositCommitted(
        bytes32 indexed commitment,
        uint256 amount,
        uint256 timestamp
    );
    
    event YieldClaimed(
        bytes32 indexed nullifier,
        address indexed recipient,
        uint256 yieldAmount,
        uint256 timestamp
    );
    
    event YieldRateUpdated(uint256 oldRate, uint256 newRate);
    
    event VerifierUpdated(string verifierType, address oldVerifier, address newVerifier);
    
    // ============ Errors ============
    
    error InvalidDepositProof();
    error InvalidYieldProof();
    error InvalidKYCProof();
    error CommitmentAlreadyExists();
    error NullifierAlreadyUsed();
    error InsufficientYieldBalance();
    error InvalidYieldAmount();
    error InvalidCommitment();
    error ZeroAddress();
    error InsufficientAmount();
    error ExcessiveAmount();
    error InvalidProofData();
    
    // ============ Constructor ============
    
    constructor(
        address _yieldToken,
        address _depositVerifier,
        address _yieldVerifier,
        address _kycVerifier,
        uint256 _yieldRate,
        uint256 _minDeposit,
        uint256 _maxDeposit
    ) Ownable(msg.sender) {
        if (_yieldToken == address(0) || _depositVerifier == address(0) || 
            _yieldVerifier == address(0) || _kycVerifier == address(0)) {
            revert ZeroAddress();
        }
        
        yieldToken = IERC20(_yieldToken);
        depositVerifier = _depositVerifier;
        yieldVerifier = _yieldVerifier;
        kycVerifier = _kycVerifier;
        yieldRate = _yieldRate;
        minDeposit = _minDeposit;
        maxDeposit = _maxDeposit;
    }
    
    // ============ External Functions ============
    
    /**
     * @notice Deposit funds with a commitment (balance is private)
     * @param amount The amount of tokens to deposit
     * @param commitment The Poseidon hash commitment
     * @param pA Proof component A
     * @param pB Proof component B
     * @param pC Proof component C
     * @param publicSignals Public signals for verification
     */
    function deposit(
        uint256 amount,
        bytes32 commitment,
        uint[2] calldata pA,
        uint[2][2] calldata pB,
        uint[2] calldata pC,
        uint[1] calldata publicSignals
    ) external whenNotPaused nonReentrant {
        if (amount < minDeposit) revert InsufficientAmount();
        if (amount > maxDeposit) revert ExcessiveAmount();
        if (commitment == bytes32(0)) revert InvalidCommitment();
        if (commitments[commitment]) revert CommitmentAlreadyExists();
        
        // Verify ZK proof on-chain
        bool valid = IGroth16Verifier(depositVerifier).verifyProof(pA, pB, pC, publicSignals);
        if (!valid) revert InvalidDepositProof();
        
        // Verify commitment matches public signal
        if (uint256(commitment) != publicSignals[0]) revert InvalidCommitment();
        
        // Transfer tokens from user to vault
        yieldToken.transferFrom(msg.sender, address(this), amount);
        
        // Store commitment
        commitments[commitment] = true;
        
        emit DepositCommitted(commitment, amount, block.timestamp);
    }
    
    /**
     * @notice Simplified deposit for testing (with minimal verification)
     * @dev Use full deposit() function in production
     */
    function depositSimple(
        uint256 amount,
        bytes32 commitment
    ) external whenNotPaused nonReentrant {
        if (amount < minDeposit) revert InsufficientAmount();
        if (amount > maxDeposit) revert ExcessiveAmount();
        if (commitment == bytes32(0)) revert InvalidCommitment();
        if (commitments[commitment]) revert CommitmentAlreadyExists();
        
        // Transfer tokens from user to vault
        yieldToken.transferFrom(msg.sender, address(this), amount);
        
        // Store commitment
        commitments[commitment] = true;
        
        emit DepositCommitted(commitment, amount, block.timestamp);
    }
    
    /**
     * @notice Claim yield with zero-knowledge proof
     * @param nullifier Unique identifier for this claim (prevents double-claiming)
     * @param yieldAmount The calculated yield amount
     * @param pA Proof component A
     * @param pB Proof component B
     * @param pC Proof component C
     * @param publicSignals Public signals for verification
     */
    function claimYield(
        bytes32 nullifier,
        uint256 yieldAmount,
        uint[2] calldata pA,
        uint[2][2] calldata pB,
        uint[2] calldata pC,
        uint[1] calldata publicSignals
    ) external whenNotPaused nonReentrant {
        if (nullifier == bytes32(0)) revert InvalidCommitment();
        if (nullifiers[nullifier]) revert NullifierAlreadyUsed();
        if (yieldAmount == 0) revert InvalidYieldAmount();
        
        // Check vault has sufficient yield tokens
        uint256 vaultBalance = yieldToken.balanceOf(address(this));
        if (vaultBalance < yieldAmount) revert InsufficientYieldBalance();
        
        // Verify ZK proof for yield calculation
        bool valid = IGroth16Verifier(yieldVerifier).verifyProof(pA, pB, pC, publicSignals);
        if (!valid) revert InvalidYieldProof();
        
        // Verify yield amount matches public signal
        if (yieldAmount != publicSignals[0]) revert InvalidYieldAmount();
        
        // Mark nullifier as used
        nullifiers[nullifier] = true;
        
        // Transfer yield tokens to user
        bool success = yieldToken.transfer(msg.sender, yieldAmount);
        if (!success) revert InsufficientYieldBalance();
        
        emit YieldClaimed(nullifier, msg.sender, yieldAmount, block.timestamp);
    }
    
    // ============ View Functions ============
    
    function isCommitmentUsed(bytes32 commitment) external view returns (bool) {
        return commitments[commitment];
    }
    
    function isNullifierUsed(bytes32 nullifier) external view returns (bool) {
        return nullifiers[nullifier];
    }
    
    function getVaultBalance() external view returns (uint256) {
        return yieldToken.balanceOf(address(this));
    }
    
    // ============ Admin Functions ============
    
    function setYieldRate(uint256 newRate) external onlyOwner {
        uint256 oldRate = yieldRate;
        yieldRate = newRate;
        emit YieldRateUpdated(oldRate, newRate);
    }
    
    function setDepositVerifier(address newVerifier) external onlyOwner {
        if (newVerifier == address(0)) revert ZeroAddress();
        address oldVerifier = depositVerifier;
        depositVerifier = newVerifier;
        emit VerifierUpdated("deposit", oldVerifier, newVerifier);
    }
    
    function setYieldVerifier(address newVerifier) external onlyOwner {
        if (newVerifier == address(0)) revert ZeroAddress();
        address oldVerifier = yieldVerifier;
        yieldVerifier = newVerifier;
        emit VerifierUpdated("yield", oldVerifier, newVerifier);
    }
    
    function setKYCVerifier(address newVerifier) external onlyOwner {
        if (newVerifier == address(0)) revert ZeroAddress();
        address oldVerifier = kycVerifier;
        kycVerifier = newVerifier;
        emit VerifierUpdated("kyc", oldVerifier, newVerifier);
    }
    
    function pause() external onlyOwner {
        _pause();
    }
    
    function unpause() external onlyOwner {
        _unpause();
    }
    
    function withdrawEmergency(address token, uint256 amount) external onlyOwner {
        IERC20(token).transfer(owner(), amount);
    }
}
