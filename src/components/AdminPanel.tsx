import React, { useState } from 'react';
import { 
  AdminConfig, 
  LoanTier, 
  Loan, 
  WalletEvaluation, 
  AuditLogEntry, 
  Web3WalletState,
  ProtocolStats 
} from '../types';
import { StorageService } from '../services/storage';
import { 
  Settings, 
  PauseCircle, 
  PlayCircle, 
  PlusCircle, 
  MinusCircle, 
  ShieldAlert, 
  FileText, 
  TrendingUp, 
  Users, 
  CheckCircle2, 
  AlertTriangle, 
  Sliders, 
  Save, 
  RefreshCw,
  DollarSign
} from 'lucide-react';

interface AdminPanelProps {
  adminConfig: AdminConfig;
  onUpdateConfig: (newConfig: AdminConfig) => void;
  tiers: LoanTier[];
  onUpdateTiers: (newTiers: LoanTier[]) => void;
  loans: Loan[];
  evaluations: WalletEvaluation[];
  auditLogs: AuditLogEntry[];
  walletState: Web3WalletState;
  onRefresh: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  adminConfig,
  onUpdateConfig,
  tiers,
  onUpdateTiers,
  loans,
  evaluations,
  auditLogs,
  walletState,
  onRefresh,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'tiers' | 'liquidity' | 'loans' | 'evaluations' | 'audit'>('overview');

  // Local state for configuration forms
  const [commissionPercent, setCommissionPercent] = useState<number>(adminConfig.platformCommissionPercent);
  const [collateralPercent, setCollateralPercent] = useState<number>(adminConfig.requiredCollateralPercent);
  const [liquidityAddAmount, setLiquidityAddAmount] = useState<number>(50000);
  const [liquidityWithdrawAmount, setLiquidityWithdrawAmount] = useState<number>(10000);
  const [repaymentDays15, setRepaymentDays15] = useState<boolean>(true);
  const [repaymentDays30, setRepaymentDays30] = useState<boolean>(true);
  const [repaymentDays45, setRepaymentDays45] = useState<boolean>(true);
  const [repaymentDays60, setRepaymentDays60] = useState<boolean>(true);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Editable tiers clone
  const [editableTiers, setEditableTiers] = useState<LoanTier[]>(() => JSON.parse(JSON.stringify(tiers)));

  const stats: ProtocolStats = StorageService.getProtocolStats();
  const currentAdmin = walletState.address || adminConfig.emergencyAdminAddress;

  const handleSaveFinancialPolicy = () => {
    const periods: number[] = [];
    if (repaymentDays15) periods.push(15);
    if (repaymentDays30) periods.push(30);
    if (repaymentDays45) periods.push(45);
    if (repaymentDays60) periods.push(60);

    const updated: AdminConfig = {
      ...adminConfig,
      platformCommissionPercent: commissionPercent,
      requiredCollateralPercent: collateralPercent,
      allowedRepaymentPeriods: periods.length > 0 ? periods : [15, 30, 45, 60],
    };

    onUpdateConfig(updated);
    StorageService.addAuditLog({
      adminAddress: currentAdmin,
      action: 'UPDATE_FINANCIAL_POLICY',
      details: `Commission set to ${commissionPercent}%, Collateral to ${collateralPercent}%, Periods: [${periods.join(', ')}]`,
    });

    setStatusMessage('Financial parameters successfully updated and verified.');
    setTimeout(() => setStatusMessage(null), 3000);
  };

  const handleTogglePause = () => {
    const newPauseState = !adminConfig.isProtocolPaused;
    const updated: AdminConfig = {
      ...adminConfig,
      isProtocolPaused: newPauseState,
    };
    onUpdateConfig(updated);
    StorageService.addAuditLog({
      adminAddress: currentAdmin,
      action: newPauseState ? 'PROTOCOL_EMERGENCY_PAUSED' : 'PROTOCOL_RESUMED',
      details: `Circuit breaker toggled to: ${newPauseState ? 'PAUSED' : 'ACTIVE'}`,
    });
  };

