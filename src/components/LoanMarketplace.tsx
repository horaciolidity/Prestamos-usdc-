import React, { useState } from 'react';
import { LoanTier, Web3WalletState, WalletEvaluation } from '../types';
import { Search, CheckCircle, AlertCircle, ArrowRight, ShieldAlert, Sparkles, UserCheck, HelpCircle } from 'lucide-react';
import { isAddress } from 'viem';

interface LoanMarketplaceProps {
  tiers: LoanTier[];
  walletState: Web3WalletState;
  lastEvaluation: WalletEvaluation | null;
  onAnalyzeAddress: (address: string) => Promise<void>;
  onApplyForTier: (tier: LoanTier) => void;
  isEvaluating: boolean;
  onOpenConnectModal: () => void;
  onOpenHelp?: () => void;
}

export const LoanMarketplace: React.FC<LoanMarketplaceProps> = ({
  tiers,
  walletState,
  lastEvaluation,
  onAnalyzeAddress,
  onApplyForTier,
  isEvaluating,
  onOpenConnectModal,
  onOpenHelp,
}) => {
  const [inputAddress, setInputAddress] = useState<string>(walletState.address || '');
  const [addressError, setAddressError] = useState<string | null>(null);

  // Sync input if wallet connects
  React.useEffect(() => {
    if (walletState.address && !inputAddress) {
      setInputAddress(walletState.address);
    }
  }, [walletState.address]);

  const handleAnalyze = async (overrideAddr?: string) => {
    const target = (overrideAddr || inputAddress).trim();
    if (!target) {
      setAddressError('Please enter an EVM wallet address to evaluate.');
      return;
    }
    if (!isAddress(target)) {
      setAddressError('Invalid address. Must be a 42-character 0x-prefixed EVM address.');
      return;
    }
    setAddressError(null);
    await onAnalyzeAddress(target);
  };

  const handleUseConnected = () => {
    if (walletState.address) {
      setInputAddress(walletState.address);
      handleAnalyze(walletState.address);
    } else {
      onOpenConnectModal();
    }
  };

  return (
    <div className="space-y-8">
      {/* Header & Address Evaluation Bar */}
      <div className="bg-white dark:bg-[#121721] border border-slate-200 dark:border-[#21262d] rounded-xl p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="max-w-2xl">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              Optimism USDC Loan Marketplace
            </h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Borrow instant, predictable USDC liquidity backed by 15% collateral. Enter your wallet address to run an on-chain eligibility audit and unlock your personalized credit tier.
            </p>
          </div>
          {onOpenHelp && (
            <button
              onClick={onOpenHelp}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-[#161b22] dark:hover:bg-[#21262d] border border-slate-300 dark:border-[#30363d] text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 shrink-0 self-start cursor-pointer"
            >
              <HelpCircle className="w-3.5 h-3.5 text-[#ff0420]" />
              <span>Lending FAQs & Guide</span>
            </button>
          )}
        </div>

        {/* Address Input Evaluation Flow */}
        <div className="mt-6">
          <div className="flex flex-col sm:flex-row items-stretch gap-3">
            <div className="relative flex-1">
              <input
                type="text"
                value={inputAddress}
                onChange={(e) => {
                  setInputAddress(e.target.value);
                  if (addressError) setAddressError(null);
                }}
                placeholder="Enter Optimism wallet address (0x...)"
                className="w-full bg-slate-50 dark:bg-[#090c10] border border-slate-200 dark:border-[#21262d] focus:border-[#ff0420] focus:ring-1 focus:ring-[#ff0420] rounded-lg px-4 py-3 text-sm text-slate-900 dark:text-white font-mono placeholder:text-slate-400 dark:placeholder:text-slate-500 placeholder:font-sans transition-all outline-none"
              />
              {walletState.address && (
                <button
                  type="button"
                  onClick={handleUseConnected}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#ff0420] hover:text-[#ff384e] font-semibold transition-colors"
                >
                  Use Connected
                </button>
              )}
            </div>

            <button
              onClick={() => handleAnalyze()}
              disabled={isEvaluating}
              className="px-6 py-3 bg-[#ff0420] hover:bg-[#e0001a] disabled:opacity-50 text-white font-semibold text-sm rounded-lg transition-all shadow-md shadow-[#ff0420]/20 flex items-center justify-center gap-2 shrink-0 active:scale-[0.98] cursor-pointer"
            >
              {isEvaluating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  <span>Evaluating...</span>
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  <span>ANALYZE WALLET</span>
                </>
              )}
            </button>
          </div>

          {addressError && (
            <p className="mt-2 text-xs text-red-500 flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{addressError}</span>
            </p>
          )}

          {/* Quick preset wallet shortcuts for convenience */}
          <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <span className="text-slate-600 dark:text-slate-500 font-medium">Quick Test Addresses:</span>
            <button
              type="button"
              onClick={() => {
                const addr = '0x71C840134f0A745e3f1Cdfa38A0D980c6C87Cdf1';
                setInputAddress(addr);
                handleAnalyze(addr);
              }}
              className="px-2 py-0.5 rounded bg-slate-100 dark:bg-[#161b22] hover:bg-slate-200 dark:hover:bg-[#21262d] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-[#30363d] transition-colors"
            >
              Active DeFi Trader
            </button>
            <button
              type="button"
              onClick={() => {
                const addr = '0x3cD751E6b0078Be393132286c442345e5DC49699';
                setInputAddress(addr);
                handleAnalyze(addr);
              }}
              className="px-2 py-0.5 rounded bg-slate-100 dark:bg-[#161b22] hover:bg-slate-200 dark:hover:bg-[#21262d] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-[#30363d] transition-colors"
            >
              Optimism Whale LP
            </button>
            <button
              type="button"
              onClick={() => {
                const addr = '0x2546BcD3c84621e976D8185a91A922aE77ECEc30';
                setInputAddress(addr);
                handleAnalyze(addr);
              }}
              className="px-2 py-0.5 rounded bg-slate-100 dark:bg-[#161b22] hover:bg-slate-200 dark:hover:bg-[#21262d] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-[#30363d] transition-colors"
            >
              Emerging User
            </button>
          </div>
        </div>

        {/* Evaluation Banner if evaluated */}
        {lastEvaluation && (
          <div
            className={`mt-6 p-4 rounded-lg border ${
              lastEvaluation.isEligible
                ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800/40 text-emerald-950 dark:text-white'
                : 'bg-amber-50 dark:bg-amber-950/20 border-amber-300 dark:border-amber-800/40 text-amber-950 dark:text-white'
            } flex flex-col sm:flex-row sm:items-center justify-between gap-4`}
          >
            <div className="flex items-start gap-3">
              {lastEvaluation.isEligible ? (
                <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <ShieldAlert className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              )}
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-900 dark:text-white text-sm">
                    {lastEvaluation.isEligible
                      ? `Wallet Approved: Eligible up to ${lastEvaluation.maxSuggestedAmount} USDC`
                      : 'Evaluation Inconclusive / Insufficient History'}
                  </span>
                  <span className="text-xs text-slate-600 dark:text-slate-400 font-mono">
                    Score: {lastEvaluation.score}/1000 · Risk: {lastEvaluation.riskLevel}
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                  {lastEvaluation.recommendationNote}
                </p>
              </div>
            </div>

            {lastEvaluation.isEligible && (
              <button
                onClick={() => {
                  const targetTier =
                    tiers.find((t) => t.id === lastEvaluation.suggestedTier) || tiers[0];
                  onApplyForTier(targetTier);
                }}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 shadow-sm"
              >
                <span>GET MY LOAN ({lastEvaluation.maxSuggestedAmount} USDC)</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Multi-Column Tier Cards Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
            Available Loan Categories
          </h3>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
            Standard: 15% Collateral · 15% Platform Commission
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tiers.map((tier) => {
            const isEligible = lastEvaluation?.eligibleTiers.includes(tier.id);
            const isSuggested = lastEvaluation?.suggestedTier === tier.id;

            return (
              <div
                key={tier.id}
                className={`flex flex-col justify-between bg-white dark:bg-[#121721] border rounded-xl p-6 transition-all relative ${
                  isSuggested
                    ? 'border-[#ff0420] shadow-lg shadow-[#ff0420]/10 bg-gradient-to-b from-rose-50/50 to-white dark:from-[#181f2c] dark:to-[#121721]'
                    : isEligible
                    ? 'border-emerald-600/60 dark:border-emerald-700/60 shadow-sm'
                    : 'border-slate-200 dark:border-[#21262d] hover:border-slate-300 dark:hover:border-[#30363d] shadow-sm'
                }`}
              >
                {/* Header of Tier */}
                <div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-lg font-bold text-slate-900 dark:text-white">{tier.name}</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{tier.tagline}</p>
                    </div>

                    <div className="text-right">
                      <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 uppercase">
                        Credit Level
                      </span>
                      <div className="text-xs font-mono font-bold text-slate-800 dark:text-slate-200">
                        {tier.recommendedCreditScore}+ pts
                      </div>
                    </div>
                  </div>

                  {/* Loan Range Highlight */}
                  <div className="mt-5 p-3.5 rounded-lg bg-slate-50 dark:bg-[#090c10] border border-slate-200 dark:border-[#21262d]">
                    <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Loan Principal
                    </div>
                    <div className="flex items-baseline gap-1 mt-1">
                      <span className="font-mono text-2xl font-extrabold text-slate-900 dark:text-white tabular-nums">
                        {tier.minAmount}–{tier.maxAmount}
                      </span>
                      <span className="font-mono text-xs font-semibold text-[#ff0420]">USDC</span>
                    </div>
                  </div>

                  {/* Financial Conditions Breakdown */}
                  <div className="mt-4 space-y-2 text-xs">
                    <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-[#21262d]/60">
                      <span className="text-slate-500 dark:text-slate-400">Required Collateral:</span>
                      <span className="font-mono font-semibold text-slate-900 dark:text-white">
                        {tier.collateralPercent}% ({(tier.minAmount * tier.collateralPercent) / 100}–{(tier.maxAmount * tier.collateralPercent) / 100} USDC)
                      </span>
                    </div>

                    <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-[#21262d]/60">
                      <span className="text-slate-500 dark:text-slate-400">Platform Commission:</span>
                      <span className="font-mono font-semibold text-slate-900 dark:text-white">
                        {tier.commissionPercent}% ({(tier.minAmount * tier.commissionPercent) / 100}–{(tier.maxAmount * tier.commissionPercent) / 100} USDC)
                      </span>
                    </div>

                    <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-[#21262d]/60">
                      <span className="text-slate-500 dark:text-slate-400">Repayment Period:</span>
                      <span className="font-mono text-slate-700 dark:text-slate-200">
                        {tier.minRepaymentDays}–{tier.maxRepaymentDays} Days
                      </span>
                    </div>

                    <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-[#21262d]/60">
                      <span className="text-slate-500 dark:text-slate-400">Min. Wallet Activity:</span>
                      <span className="text-slate-700 dark:text-slate-300">
                        {tier.minTransactions} txs · {tier.minWalletAgeDays}d age
                      </span>
                    </div>

                    <div className="flex items-center justify-between py-1">
                      <span className="text-slate-500 dark:text-slate-400">Pool Liquidity:</span>
                      <span className="font-mono text-emerald-600 dark:text-emerald-400 font-semibold tabular-nums">
                        ${tier.fundsAvailableUSDC.toLocaleString()} USDC
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Action & Status */}
                <div className="mt-6 pt-4 border-t border-slate-100 dark:border-[#21262d]">
                  <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-3">
                    <span>Active loans in tier:</span>
                    <span className="font-mono text-slate-800 dark:text-slate-200 font-semibold">
                      {tier.activeLoansCount} active
                    </span>
                  </div>

                  {lastEvaluation ? (
                    isEligible ? (
                      <button
                        onClick={() => onApplyForTier(tier)}
                        className={`w-full py-2.5 px-4 font-semibold text-xs rounded-lg transition-all flex items-center justify-center gap-1.5 shadow-sm cursor-pointer ${
                          isSuggested
                            ? 'bg-[#ff0420] hover:bg-[#e0001a] text-white shadow-[#ff0420]/20'
                            : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                        }`}
                      >
                        <span>{isSuggested ? 'APPLY (SUGGESTED TIER)' : 'APPLY FOR LOAN'}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    ) : (
                      <button
                        onClick={() => handleAnalyze()}
                        className="w-full py-2.5 px-4 bg-slate-100 dark:bg-[#161b22] hover:bg-slate-200 dark:hover:bg-[#21262d] border border-slate-200 dark:border-[#30363d] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 font-medium text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <span>View Requirements</span>
                      </button>
                    )
                  ) : (
                    <button
                      onClick={() => handleAnalyze()}
                      className="w-full py-2.5 px-4 bg-slate-100 dark:bg-[#161b22] hover:bg-slate-200 dark:hover:bg-[#21262d] border border-slate-200 dark:border-[#30363d] text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white font-medium text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <span>Analyze Address to Apply</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
