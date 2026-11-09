import React, { useState } from 'react';
import { Loan, Web3WalletState } from '../types';
import { StorageService } from '../services/storage';
import { X, CheckCircle2, AlertCircle, ArrowRight, ShieldCheck, Gift } from 'lucide-react';

interface RepayModalProps {
  isOpen: boolean;
  onClose: () => void;
  loan: Loan;
  walletState: Web3WalletState;
  onRepaymentSuccess: () => void;
}

export const RepayModal: React.FC<RepayModalProps> = ({
  isOpen,
  onClose,
  loan,
  walletState,
  onRepaymentSuccess,
}) => {
  const [step, setStep] = useState<'confirm' | 'processing' | 'done'>('confirm');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const hasSufficientUSDC = walletState.usdcBalance >= loan.principalAmount;

  const handleRepay = async () => {
    if (!hasSufficientUSDC) {
      setErrorMsg(`Insufficient USDC in wallet. You have ${walletState.usdcBalance.toFixed(2)} USDC, but principal due is ${loan.principalAmount.toFixed(2)} USDC.`);
      return;
    }

    setErrorMsg(null);
    setStep('processing');

    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const randomHex = () =>
        '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
      const repayTxHash = randomHex();
      const refundTxHash = randomHex();

      // Deduct principal and refund collateral into user wallet
      walletState.usdcBalance = Number(
        (walletState.usdcBalance - loan.principalAmount + loan.collateralAmount).toFixed(2)
      );

      StorageService.repayLoan(loan.id, repayTxHash, refundTxHash);
      setStep('done');
      onRepaymentSuccess();
    } catch (err: any) {
      setErrorMsg(err.message || 'Repayment failed on Optimism');
      setStep('confirm');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 dark:bg-black/85 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white dark:bg-[#121721] border border-slate-200 dark:border-[#21262d] rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-slate-200 dark:border-[#21262d] flex items-center justify-between bg-slate-50 dark:bg-transparent">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
              Repay Loan & Release Collateral
            </h3>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
              Loan ID: {loan.id} · Optimism Mainnet
            </span>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {step === 'done' ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-500/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h4 className="text-xl font-bold text-slate-900 dark:text-white">Repayment Settled!</h4>
            <p className="text-xs text-slate-600 dark:text-slate-300 max-w-md mx-auto leading-relaxed">
              Your principal repayment of <strong className="text-slate-900 dark:text-white">{loan.principalAmount} USDC</strong> has been confirmed on Optimism. Escrow has automatically refunded <strong className="text-emerald-600 dark:text-emerald-400">{loan.collateralAmount} USDC</strong> collateral directly back to your wallet address.
            </p>

            <button
              onClick={onClose}
              className="mt-4 px-6 py-2.5 bg-[#ff0420] hover:bg-[#e0001a] text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
            >
              Done
            </button>
          </div>
        ) : step === 'processing' ? (
          <div className="p-10 text-center space-y-4">
            <div className="w-14 h-14 border-3 border-[#ff0420] border-t-transparent rounded-full animate-spin mx-auto" />
            <h4 className="text-base font-bold text-slate-900 dark:text-white">Settling On-Chain Repayment...</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto font-mono">
              Executing OptimismLendingPool.repayLoan({loan.id}) and triggering automated collateral refund.
            </p>
          </div>
        ) : (
          <div className="p-6 space-y-5">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#090c10] border border-slate-200 dark:border-[#21262d] space-y-2.5 text-xs">
              <div className="flex justify-between items-center text-slate-700 dark:text-slate-300">
                <span>Principal Due to Pool:</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white text-sm">
                  {loan.principalAmount.toFixed(2)} USDC
                </span>
              </div>
              <div className="flex justify-between items-center text-emerald-600 dark:text-emerald-400 font-semibold pt-2 border-t border-slate-200 dark:border-[#21262d]">
                <div className="flex items-center gap-1.5">
                  <Gift className="w-3.5 h-3.5" />
                  <span>Collateral Refund to be released:</span>
                </div>
                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                  +{loan.collateralAmount.toFixed(2)} USDC
                </span>
              </div>
              <div className="flex justify-between items-center text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-200 dark:border-[#21262d]">
                <span>Net Outflow:</span>
                <span className="font-mono text-slate-700 dark:text-slate-300">
                  -{(loan.principalAmount - loan.collateralAmount).toFixed(2)} USDC
                </span>
              </div>
            </div>

            <div className="p-3 bg-slate-100 dark:bg-[#161b22] border border-slate-200 dark:border-[#30363d] rounded-lg flex items-center justify-between text-xs">
              <span className="text-slate-500 dark:text-slate-400">Your Wallet USDC Balance:</span>
              <span className="font-mono font-bold text-slate-900 dark:text-white">
                {walletState.usdcBalance.toFixed(2)} USDC
              </span>
            </div>

            {errorMsg && (
              <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/60 rounded-lg text-xs text-red-700 dark:text-red-300 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-500 dark:text-red-400 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div className="flex items-center justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-[#161b22] hover:bg-slate-200 dark:hover:bg-[#21262d] border border-slate-200 dark:border-[#30363d] rounded-lg transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleRepay}
                disabled={!hasSufficientUSDC}
                className="flex-1 py-3 px-4 bg-[#ff0420] hover:bg-[#e0001a] disabled:opacity-50 text-white font-bold text-xs rounded-lg transition-all shadow-md shadow-[#ff0420]/20 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>CONFIRM REPAYMENT & REFUND COLLATERAL</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
