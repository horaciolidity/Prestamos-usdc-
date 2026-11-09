export type LoanTierId = 'starter' | 'basic' | 'silver' | 'gold' | 'platinum' | 'premium';

export interface LoanTier {
  id: LoanTierId;
  name: string;
  tagline: string;
  minAmount: number;
  maxAmount: number;
  collateralPercent: number; // e.g. 15
  commissionPercent: number; // e.g. 15
  minRepaymentDays: number;
  maxRepaymentDays: number;
  minWalletAgeDays: number;
  minTransactions: number;
  minDeFiInteractions: number;
  minHistoricalBalanceUSDC: number;
  fundsAvailableUSDC: number;
  activeLoansCount: number;
  recommendedCreditScore: number; // 0 - 1000
}

export type LoanStatus = 'active' | 'repaid' | 'overdue' | 'defaulted';

export interface Loan {
  id: string;
  borrowerAddress: string;
  tierId: LoanTierId;
  principalAmount: number;
  commissionAmount: number;
  commissionPercent: number;
  collateralAmount: number;
  collateralPercent: number;
  collateralRefunded: boolean;
  interestRateAnnual: number;
  disbursedAmount: number; // Principal minus commission (or net received)
  issuedAt: number; // timestamp ms
  expiresAt: number; // timestamp ms
  repaymentDeadlineDays: number;
  repaidAt?: number;
  status: LoanStatus;
  txHashDisbursement: string;
  txHashRepayment?: string;
  txHashCollateralRefund?: string;
}

export interface WalletFactIndicator {
  label: string;
  value: string;
  verified: boolean;
  type: 'fact' | 'risk_indicator';
  description: string;
}

export interface WalletEvaluation {
  id: string;
  address: string;
  evaluatedAt: number;
  isEligible: boolean;
  eligibleTiers: LoanTierId[];
  suggestedTier: LoanTierId;
  maxSuggestedAmount: number;
  score: number; // 0 - 1000
  walletAgeDays: number;
  transactionCount: number;
  usdcBalance: number;
  ethBalance: number;
  defiProtocolsDetected: string[];
  smartContractInteractions: number;
  riskLevel: 'LOW' | 'MODERATE' | 'ELEVATED' | 'HIGH';
  facts: WalletFactIndicator[];
  reasons: string[];
  recommendationNote: string;
}

export interface TransactionRecord {
  id: string;
  hash: string;
  type: 'BORROW' | 'REPAY' | 'COLLATERAL_DEPOSIT' | 'COLLATERAL_REFUND' | 'ADMIN_LIQUIDITY_ADD' | 'ADMIN_LIQUIDITY_REMOVE' | 'FAUCET_MINT';
  address: string;
  amount: number;
  token: 'USDC' | 'ETH';
  timestamp: number;
  blockNumber: number;
  status: 'CONFIRMED' | 'PENDING' | 'FAILED';
  description: string;
}

export interface AdminConfig {
  platformCommissionPercent: number; // Default 15%
  requiredCollateralPercent: number; // Default 15%
  isProtocolPaused: boolean;
  allowedRepaymentPeriods: number[]; // [15, 30, 45, 60]
  totalLiquidityPoolUSDC: number;
  emergencyAdminAddress: string;
  gracePeriodDays: number; // e.g. 5 days after deadline before default
}

export interface ProtocolStats {
  totalUsdcAvailable: number;
  totalUsdcLent: number;
  totalRepayments: number;
  totalCommissionsEarned: number;
  totalBorrowersCount: number;
  activeLoansCount: number;
  averageLoanAmount: number;
  defaultRatePercent: number;
}

export interface AuditLogEntry {
  id: string;
  timestamp: number;
  adminAddress: string;
  action: string;
  details: string;
}

export interface Web3WalletState {
  address: string | null;
  chainId: number | null;
  isConnected: boolean;
  isOptimism: boolean;
  ethBalance: number;
  usdcBalance: number;
  signature: string | null;
  isSigned: boolean;
  providerName: string;
  isDemoMode: boolean;
}
