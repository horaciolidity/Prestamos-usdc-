import React from 'react';
import { WalletEvaluation, LoanTier } from '../types';
import { CheckCircle2, AlertTriangle, ShieldCheck, X, ArrowRight, ExternalLink, RefreshCw } from 'lucide-react';
import { OPTIMISM_EXPLORER_URL } from '../contracts/contractInfo';

interface WalletEvaluationModalProps {
  isOpen: boolean;
  onClose: () => void;
  evaluation: WalletEvaluation | null;
  tiers: LoanTier[];
  onProceedToLoan: (tier: LoanTier, prefilledAmount: number) => void;
  onReAnalyze: () => void;
}

export const WalletEvaluationModal: React.FC<WalletEvaluationModalProps> = ({
  isOpen,
  onClose,
  evaluation,
  tiers,
  onProceedToLoan,
  onReAnalyze,
}) => {
  if (!isOpen || !evaluation) return null;

  const suggestedTier = tiers.find((t) => t.id === evaluation.suggestedTier) || tiers[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 dark:bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white dark:bg-[#121721] border border-slate-200 dark:border-[#21262d] rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="p-6 border-b border-slate-200 dark:border-[#21262d] flex items-center justify-between bg-slate-50 dark:bg-transparent">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${evaluation.isEligible ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800/40' : 'bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-300 dark:border-amber-800/40'}`}>
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Wallet Address On-Chain Audit</h3>
              <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500 dark:text-slate-400 font-mono">
                <span>{evaluation.address}</span>
                <a
                  href={`${OPTIMISM_EXPLORER_URL}/address/${evaluation.address}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 dark:hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Evaluation Summary Strip */}
        <div className="p-6 border-b border-slate-200 dark:border-[#21262d] bg-slate-100/60 dark:bg-[#090c10]/60 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase">Assessment</span>
            <div className={`text-sm font-bold mt-1 ${evaluation.isEligible ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
              {evaluation.isEligible ? 'APPROVED' : 'RESTRICTED'}
            </div>
          </div>
          <div>
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase">Risk Level</span>
            <div className="text-sm font-bold text-slate-900 dark:text-white mt-1">
              {evaluation.riskLevel}
            </div>
          </div>
          <div>
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase">Credit Score</span>
            <div className="text-sm font-bold font-mono text-sky-600 dark:text-cyan-300 mt-1 tabular-nums">
              {evaluation.score} / 1000
            </div>
          </div>
          <div>
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase">Max Suggested</span>
            <div className="text-sm font-bold font-mono text-[#ff0420] mt-1 tabular-nums">
              {evaluation.maxSuggestedAmount} USDC
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6">
          {/* Transparent Notice */}
          <div className="p-3 bg-slate-100 dark:bg-[#161b22] border border-slate-200 dark:border-[#30363d] rounded-lg text-xs text-slate-700 dark:text-slate-300 flex items-start gap-2.5">
            <span className="text-[#ff0420] font-bold">Protocol Notice:</span>
            <span>
              Optimism Lending evaluates objective blockchain telemetry (nonce, balance, verifiable DeFi contract calls) rather than arbitrary off-chain credit scoring.
            </span>
          </div>

          {/* Fact Indicators Table */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-3">
              Verifiable Blockchain Facts & Risk Indicators
            </h4>
            <div className="divide-y divide-slate-100 dark:divide-[#21262d] border border-slate-200 dark:border-[#21262d] rounded-xl overflow-hidden bg-slate-50 dark:bg-[#090c10]">
              {evaluation.facts.map((fact, idx) => (
                <div key={idx} className="p-3.5 flex items-center justify-between text-xs">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-slate-900 dark:text-white">{fact.label}</span>
                      {fact.verified ? (
                        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono">
                          [VERIFIED ON-CHAIN]
                        </span>
                      ) : (
                        <span className="text-[10px] text-amber-600 dark:text-amber-400 font-mono">
                          [ESTIMATED INDICATOR]
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{fact.description}</p>
                  </div>
                  <div className="font-mono font-bold text-slate-800 dark:text-slate-200 text-right ml-4 shrink-0">
                    {fact.value}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Reasons / Explanation */}
          {evaluation.reasons.length > 0 && (
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2">
                Eligibility Observations
              </h4>
              <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
                {evaluation.reasons.map((r, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-[#ff0420] mt-0.5">·</span>
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Eligible Tiers unlocked */}
          {evaluation.eligibleTiers.length > 0 && (
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2">
                Unlocked Borrowing Tiers
              </h4>
              <div className="flex flex-wrap gap-2">
                {evaluation.eligibleTiers.map((tId) => {
                  const t = tiers.find((tier) => tier.id === tId);
                  if (!t) return null;
                  const isSuggested = t.id === evaluation.suggestedTier;
                  return (
                    <div
                      key={t.id}
                      className={`px-3 py-1.5 rounded-lg border text-xs font-mono flex items-center gap-1.5 ${
                        isSuggested
                          ? 'bg-rose-50 dark:bg-[#ff0420]/20 border-[#ff0420] text-[#ff0420] dark:text-white font-semibold'
                          : 'bg-slate-100 dark:bg-[#161b22] border-slate-200 dark:border-[#30363d] text-slate-800 dark:text-slate-300'
                      }`}
                    >
                      <span>{t.name}: {t.minAmount}–{t.maxAmount} USDC</span>
                      {isSuggested && <span className="text-[10px] text-[#ff0420] font-bold">(Best Match)</span>}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-6 border-t border-slate-200 dark:border-[#21262d] bg-slate-50 dark:bg-[#0c1017] flex items-center justify-between gap-4">
          <button
            onClick={onReAnalyze}
            className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-[#161b22] hover:bg-slate-200 dark:hover:bg-[#21262d] border border-slate-200 dark:border-[#30363d] rounded-lg transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Re-Analyze Address</span>
          </button>

          {evaluation.isEligible ? (
            <button
              onClick={() => onProceedToLoan(suggestedTier, evaluation.maxSuggestedAmount)}
              className="flex items-center gap-2 px-6 py-2.5 text-xs font-bold text-white bg-[#ff0420] hover:bg-[#e0001a] rounded-lg transition-all shadow-md shadow-[#ff0420]/20 active:scale-[0.98] cursor-pointer"
            >
              <span>GET MY LOAN ({evaluation.maxSuggestedAmount} USDC)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={onClose}
              className="px-6 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-200 dark:bg-[#21262d] rounded-lg transition-colors cursor-pointer"
            >
              Close Assessment
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