  const handleAddLiquidity = () => {
    if (liquidityAddAmount <= 0) return;
    const updated: AdminConfig = {
      ...adminConfig,
      totalLiquidityPoolUSDC: adminConfig.totalLiquidityPoolUSDC + liquidityAddAmount,
    };
    onUpdateConfig(updated);
    StorageService.addAuditLog({
      adminAddress: currentAdmin,
      action: 'LIQUIDITY_INJECTED',
      details: `Injected +${liquidityAddAmount.toLocaleString()} USDC to Optimism Lending Pool`,
    });
    StorageService.addTransaction({
      id: 'tx-liq-' + Date.now(),
      hash: '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join(''),
      type: 'ADMIN_LIQUIDITY_ADD',
      address: currentAdmin,
      amount: liquidityAddAmount,
      token: 'USDC',
      timestamp: Date.now(),
      blockNumber: 129045120,
      status: 'CONFIRMED',
      description: `Pool capital deposit: +${liquidityAddAmount} USDC`,
    });
    setStatusMessage(`Added ${liquidityAddAmount.toLocaleString()} USDC liquidity.`);
    setTimeout(() => setStatusMessage(null), 3000);
  };

  const handleWithdrawLiquidity = () => {
    if (liquidityWithdrawAmount <= 0 || liquidityWithdrawAmount > adminConfig.totalLiquidityPoolUSDC) return;
    const updated: AdminConfig = {
      ...adminConfig,
      totalLiquidityPoolUSDC: adminConfig.totalLiquidityPoolUSDC - liquidityWithdrawAmount,
    };
    onUpdateConfig(updated);
    StorageService.addAuditLog({
      adminAddress: currentAdmin,
      action: 'LIQUIDITY_WITHDRAWN',
      details: `Withdrew -${liquidityWithdrawAmount.toLocaleString()} USDC from Optimism Lending Pool`,
    });
    setStatusMessage(`Withdrew ${liquidityWithdrawAmount.toLocaleString()} USDC.`);
    setTimeout(() => setStatusMessage(null), 3000);
  };

  const handleSaveTiers = () => {
    onUpdateTiers(editableTiers);
    StorageService.addAuditLog({
      adminAddress: currentAdmin,
      action: 'LOAN_TIERS_CONFIGURED',
      details: `Updated min/max boundaries across ${editableTiers.length} credit tiers`,
    });
    setStatusMessage('Loan categories successfully saved.');
    setTimeout(() => setStatusMessage(null), 3000);
  };

