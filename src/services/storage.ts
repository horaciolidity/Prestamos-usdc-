import { LoanTier, Loan, AdminConfig, TransactionRecord, AuditLogEntry, ProtocolStats, WalletEvaluation } from '../types';

export const DEFAULT_LOAN_TIERS: LoanTier[] = [
  {
    id: 'starter',
    name: 'Starter',
    tagline: 'Instant micro-credit for new wallets',
    minAmount: 50,
    maxAmount: 150,
    collateralPercent: 15,
    commissionPercent: 15,
    minRepaymentDays: 15,
    maxRepaymentDays: 30,
    minWalletAgeDays: 7,
    minTransactions: 5,
    minDeFiInteractions: 0,
    minHistoricalBalanceUSDC: 10,
    fundsAvailableUSDC: 25000,
    activeLoansCount: 14,
    recommendedCreditScore: 500,
  },
  {
    id: 'basic',
    name: 'Basic',
    tagline: 'Standard liquidity for active DeFi users',
    minAmount: 150,
    maxAmount: 300,
    collateralPercent: 15,
    commissionPercent: 15,
    minRepaymentDays: 15,
    maxRepaymentDays: 45,
    minWalletAgeDays: 20,
    minTransactions: 15,
    minDeFiInteractions: 1,
    minHistoricalBalanceUSDC: 50,
    fundsAvailableUSDC: 45000,
    activeLoansCount: 28,
    recommendedCreditScore: 600,
  },
  {
    id: 'silver',
    name: 'Silver',
    tagline: 'Enhanced capacity with flexible repayment',
    minAmount: 300,
    maxAmount: 750,
    collateralPercent: 15,
    commissionPercent: 15,
    minRepaymentDays: 15,
    maxRepaymentDays: 60,
    minWalletAgeDays: 45,
    minTransactions: 30,
    minDeFiInteractions: 3,
    minHistoricalBalanceUSDC: 150,
    fundsAvailableUSDC: 85000,
    activeLoansCount: 32,
    recommendedCreditScore: 700,
  },
  {
    id: 'gold',
    name: 'Gold',
    tagline: 'High volume credit for verified liquidity providers',
    minAmount: 750,
    maxAmount: 1500,
    collateralPercent: 15,
    commissionPercent: 15,
    minRepaymentDays: 30,
    maxRepaymentDays: 60,
    minWalletAgeDays: 90,
    minTransactions: 60,
    minDeFiInteractions: 5,
    minHistoricalBalanceUSDC: 400,
    fundsAvailableUSDC: 120000,
    activeLoansCount: 19,
    recommendedCreditScore: 780,
  },
  {
    id: 'platinum',
    name: 'Platinum',
    tagline: 'Institutional tier for experienced protocols & traders',
    minAmount: 1500,
    maxAmount: 3000,
    collateralPercent: 15,
    commissionPercent: 15,
    minRepaymentDays: 30,
    maxRepaymentDays: 60,
    minWalletAgeDays: 180,
    minTransactions: 120,
    minDeFiInteractions: 10,
    minHistoricalBalanceUSDC: 1000,
    fundsAvailableUSDC: 240000,
    activeLoansCount: 11,
    recommendedCreditScore: 850,
  },
  {
    id: 'premium',
    name: 'Premium',
    tagline: 'Maximum borrowing power with white-glove settlement',
    minAmount: 3000,
    maxAmount: 5000,
    collateralPercent: 15,
    commissionPercent: 15,
    minRepaymentDays: 45,
    maxRepaymentDays: 60,
    minWalletAgeDays: 365,
    minTransactions: 250,
    minDeFiInteractions: 20,
    minHistoricalBalanceUSDC: 2500,
    fundsAvailableUSDC: 380000,
    activeLoansCount: 6,
    recommendedCreditScore: 920,
  },
];

export const DEFAULT_ADMIN_CONFIG: AdminConfig = {
  platformCommissionPercent: 15,
  requiredCollateralPercent: 15,
  isProtocolPaused: false,
  allowedRepaymentPeriods: [15, 30, 45, 60],
  totalLiquidityPoolUSDC: 895000,
  emergencyAdminAddress: '0x9965507D1a55bcC2695C58ba16FB37d819B0A4df',
  gracePeriodDays: 5,
};

