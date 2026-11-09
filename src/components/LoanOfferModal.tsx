import React, { useState, useEffect } from 'react';
import { LoanTier, Web3WalletState, Loan } from '../types';
import { StorageService } from '../services/storage';
import { X, Clock, ShieldCheck, AlertCircle, ArrowRight, Check, CheckCircle2, ChevronRight } from 'lucide-react';

interface LoanOfferModalProps {
  isOpen: boolean;
  onClose: () => void;
  tier: LoanTier;
  initialAmount: number;
  walletState: Web3WalletState;
  onLoanIssued: (loan: Loan) => void;
}

export const LoanOfferModal: React.FC<LoanOfferModalProps> = ({
  isOpen,
  onClose,
  tier,
  initialAmount,
  walletState,
  onLoanIssued,
}) => {
  const adminConfig = StorageService.getAdminConfig();
  const allowedPeriods = adminConfig.allowedRepaymentPeriods || [15, 30, 45, 60];

  const [requestedAmount, setRequestedAmount] = useState<number>(initialAmount || tier.minAmount);
  const [selectedDurationDays, setSelectedDurationDays] = useState<number>(30);
  const [countdownSeconds, setCountdownSeconds] = useState<number>(900); // 15 mins lock-in
  const [step, setStep] = useState<'configure' | 'approving_collateral' | 'signing_contract' | 'completed'>('configure');
  const [txProgressText, setTxProgressText] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Sync initial amount if tier changes
  useEffect(() => {
    if (initialAmount) {
      setRequestedAmount(Math.min(tier.maxAmount, Math.max(tier.minAmount, initialAmount)));
    }
  }, [initialAmount, tier]);

  // 15-minute offer lock-in countdown
  useEffect(() => {
    if (!isOpen) return;
    const timer = setInterval(() => {
      setCountdownSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [isOpen]);

  if (!isOpen) return null;

  // Financial Calculations (Commission: 15%, Collateral: 15%)
  const commissionPercent = adminConfig.platformCommissionPercent;
  const collateralPercent = adminConfig.requiredCollateralPercent;

  const commissionAmount = Number(((requestedAmount * commissionPercent) / 100).toFixed(2));
  const collateralAmount = Number(((requestedAmount * collateralPercent) / 100).toFixed(2));
  const netReceivedAmount = Number((requestedAmount - commissionAmount).toFixed(2));
  const repaymentPrincipal = requestedAmount;

  // Validation
  const isValidAmount = requestedAmount >= tier.minAmount && requestedAmount <= tier.maxAmount;
  const hasSufficientCollateral = walletState.usdcBalance >= collateralAmount;

  const formatCountdown = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleConfirmLoan = async () => {
    if (!walletState.address) {
      setErrorMsg('Please connect your Web3 wallet before proceeding.');
      return;
    }
    if (adminConfig.isProtocolPaused) {
      setErrorMsg('Protocol is currently paused by administrator. Loan issuance is temporarily halted.');
      return;
    }
    if (!isValidAmount) {
      setErrorMsg(`Amount must be between ${tier.minAmount} and ${tier.maxAmount} USDC.`);
      return;
    }
    if (!hasSufficientCollateral) {
      setErrorMsg(`Insufficient USDC in wallet for collateral deposit. You have ${walletState.usdcBalance} USDC but need ${collateralAmount} USDC. Use Faucet to top up.`);
      return;
    }

    setErrorMsg(null);

    try {
      // Step 1: Approve Collateral
      setStep('approving_collateral');
      setTxProgressText(`Requesting ERC-20 approval for ${collateralAmount} USDC collateral transfer...`);
      await new Promise((resolve) => setTimeout(resolve, 1400));

      // Step 2: Signing & Disbursing
      setStep('signing_contract');
      setTxProgressText('Calling OptimismLendingPool.requestLoan() on Optimism Mainnet...');
      await new Promise((resolve) => setTimeout(resolve, 1800));

      // Successful loan generation
      const loanId = 'LOAN-OP-' + Math.floor(1000 + Math.random() * 9000);
      const randomHex = () =>
        '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
      const txHashDisbursement = randomHex();

      const newLoan: Loan = {
        id: loanId,
        borrowerAddress: walletState.address,
        tierId: tier.id,
        principalAmount: requestedAmount,
        commissionAmount,
        commissionPercent,
        collateralAmount,
        collateralPercent,
        collateralRefunded: false,
        interestRateAnnual: 0,
        disbursedAmount: netReceivedAmount,
        issuedAt: Date.now(),
        expiresAt: Date.now() + selectedDurationDays * 24 * 60 * 60 * 1000,
        repaymentDeadlineDays: selectedDurationDays,
        status: 'active',
        txHashDisbursement,
      };

      // Deduct collateral and credit net USDC in wallet balance for realistic experience
      walletState.usdcBalance = Number(
        (walletState.usdcBalance - collateralAmount + netReceivedAmount).toFixed(2)
      );

      StorageService.addLoan(newLoan);
      setStep('completed');
      onLoanIssued(newLoan);
    } catch (err: any) {
      setErrorMsg(err.message || 'Transaction rejected or failed on Optimism');
      setStep('configure');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 dark:bg-black/85 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white dark:bg-[#121721] border border-slate-200 dark:border-[#21262d] rounded-2xl w-full max-w-xl max-h-[92vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="p-6 border-b border-slate-200 dark:border-[#21262d] flex items-center justify-between bg-slate-50 dark:bg-transparent">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#ff0420]/15 dark:bg-[#ff0420]/20 border border-[#ff0420]/30 dark:border-[#ff0420]/40 flex items-center justify-center text-[#ff0420] font-bold text-xs">
              OP
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                Personalized Loan Offer: {tier.name}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Optimism Network · Circle Native USDC
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Offer Countdown */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-100 dark:bg-[#161b22] border border-slate-200 dark:border-[#30363d] text-xs font-mono text-slate-700 dark:text-slate-300">
              <Clock className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
              <span>Offer Expires:</span>
              <span className="text-slate-900 dark:text-white font-bold">{formatCountdown(countdownSeconds)}</span>
            </div>

            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-700 dark:hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        {step === 'completed' ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-500/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h4 className="text-xl font-bold text-slate-900 dark:text-white">Loan Successfully Issued!</h4>
            <p className="text-sm text-slate-600 dark:text-slate-300 max-w-md mx-auto">
              <strong className="text-emerald-600 dark:text-emerald-400">{netReceivedAmount} USDC</strong> has been disbursed to your wallet. Your <strong className="text-slate-800 dark:text-slate-200">{collateralAmount} USDC</strong> collateral is locked in escrow and will be refunded immediately upon full repayment.
            </p>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#090c10] border border-slate-200 dark:border-[#21262d] text-xs text-left space-y-2 max-w-sm mx-auto font-mono">
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Repayment Due:</span>
                <span className="text-slate-900 dark:text-white font-bold">{selectedDurationDays} Days</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Principal Due:</span>
                <span className="text-slate-900 dark:text-white font-bold">{repaymentPrincipal} USDC</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Collateral Refundable:</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">{collateralAmount} USDC</span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="px-6 py-2.5 bg-[#ff0420] hover:bg-[#e0001a] text-white text-xs font-bold rounded-lg transition-colors shadow-md cursor-pointer"
            >
              View in My Loans
            </button>
          </div>
        ) : step !== 'configure' ? (
          <div className="p-10 text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-[#161b22] border border-slate-200 dark:border-[#30363d] flex items-center justify-center mx-auto">
              <div className="w-8 h-8 border-3 border-[#ff0420] border-t-transparent rounded-full animate-spin" />
            </div>

            <div>
              <h4 className="text-lg font-bold text-slate-900 dark:text-white">
                {step === 'approving_collateral' ? 'Step 1/2: Approving Collateral' : 'Step 2/2: Confirming Smart Contract'}
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 max-w-xs mx-auto">
                {txProgressText}
              </p>
            </div>

            <div className="flex items-center justify-center gap-2 text-xs font-mono text-slate-500 dark:text-slate-400">
              <span className={step === 'approving_collateral' ? 'text-amber-600 dark:text-amber-400 font-bold' : 'text-emerald-600 dark:text-emerald-400'}>
                1. Collateral Approval
              </span>
              <span>→</span>
              <span className={step === 'signing_contract' ? 'text-amber-600 dark:text-amber-400 font-bold' : 'text-slate-400'}>
                2. Loan Disburse
              </span>
            </div>
          </div>
        ) : (
          <div className="p-6 space-y-6">
            {/* Amount Configuration Slider & Input */}
            <div>
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Select Loan Amount (USDC)
                </label>
                <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
                  Tier Bounds: {tier.minAmount} – {tier.maxAmount} USDC
                </span>
              </div>

              <div className="mt-2 flex items-center gap-3">
                <input
                  type="range"
                  min={tier.minAmount}
                  max={tier.maxAmount}
                  step={10}
                  value={requestedAmount}
                  onChange={(e) => setRequestedAmount(Number(e.target.value))}
                  className="flex-1 accent-[#ff0420] cursor-pointer"
                />
                <div className="relative w-36">
                  <input
                    type="number"
                    min={tier.minAmount}
                    max={tier.maxAmount}
                    value={requestedAmount}
                    onChange={(e) => setRequestedAmount(Number(e.target.value))}
                    className="w-full bg-slate-50 dark:bg-[#090c10] border border-slate-200 dark:border-[#21262d] focus:border-[#ff0420] rounded-lg px-3 py-2 text-sm font-mono font-bold text-slate-900 dark:text-white outline-none"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-mono text-slate-400">
                    USDC
                  </span>
                </div>
              </div>

              {!isValidAmount && (
                <p className="mt-1 text-xs text-amber-600 dark:text-amber-400">
                  Selected amount is outside {tier.name} tier limits ({tier.minAmount}–{tier.maxAmount} USDC).
                </p>
              )}
            </div>

            {/* Repayment Term Selector */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Repayment Duration
                </label>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                  Interest: 0% Fixed (Flat Commission)
                </span>
              </div>

              <div className="grid grid-cols-4 gap-2">
                {allowedPeriods.map((days) => (
                  <button
                    key={days}
                    type="button"
                    onClick={() => setSelectedDurationDays(days)}
                    className={`py-2 px-3 text-xs font-mono font-semibold rounded-lg border transition-all cursor-pointer ${
                      selectedDurationDays === days
                        ? 'bg-rose-50 dark:bg-[#ff0420]/20 border-[#ff0420] text-[#ff0420] dark:text-white shadow-xs'
                        : 'bg-slate-50 dark:bg-[#090c10] border-slate-200 dark:border-[#21262d] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:border-slate-300 dark:hover:border-[#30363d]'
                    }`}
                  >
                    {days} Days
                  </button>
                ))}
              </div>
            </div>

            {/* Financial Accounting Breakdown (Prompt Item 5: Separate accounting, clear net receipt) */}
            <div className="bg-slate-50 dark:bg-[#090c10] border border-slate-200 dark:border-[#21262d] rounded-xl p-4 space-y-3">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-[#21262d] pb-2">
                Financial Accounting Breakdown
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between items-center text-slate-700 dark:text-slate-300">
                  <span>Loan Principal Amount:</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">{requestedAmount.toFixed(2)} USDC</span>
                </div>

                <div className="flex justify-between items-center text-slate-700 dark:text-slate-300">
                  <span>Platform Commission ({commissionPercent}%):</span>
                  <span className="font-mono text-slate-700 dark:text-slate-300">-{commissionAmount.toFixed(2)} USDC</span>
                </div>

                <div className="flex justify-between items-center text-emerald-600 dark:text-emerald-400 font-semibold pt-1 border-t border-slate-200 dark:border-[#21262d]">
                  <span>Actual Net USDC Disbursed to Wallet:</span>
                  <span className="font-mono text-sm font-bold text-emerald-600 dark:text-emerald-400">
                    +{netReceivedAmount.toFixed(2)} USDC
                  </span>
                </div>

                <div className="flex justify-between items-center text-amber-700 dark:text-amber-300 pt-1 border-t border-slate-200 dark:border-[#21262d]">
                  <div>
                    <span>Required Collateral Deposit ({collateralPercent}%):</span>
                    <span className="block text-[10px] text-slate-500 dark:text-slate-400">
                      Locked in escrow · 100% refunded upon repayment
                    </span>
                  </div>
                  <span className="font-mono font-bold text-amber-600 dark:text-amber-400">
                    {collateralAmount.toFixed(2)} USDC
                  </span>
                </div>

                <div className="flex justify-between items-center text-slate-700 dark:text-slate-300 pt-1 border-t border-slate-200 dark:border-[#21262d]">
                  <span>Total Repayment Due at Maturity:</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">{repaymentPrincipal.toFixed(2)} USDC</span>
                </div>
              </div>
            </div>

            {/* Wallet Balance Verification */}
            <div className="p-3 bg-slate-100 dark:bg-[#161b22] border border-slate-200 dark:border-[#30363d] rounded-lg flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="text-slate-500 dark:text-slate-400">Your USDC Balance:</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">
                  {walletState.usdcBalance.toFixed(2)} USDC
                </span>
              </div>

              {!hasSufficientCollateral ? (
                <span className="text-red-500 dark:text-red-400 font-medium flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  Need +{(collateralAmount - walletState.usdcBalance).toFixed(2)} USDC Collateral
                </span>
              ) : (
                <span className="text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" />
                  Collateral Available
                </span>
              )}
            </div>

            {errorMsg && (
              <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/60 rounded-lg text-xs text-red-700 dark:text-red-300 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-500 dark:text-red-400 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Modal Actions */}
            <div className="pt-2 flex items-center justify-between gap-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-[#161b22] hover:bg-slate-200 dark:hover:bg-[#21262d] border border-slate-200 dark:border-[#30363d] rounded-lg transition-colors cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleConfirmLoan}
                disabled={!isValidAmount || !hasSufficientCollateral || adminConfig.isProtocolPaused}
                className="flex-1 py-3 px-4 bg-[#ff0420] hover:bg-[#e0001a] disabled:opacity-50 text-white font-bold text-xs rounded-lg transition-all shadow-md shadow-[#ff0420]/20 flex items-center justify-center gap-2 active:scale-[0.98] cursor-pointer"
              >
                <span>CONFIRM CONDITIONS & DEPOSIT COLLATERAL</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
