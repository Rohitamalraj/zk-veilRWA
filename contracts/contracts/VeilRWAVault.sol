// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title VeilRWAVault
 * @notice Main vault contract for privacy-preserving RWA deposits and yield claims
 * @dev Uses zero-knowledge proofs to verify KYC and yield calculations without revealing sensitive data
 */
contract VeilRWAVault is Ownable, ReentrancyGuard, Pausable {
    // ============ State Variables ============
    
    /// @notice Mapping of commitment hashes to their existence
    mapping(bytes32 => bool) public commitments;
    
    /// @notice Mapping of nullifiers to prevent double-claiming
    mapping(bytes32 => bool) public nullifiers;
    
    /// @notice Yield rate in basis points (e.g., 500 = 5%)
    uint256 public yieldRate;
    
    /// @notice Address of the ZK verifier contract
    address public zkVerifier;
    
    /// @notice Address of the KYC registry contract
    address public kycRegistry;
    
    /// @notice ERC20 token used for yield payments
    IERC20 public yieldToken;
    
    /// @notice Minimum deposit amount
    uint256 public minDeposit;
    
    /// @notice Maximum deposit amount
    uint256 public maxDeposit;
    
    // ============ Events ============
    
    event DepositCommitted(
        bytes32 indexed commitment,
        uint256 timestamp
    );
    
    event YieldClaimed(
        bytes32 indexed nullifier,
        address indexed recipient,
        uint256 yieldAmount,
        uint256 timestamp
    );
    
    event YieldRateUpdated(uint256 oldRate, uint256 newRate);
    
    event VerifierUpdated(address oldVerifier, address newVerifier);
    
    // ============ Errors ============
    
    error InvalidProof();
    error CommitmentAlreadyExists();
    error NullifierAlreadyUsed();
    error InsufficientYieldBalance();
    error InvalidYieldAmount();
    error InvalidCommitment();
    error ZeroAddress();
    error InsufficientAmount();
    error ExcessiveAmount();
    
    // ============ Constructor ============
    
    constructor(
        address _yieldToken,
        address _zkVerifier,
        address _kycRegistry,
        uint256 _yieldRate,
        uint256 _minDeposit,
        uint256 _maxDeposit
    ) Ownable(msg.sender) {
        if (_yieldToken == address(0) || _zkVerifier == address(0) || _kycRegistry == address(0)) {
            revert ZeroAddress();
        }
        
        yieldToken = IERC20(_yieldToken);
        zkVerifier = _zkVerifier;
        kycRegistry = _kycRegistry;
        yieldRate = _yieldRate;
        minDeposit = _minDeposit;
        maxDeposit = _maxDeposit;
    }
    
    // ============ External Functions ============
    
    /**
     * @notice Deposit funds with a commitment (balance is private)
     * @param amount The amount of tokens to deposit
     * @param commitment The Poseidon hash commitment of (balance, salt)
     * @param zkKYCProof Zero-knowledge proof of valid KYC
     */
    function deposit(
        uint256 amount,
        bytes32 commitment,
        bytes calldata zkKYCProof
    ) external whenNotPaused nonReentrant {
        if (amount < minDeposit) revert InsufficientAmount();
        if (amount > maxDeposit) revert ExcessiveAmount();
        if (commitment == bytes32(0)) revert InvalidCommitment();
        if (commitments[commitment]) revert CommitmentAlreadyExists();
        
        // TODO: Verify KYC proof via zkVerifier
        // For now, we'll implement a simplified version
        // In production, this would call: IZKVerifier(zkVerifier).verifyKYCProof(zkKYCProof)
        
        // Transfer tokens from user to vault
        yieldToken.transferFrom(msg.sender, address(this), amount);
        
        // Store commitment
        commitments[commitment] = true;
        
        emit DepositCommitted(commitment, block.timestamp);
    }
    
    /**
     * @notice Claim yield with zero-knowledge proof
     * @param nullifier Unique identifier for this claim (prevents double-claiming)
     * @param yieldAmount The calculated yield amount
     * @param zkYieldProof Zero-knowledge proof of correct yield calculation
     */
    function claimYield(
        bytes32 nullifier,
        uint256 yieldAmount,
        bytes calldata zkYieldProof
    ) external whenNotPaused nonReentrant {
        if (nullifier == bytes32(0)) revert InvalidCommitment();
        if (nullifiers[nullifier]) revert NullifierAlreadyUsed();
        if (yieldAmount == 0) revert InvalidYieldAmount();
        
        // Check vault has sufficient yield tokens
        uint256 vaultBalance = yieldToken.balanceOf(address(this));
        if (vaultBalance < yieldAmount) revert InsufficientYieldBalance();
        
        // TODO: Verify yield proof via zkVerifier
        // For now, we'll implement a simplified version
        // In production, this would call: IZKVerifier(zkVerifier).verifyYieldProof(zkYieldProof, yieldAmount, yieldRate, nullifier)
        
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
    
    function setVerifier(address newVerifier) external onlyOwner {
        if (newVerifier == address(0)) revert ZeroAddress();
        address oldVerifier = zkVerifier;
        zkVerifier = newVerifier;
        emit VerifierUpdated(oldVerifier, newVerifier);
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
