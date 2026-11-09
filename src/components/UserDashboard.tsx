import React from 'react';
import { Loan, WalletEvaluation, Web3WalletState, LoanTier } from '../types';
import { StorageService } from '../services/storage';
import { 
  CreditCard, 
  Clock, 
  CheckCircle2, 
  ArrowUpRight, 
  ShieldCheck, 
  TrendingUp, 
  Layers, 
  DollarSign, 
  Gift, 
  ExternalLink,
  HelpCircle 
} from 'lucide-react';
import { OPTIMISM_EXPLORER_URL } from '../contracts/contractInfo';
import { LoanCountdownClock } from './MyLoans';
import { RiskAnalysisSection } from './RiskAnalysisSection';

interface UserDashboardProps {
  loans: Loan[];
  walletState: Web3WalletState;
  evaluations: WalletEvaluation[];
  tiers: LoanTier[];
  onOpenBorrow: () => void;
  onOpenMyLoans: () => void;
  onOpenRepayModal: (loan: Loan) => void;
  onReAnalyze: (addr: string) => void;
  onOpenHelp?: () => void;
}

export const UserDashboard: React.FC<UserDashboardProps> = ({
  loans,
  walletState,
  evaluations,
  tiers,
  onOpenBorrow,
  onOpenMyLoans,
  onOpenRepayModal,
  onReAnalyze,
  onOpenHelp,
}) => {
  const userAddress = walletState.address?.toLowerCase();
  const userLoans = loans.filter((l) =>
    userAddress ? l.borrowerAddress.toLowerCase() === userAddress : true
  );

  const activeLoans = userLoans.filter((l) => l.status === 'active');
  const completedLoans = userLoans.filter((l) => l.status === 'repaid');

  const totalBorrowed = userLoans.reduce((acc, l) => acc + l.principalAmount, 0);
  const totalRepaymentsOutstanding = activeLoans.reduce((acc, l) => acc + l.principalAmount, 0);
  const totalCollateralDeposited = userLoans.reduce((acc, l) => acc + l.collateralAmount, 0);
  const availableCollateralRefunds = completedLoans
    .filter((l) => l.collateralRefunded)
    .reduce((acc, l) => acc + l.collateralAmount, 0);

  // Derive credit level
  const lastUserEval = evaluations.find(
    (e) => userAddress && e.address.toLowerCase() === userAddress
  );
  const creditScore = lastUserEval ? lastUserEval.score : 650;
  const creditLevelName =
    creditScore >= 850
      ? 'Tier 1 Prime (Platinum/Premium)'
      : creditScore >= 700
      ? 'Tier 2 Established (Gold/Silver)'
      : creditScore >= 550
      ? 'Tier 3 Standard (Basic)'
      : 'Tier 4 Emerging (Starter)';

  return (
    <div className="space-y-8">
      {/* Welcome Banner & Credit Level */}
      <div className="bg-white dark:bg-[#121721] border border-slate-200 dark:border-[#21262d] rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm transition-colors duration-200">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-[#ff0420] uppercase tracking-wider font-semibold">
            <span>Optimism Mainnet</span>
            <span>·</span>
            <span>Circle USDC Escrow</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-1">
            DeFi Credit Dashboard
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-2 max-w-xl leading-relaxed">
            Non-custodial micro-credit and institutional liquidity. Automated 15% collateral lock with immediate refund upon repayment confirmation.
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-4 text-xs font-mono">
            <div className="flex items-center gap-2 bg-slate-100 dark:bg-[#090c10] px-3 py-1.5 rounded-lg border border-slate-200 dark:border-[#21262d]">
              <span className="text-slate-500 dark:text-slate-400">Credit Standing:</span>
              <span className="font-bold text-slate-900 dark:text-white">{creditLevelName}</span>
              <span className="text-cyan-600 dark:text-cyan-400 font-bold">({creditScore} pts)</span>
            </div>

            {walletState.address && (
              <div className="flex items-center gap-2 bg-slate-100 dark:bg-[#090c10] px-3 py-1.5 rounded-lg border border-slate-200 dark:border-[#21262d] text-slate-700 dark:text-slate-300">
                <span className="text-slate-500 dark:text-slate-400">Connected:</span>
                <span className="text-slate-800 dark:text-slate-200">
                  {walletState.address.slice(0, 6)}...{walletState.address.slice(-4)}
                </span>
                <a
                  href={`${OPTIMISM_EXPLORER_URL}/address/${walletState.address}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-slate-900 dark:hover:text-white"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row md:flex-col gap-2.5 shrink-0">
          <button
            onClick={onOpenBorrow}
            className="px-6 py-2.5 bg-[#ff0420] hover:bg-[#e0001a] text-white text-xs font-bold rounded-lg transition-all shadow-md shadow-[#ff0420]/20 flex items-center justify-center gap-2 active:scale-[0.98] cursor-pointer"
          >
            <span>APPLY FOR LOAN</span>
            <ArrowUpRight className="w-4 h-4" />
          </button>
          <button
            onClick={onOpenMyLoans}
            className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-[#161b22] dark:hover:bg-[#21262d] border border-slate-300 dark:border-[#30363d] text-slate-800 dark:text-slate-200 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>VIEW MY LOANS ({userLoans.length})</span>
          </button>
          {onOpenHelp && (
            <button
              onClick={onOpenHelp}
              className="px-6 py-2 bg-slate-100/70 hover:bg-slate-200 dark:bg-[#0d1117] dark:hover:bg-[#161b22] border border-slate-200 dark:border-[#21262d] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white text-xs font-medium rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <HelpCircle className="w-3.5 h-3.5 text-[#ff0420]" />
              <span>How Lending Works</span>
            </button>
          )}
        </div>
      </div>

      {/* KPI Grid (Prompt item 7 requirements) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total USDC Borrowed */}
        <div className="p-5 rounded-xl bg-white dark:bg-[#121721] border border-slate-200 dark:border-[#21262d] shadow-sm transition-colors duration-200">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Total USDC Borrowed
          </span>
          <div className="text-2xl font-extrabold font-mono text-slate-900 dark:text-white mt-1.5 tabular-nums">
            ${totalBorrowed.toLocaleString('en-US', { minimumFractionDigits: 0 })}
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">
            {userLoans.length} total loans issued
          </span>
        </div>

        {/* Outstanding Repayments */}
        <div className="p-5 rounded-xl bg-white dark:bg-[#121721] border border-slate-200 dark:border-[#21262d] shadow-sm transition-colors duration-200">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Outstanding Due
          </span>
          <div className="text-2xl font-extrabold font-mono text-amber-600 dark:text-amber-400 mt-1.5 tabular-nums">
            ${totalRepaymentsOutstanding.toLocaleString('en-US', { minimumFractionDigits: 0 })}
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">
            {activeLoans.length} active positions
          </span>
        </div>

        {/* Total Collateral Deposited */}
        <div className="p-5 rounded-xl bg-white dark:bg-[#121721] border border-slate-200 dark:border-[#21262d] shadow-sm transition-colors duration-200">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Collateral Deposited (15%)
          </span>
          <div className="text-2xl font-extrabold font-mono text-slate-800 dark:text-slate-200 mt-1.5 tabular-nums">
            ${totalCollateralDeposited.toLocaleString('en-US', { minimumFractionDigits: 0 })}
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">
            Escrow collateral security
          </span>
        </div>

        {/* Available Collateral Refunds */}
        <div className="p-5 rounded-xl bg-white dark:bg-[#121721] border border-slate-200 dark:border-[#21262d] shadow-sm transition-colors duration-200">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Collateral Recovered
          </span>
          <div className="text-2xl font-extrabold font-mono text-emerald-600 dark:text-emerald-400 mt-1.5 tabular-nums">
            ${availableCollateralRefunds.toLocaleString('en-US', { minimumFractionDigits: 0 })}
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">
            {completedLoans.length} completed loans
          </span>
        </div>
      </div>

      {/* Historical Collateral vs Repayment Risk Analysis (D3.js Visualization) */}
      <RiskAnalysisSection loans={loans} />

      {/* Featured Section: MY LOANS (Recent Active Loans) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">MY LOANS</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Active positions with real-time countdown clocks.
            </p>
          </div>
          <button
            onClick={onOpenMyLoans}
            className="text-xs text-[#ff0420] hover:text-[#ff384e] font-semibold flex items-center gap-1"
          >
            <span>See all loans</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {activeLoans.length === 0 ? (
          <div className="p-8 text-center bg-white dark:bg-[#121721] border border-slate-200 dark:border-[#21262d] rounded-xl space-y-2 shadow-sm">
            <p className="text-xs text-slate-500 dark:text-slate-400">No active loans outstanding.</p>
            <button
              onClick={onOpenBorrow}
              className="text-xs font-bold text-[#ff0420] hover:underline"
            >
              Request a new USDC loan →
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeLoans.slice(0, 2).map((loan) => (
              <div
                key={loan.id}
                className="bg-white dark:bg-[#121721] border border-slate-200 dark:border-[#21262d] rounded-xl p-5 space-y-4 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-slate-900 dark:text-white text-sm">#{loan.id}</span>
                    <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-[#161b22] border border-slate-300 dark:border-[#30363d] text-slate-700 dark:text-slate-300">
                      {loan.tierId}
                    </span>
                  </div>
                  <span className="text-xs font-mono text-cyan-600 dark:text-cyan-300 font-semibold">ACTIVE</span>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-[#090c10] border border-slate-200 dark:border-[#21262d] rounded-lg flex items-center justify-between">
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Repayment In:</span>
                  <LoanCountdownClock expiresAt={loan.expiresAt} isRepaid={loan.status === 'repaid'} />
                </div>

                <div className="flex justify-between items-center text-xs">
                  <div>
                    <span className="text-slate-500 dark:text-slate-400 block">Principal Due:</span>
                    <span className="font-mono font-bold text-slate-900 dark:text-white text-base">
                      {loan.principalAmount} USDC
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 dark:text-slate-400 block text-right">Collateral Locked:</span>
                    <span className="font-mono font-bold text-amber-600 dark:text-amber-300 text-base">
                      {loan.collateralAmount} USDC
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => onOpenRepayModal(loan)}
                  className="w-full py-2.5 bg-[#ff0420] hover:bg-[#e0001a] text-white text-xs font-bold rounded-lg transition-colors shadow-sm"
                >
                  Repay Now & Release Collateral
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Wallet Evaluation History */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
              Wallet Evaluation History
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Audit log of addresses analyzed for credit line eligibility.
            </p>
          </div>
        </div>

        {evaluations.length === 0 ? (
          <div className="p-6 text-center bg-white dark:bg-[#121721] border border-slate-200 dark:border-[#21262d] rounded-xl text-xs text-slate-500 dark:text-slate-400 shadow-sm">
            No wallet addresses evaluated yet. Enter an address in the marketplace to perform an evaluation.
          </div>
        ) : (
          <div className="border border-slate-200 dark:border-[#21262d] rounded-xl overflow-hidden bg-white dark:bg-[#121721] shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-[#090c10] border-b border-slate-200 dark:border-[#21262d] text-slate-500 dark:text-slate-400 uppercase font-mono text-[11px]">
                  <tr>
                    <th className="py-3 px-4">Address</th>
                    <th className="py-3 px-4">Evaluated</th>
                    <th className="py-3 px-4">Score</th>
                    <th className="py-3 px-4">Risk Level</th>
                    <th className="py-3 px-4">Max Suggested</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-[#21262d]/60 font-mono">
                  {evaluations.slice(0, 5).map((ev) => (
                    <tr key={ev.id} className="hover:bg-slate-50 dark:hover:bg-[#161b22]/50 transition-colors">
                      <td className="py-3 px-4 font-semibold text-slate-800 dark:text-slate-200">
                        {ev.address.slice(0, 8)}...{ev.address.slice(-6)}
                      </td>
                      <td className="py-3 px-4 text-slate-500 dark:text-slate-400 font-sans">
                        {new Date(ev.evaluatedAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 font-bold text-cyan-600 dark:text-cyan-300">
                        {ev.score}
                      </td>
                      <td className="py-3 px-4 text-slate-700 dark:text-slate-300">
                        {ev.riskLevel}
                      </td>
                      <td className="py-3 px-4 text-slate-900 dark:text-white font-bold">
                        {ev.maxSuggestedAmount} USDC
                      </td>
                      <td className="py-3 px-4">
                        {ev.isEligible ? (
                          <span className="text-emerald-600 dark:text-emerald-400 font-semibold">APPROVED</span>
                        ) : (
                          <span className="text-amber-600 dark:text-amber-400 font-semibold">RESTRICTED</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right font-sans">
                        <button
                          onClick={() => onReAnalyze(ev.address)}
                          className="text-[#ff0420] hover:underline font-semibold"
                        >
                          Re-Analyze
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
