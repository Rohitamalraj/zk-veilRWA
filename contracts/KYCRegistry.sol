// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title KYCRegistry
 * @notice Manages authorized KYC issuers and allowed jurisdictions
 * @dev Stores issuer public keys and country whitelist
 */
contract KYCRegistry is Ownable {
    // ============ State Variables ============
    
    /// @notice Mapping of authorized issuer addresses
    mapping(address => bool) public authorizedIssuers;
    
    /// @notice Mapping of allowed country codes (ISO 3166-1 numeric)
    mapping(uint256 => bool) public allowedCountries;
    
    /// @notice Merkle root of allowed countries (for ZK circuits)
    bytes32 public countriesMerkleRoot;
    
    /// @notice List of all issuer addresses for enumeration
    address[] public issuerList;
    
    // ============ Events ============
    
    event IssuerAdded(address indexed issuer);
    event IssuerRemoved(address indexed issuer);
    event CountryAdded(uint256 indexed countryCode);
    event CountryRemoved(uint256 indexed countryCode);
    event MerkleRootUpdated(bytes32 oldRoot, bytes32 newRoot);
    
    // ============ Constructor ============
    
    constructor() Ownable(msg.sender) {
        // Add some default countries (for testing)
        _addCountry(840);  // US
        _addCountry(826);  // GB
        _addCountry(702);  // SG
        _addCountry(756);  // CH
        _addCountry(784);  // AE
    }
    
    // ============ External Functions ============
    
    function addIssuer(address issuer) external onlyOwner {
        require(issuer != address(0), "Invalid issuer address");
        require(!authorizedIssuers[issuer], "Issuer already authorized");
        
        authorizedIssuers[issuer] = true;
        issuerList.push(issuer);
        
        emit IssuerAdded(issuer);
    }
    
    function removeIssuer(address issuer) external onlyOwner {
        require(authorizedIssuers[issuer], "Issuer not authorized");
        
        authorizedIssuers[issuer] = false;
        
        // Remove from list
        for (uint i = 0; i < issuerList.length; i++) {
            if (issuerList[i] == issuer) {
                issuerList[i] = issuerList[issuerList.length - 1];
                issuerList.pop();
                break;
            }
        }
        
        emit IssuerRemoved(issuer);
    }
    
    function addCountry(uint256 countryCode) external onlyOwner {
        _addCountry(countryCode);
    }
    
    function removeCountry(uint256 countryCode) external onlyOwner {
        require(allowedCountries[countryCode], "Country not in list");
        
        allowedCountries[countryCode] = false;
        
        emit CountryRemoved(countryCode);
    }
    
    function updateCountriesMerkleRoot(bytes32 newRoot) external onlyOwner {
        bytes32 oldRoot = countriesMerkleRoot;
        countriesMerkleRoot = newRoot;
        
        emit MerkleRootUpdated(oldRoot, newRoot);
    }
    
    // ============ View Functions ============
    
    function isIssuerAuthorized(address issuer) external view returns (bool) {
        return authorizedIssuers[issuer];
    }
    
    function isCountryAllowed(uint256 countryCode) external view returns (bool) {
        return allowedCountries[countryCode];
    }
    
    function getIssuerCount() external view returns (uint256) {
        return issuerList.length;
    }
    
    function getIssuerAt(uint256 index) external view returns (address) {
        require(index < issuerList.length, "Index out of bounds");
        return issuerList[index];
    }
    
    // ============ Internal Functions ============
    
    function _addCountry(uint256 countryCode) internal {
        require(!allowedCountries[countryCode], "Country already added");
        
        allowedCountries[countryCode] = true;
        
        emit CountryAdded(countryCode);
    }
}
