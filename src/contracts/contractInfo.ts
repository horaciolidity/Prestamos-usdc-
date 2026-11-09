/**
 * Official Optimism Network & USDC Constants
 * Circle Native USDC on Optimism: 0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85 (6 decimals)
 * Optimism Chain ID: 10
 */

export const OPTIMISM_CHAIN_ID = 10;
export const OPTIMISM_CHAIN_ID_HEX = '0xa';
export const OPTIMISM_RPC_URL = 'https://mainnet.optimism.io';
export const OPTIMISM_EXPLORER_URL = 'https://optimistic.etherscan.io';

// Official Native USDC on Optimism Mainnet issued by Circle
export const OPTIMISM_USDC_ADDRESS = '0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85';

// Optimism Lending Pool Contract Address
// Live deployed contract or development sandbox proxy
export const OPTIMISM_LENDING_POOL_ADDRESS = '0x4984f8817282F3B8c3a1d904791E211d20387b9D';

export const OPTIMISM_CHAIN_CONFIG = {
  chainId: OPTIMISM_CHAIN_ID_HEX,
  chainName: 'OP Mainnet',
  nativeCurrency: {
    name: 'Ether',
    symbol: 'ETH',
    decimals: 18,
  },
  rpcUrls: ['https://mainnet.optimism.io', 'https://optimism.llamarpc.com'],
  blockExplorerUrls: ['https://optimistic.etherscan.io'],
};

export const LENDING_POOL_ABI = [
  {
    inputs: [{ internalType: 'address', name: '_usdcToken', type: 'address' }],
    stateMutability: 'nonpayable',
    type: 'constructor',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'uint256', name: 'loanId', type: 'uint256' },
      { indexed: true, internalType: 'address', name: 'borrower', type: 'address' },
      { indexed: false, internalType: 'uint256', name: 'principal', type: 'uint256' },
      { indexed: false, internalType: 'uint256', name: 'commission', type: 'uint256' },
      { indexed: false, internalType: 'uint256', name: 'collateral', type: 'uint256' },
      { indexed: false, internalType: 'uint256', name: 'expiresAt', type: 'uint256' },
    ],
    name: 'LoanIssued',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'uint256', name: 'loanId', type: 'uint256' },
      { indexed: true, internalType: 'address', name: 'borrower', type: 'address' },
      { indexed: false, internalType: 'uint256', name: 'repaymentAmount', type: 'uint256' },
    ],
    name: 'LoanRepaid',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'uint256', name: 'loanId', type: 'uint256' },
      { indexed: true, internalType: 'address', name: 'borrower', type: 'address' },
      { indexed: false, internalType: 'uint256', name: 'amount', type: 'uint256' },
    ],
    name: 'CollateralRefunded',
    type: 'event',
  },
  {
    inputs: [
      { internalType: 'uint256', name: 'principal', type: 'uint256' },
      { internalType: 'uint256', name: 'durationSeconds', type: 'uint256' },
    ],
    name: 'requestLoan',
    outputs: [{ internalType: 'uint256', name: 'loanId', type: 'uint256' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint256', name: 'loanId', type: 'uint256' }],
    name: 'repayLoan',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getAvailableLiquidity',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: 'borrower', type: 'address' }],
    name: 'getBorrowerLoans',
    outputs: [{ internalType: 'uint256[]', name: '', type: 'uint256[]' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint256', name: 'amount', type: 'uint256' }],
    name: 'addLiquidity',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const;

export const ERC20_ABI = [
  {
    constant: true,
    inputs: [{ name: '_owner', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: 'balance', type: 'uint256' }],
    type: 'function',
  },
  {
    constant: false,
    inputs: [
      { name: '_spender', type: 'address' },
      { name: '_value', type: 'uint256' },
    ],
    name: 'approve',
    outputs: [{ name: 'success', type: 'bool' }],
    type: 'function',
  },
  {
    constant: true,
    inputs: [
      { name: '_owner', type: 'address' },
      { name: '_spender', type: 'address' },
    ],
    name: 'allowance',
    outputs: [{ name: 'remaining', type: 'uint256' }],
    type: 'function',
  },
] as const;
