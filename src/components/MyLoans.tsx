import React, { useState, useEffect } from 'react';
import { Loan, Web3WalletState } from '../types';
import { Clock, CheckCircle2, AlertTriangle, ArrowUpRight, ShieldCheck, RefreshCw, DollarSign, Gift, HelpCircle } from 'lucide-react';
import { OPTIMISM_EXPLORER_URL } from '../contracts/contractInfo';

interface MyLoansProps {
  loans: Loan[];
  walletState: Web3WalletState;
  onOpenRepayModal: (loan: Loan) => void;
  onOpenBorrow: () => void;
  onRefresh: () => void;
  onOpenHelp?: () => void;
}

// Subcomponent for live ticking countdown (DAYS : HOURS : MINUTES : SECONDS)
export const LoanCountdownClock: React.FC<{ expiresAt: number; isRepaid: boolean }> = ({
  expiresAt,
  isRepaid,
}) => {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    isOverdue: boolean;
  }>({ days: 0, hours: 0, minutes: 0, seconds: 0, isOverdue: false });

  useEffect(() => {
    if (isRepaid) return;

    const calc = () => {
      const now = Date.now();
      const diff = expiresAt - now;

      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isOverdue: true });
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds, isOverdue: false });
    };

    calc();
    const interval = setInterval(calc, 1000);
    return () => clearInterval(interval);
  }, [expiresAt, isRepaid]);

  if (isRepaid) {
    return (
      <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-mono font-medium">
        <CheckCircle2 className="w-3.5 h-3.5" />
        <span>REPAID & SETTLED</span>
      </div>
    );
  }

  if (timeLeft.isOverdue) {
    return (
      <div className="flex items-center gap-1.5 text-xs text-red-400 font-mono font-bold animate-pulse">
        <AlertTriangle className="w-3.5 h-3.5" />
        <span>OVERDUE · SETTLE IMMEDIATELY</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 font-mono">
      <div className="flex items-center gap-1 text-slate-900 dark:text-slate-100 font-bold tabular-nums text-xs sm:text-sm">
        <span className="bg-slate-100 dark:bg-[#090c10] px-1.5 py-0.5 rounded border border-slate-200 dark:border-[#21262d]">
          {timeLeft.days.toString().padStart(2, '0')}d
        </span>
        <span className="text-slate-400 dark:text-slate-500">:</span>
        <span className="bg-slate-100 dark:bg-[#090c10] px-1.5 py-0.5 rounded border border-slate-200 dark:border-[#21262d]">
          {timeLeft.hours.toString().padStart(2, '0')}h
        </span>
        <span className="text-slate-400 dark:text-slate-500">:</span>
        <span className="bg-slate-100 dark:bg-[#090c10] px-1.5 py-0.5 rounded border border-slate-200 dark:border-[#21262d]">
          {timeLeft.minutes.toString().padStart(2, '0')}m
        </span>
        <span className="text-slate-400 dark:text-slate-500">:</span>
        <span className="bg-slate-100 dark:bg-[#090c10] px-1.5 py-0.5 rounded border border-slate-200 dark:border-[#21262d] text-[#ff0420]">
          {timeLeft.seconds.toString().padStart(2, '0')}s
        </span>
      </div>
    </div>
  );
};

