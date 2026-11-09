import React, { useState } from 'react';
import { Web3WalletState } from '../types';
import { Web3Service, DEMO_PROFILES, DemoWalletProfile } from '../services/web3';
import { X, ShieldCheck, Check, AlertCircle, Sparkles, KeyRound } from 'lucide-react';

interface WalletConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
  walletState: Web3WalletState;
}

export const WalletConnectModal: React.FC<WalletConnectModalProps> = ({
  isOpen,
  onClose,
  walletState,
}) => {
  const [connecting, setConnecting] = useState<boolean>(false);
  const [signing, setSigning] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleConnectInjected = async () => {
    setConnecting(true);
    setErrorMsg(null);
    const res = await Web3Service.connectInjected();
    setConnecting(false);
    if (!res.success && res.error) {
      setErrorMsg(res.error);
    } else {
      // Prompt signature verification
      handleVerifySignature();
    }
  };

  const handleSelectDemoProfile = (profile: DemoWalletProfile) => {
    Web3Service.activateDemoMode(profile);
    setErrorMsg(null);
  };

  const handleVerifySignature = async () => {
    setSigning(true);
    setErrorMsg(null);
    const res = await Web3Service.verifyOwnershipSignature();
    setSigning(false);
    if (!res.success && res.error) {
      setErrorMsg(res.error);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 dark:bg-black/85 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white dark:bg-[#121721] border border-slate-200 dark:border-[#21262d] rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="p-6 border-b border-slate-200 dark:border-[#21262d] flex items-center justify-between bg-slate-50 dark:bg-transparent">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#ff0420] text-white flex items-center justify-center font-bold text-sm">
              OP
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Connect Web3 Wallet</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Optimism Mainnet (Chain ID 10)</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Security Guarantee Banner */}
          <div className="p-3 bg-slate-100 dark:bg-[#161b22] border border-slate-200 dark:border-[#30363d] rounded-lg text-xs text-slate-700 dark:text-slate-300 flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-900 dark:text-white">Zero-Knowledge Security:</strong>
              <p className="text-slate-600 dark:text-slate-400 mt-0.5">
                We never request, handle, or store your private keys or seed phrases. All protocol interactions are signed cryptographically via EIP-191.
              </p>
            </div>
          </div>

          {/* Current Connection Status */}
          {walletState.isConnected && walletState.address ? (
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#090c10] border border-slate-200 dark:border-[#21262d] space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 dark:text-slate-400">Connected Address:</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">
                  {walletState.address.slice(0, 10)}...{walletState.address.slice(-8)}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 dark:text-slate-400">Network:</span>
                <span className={walletState.isOptimism ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-amber-600 dark:text-amber-400 font-bold'}>
                  {walletState.isOptimism ? 'Optimism Mainnet (Chain ID 10)' : 'Non-Optimism Chain'}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 dark:text-slate-400">Balances:</span>
                <span className="font-mono text-slate-800 dark:text-slate-200">
                  {walletState.usdcBalance.toFixed(2)} USDC · {walletState.ethBalance.toFixed(4)} ETH
                </span>
              </div>

              <div className="pt-2 border-t border-slate-200 dark:border-[#21262d] flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs">
                  {walletState.isSigned ? (
                    <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" />
                      Ownership Signature Verified
                    </span>
                  ) : (
                    <span className="text-amber-600 dark:text-amber-400 font-medium flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      Pending Signature
                    </span>
                  )}
                </div>

                {!walletState.isSigned && (
                  <button
                    onClick={handleVerifySignature}
                    disabled={signing}
                    className="px-3 py-1.5 bg-[#ff0420] hover:bg-[#e0001a] text-white text-xs font-bold rounded transition-colors cursor-pointer"
                  >
                    {signing ? 'Signing...' : 'Sign EIP-191 Nonce'}
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
                Browser Wallets
              </h4>
              <button
                onClick={handleConnectInjected}
                disabled={connecting}
                className="w-full p-3.5 bg-slate-100 dark:bg-[#161b22] hover:bg-slate-200 dark:hover:bg-[#21262d] border border-slate-200 dark:border-[#30363d] rounded-xl text-left flex items-center justify-between transition-all group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-slate-200 dark:bg-[#21262d] flex items-center justify-center text-slate-700 dark:text-slate-200 font-bold text-xs">
                    🦊
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-[#ff0420] transition-colors">
                      MetaMask / Rabby / Injected Web3
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">
                      Connect via browser extension on Optimism
                    </div>
                  </div>
                </div>
                <span className="text-xs font-semibold text-[#ff0420]">Connect →</span>
              </button>
            </div>
          )}

          {/* Interactive Optimism Sandbox & Test Profiles */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Optimism Sandbox Profiles (Instant Testing)
              </h4>
              <span className="text-[10px] text-sky-600 dark:text-cyan-400 font-mono">Real-time simulation</span>
            </div>

            <div className="space-y-2">
              {DEMO_PROFILES.map((profile, i) => (
                <button
                  key={i}
                  onClick={() => handleSelectDemoProfile(profile)}
                  className={`w-full p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    walletState.address?.toLowerCase() === profile.address.toLowerCase()
                      ? 'bg-rose-50/70 dark:bg-[#181f2c] border-[#ff0420] shadow-xs'
                      : 'bg-slate-50 dark:bg-[#090c10] border-slate-200 dark:border-[#21262d] hover:border-slate-300 dark:hover:border-[#30363d]'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-900 dark:text-white">{profile.name}</span>
                    <span className="font-mono text-emerald-600 dark:text-emerald-400 font-semibold">{profile.usdcBalance} USDC</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">{profile.description}</p>
                </button>
              ))}
            </div>
          </div>

          {errorMsg && (
            <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/60 rounded-lg text-xs text-red-700 dark:text-red-300 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-500 dark:text-red-400 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-slate-200 dark:border-[#21262d] bg-slate-50 dark:bg-[#0c1017] flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-100 dark:bg-[#21262d] hover:bg-slate-200 dark:hover:bg-[#30363d] text-slate-800 dark:text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
