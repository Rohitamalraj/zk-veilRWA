// Contract addresses on Mantle Sepolia
export const CONTRACTS = {
  KYCRegistry: '0x0f61cB672d345797f6A1505A282240583F902cb2',
  MockRWAToken: '0x35FB06244022403dc1a0cC308E150b5744e37A6b',
  VeilRWAVault: '0xd9133c2CcA52e7dfFdBAEAA0B3228c9288c19E5f',
  // ZK Verifiers
  DepositVerifier: '0x20032EA6f975FbfA5aFbA329f2c2fCE51B60FE94',
  YieldVerifier: '0x4040D46b287993060eE7f51B7c87F8bfd913508C',
  KYCVerifier: '0x870f9724047acba94885359f38cA55D639A4C564',
} as const;

// VeilRWAVault ABI (key functions only)
export const VAULT_ABI = [
  {
    type: 'function',
    name: 'deposit',
    inputs: [
      { name: 'amount', type: 'uint256' },
      { name: 'commitment', type: 'bytes32' },
      { name: 'zkKYCProof', type: 'bytes' },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'claimYield',
    inputs: [
      { name: 'nullifier', type: 'bytes32' },
      { name: 'yieldAmount', type: 'uint256' },
      { name: 'zkYieldProof', type: 'bytes' },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'yieldRate',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'minDeposit',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'maxDeposit',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getVaultBalance',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'event',
    name: 'DepositMade',
    inputs: [
      { name: 'commitment', type: 'bytes32', indexed: true },
      { name: 'timestamp', type: 'uint256', indexed: false },
    ],
  },
  {
    type: 'event',
    name: 'YieldClaimed',
    inputs: [
      { name: 'nullifier', type: 'bytes32', indexed: true },
      { name: 'timestamp', type: 'uint256', indexed: false },
    ],
  },
] as const;

// MockRWAToken ABI (ERC20 functions)
export const TOKEN_ABI = [
  {
    type: 'function',
    name: 'approve',
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'balanceOf',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'allowance',
    inputs: [
      { name: 'owner', type: 'address' },
      { name: 'spender', type: 'address' },
    ],
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'decimals',
    inputs: [],
    outputs: [{ name: '', type: 'uint8' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'symbol',
    inputs: [],
    outputs: [{ name: '', type: 'string' }],
    stateMutability: 'view',
  },
] as const;

// KYCRegistry ABI
export const KYC_REGISTRY_ABI = [
  {
    type: 'function',
    name: 'isCountryAllowed',
    inputs: [{ name: 'countryCode', type: 'uint256' }],
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'isIssuerAuthorized',
    inputs: [{ name: 'issuer', type: 'address' }],
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'view',
  },
] as const;