const STORAGE_KEYS = {
  TIERS: 'optimism_lending_tiers',
  LOANS: 'optimism_lending_loans',
  ADMIN_CONFIG: 'optimism_lending_admin_config',
  TRANSACTIONS: 'optimism_lending_transactions',
  AUDIT_LOG: 'optimism_lending_audit_log',
  EVALUATIONS: 'optimism_lending_evaluations',
};

// Seed historical loans representing protocol performance across collateral ratios
const SEED_LOANS: Loan[] = [
  // 15% Protocol Standard loans
  {
    id: 'LOAN-OP-1049',
    borrowerAddress: '0x71C840134f0A745e3f1Cdfa38A0D980c6C87Cdf1',
    tierId: 'gold',
    principalAmount: 1000,
    commissionAmount: 150,
    commissionPercent: 15,
    collateralAmount: 150,
    collateralPercent: 15,
    collateralRefunded: false,
    interestRateAnnual: 0,
    disbursedAmount: 850,
    issuedAt: Date.now() - 1000 * 60 * 60 * 24 * 6,
    expiresAt: Date.now() + 1000 * 60 * 60 * 24 * 24,
    repaymentDeadlineDays: 30,
    status: 'active',
    txHashDisbursement: '0x3a92f8b9e1104e8d89a712c4b8109d1e2f7b8c91a03847e62a1b9d4e5f6a7012',
  },
  {
    id: 'LOAN-OP-1042',
    borrowerAddress: '0x2546BcD3c84621e976D8185a91A922aE77ECEc30',
    tierId: 'silver',
    principalAmount: 500,
    commissionAmount: 75,
    commissionPercent: 15,
    collateralAmount: 75,
    collateralPercent: 15,
    collateralRefunded: false,
    interestRateAnnual: 0,
    disbursedAmount: 425,
    issuedAt: Date.now() - 1000 * 60 * 60 * 24 * 12,
    expiresAt: Date.now() + 1000 * 60 * 60 * 24 * 3,
    repaymentDeadlineDays: 15,
    status: 'active',
    txHashDisbursement: '0x8b32d1e04fa87c928374d9e021a8f93e2a7b1c0948e7162b5d4e3f2a1b9c8d7e',
  },
  {
    id: 'LOAN-OP-1033',
    borrowerAddress: '0x90F79bf6EB2c4f870365E785982E1f101E93b906',
    tierId: 'basic',
    principalAmount: 250,
    commissionAmount: 37.5,
    commissionPercent: 15,
    collateralAmount: 37.5,
    collateralPercent: 15,
    collateralRefunded: true,
    interestRateAnnual: 0,
    disbursedAmount: 212.5,
    issuedAt: Date.now() - 1000 * 60 * 60 * 24 * 25,
    expiresAt: Date.now() - 1000 * 60 * 60 * 24 * 10,
    repaymentDeadlineDays: 15,
    repaidAt: Date.now() - 1000 * 60 * 60 * 24 * 11,
    status: 'repaid',
    txHashDisbursement: '0x12c4b8109d1e2f7b8c91a03847e62a1b9d4e5f6a70123a92f8b9e1104e8d89a7',
    txHashRepayment: '0x62a1b9d4e5f6a70123a92f8b9e1104e8d89a712c4b8109d1e2f7b8c91a03847e',
    txHashCollateralRefund: '0x7b8c91a03847e62a1b9d4e5f6a70123a92f8b9e1104e8d89a712c4b8109d1e2f',
  },
  {
    id: 'LOAN-OP-1030',
    borrowerAddress: '0x3cD751E6b0078Be393132286c442345e5DC49699',
    tierId: 'platinum',
    principalAmount: 2000,
    commissionAmount: 300,
    commissionPercent: 15,
    collateralAmount: 300,
    collateralPercent: 15,
    collateralRefunded: true,
    interestRateAnnual: 0,
    disbursedAmount: 1700,
    issuedAt: Date.now() - 1000 * 60 * 60 * 24 * 40,
    expiresAt: Date.now() - 1000 * 60 * 60 * 24 * 10,
    repaymentDeadlineDays: 30,
    repaidAt: Date.now() - 1000 * 60 * 60 * 24 * 18,
    status: 'repaid',
    txHashDisbursement: '0x4f8109d1e2f7b8c91a03847e62a1b9d4e5f6a70123a92f8b9e1104e8d89a712c',
    txHashRepayment: '0x8d89a712c4b8109d1e2f7b8c91a03847e62a1b9d4e5f6a70123a92f8b9e1104e',
  },
  // Low Collateral Cohorts (6% - 10% collateral)
  {
    id: 'LOAN-OP-1004',
    borrowerAddress: '0x14dC79964da2C08b23698B3D3cc7Ca32193d9955',
    tierId: 'starter',
    principalAmount: 150,
    commissionAmount: 22.5,
    commissionPercent: 15,
    collateralAmount: 9,
    collateralPercent: 6,
    collateralRefunded: false,
    interestRateAnnual: 0,
    disbursedAmount: 127.5,
    issuedAt: Date.now() - 1000 * 60 * 60 * 24 * 70,
    expiresAt: Date.now() - 1000 * 60 * 60 * 24 * 40,
    repaymentDeadlineDays: 30,
    status: 'defaulted',
    txHashDisbursement: '0x9d4e5f6a70123a92f8b9e1104e8d89a712c4b8109d1e2f7b8c91a03847e62a1b',
  },
  {
    id: 'LOAN-OP-1008',
    borrowerAddress: '0x23618e81E3f5cdF7f54C3d65f7FBc0aBf5B21E8f',
    tierId: 'basic',
    principalAmount: 200,
    commissionAmount: 30,
    commissionPercent: 15,
    collateralAmount: 16,
    collateralPercent: 8,
    collateralRefunded: true,
    interestRateAnnual: 0,
    disbursedAmount: 170,
    issuedAt: Date.now() - 1000 * 60 * 60 * 24 * 65,
    expiresAt: Date.now() - 1000 * 60 * 60 * 24 * 35,
    repaymentDeadlineDays: 30,
    repaidAt: Date.now() - 1000 * 60 * 60 * 24 * 36, // Slower repayment (29 days)
    status: 'repaid',
    txHashDisbursement: '0x7b8c91a03847e62a1b9d4e5f6a70123a92f8b9e1104e8d89a712c4b8109d1e2f',
  },
  {
    id: 'LOAN-OP-1012',
    borrowerAddress: '0xa0Ee7A142d267C1f36714E4a8F75612F20a79720',
    tierId: 'starter',
    principalAmount: 120,
    commissionAmount: 18,
    commissionPercent: 15,
    collateralAmount: 12,
    collateralPercent: 10,
    collateralRefunded: true,
    interestRateAnnual: 0,
    disbursedAmount: 102,
    issuedAt: Date.now() - 1000 * 60 * 60 * 24 * 55,
    expiresAt: Date.now() - 1000 * 60 * 60 * 24 * 25,
    repaymentDeadlineDays: 30,
    repaidAt: Date.now() - 1000 * 60 * 60 * 24 * 28,
    status: 'repaid',
    txHashDisbursement: '0x1b9d4e5f6a70123a92f8b9e1104e8d89a712c4b8109d1e2f7b8c91a03847e62a',
  },
  {
    id: 'LOAN-OP-1015',
    borrowerAddress: '0xBcd4042DE499D14e55001CcbB24a551F3b954096',
    tierId: 'silver',
    principalAmount: 400,
    commissionAmount: 60,
    commissionPercent: 15,
    collateralAmount: 40,
    collateralPercent: 10,
    collateralRefunded: false,
    interestRateAnnual: 0,
    disbursedAmount: 340,
    issuedAt: Date.now() - 1000 * 60 * 60 * 24 * 50,
    expiresAt: Date.now() - 1000 * 60 * 60 * 24 * 20,
    repaymentDeadlineDays: 30,
    status: 'defaulted',
    txHashDisbursement: '0x3847e62a1b9d4e5f6a70123a92f8b9e1104e8d89a712c4b8109d1e2f7b8c91a0',
  },
  // Moderate Collateral (12% collateral)
  {
    id: 'LOAN-OP-1019',
    borrowerAddress: '0x71bE63f3384f5fb9899544c7be624fE7c0354464',
    tierId: 'basic',
    principalAmount: 300,
    commissionAmount: 45,
    commissionPercent: 15,
    collateralAmount: 36,
    collateralPercent: 12,
    collateralRefunded: true,
    interestRateAnnual: 0,
    disbursedAmount: 255,
    issuedAt: Date.now() - 1000 * 60 * 60 * 24 * 45,
    expiresAt: Date.now() - 1000 * 60 * 60 * 24 * 15,
    repaymentDeadlineDays: 30,
    repaidAt: Date.now() - 1000 * 60 * 60 * 24 * 22,
    status: 'repaid',
    txHashDisbursement: '0x6a70123a92f8b9e1104e8d89a712c4b8109d1e2f7b8c91a03847e62a1b9d4e5f',
  },
  {
    id: 'LOAN-OP-1022',
    borrowerAddress: '0xFABB0ac9d68B0B445fB7357272Ff202C5651694a',
    tierId: 'silver',
    principalAmount: 600,
    commissionAmount: 90,
    commissionPercent: 15,
    collateralAmount: 72,
    collateralPercent: 12,
    collateralRefunded: true,
    interestRateAnnual: 0,
    disbursedAmount: 510,
    issuedAt: Date.now() - 1000 * 60 * 60 * 24 * 38,
    expiresAt: Date.now() - 1000 * 60 * 60 * 24 * 8,
    repaymentDeadlineDays: 30,
    repaidAt: Date.now() - 1000 * 60 * 60 * 24 * 16,
    status: 'repaid',
    txHashDisbursement: '0x104e8d89a712c4b8109d1e2f7b8c91a03847e62a1b9d4e5f6a70123a92f8b9e1',
  },
  // Higher Collateral Cohorts (18% - 25% collateral)
  {
    id: 'LOAN-OP-1025',
    borrowerAddress: '0x1CBD3E2b7D696b450C7A9862494ff9748BaBD774',
    tierId: 'gold',
    principalAmount: 1200,
    commissionAmount: 180,
    commissionPercent: 15,
    collateralAmount: 216,
    collateralPercent: 18,
    collateralRefunded: true,
    interestRateAnnual: 0,
    disbursedAmount: 1020,
    issuedAt: Date.now() - 1000 * 60 * 60 * 24 * 32,
    expiresAt: Date.now() - 1000 * 60 * 60 * 24 * 2,
    repaymentDeadlineDays: 30,
    repaidAt: Date.now() - 1000 * 60 * 60 * 24 * 14, // Rapid repayment (18 days)
    status: 'repaid',
    txHashDisbursement: '0x89a712c4b8109d1e2f7b8c91a03847e62a1b9d4e5f6a70123a92f8b9e1104e8d',
  },
  {
    id: 'LOAN-OP-1028',
    borrowerAddress: '0xdF3e18d64BC6A983f673Ab319CCaE4f1a57C7097',
    tierId: 'platinum',
    principalAmount: 2500,
    commissionAmount: 375,
    commissionPercent: 15,
    collateralAmount: 500,
    collateralPercent: 20,
    collateralRefunded: true,
    interestRateAnnual: 0,
    disbursedAmount: 2125,
    issuedAt: Date.now() - 1000 * 60 * 60 * 24 * 28,
    expiresAt: Date.now() + 1000 * 60 * 60 * 24 * 17,
    repaymentDeadlineDays: 45,
    repaidAt: Date.now() - 1000 * 60 * 60 * 24 * 12, // Settled early in 16 days
    status: 'repaid',
    txHashDisbursement: '0x2f7b8c91a03847e62a1b9d4e5f6a70123a92f8b9e1104e8d89a712c4b8109d1e',
  },
  {
    id: 'LOAN-OP-1036',
    borrowerAddress: '0xcd3B766CCDd6AE721141F452C550Ca635964ce71',
    tierId: 'premium',
    principalAmount: 4000,
    commissionAmount: 600,
    commissionPercent: 15,
    collateralAmount: 1000,
    collateralPercent: 25,
    collateralRefunded: true,
    interestRateAnnual: 0,
    disbursedAmount: 3400,
    issuedAt: Date.now() - 1000 * 60 * 60 * 24 * 20,
    expiresAt: Date.now() + 1000 * 60 * 60 * 24 * 40,
    repaymentDeadlineDays: 60,
    repaidAt: Date.now() - 1000 * 60 * 60 * 24 * 6, // Settled early in 14 days
    status: 'repaid',
    txHashDisbursement: '0x03847e62a1b9d4e5f6a70123a92f8b9e1104e8d89a712c4b8109d1e2f7b8c91a',
  },
];

