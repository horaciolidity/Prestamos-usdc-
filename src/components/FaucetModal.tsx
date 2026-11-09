import React, { useState } from 'react';
import { Web3WalletState } from '../types';
import { Web3Service } from '../services/web3';
import { StorageService } from '../services/storage';
import { X, Droplets, CheckCircle2, AlertCircle } from 'lucide-react';

interface FaucetModalProps {
  isOpen: boolean;
  onClose: () => void;
  walletState: Web3WalletState;
  onMintSuccess: () => void;
}

export const FaucetModal: React.FC<FaucetModalProps> = ({
  isOpen,
  onClose,
  walletState,
  onMintSuccess,
}) => {
  const [amountUSDC, setAmountUSDC] = useState<number>(1000);
  const [isMinting, setIsMinting] = useState<boolean>(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleMint = async () => {
    if (!walletState.address) return;
    setIsMinting(true);
    setSuccessMsg(null);

    await new Promise((resolve) => setTimeout(resolve, 800));

    Web3Service.faucetMint(amountUSDC, 0.5);

    StorageService.addTransaction({
      id: 'tx-faucet-' + Date.now(),
      hash: '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join(''),
      type: 'FAUCET_MINT',
      address: walletState.address,
      amount: amountUSDC,
      token: 'USDC',
      timestamp: Date.now(),
      blockNumber: 129080110,
      status: 'CONFIRMED',
      description: `Faucet dispensed +${amountUSDC} USDC & +0.5 ETH for testing`,
    });

    setIsMinting(false);
    setSuccessMsg(`Successfully minted +${amountUSDC} USDC and +0.50 ETH!`);
    onMintSuccess();
    setTimeout(() => {
      setSuccessMsg(null);
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 dark:bg-black/85 backdrop-blur-sm">
      <div className="bg-white dark:bg-[#121721] border border-slate-200 dark:border-[#21262d] rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-slate-200 dark:border-[#21262d] flex items-center justify-between bg-slate-50 dark:bg-transparent">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-sky-100 dark:bg-cyan-950/60 border border-sky-300 dark:border-cyan-800/40 text-sky-600 dark:text-cyan-400 flex items-center justify-center">
              <Droplets className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Optimism Testnet Faucet</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Mint USDC & ETH for collateral testing</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <p className="text-xs text-slate-600 dark:text-slate-300">
            Select test USDC amount to receive in your connected wallet. This allows you to deposit the mandatory 15% collateral and test repayments.
          </p>

          <div className="grid grid-cols-3 gap-2">
            {[500, 1000, 2500].map((amt) => (
              <button
                key={amt}
                type="button"
                onClick={() => setAmountUSDC(amt)}
                className={`py-2 px-3 rounded-lg border text-xs font-mono font-bold transition-all cursor-pointer ${
                  amountUSDC === amt
                    ? 'bg-rose-50 dark:bg-[#ff0420]/20 border-[#ff0420] text-[#ff0420] dark:text-white shadow-xs'
                    : 'bg-slate-50 dark:bg-[#090c10] border-slate-200 dark:border-[#21262d] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                +{amt} USDC
              </button>
            ))}
          </div>

          <div className="p-3 bg-slate-50 dark:bg-[#090c10] border border-slate-200 dark:border-[#21262d] rounded-lg text-xs space-y-1">
            <div className="flex justify-between text-slate-500 dark:text-slate-400">
              <span>Target Wallet:</span>
              <span className="font-mono text-slate-800 dark:text-slate-200">
                {walletState.address
                  ? `${walletState.address.slice(0, 6)}...${walletState.address.slice(-4)}`
                  : 'No wallet connected'}
              </span>
            </div>
            <div className="flex justify-between text-slate-500 dark:text-slate-400">
              <span>Includes Gas Allowance:</span>
              <span className="font-mono text-emerald-600 dark:text-emerald-400 font-semibold">+0.50 ETH</span>
            </div>
          </div>

          {successMsg && (
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800/60 rounded-lg text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          <button
            onClick={handleMint}
            disabled={!walletState.address || isMinting}
            className="w-full py-3 bg-[#ff0420] hover:bg-[#e0001a] disabled:opacity-50 text-white font-bold text-xs rounded-lg transition-all shadow-md shadow-[#ff0420]/20 flex items-center justify-center gap-2 mt-2 cursor-pointer"
          >
            {isMinting ? (
              <span>Dispensing Tokens...</span>
            ) : (
              <span>Mint {amountUSDC} USDC & 0.5 ETH</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
