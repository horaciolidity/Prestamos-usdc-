import { createPublicClient, http, formatEther, isAddress, verifyMessage } from 'viem';
import { optimism } from 'viem/chains';
import { 
  OPTIMISM_CHAIN_ID, 
  OPTIMISM_CHAIN_ID_HEX, 
  OPTIMISM_RPC_URL, 
  OPTIMISM_USDC_ADDRESS,
  OPTIMISM_CHAIN_CONFIG 
} from '../contracts/contractInfo';
import { Web3WalletState } from '../types';

export const publicClient = createPublicClient({
  chain: optimism,
  transport: http(OPTIMISM_RPC_URL),
});

// Demo / Preset test profiles for instant sandbox testing
export interface DemoWalletProfile {
  name: string;
  address: string;
  description: string;
  ethBalance: number;
  usdcBalance: number;
}

export const DEMO_PROFILES: DemoWalletProfile[] = [
  {
    name: 'Active DeFi Trader (Silver/Gold)',
    address: '0x71C840134f0A745e3f1Cdfa38A0D980c6C87Cdf1',
    description: '142 days old, 84 transactions, 4 DeFi protocols (Velodrome, Uniswap, Aave v3)',
    ethBalance: 0.85,
    usdcBalance: 1250,
  },
  {
    name: 'Optimism Whale LP (Platinum/Premium)',
    address: '0x3cD751E6b0078Be393132286c442345e5DC49699',
    description: '410 days old, 380 transactions, Synthetix & Velodrome gauge liquidity provider',
    ethBalance: 4.25,
    usdcBalance: 8400,
  },
  {
    name: 'Emerging User (Starter/Basic)',
    address: '0x2546BcD3c84621e976D8185a91A922aE77ECEc30',
    description: '28 days old, 18 transactions, some DEX swaps on Optimism',
    ethBalance: 0.12,
    usdcBalance: 240,
  },
  {
    name: 'Brand New Wallet (Needs Starter Activity)',
    address: '0x000000000000000000000000000000000000dEaD',
    description: '0 days old, 0 transactions, insufficient on-chain history',
    ethBalance: 0.00,
    usdcBalance: 0,
  },
];

export class Web3Service {
  private static listeners: ((state: Web3WalletState) => void)[] = [];

  private static state: Web3WalletState = {
    address: null,
    chainId: null,
    isConnected: false,
    isOptimism: false,
    ethBalance: 0,
    usdcBalance: 0,
    signature: null,
    isSigned: false,
    providerName: 'None',
    isDemoMode: false,
  };