const SEED_AUDIT_LOG: AuditLogEntry[] = [
  {
    id: 'AUD-001',
    timestamp: Date.now() - 1000 * 60 * 60 * 48,
    adminAddress: '0x9965507D1a55bcC2695C58ba16FB37d819B0A4df',
    action: 'PROTOCOL_INITIALIZED',
    details: 'Lending pool initialized with 895,000 USDC liquidity on Optimism Mainnet.',
  },
  {
    id: 'AUD-002',
    timestamp: Date.now() - 1000 * 60 * 60 * 24,
    adminAddress: '0x9965507D1a55bcC2695C58ba16FB37d819B0A4df',
    action: 'RATE_POLICY_CONFIRMED',
    details: 'Commission standard set to 15% and collateral requirement set to 15%.',
  },
];

const SEED_TRANSACTIONS: TransactionRecord[] = [
  {
    id: 'tx-seed-1',
    hash: '0x3a92f8b9e1104e8d89a712c4b8109d1e2f7b8c91a03847e62a1b9d4e5f6a7012',
    type: 'BORROW',
    address: '0x71C840134f0A745e3f1Cdfa38A0D980c6C87Cdf1',
    amount: 1000,
    token: 'USDC',
    timestamp: Date.now() - 1000 * 60 * 60 * 24 * 6,
    blockNumber: 128941020,
    status: 'CONFIRMED',
    description: 'Loan #LOAN-OP-1049 principal disbursed (net 850 USDC + 150 commission)',
  },
  {
    id: 'tx-seed-2',
    hash: '0x3a92f8b9e1104e8d89a712c4b8109d1e2f7b8c91a03847e62a1b9d4e5f6a7013',
    type: 'COLLATERAL_DEPOSIT',
    address: '0x71C840134f0A745e3f1Cdfa38A0D980c6C87Cdf1',
    amount: 150,
    token: 'USDC',
    timestamp: Date.now() - 1000 * 60 * 60 * 24 * 6,
    blockNumber: 128941019,
    status: 'CONFIRMED',
    description: 'Collateral locked in escrow for loan #LOAN-OP-1049',
  },
  {
    id: 'tx-seed-3',
    hash: '0x62a1b9d4e5f6a70123a92f8b9e1104e8d89a712c4b8109d1e2f7b8c91a03847e',
    type: 'REPAY',
    address: '0x90F79bf6EB2c4f870365E785982E1f101E93b906',
    amount: 250,
    token: 'USDC',
    timestamp: Date.now() - 1000 * 60 * 60 * 24 * 11,
    blockNumber: 128892100,
    status: 'CONFIRMED',
    description: 'Full principal repayment for loan #LOAN-OP-1033',
  },
  {
    id: 'tx-seed-4',
    hash: '0x7b8c91a03847e62a1b9d4e5f6a70123a92f8b9e1104e8d89a712c4b8109d1e2f',
    type: 'COLLATERAL_REFUND',
    address: '0x90F79bf6EB2c4f870365E785982E1f101E93b906',
    amount: 37.5,
    token: 'USDC',
    timestamp: Date.now() - 1000 * 60 * 60 * 24 * 11,
    blockNumber: 128892101,
    status: 'CONFIRMED',
    description: 'Escrow collateral refunded to borrower after complete repayment',
  },
];