export const MyLoans: React.FC<MyLoansProps> = ({
  loans,
  walletState,
  onOpenRepayModal,
  onOpenBorrow,
  onRefresh,
  onOpenHelp,
}) => {
  const [filter, setFilter] = useState<'all' | 'active' | 'repaid' | 'overdue'>('all');

  const userAddress = walletState.address?.toLowerCase();
  const userLoans = loans.filter((l) =>
    userAddress ? l.borrowerAddress.toLowerCase() === userAddress : true
  );

  const filteredLoans = userLoans.filter((loan) => {
    if (filter === 'all') return true;
    if (filter === 'active') return loan.status === 'active';
    if (filter === 'repaid') return loan.status === 'repaid';
    if (filter === 'overdue') return loan.status === 'overdue' || (loan.status === 'active' && Date.now() > loan.expiresAt);
    return true;
  });

  const totalBorrowed = userLoans.reduce((acc, l) => acc + l.principalAmount, 0);
  const totalActiveRepayment = userLoans
    .filter((l) => l.status === 'active')
    .reduce((acc, l) => acc + l.principalAmount, 0);
  const totalCollateralLocked = userLoans
    .filter((l) => l.status === 'active')
    .reduce((acc, l) => acc + l.collateralAmount, 0);
  const totalCollateralRefunded = userLoans
    .filter((l) => l.collateralRefunded)
    .reduce((acc, l) => acc + l.collateralAmount, 0);

  return (
    <div className="space-y-6">
      {/* Top Header & Metrics summary for Borrower */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            My Loan Portfolio
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
            Track active positions, live repayment deadlines, and automated collateral refunds.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {onOpenHelp && (
            <button
              onClick={onOpenHelp}
              className="px-3 py-2 bg-slate-100 dark:bg-[#161b22] hover:bg-slate-200 dark:hover:bg-[#21262d] border border-slate-300 dark:border-[#30363d] text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <HelpCircle className="w-3.5 h-3.5 text-[#ff0420]" />
              <span>Repayment FAQs</span>
            </button>
          )}
          <button
            onClick={onRefresh}
            title="Refresh on-chain state"
            className="p-2 bg-slate-100 dark:bg-[#161b22] hover:bg-slate-200 dark:hover:bg-[#21262d] border border-slate-200 dark:border-[#30363d] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-lg transition-colors cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={onOpenBorrow}
            className="px-4 py-2 bg-[#ff0420] hover:bg-[#e0001a] text-white text-xs font-bold rounded-lg transition-colors shadow-md shadow-[#ff0420]/20 flex items-center gap-1.5 cursor-pointer"
          >
            <span>Borrow USDC</span>
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Borrower KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-white dark:bg-[#121721] border border-slate-200 dark:border-[#21262d] shadow-sm">
          <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase">Total Borrowed</span>
          <div className="text-lg font-bold font-mono text-slate-900 dark:text-white mt-1 tabular-nums">
            ${totalBorrowed.toLocaleString()} USDC
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-[#121721] border border-slate-200 dark:border-[#21262d] shadow-sm">
          <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase">Outstanding Repayment</span>
          <div className="text-lg font-bold font-mono text-amber-600 dark:text-amber-400 mt-1 tabular-nums">
            ${totalActiveRepayment.toLocaleString()} USDC
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-[#121721] border border-slate-200 dark:border-[#21262d] shadow-sm">
          <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase">Collateral Locked</span>
          <div className="text-lg font-bold font-mono text-slate-800 dark:text-slate-200 mt-1 tabular-nums">
            ${totalCollateralLocked.toLocaleString()} USDC
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-[#121721] border border-slate-200 dark:border-[#21262d] shadow-sm">
          <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase">Collateral Recovered</span>
          <div className="text-lg font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-1 tabular-nums">
            ${totalCollateralRefunded.toLocaleString()} USDC
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 p-1 bg-slate-100 dark:bg-[#121721] border border-slate-200 dark:border-[#21262d] rounded-lg w-fit text-xs font-medium">
        {(['all', 'active', 'repaid', 'overdue'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setFilter(t)}
            className={`px-3 py-1.5 rounded-md capitalize transition-colors cursor-pointer ${
              filter === t
                ? 'bg-white dark:bg-[#21262d] text-slate-900 dark:text-white shadow-xs font-semibold'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {t} ({userLoans.filter((l) => (t === 'all' ? true : t === 'active' ? l.status === 'active' : t === 'repaid' ? l.status === 'repaid' : l.status === 'overdue')).length})
          </button>
        ))}
      </div>

      {/* Loans Grid / Cards */}
      {filteredLoans.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-[#121721] border border-slate-200 dark:border-[#21262d] rounded-xl space-y-3 shadow-sm">
          <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-[#161b22] border border-slate-200 dark:border-[#30363d] flex items-center justify-center mx-auto text-slate-500 dark:text-slate-400">
            <Clock className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">No Loans Found</h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 max-w-sm mx-auto">
            You currently have no loans under the &quot;{filter}&quot; filter. Apply on the marketplace to access instant USDC credit on Optimism.
          </p>
          <button
            onClick={onOpenBorrow}
            className="mt-2 px-4 py-2 bg-[#ff0420] hover:bg-[#e0001a] text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
          >
            Explore Loan Categories
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredLoans.map((loan) => {
            const isRepaid = loan.status === 'repaid';
            const isOverdue = loan.status === 'overdue' || (!isRepaid && Date.now() > loan.expiresAt);

            return (
              <div
                key={loan.id}
                className="bg-white dark:bg-[#121721] border border-slate-200 dark:border-[#21262d] rounded-xl p-5 sm:p-6 flex flex-col justify-between space-y-5 hover:border-slate-300 dark:hover:border-[#30363d] transition-all shadow-sm"
              >
                <div>
                  {/* Top Bar of Card */}
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-[#21262d]">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-900 dark:text-white text-sm">
                        #{loan.id}
                      </span>
                      <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-[#161b22] border border-slate-200 dark:border-[#30363d] text-slate-700 dark:text-slate-300">
                        {loan.tierId}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {isRepaid ? (
                        <span className="text-xs font-mono font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          REPAID
                        </span>
                      ) : isOverdue ? (
                        <span className="text-xs font-mono font-semibold text-red-600 dark:text-red-400 flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          OVERDUE
                        </span>
                      ) : (
                        <span className="text-xs font-mono font-semibold text-sky-600 dark:text-cyan-300 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          ACTIVE
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Countdown Timer Block (Prompt requirement: DAYS : HOURS : MINUTES : SECONDS) */}
                  <div className="mt-4 p-3.5 bg-slate-50 dark:bg-[#090c10] border border-slate-200 dark:border-[#21262d] rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Repayment Deadline Countdown:
                    </span>
                    <LoanCountdownClock expiresAt={loan.expiresAt} isRepaid={isRepaid} />
                  </div>

                  {/* Detailed Financial Accounting */}
                  <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
                    <div className="p-3 bg-slate-50/80 dark:bg-[#161b22]/60 rounded-lg border border-slate-200 dark:border-[#21262d]">
                      <span className="text-slate-500 dark:text-slate-400">Principal Amount:</span>
                      <div className="font-mono font-bold text-slate-900 dark:text-white text-sm mt-0.5 tabular-nums">
                        {loan.principalAmount.toFixed(2)} USDC
                      </div>
                    </div>

                    <div className="p-3 bg-slate-50/80 dark:bg-[#161b22]/60 rounded-lg border border-slate-200 dark:border-[#21262d]">
                      <span className="text-slate-500 dark:text-slate-400">Net Disbursed:</span>
                      <div className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-sm mt-0.5 tabular-nums">
                        {loan.disbursedAmount.toFixed(2)} USDC
                      </div>
                    </div>

                    <div className="p-3 bg-slate-50/80 dark:bg-[#161b22]/60 rounded-lg border border-slate-200 dark:border-[#21262d]">
                      <span className="text-slate-500 dark:text-slate-400">Commission Paid ({loan.commissionPercent}%):</span>
                      <div className="font-mono text-slate-700 dark:text-slate-300 mt-0.5 tabular-nums">
                        {loan.commissionAmount.toFixed(2)} USDC
                      </div>
                    </div>

                    <div className="p-3 bg-slate-50/80 dark:bg-[#161b22]/60 rounded-lg border border-slate-200 dark:border-[#21262d]">
                      <span className="text-slate-500 dark:text-slate-400">Collateral ({loan.collateralPercent}%):</span>
                      <div className="font-mono font-semibold text-amber-600 dark:text-amber-300 mt-0.5 tabular-nums flex items-center justify-between">
                        <span>{loan.collateralAmount.toFixed(2)} USDC</span>
                        {loan.collateralRefunded && (
                          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-normal">Refunded ✓</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Dates & Timeline */}
                  <div className="mt-4 space-y-1 text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                    <div className="flex justify-between">
                      <span>Date Issued:</span>
                      <span className="text-slate-800 dark:text-slate-200">
                        {new Date(loan.issuedAt).toLocaleDateString()} {new Date(loan.issuedAt).toLocaleTimeString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Maturity Expiration:</span>
                      <span className="text-slate-800 dark:text-slate-200">
                        {new Date(loan.expiresAt).toLocaleDateString()} {new Date(loan.expiresAt).toLocaleTimeString()}
                      </span>
                    </div>
                    {loan.repaidAt && (
                      <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                        <span>Repaid On:</span>
                        <span>
                          {new Date(loan.repaidAt).toLocaleDateString()} {new Date(loan.repaidAt).toLocaleTimeString()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Action Footer */}
                <div className="pt-3 border-t border-slate-100 dark:border-[#21262d] flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-xs font-mono">
                    <a
                      href={`${OPTIMISM_EXPLORER_URL}/tx/${loan.txHashDisbursement}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors flex items-center gap-1"
                    >
                      <span>Disburse Tx</span>
                      <ArrowUpRight className="w-3 h-3" />
                    </a>
                    {loan.txHashRepayment && (
                      <a
                        href={`${OPTIMISM_EXPLORER_URL}/tx/${loan.txHashRepayment}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors flex items-center gap-1"
                      >
                        <span>Repay Tx</span>
                        <ArrowUpRight className="w-3 h-3" />
                      </a>
                    )}
                  </div>

                  {!isRepaid ? (
                    <button
                      onClick={() => onOpenRepayModal(loan)}
                      className="px-4 py-2 bg-[#ff0420] hover:bg-[#e0001a] text-white text-xs font-bold rounded-lg transition-colors shadow-md shadow-[#ff0420]/20 flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>REPAY {loan.principalAmount} USDC</span>
                      <Gift className="w-3.5 h-3.5 text-amber-200" />
                    </button>
                  ) : (
                    <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-mono font-medium">
                      <Gift className="w-3.5 h-3.5" />
                      <span>Collateral ({loan.collateralAmount} USDC) Released</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
