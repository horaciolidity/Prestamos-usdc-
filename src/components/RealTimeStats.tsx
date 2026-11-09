import React, { useEffect, useState } from 'react';
import { ProtocolStats } from '../types';
import { StorageService } from '../services/storage';

interface RealTimeStatsProps {
  statsRefreshTrigger?: number;
}

export const RealTimeStats: React.FC<RealTimeStatsProps> = ({ statsRefreshTrigger }) => {
  const [stats, setStats] = useState<ProtocolStats>(() => StorageService.getProtocolStats());

  useEffect(() => {
    const updated = StorageService.getProtocolStats();
    setStats(updated);
  }, [statsRefreshTrigger]);

  // Periodic subtle tick to reflect live protocol counters
  useEffect(() => {
    const interval = setInterval(() => {
      setStats(StorageService.getProtocolStats());
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const formatCurrency = (val: number) =>
    val.toLocaleString('en-US', { maximumFractionDigits: 0 });

  return (
    <section className="bg-slate-100 dark:bg-[#0e131d] border-y border-slate-200 dark:border-[#21262d] py-3.5 px-4 sm:px-6 lg:px-8 transition-colors duration-200">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-200 dark:divide-[#21262d]/60">
          {/* Total USDC Available */}
          <div className="flex flex-col pt-2 sm:pt-0 sm:px-3 first:pl-0">
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Total Available
            </span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="font-mono text-base lg:text-lg font-bold text-slate-900 dark:text-white tabular-nums">
                ${formatCurrency(stats.totalUsdcAvailable)}
              </span>
              <span className="text-[10px] font-mono text-[#ff0420] font-semibold">USDC</span>
            </div>
          </div>

          {/* Total USDC Lent */}
          <div className="flex flex-col pt-2 sm:pt-0 sm:px-3">
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Total Lent
            </span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="font-mono text-base lg:text-lg font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                ${formatCurrency(stats.totalUsdcLent)}
              </span>
              <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">USDC</span>
            </div>
          </div>

          {/* Total Repayments */}
          <div className="flex flex-col pt-2 sm:pt-0 sm:px-3">
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Total Repaid
            </span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="font-mono text-base lg:text-lg font-bold text-slate-900 dark:text-white tabular-nums">
                ${formatCurrency(stats.totalRepayments)}
              </span>
              <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400">USDC</span>
            </div>
          </div>

          {/* Active Loans */}
          <div className="flex flex-col pt-2 sm:pt-0 sm:px-3">
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Active Loans
            </span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="font-mono text-base lg:text-lg font-bold text-cyan-700 dark:text-cyan-300 tabular-nums">
                {stats.activeLoansCount}
              </span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400">loans</span>
            </div>
          </div>

          {/* Borrowers Count */}
          <div className="flex flex-col pt-2 sm:pt-0 sm:px-3">
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Borrowers
            </span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="font-mono text-base lg:text-lg font-bold text-slate-900 dark:text-white tabular-nums">
                {stats.totalBorrowersCount}
              </span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400">wallets</span>
            </div>
          </div>

          {/* Average Loan */}
          <div className="flex flex-col pt-2 sm:pt-0 sm:px-3">
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Avg Loan Size
            </span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="font-mono text-base lg:text-lg font-bold text-slate-900 dark:text-white tabular-nums">
                ${formatCurrency(stats.averageLoanAmount)}
              </span>
              <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">USDC</span>
            </div>
          </div>

          {/* Platform Commissions */}
          <div className="flex flex-col pt-2 sm:pt-0 sm:px-3">
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Protocol Rev (15%)
            </span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="font-mono text-base lg:text-lg font-bold text-[#ff0420] tabular-nums">
                ${formatCurrency(stats.totalCommissionsEarned)}
              </span>
              <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">USDC</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