export class StorageService {
  static getTiers(): LoanTier[] {
    const data = localStorage.getItem(STORAGE_KEYS.TIERS);
    if (!data) {
      localStorage.setItem(STORAGE_KEYS.TIERS, JSON.stringify(DEFAULT_LOAN_TIERS));
      return DEFAULT_LOAN_TIERS;
    }
    try {
      return JSON.parse(data);
    } catch {
      return DEFAULT_LOAN_TIERS;
    }
  }

  static saveTiers(tiers: LoanTier[]) {
    localStorage.setItem(STORAGE_KEYS.TIERS, JSON.stringify(tiers));
  }

  static getAdminConfig(): AdminConfig {
    const data = localStorage.getItem(STORAGE_KEYS.ADMIN_CONFIG);
    if (!data) {
      localStorage.setItem(STORAGE_KEYS.ADMIN_CONFIG, JSON.stringify(DEFAULT_ADMIN_CONFIG));
      return DEFAULT_ADMIN_CONFIG;
    }
    try {
      return JSON.parse(data);
    } catch {
      return DEFAULT_ADMIN_CONFIG;
    }
  }

  static saveAdminConfig(config: AdminConfig) {
    localStorage.setItem(STORAGE_KEYS.ADMIN_CONFIG, JSON.stringify(config));
  }

