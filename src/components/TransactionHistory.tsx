import React, { useState } from 'react';
import { TransactionRecord } from '../types';
import { OPTIMISM_EXPLORER_URL } from '../contracts/contractInfo';
import { ArrowUpRight, CheckCircle2, Clock, Filter, Search, Download, Check } from 'lucide-react';

interface TransactionHistoryProps {
  transactions: TransactionRecord[];
}

export const TransactionHistory: React.FC<TransactionHistoryProps> = ({ transactions }) => {
  const [filterType, setFilterType] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportSuccess, setExportSuccess] = useState<boolean>(false);

  const filtered = transactions.filter((tx) => {
    if (filterType !== 'ALL' && tx.type !== filterType) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        tx.hash.toLowerCase().includes(q) ||
        tx.address.toLowerCase().includes(q) ||
        tx.description.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleExportCSV = () => {
    setIsExporting(true);

    try {
      // CSV Headers
      const headers = [
        'Transaction ID',
        'Date UTC',
        'Unix Timestamp ms',
        'Transaction Type',
        'Amount',
        'Token Symbol',
        'Wallet Address',
        'Transaction Hash',
        'Optimism Block Number',
        'Confirmation Status',
        'Network',
        'Explorer URL',
        'Accounting Description',
      ];

      // Escape helper
      const escapeCSV = (val: string | number | undefined | null) => {
        if (val === undefined || val === null) return '""';
        const str = String(val);
        if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
          return `"${str.replace(/"/g, '""')}"`;
        }
        return `"${str}"`;
      };

      const rows = filtered.map((tx) => [
        escapeCSV(tx.id),
        escapeCSV(new Date(tx.timestamp).toISOString()),
        escapeCSV(tx.timestamp),
        escapeCSV(tx.type),
        escapeCSV(tx.amount),
        escapeCSV(tx.token),
        escapeCSV(tx.address),
        escapeCSV(tx.hash),
        escapeCSV(tx.blockNumber),
        escapeCSV(tx.status),
        escapeCSV('Optimism Mainnet (Chain ID 10)'),
        escapeCSV(`${OPTIMISM_EXPLORER_URL}/tx/${tx.hash}`),
        escapeCSV(tx.description),
      ]);

      const csvContent = [
        headers.join(','),
        ...rows.map((row) => row.join(',')),
      ].join('\r\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const dateStr = new Date().toISOString().split('T')[0];
      link.setAttribute('download', `optimism_lending_transactions_${dateStr}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 2500);
    } catch (err) {
      console.error('Failed to export CSV:', err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Optimism On-Chain Transactions
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
            Verifiable ledger of all borrowing, collateral locking, repayments, and protocol events.
          </p>
        </div>

        {/* Search, Filter & CSV Export Toolbar */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 sm:flex-initial">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tx hash, address..."
              className="bg-white dark:bg-[#121721] border border-slate-300 dark:border-[#21262d] focus:border-[#ff0420] text-xs text-slate-900 dark:text-white rounded-lg pl-9 pr-3 py-2 outline-none w-full sm:w-52 placeholder:text-slate-400 shadow-sm transition-colors"
            />
          </div>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="bg-white dark:bg-[#121721] border border-slate-300 dark:border-[#21262d] text-xs text-slate-800 dark:text-slate-300 rounded-lg px-3 py-2 outline-none font-medium shadow-sm transition-colors"
          >
            <option value="ALL">All Types ({transactions.length})</option>
            <option value="BORROW">Disbursements (BORROW)</option>
            <option value="REPAY">Repayments (REPAY)</option>
            <option value="COLLATERAL_DEPOSIT">Collateral Deposits</option>
            <option value="COLLATERAL_REFUND">Collateral Refunds</option>
            <option value="ADMIN_LIQUIDITY_ADD">Pool Liquidity</option>
          </select>

          {/* Export to CSV Button */}
          <button
            onClick={handleExportCSV}
            disabled={isExporting || filtered.length === 0}
            title="Download personal loan and repayment records for tax & accounting purposes (CSV)"
            className={`px-3.5 py-2 text-xs font-semibold rounded-lg border transition-all flex items-center gap-1.5 shrink-0 shadow-sm ${
              exportSuccess
                ? 'bg-emerald-50 text-emerald-800 border-emerald-400 dark:bg-emerald-950/60 dark:border-emerald-600/60 dark:text-emerald-300'
                : 'bg-white hover:bg-slate-50 dark:bg-[#161b22] dark:hover:bg-[#21262d] border-slate-300 dark:border-[#30363d] text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white'
            } disabled:opacity-50`}
          >
            {exportSuccess ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Exported ({filtered.length})</span>
              </>
            ) : (
              <>
                <Download className="w-3.5 h-3.5 text-[#ff0420]" />
                <span>Export to CSV</span>
              </>
            )}
          </button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-[#121721] border border-slate-200 dark:border-[#21262d] rounded-xl text-xs text-slate-500 dark:text-slate-400 shadow-sm">
          No transactions found matching your criteria.
        </div>
      ) : (
        <div className="border border-slate-200 dark:border-[#21262d] rounded-xl overflow-hidden bg-white dark:bg-[#121721] shadow-sm transition-colors duration-200">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-[#090c10] border-b border-slate-200 dark:border-[#21262d] text-slate-500 dark:text-slate-400 uppercase font-mono text-[11px]">
                <tr>
                  <th className="py-3.5 px-4">Tx Hash</th>
                  <th className="py-3.5 px-4">Type</th>
                  <th className="py-3.5 px-4">Amount</th>
                  <th className="py-3.5 px-4">Address</th>
                  <th className="py-3.5 px-4">Block</th>
                  <th className="py-3.5 px-4">Time</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Explorer</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-[#21262d]/60 font-mono">
                {filtered.map((tx) => {
                  const typeColors: Record<string, string> = {
                    BORROW: 'text-[#ff0420] bg-red-50 dark:bg-[#ff0420]/10 border-red-200 dark:border-[#ff0420]/30',
                    REPAY: 'text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/40',
                    COLLATERAL_DEPOSIT: 'text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800/40',
                    COLLATERAL_REFUND: 'text-cyan-800 dark:text-cyan-300 bg-cyan-50 dark:bg-cyan-950/40 border-cyan-200 dark:border-cyan-800/40',
                    ADMIN_LIQUIDITY_ADD: 'text-purple-800 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/40 border-purple-200 dark:border-purple-800/40',
                    FAUCET_MINT: 'text-blue-800 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800/40',
                  };

                  return (
                    <tr key={tx.id} className="hover:bg-slate-50 dark:hover:bg-[#161b22]/50 transition-colors">
                      <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-white">
                        {tx.hash.slice(0, 10)}...{tx.hash.slice(-8)}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                            typeColors[tx.type] || 'text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          {tx.type}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white tabular-nums">
                        {tx.amount > 0 ? `${tx.amount.toLocaleString()} ${tx.token}` : '—'}
                      </td>
                      <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300">
                        {tx.address.slice(0, 6)}...{tx.address.slice(-4)}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400 font-mono">
                        #{tx.blockNumber}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400 font-sans text-[11px]">
                        {new Date(tx.timestamp).toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 text-[11px] font-medium font-sans">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Confirmed</span>
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right font-sans">
                        <a
                          href={`${OPTIMISM_EXPLORER_URL}/tx/${tx.hash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
                        >
                          <span>Etherscan</span>
                          <ArrowUpRight className="w-3 h-3" />
                        </a>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