  static subscribe(listener: (state: Web3WalletState) => void) {
    this.listeners.push(listener);
    listener({ ...this.state });
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private static notify() {
    this.listeners.forEach((l) => l({ ...this.state }));
  }

  static getState(): Web3WalletState {
    return { ...this.state };
  }

  /**
   * Connect to Injected Web3 Provider (MetaMask, Rabby, Coinbase Wallet, etc.)
   */
  static async connectInjected(): Promise<{ success: boolean; error?: string }> {
    const ethereum = (window as unknown as { ethereum?: Record<string, unknown> }).ethereum;

    if (!ethereum) {
      // If no browser extension, automatically switch to active demo mode
      this.activateDemoMode(DEMO_PROFILES[0]);
      return { 
        success: true, 
        error: 'No Web3 browser extension found (MetaMask/Rabby). Switched to interactive Optimism Sandbox mode.' 
      };
    }

    try {
      const accounts = (await (ethereum as any).request({
        method: 'eth_requestAccounts',
      })) as string[];

      if (!accounts || accounts.length === 0) {
        return { success: false, error: 'User rejected wallet connection' };
      }

      const chainIdHex = (await (ethereum as any).request({ method: 'eth_chainId' })) as string;
      const chainId = parseInt(chainIdHex, 16);
      const isOptimism = chainId === OPTIMISM_CHAIN_ID;

      this.state.address = accounts[0];
      this.state.chainId = chainId;
      this.state.isConnected = true;
      this.state.isOptimism = isOptimism;
      this.state.isDemoMode = false;
      this.state.providerName = (ethereum as any).isRabby
        ? 'Rabby'
        : (ethereum as any).isMetaMask
        ? 'MetaMask'
        : 'Injected Web3';

      // Attach chain & account change listeners
      if ((ethereum as any).on) {
        (ethereum as any).on('chainChanged', (newChainHex: string) => {
          const newChainId = parseInt(newChainHex, 16);
          this.state.chainId = newChainId;
          this.state.isOptimism = newChainId === OPTIMISM_CHAIN_ID;
          this.fetchLiveBalances();
          this.notify();
        });

        (ethereum as any).on('accountsChanged', (newAccounts: string[]) => {
          if (!newAccounts || newAccounts.length === 0) {
            this.disconnect();
          } else {
            this.state.address = newAccounts[0];
            this.state.isSigned = false;
            this.state.signature = null;
            this.fetchLiveBalances();
            this.notify();
          }
        });
      }

      await this.fetchLiveBalances();
      this.notify();

      return { success: true };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to connect wallet';
      return { success: false, error: msg };
    }
  }

  /**
   * Switch Network to Optimism Mainnet (Chain ID 10)
   */
  static async switchToOptimism(): Promise<boolean> {
    if (this.state.isDemoMode) {
      this.state.isOptimism = true;
      this.state.chainId = OPTIMISM_CHAIN_ID;
      this.notify();
      return true;
    }

    const ethereum = (window as any).ethereum;
    if (!ethereum) return false;

    try {
      await ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: OPTIMISM_CHAIN_ID_HEX }],
      });
      this.state.chainId = OPTIMISM_CHAIN_ID;
      this.state.isOptimism = true;
      await this.fetchLiveBalances();
      this.notify();
      return true;
    } catch (switchError: any) {
      // Error code 4902 indicates chain has not been added to wallet
      if (switchError.code === 4902) {
        try {
          await ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [OPTIMISM_CHAIN_CONFIG],
          });
          this.state.chainId = OPTIMISM_CHAIN_ID;
          this.state.isOptimism = true;
          await this.fetchLiveBalances();
          this.notify();
          return true;
        } catch (addError) {
          console.error('Failed to add Optimism network:', addError);
          return false;
        }
      }
      console.error('Failed to switch network:', switchError);
      return false;
    }
  }

  /**
   * Request Cryptographic Wallet Signature to verify ownership
   * Message adheres to standard personal_sign / EIP-191
   */
  static async verifyOwnershipSignature(): Promise<{ success: boolean; signature?: string; error?: string }> {
    if (!this.state.address) {
      return { success: false, error: 'Please connect wallet first.' };
    }

    const nonce = Math.floor(Date.now() / 1000);
    const message = [
      'OPTIMISM LENDING AUTHENTICATION',
      '==================================',
      `Wallet Address: ${this.state.address}`,
      `Network: Optimism Mainnet (Chain ID: 10)`,
      `Session Nonce: ${nonce}`,
      'Timestamp: ' + new Date().toISOString(),
      '',
      'By signing this transaction, I certify ownership of this address',
      'and authorize Optimism Lending Protocol to assess verified on-chain',
      'metrics for USDC borrowing eligibility.',
      '',
      'Zero gas fee is incurred for signing.',
    ].join('\n');

    if (this.state.isDemoMode) {
      // Simulate realistic cryptographic signature in demo/sandbox mode
      const simSig = '0x' + Array.from({ length: 130 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
      this.state.signature = simSig;
      this.state.isSigned = true;
      this.notify();
      return { success: true, signature: simSig };
    }

    const ethereum = (window as any).ethereum;
    if (!ethereum) {
      return { success: false, error: 'No Web3 provider available' };
    }

    try {
      const signature = (await ethereum.request({
        method: 'personal_sign',
        params: [message, this.state.address],
      })) as string;

      this.state.signature = signature;
      this.state.isSigned = true;
      this.notify();
      return { success: true, signature };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'User rejected signature request';
      return { success: false, error: msg };
    }
  }

  /**
   * Fetch live ETH & USDC balances
   */
  static async fetchLiveBalances(): Promise<void> {
    if (!this.state.address) return;

    if (this.state.isDemoMode) {
      return;
    }

    try {
      // Fetch native ETH balance
      const ethWei = await publicClient.getBalance({
        address: this.state.address as `0x${string}`,
      });
      this.state.ethBalance = Number(parseFloat(formatEther(ethWei)).toFixed(4));

      // Fetch official Circle USDC on Optimism balance (6 decimals)
      // ERC20 balanceOf function selector: 0x70a08231 + padded address
      try {
        const result = await publicClient.readContract({
          address: OPTIMISM_USDC_ADDRESS as `0x${string}`,
          abi: [
            {
              type: 'function',
              name: 'balanceOf',
              stateMutability: 'view',
              inputs: [{ name: 'account', type: 'address' }],
              outputs: [{ name: '', type: 'uint256' }],
            },
          ],
          functionName: 'balanceOf',
          args: [this.state.address as `0x${string}`],
        });
        this.state.usdcBalance = Number(Number(result) / 1e6);
      } catch (tokenErr) {
        // Fallback default or RPC rate limit
        console.warn('Could not read live USDC balance on RPC:', tokenErr);
      }

      this.notify();
    } catch (err) {
      console.warn('Error fetching live balances from Optimism RPC:', err);
    }
  }

  /**
   * Activate Demo / Sandbox Mode
   */
  static activateDemoMode(profile: DemoWalletProfile) {
    this.state = {
      address: profile.address,
      chainId: OPTIMISM_CHAIN_ID,
      isConnected: true,
      isOptimism: true,
      ethBalance: profile.ethBalance,
      usdcBalance: profile.usdcBalance,
      signature: '0x' + '9f'.repeat(65),
      isSigned: true,
      providerName: `Demo (${profile.name.split(' ')[0]})`,
      isDemoMode: true,
    };
    this.notify();
  }

  /**
   * Faucet test mint for sandbox
   */
  static faucetMint(amountUSDC: number, amountETH: number) {
    this.state.usdcBalance += amountUSDC;
    this.state.ethBalance = Number((this.state.ethBalance + amountETH).toFixed(4));
    this.notify();
  }

  /**
   * Disconnect current wallet
   */
  static disconnect() {
    this.state = {
      address: null,
      chainId: null,
      isConnected: false,
      isOptimism: false,
      ethBalance: 0,
      usdcBalance: 0,
      signature: null,
      isSigned: false,
      providerName: 'None',
      isDemoMode: false,
    };
    this.notify();
  }

  /**
   * Validate standard EVM address
   */
  static isValidAddress(addr: string): boolean {
    return isAddress(addr);
  }
}