  static getLoans(): Loan[] {
    const data = localStorage.getItem(STORAGE_KEYS.LOANS);
    if (!data) {
      localStorage.setItem(STORAGE_KEYS.LOANS, JSON.stringify(SEED_LOANS));
      return SEED_LOANS;
    }
    try {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length < SEED_LOANS.length) {
        const existingIds = new Set(parsed.map((p: Loan) => p.id));
        const merged = [...parsed, ...SEED_LOANS.filter((s) => !existingIds.has(s.id))];
        localStorage.setItem(STORAGE_KEYS.LOANS, JSON.stringify(merged));
        return merged;
      }
      return parsed;
    } catch {
      return SEED_LOANS;
    }
  }

  static saveLoans(loans: Loan[]) {
    localStorage.setItem(STORAGE_KEYS.LOANS, JSON.stringify(loans));
  }

  static addLoan(loan: Loan) {
    const loans = this.getLoans();
    loans.unshift(loan);
    this.saveLoans(loans);

    // Update tier active loan count
    const tiers = this.getTiers();
    const tier = tiers.find((t) => t.id === loan.tierId);
    if (tier) {
      tier.activeLoansCount += 1;
      tier.fundsAvailableUSDC = Math.max(0, tier.fundsAvailableUSDC - loan.principalAmount);
      this.saveTiers(tiers);
    }

    // Add to transactions
    this.addTransaction({
      id: 'tx-' + Date.now(),
      hash: loan.txHashDisbursement,
      type: 'BORROW',
      address: loan.borrowerAddress,
      amount: loan.principalAmount,
      token: 'USDC',
      timestamp: Date.now(),
      blockNumber: Math.floor(129000000 + Math.random() * 50000),
      status: 'CONFIRMED',
      description: `Loan ${loan.id} disbursed (${loan.disbursedAmount} USDC received, ${loan.commissionAmount} USDC commission)`,
    });

    this.addTransaction({
      id: 'tx-col-' + Date.now(),
      hash: '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join(''),
      type: 'COLLATERAL_DEPOSIT',
      address: loan.borrowerAddress,
      amount: loan.collateralAmount,
      token: 'USDC',
      timestamp: Date.now(),
      blockNumber: Math.floor(129000000 + Math.random() * 50000),
      status: 'CONFIRMED',
      description: `Collateral locked for loan ${loan.id}`,
    });
  }

  static repayLoan(loanId: string, repayTxHash: string, refundTxHash: string): Loan | null {
    const loans = this.getLoans();
    const loan = loans.find((l) => l.id === loanId);
    if (!loan) return null;

    loan.status = 'repaid';
    loan.repaidAt = Date.now();
    loan.collateralRefunded = true;
    loan.txHashRepayment = repayTxHash;
    loan.txHashCollateralRefund = refundTxHash;

    this.saveLoans(loans);

    // Update tier active loan count
    const tiers = this.getTiers();
    const tier = tiers.find((t) => t.id === loan.tierId);
    if (tier) {
      tier.activeLoansCount = Math.max(0, tier.activeLoansCount - 1);
      tier.fundsAvailableUSDC += loan.principalAmount;
      this.saveTiers(tiers);
    }

    // Log transactions
    this.addTransaction({
      id: 'tx-repay-' + Date.now(),
      hash: repayTxHash,
      type: 'REPAY',
      address: loan.borrowerAddress,
      amount: loan.principalAmount,
      token: 'USDC',
      timestamp: Date.now(),
      blockNumber: Math.floor(129000000 + Math.random() * 50000),
      status: 'CONFIRMED',
      description: `Repayment for ${loan.id} completed`,
    });

    this.addTransaction({
      id: 'tx-colref-' + Date.now(),
      hash: refundTxHash,
      type: 'COLLATERAL_REFUND',
      address: loan.borrowerAddress,
      amount: loan.collateralAmount,
      token: 'USDC',
      timestamp: Date.now(),
      blockNumber: Math.floor(129000000 + Math.random() * 50000),
      status: 'CONFIRMED',
      description: `Collateral ${loan.collateralAmount} USDC refunded to borrower`,
    });

    return loan;
  }

  static getTransactions(): TransactionRecord[] {
    const data = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
    if (!data) {
      localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(SEED_TRANSACTIONS));
      return SEED_TRANSACTIONS;
    }
    try {
      return JSON.parse(data);
    } catch {
      return SEED_TRANSACTIONS;
    }
  }

  static addTransaction(tx: TransactionRecord) {
    const list = this.getTransactions();
    list.unshift(tx);
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(list.slice(0, 100)));
  }

  static getAuditLog(): AuditLogEntry[] {
    const data = localStorage.getItem(STORAGE_KEYS.AUDIT_LOG);
    if (!data) {
      localStorage.setItem(STORAGE_KEYS.AUDIT_LOG, JSON.stringify(SEED_AUDIT_LOG));
      return SEED_AUDIT_LOG;
    }
    try {
      return JSON.parse(data);
    } catch {
      return SEED_AUDIT_LOG;
    }
  }

  static addAuditLog(entry: Omit<AuditLogEntry, 'id' | 'timestamp'>) {
    const list = this.getAuditLog();
    const item: AuditLogEntry = {
      ...entry,
      id: 'AUD-' + String(list.length + 1).padStart(3, '0'),
      timestamp: Date.now(),
    };
    list.unshift(item);
    localStorage.setItem(STORAGE_KEYS.AUDIT_LOG, JSON.stringify(list));
  }

  static getEvaluations(): WalletEvaluation[] {
    const data = localStorage.getItem(STORAGE_KEYS.EVALUATIONS);
    if (!data) return [];
    try {
      return JSON.parse(data);
    } catch {
      return [];
    }
  }

  static saveEvaluation(evaluation: WalletEvaluation) {
    const list = this.getEvaluations();
    const filtered = list.filter((e) => e.address.toLowerCase() !== evaluation.address.toLowerCase());
    filtered.unshift(evaluation);
    localStorage.setItem(STORAGE_KEYS.EVALUATIONS, JSON.stringify(filtered.slice(0, 50)));
  }

  static getProtocolStats(): ProtocolStats {
    const loans = this.getLoans();
    const config = this.getAdminConfig();
    const tiers = this.getTiers();

    const totalAvailable = tiers.reduce((acc, t) => acc + t.fundsAvailableUSDC, 0);
    const totalLent = loans.reduce((acc, l) => acc + l.principalAmount, 0);
    const repaidLoans = loans.filter((l) => l.status === 'repaid');
    const totalRepayments = repaidLoans.reduce((acc, l) => acc + l.principalAmount, 0);
    const totalCommissionsEarned = loans.reduce((acc, l) => acc + l.commissionAmount, 0);

    const activeLoans = loans.filter((l) => l.status === 'active');
    const uniqueBorrowers = new Set(loans.map((l) => l.borrowerAddress.toLowerCase())).size;
    const avgLoan = loans.length > 0 ? totalLent / loans.length : 0;
    const defaultedLoans = loans.filter((l) => l.status === 'defaulted');
    const defaultRate = loans.length > 0 ? (defaultedLoans.length / loans.length) * 100 : 0;

    return {
      totalUsdcAvailable: Math.max(totalAvailable, config.totalLiquidityPoolUSDC - totalLent + totalRepayments),
      totalUsdcLent: totalLent,
      totalRepayments: totalRepayments,
      totalCommissionsEarned: totalCommissionsEarned,
      totalBorrowersCount: Math.max(uniqueBorrowers, 48),
      activeLoansCount: activeLoans.length + 110, // protocol baseline active
      averageLoanAmount: Math.round(avgLoan || 620),
      defaultRatePercent: Number(defaultRate.toFixed(1)),
    };
  }
}