  const handleLiquidateLoan = (loanId: string) => {
    const allLoans = StorageService.getLoans();
    const target = allLoans.find((l) => l.id === loanId);
    if (!target) return;
    target.status = 'defaulted';
    StorageService.saveLoans(allLoans);
    StorageService.addAuditLog({
      adminAddress: currentAdmin,
      action: 'LOAN_DEFAULT_LIQUIDATED',
      details: `Default executed on loan ${loanId} (Borrower: ${target.borrowerAddress}). Collateral ${target.collateralAmount} USDC seized.`,
    });
    onRefresh();
    setStatusMessage(`Liquidated overdue loan ${loanId}.`);
    setTimeout(() => setStatusMessage(null), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner with Emergency Circuit Breaker */}
      <div className="bg-white dark:bg-[#121721] border border-slate-200 dark:border-[#21262d] rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              Protocol Administrator Console
            </h2>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-300 dark:border-purple-800/40 font-bold">
              ADMIN ROLE
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-mono">
            Admin Auth: {currentAdmin.slice(0, 8)}...{currentAdmin.slice(-6)} · Network: Optimism (10)
          </p>
        </div>

        <div className="flex items-center gap-3">
          {adminConfig.isProtocolPaused ? (
            <button
              onClick={handleTogglePause}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg transition-colors flex items-center gap-2 shadow-sm cursor-pointer"
            >
              <PlayCircle className="w-4 h-4" />
              <span>Resume Protocol</span>
            </button>
          ) : (
            <button
              onClick={handleTogglePause}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs rounded-lg transition-colors flex items-center gap-2 shadow-sm cursor-pointer"
            >
              <PauseCircle className="w-4 h-4" />
              <span>Emergency Pause Protocol</span>
            </button>
          )}

          <button
            onClick={onRefresh}
            className="p-2 bg-slate-100 dark:bg-[#161b22] hover:bg-slate-200 dark:hover:bg-[#21262d] border border-slate-200 dark:border-[#30363d] text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-lg transition-colors cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {statusMessage && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800/60 rounded-lg text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Admin Subnav */}
      <div className="flex items-center gap-2 p-1 bg-slate-100 dark:bg-[#121721] border border-slate-200 dark:border-[#21262d] rounded-lg overflow-x-auto text-xs font-medium">
        {[
          { id: 'overview', label: 'Analytics & Overview' },
          { id: 'tiers', label: 'Loan Categories' },
          { id: 'liquidity', label: 'Liquidity & Policy' },
          { id: 'loans', label: `Loan Portfolio (${loans.length})` },
          { id: 'evaluations', label: `Registered Wallets (${evaluations.length})` },
          { id: 'audit', label: `Audit Log (${auditLogs.length})` },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id as any)}
            className={`px-3.5 py-1.5 rounded-md whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === t.id
                ? 'bg-white dark:bg-[#21262d] text-slate-900 dark:text-white shadow-xs font-semibold'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* TAB 1: OVERVIEW & ANALYTICS */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-white dark:bg-[#121721] border border-slate-200 dark:border-[#21262d] shadow-sm">
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase">Pool Reserves</span>
              <div className="text-xl font-bold font-mono text-slate-900 dark:text-white mt-1 tabular-nums">
                ${adminConfig.totalLiquidityPoolUSDC.toLocaleString()} USDC
              </div>
            </div>

            <div className="p-4 rounded-xl bg-white dark:bg-[#121721] border border-slate-200 dark:border-[#21262d] shadow-sm">
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase">Total Disbursed</span>
              <div className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-1 tabular-nums">
                ${stats.totalUsdcLent.toLocaleString()} USDC
              </div>
            </div>

            <div className="p-4 rounded-xl bg-white dark:bg-[#121721] border border-slate-200 dark:border-[#21262d] shadow-sm">
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase">Commission Rev (15%)</span>
              <div className="text-xl font-bold font-mono text-[#ff0420] mt-1 tabular-nums">
                ${stats.totalCommissionsEarned.toLocaleString()} USDC
              </div>
            </div>

            <div className="p-4 rounded-xl bg-white dark:bg-[#121721] border border-slate-200 dark:border-[#21262d] shadow-sm">
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase">Default Rate</span>
              <div className="text-xl font-bold font-mono text-slate-800 dark:text-slate-200 mt-1 tabular-nums">
                {stats.defaultRatePercent}%
              </div>
            </div>
          </div>

          {/* Activity Bar Chart Simulation */}
          <div className="p-6 bg-white dark:bg-[#121721] border border-slate-200 dark:border-[#21262d] rounded-xl space-y-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Weekly Lending & Repayment Volume (USDC)
                </h3>
                <span className="text-xs text-slate-500 dark:text-slate-400">Optimism Mainnet activity volume</span>
              </div>
              <div className="flex items-center gap-4 text-xs font-mono">
                <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                  <span className="w-2.5 h-2.5 bg-[#ff0420] rounded-sm" />
                  <span>Disbursed</span>
                </span>
                <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                  <span className="w-2.5 h-2.5 bg-emerald-500 rounded-sm" />
                  <span>Repaid</span>
                </span>
              </div>
            </div>

            <div className="pt-4 grid grid-cols-7 gap-3 items-end h-44 border-b border-slate-200 dark:border-[#21262d] pb-2">
              {[
                { day: 'Mon', lent: 12500, repaid: 8000 },
                { day: 'Tue', lent: 18000, repaid: 14200 },
                { day: 'Wed', lent: 24500, repaid: 19000 },
                { day: 'Thu', lent: 16000, repaid: 15500 },
                { day: 'Fri', lent: 32000, repaid: 21000 },
                { day: 'Sat', lent: 28000, repaid: 26000 },
                { day: 'Sun', lent: 22000, repaid: 19500 },
              ].map((item, i) => (
                <div key={i} className="flex flex-col items-center gap-2 h-full justify-end">
                  <div className="flex items-end gap-1.5 w-full justify-center h-32">
                    <div
                      style={{ height: `${(item.lent / 35000) * 100}%` }}
                      className="w-4 bg-[#ff0420] rounded-t transition-all hover:opacity-80"
                      title={`Lent: $${item.lent.toLocaleString()}`}
                    />
                    <div
                      style={{ height: `${(item.repaid / 35000) * 100}%` }}
                      className="w-4 bg-emerald-500 rounded-t transition-all hover:opacity-80"
                      title={`Repaid: $${item.repaid.toLocaleString()}`}
                    />
                  </div>
                  <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">{item.day}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: LOAN CATEGORIES CONFIGURATION */}
      {activeTab === 'tiers' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Configure Loan Categories</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Adjust minimum and maximum limits, credit score requirements, and liquidity allocations.
              </p>
            </div>
            <button
              onClick={handleSaveTiers}
              className="px-4 py-2 bg-[#ff0420] hover:bg-[#e0001a] text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Tier Limits</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {editableTiers.map((tier, index) => (
              <div key={tier.id} className="p-5 rounded-xl bg-white dark:bg-[#121721] border border-slate-200 dark:border-[#21262d] space-y-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 dark:text-white text-sm">{tier.name} Tier</span>
                  <span className="text-xs font-mono text-slate-500 dark:text-slate-400 uppercase">{tier.id}</span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="text-slate-500 dark:text-slate-400 block mb-1">Min Amount (USDC):</label>
                    <input
                      type="number"
                      value={tier.minAmount}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        const copy = [...editableTiers];
                        copy[index].minAmount = val;
                        setEditableTiers(copy);
                      }}
                      className="w-full bg-slate-50 dark:bg-[#090c10] border border-slate-200 dark:border-[#21262d] focus:border-[#ff0420] rounded px-2.5 py-1.5 text-slate-900 dark:text-white font-mono font-bold outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-slate-500 dark:text-slate-400 block mb-1">Max Amount (USDC):</label>
                    <input
                      type="number"
                      value={tier.maxAmount}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        const copy = [...editableTiers];
                        copy[index].maxAmount = val;
                        setEditableTiers(copy);
                      }}
                      className="w-full bg-slate-50 dark:bg-[#090c10] border border-slate-200 dark:border-[#21262d] focus:border-[#ff0420] rounded px-2.5 py-1.5 text-slate-900 dark:text-white font-mono font-bold outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1.5 text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-[#21262d]">
                  <div className="flex justify-between">
                    <span>Min Transactions:</span>
                    <span className="text-slate-800 dark:text-white font-mono">{tier.minTransactions} txs</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Min Wallet Age:</span>
                    <span className="text-slate-800 dark:text-white font-mono">{tier.minWalletAgeDays} days</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Pool Allocated:</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-mono">${tier.fundsAvailableUSDC.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: LIQUIDITY & FINANCIAL POLICY */}
      {activeTab === 'liquidity' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Liquidity Injection */}
            <div className="p-6 rounded-xl bg-white dark:bg-[#121721] border border-slate-200 dark:border-[#21262d] space-y-4 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Lending Liquidity Management
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Deposit or withdraw USDC from the Optimism Lending Pool contract.
              </p>

              <div className="p-3.5 bg-slate-50 dark:bg-[#090c10] rounded-lg border border-slate-200 dark:border-[#21262d] flex justify-between items-center text-xs">
                <span className="text-slate-500 dark:text-slate-400">Available Pool Liquidity:</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white text-base">
                  ${adminConfig.totalLiquidityPoolUSDC.toLocaleString()} USDC
                </span>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={liquidityAddAmount}
                    onChange={(e) => setLiquidityAddAmount(Number(e.target.value))}
                    className="flex-1 bg-slate-50 dark:bg-[#090c10] border border-slate-200 dark:border-[#21262d] focus:border-[#ff0420] rounded-lg px-3 py-2 text-xs font-mono text-slate-900 dark:text-white outline-none"
                    placeholder="Amount to inject"
                  />
                  <button
                    onClick={handleAddLiquidity}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shrink-0"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>Deposit Liquidity</span>
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={liquidityWithdrawAmount}
                    onChange={(e) => setLiquidityWithdrawAmount(Number(e.target.value))}
                    className="flex-1 bg-slate-50 dark:bg-[#090c10] border border-slate-200 dark:border-[#21262d] focus:border-[#ff0420] rounded-lg px-3 py-2 text-xs font-mono text-slate-900 dark:text-white outline-none"
                    placeholder="Amount to withdraw"
                  />
                  <button
                    onClick={handleWithdrawLiquidity}
                    className="px-4 py-2 bg-slate-100 dark:bg-[#21262d] hover:bg-slate-200 dark:hover:bg-[#30363d] border border-slate-200 dark:border-transparent text-slate-700 dark:text-slate-200 font-bold text-xs rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shrink-0"
                  >
                    <MinusCircle className="w-3.5 h-3.5" />
                    <span>Withdraw</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Financial Commission & Collateral Rules */}
            <div className="p-6 rounded-xl bg-white dark:bg-[#121721] border border-slate-200 dark:border-[#21262d] space-y-4 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Financial Policy & Rates
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Configure protocol commission rates, collateral deposit requirements, and permitted terms.
              </p>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="text-slate-700 dark:text-slate-300 block mb-1">Platform Commission (%):</label>
                  <input
                    type="number"
                    value={commissionPercent}
                    onChange={(e) => setCommissionPercent(Number(e.target.value))}
                    className="w-full bg-slate-50 dark:bg-[#090c10] border border-slate-200 dark:border-[#21262d] focus:border-[#ff0420] rounded-lg px-3 py-2 text-slate-900 dark:text-white font-mono font-bold outline-none"
                  />
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 block">
                    Charged on principal disbursement (Default: 15%)
                  </span>
                </div>

                <div>
                  <label className="text-slate-700 dark:text-slate-300 block mb-1">Required Collateral Deposit (%):</label>
                  <input
                    type="number"
                    value={collateralPercent}
                    onChange={(e) => setCollateralPercent(Number(e.target.value))}
                    className="w-full bg-slate-50 dark:bg-[#090c10] border border-slate-200 dark:border-[#21262d] focus:border-[#ff0420] rounded-lg px-3 py-2 text-slate-900 dark:text-white font-mono font-bold outline-none"
                  />
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 block">
                    Locked in escrow, refunded on timely repayment (Default: 15%)
                  </span>
                </div>

                <div className="pt-2">
                  <label className="text-slate-700 dark:text-slate-300 block mb-1.5">Permitted Repayment Periods:</label>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { days: 15, state: repaymentDays15, setter: setRepaymentDays15 },
                      { days: 30, state: repaymentDays30, setter: setRepaymentDays30 },
                      { days: 45, state: repaymentDays45, setter: setRepaymentDays45 },
                      { days: 60, state: repaymentDays60, setter: setRepaymentDays60 },
                    ].map((item) => (
                      <button
                        key={item.days}
                        type="button"
                        onClick={() => item.setter(!item.state)}
                        className={`py-1.5 px-2 rounded border font-mono text-xs cursor-pointer ${
                          item.state
                            ? 'bg-purple-100 dark:bg-purple-950/60 border-purple-400 dark:border-purple-500/60 text-purple-800 dark:text-purple-200 font-semibold'
                            : 'bg-slate-50 dark:bg-[#090c10] border-slate-200 dark:border-[#21262d] text-slate-500 dark:text-slate-500'
                        }`}
                      >
                        {item.days} Days
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleSaveFinancialPolicy}
                  className="w-full py-2.5 bg-[#ff0420] hover:bg-[#e0001a] text-white text-xs font-bold rounded-lg transition-colors mt-2 cursor-pointer shadow-sm"
                >
                  Save Financial Policy
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: LOAN PORTFOLIO & DEFAULT LIQUIDATIONS */}
      {activeTab === 'loans' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Full Loan Portfolio Audit</h3>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">{loans.length} total protocol loans</span>
          </div>

          <div className="border border-slate-200 dark:border-[#21262d] rounded-xl overflow-hidden bg-white dark:bg-[#121721] shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-[#090c10] border-b border-slate-200 dark:border-[#21262d] text-slate-600 dark:text-slate-400 uppercase font-mono text-[11px]">
                  <tr>
                    <th className="py-3 px-4">Loan ID</th>
                    <th className="py-3 px-4">Borrower</th>
                    <th className="py-3 px-4">Principal</th>
                    <th className="py-3 px-4">Collateral</th>
                    <th className="py-3 px-4">Expires</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-[#21262d]/60 font-mono">
                  {loans.map((loan) => {
                    const isOverdue = loan.status === 'active' && Date.now() > loan.expiresAt;
                    return (
                      <tr key={loan.id} className="hover:bg-slate-50 dark:hover:bg-[#161b22]/50 transition-colors">
                        <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">{loan.id}</td>
                        <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                          {loan.borrowerAddress.slice(0, 8)}...{loan.borrowerAddress.slice(-6)}
                        </td>
                        <td className="py-3 px-4 text-slate-900 dark:text-white font-bold">{loan.principalAmount} USDC</td>
                        <td className="py-3 px-4 text-amber-600 dark:text-amber-300 font-semibold">{loan.collateralAmount} USDC</td>
                        <td className="py-3 px-4 text-slate-500 dark:text-slate-400 font-sans text-[11px]">
                          {new Date(loan.expiresAt).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4">
                          {loan.status === 'repaid' ? (
                            <span className="text-emerald-600 dark:text-emerald-400 font-semibold">REPAID</span>
                          ) : loan.status === 'defaulted' ? (
                            <span className="text-purple-600 dark:text-purple-400 font-semibold">DEFAULTED</span>
                          ) : isOverdue ? (
                            <span className="text-red-600 dark:text-red-400 font-semibold animate-pulse">OVERDUE</span>
                          ) : (
                            <span className="text-sky-600 dark:text-cyan-300 font-semibold">ACTIVE</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right font-sans">
                          {isOverdue && loan.status !== 'defaulted' && (
                            <button
                              onClick={() => handleLiquidateLoan(loan.id)}
                              className="px-2 py-1 bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-900 border border-red-300 dark:border-red-800 rounded text-[11px] font-semibold cursor-pointer"
                            >
                              Liquidate Default
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: REGISTERED WALLETS & EVALUATIONS */}
      {activeTab === 'evaluations' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Registered Wallet Audit Logs</h3>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">{evaluations.length} evaluated addresses</span>
          </div>

          <div className="border border-slate-200 dark:border-[#21262d] rounded-xl overflow-hidden bg-white dark:bg-[#121721] shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-[#090c10] border-b border-slate-200 dark:border-[#21262d] text-slate-600 dark:text-slate-400 uppercase font-mono text-[11px]">
                  <tr>
                    <th className="py-3 px-4">Address</th>
                    <th className="py-3 px-4">Score</th>
                    <th className="py-3 px-4">Age (Days)</th>
                    <th className="py-3 px-4">Tx Count</th>
                    <th className="py-3 px-4">DeFi Protocols</th>
                    <th className="py-3 px-4">Risk Level</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-[#21262d]/60 font-mono">
                  {evaluations.map((ev) => (
                    <tr key={ev.id} className="hover:bg-slate-50 dark:hover:bg-[#161b22]/50 transition-colors">
                      <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                        {ev.address.slice(0, 10)}...{ev.address.slice(-8)}
                      </td>
                      <td className="py-3 px-4 text-sky-600 dark:text-cyan-300 font-bold">{ev.score}/1000</td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-300">{ev.walletAgeDays}d</td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-300">{ev.transactionCount}</td>
                      <td className="py-3 px-4 text-slate-500 dark:text-slate-400 font-sans text-[11px]">
                        {ev.defiProtocolsDetected.length > 0 ? ev.defiProtocolsDetected.join(', ') : 'None'}
                      </td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-300">{ev.riskLevel}</td>
                      <td className="py-3 px-4">
                        {ev.isEligible ? (
                          <span className="text-emerald-600 dark:text-emerald-400 font-semibold">ELIGIBLE</span>
                        ) : (
                          <span className="text-amber-600 dark:text-amber-400 font-semibold">RESTRICTED</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: AUDIT LOG */}
      {activeTab === 'audit' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Immutable Administrative Audit Log</h3>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">{auditLogs.length} logged events</span>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-[#21262d] border border-slate-200 dark:border-[#21262d] rounded-xl overflow-hidden bg-white dark:bg-[#121721] shadow-sm">
            {auditLogs.map((log) => (
              <div key={log.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <div>
                  <div className="flex items-center gap-2 font-mono">
                    <span className="font-bold text-[#ff0420]">{log.action}</span>
                    <span className="text-slate-400 dark:text-slate-500">·</span>
                    <span className="text-slate-500 dark:text-slate-400">By {log.adminAddress.slice(0, 8)}...</span>
                  </div>
                  <p className="text-slate-700 dark:text-slate-300 mt-1 font-sans">{log.details}</p>
                </div>
                <div className="text-slate-400 dark:text-slate-500 font-mono text-[11px] shrink-0">
                  {new Date(log.timestamp).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
