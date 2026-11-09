import React from 'react';
import { Web3WalletState } from '../types';
import { Web3Service } from '../services/web3';
import { ShieldCheck, AlertCircle, Droplets, LogOut, HelpCircle, Sun, Moon } from 'lucide-react';

interface NavbarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  walletState: Web3WalletState;
  onOpenFaucet: () => void;
  onOpenConnectModal: () => void;
  onOpenHelp: () => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  walletState,
  onOpenFaucet,
  onOpenConnectModal,
  onOpenHelp,
  theme,
  onToggleTheme,
}) => {
  const formatAddress = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-[#090c10]/95 backdrop-blur-md border-b border-slate-200 dark:border-[#21262d] transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand Wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => onSelectTab('dashboard')}
            className="flex items-center gap-2.5 text-left focus:outline-none group"
          >
            <div className="w-8 h-8 rounded-lg bg-[#ff0420] flex items-center justify-center font-extrabold text-white text-sm shadow-md shadow-[#ff0420]/20">
              OP
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-base tracking-tight text-slate-900 dark:text-white whitespace-nowrap group-hover:text-[#ff0420] transition-colors">
                OPTIMISM LENDING
              </span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono tracking-wide uppercase">
                USDC Credit Protocol
              </span>
            </div>
          </button>
        </div>

        {/* Zone 2: Navigation Links (Single-line, unboxed, quiet hover states) */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium">
          <button
            onClick={() => onSelectTab('dashboard')}
            className={`whitespace-nowrap transition-colors py-1 ${
              currentTab === 'dashboard'
                ? 'text-slate-900 dark:text-white border-b-2 border-[#ff0420] font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => onSelectTab('marketplace')}
            className={`whitespace-nowrap transition-colors py-1 ${
              currentTab === 'marketplace'
                ? 'text-slate-900 dark:text-white border-b-2 border-[#ff0420] font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Borrow USDC
          </button>
          <button
            onClick={() => onSelectTab('my-loans')}
            className={`whitespace-nowrap transition-colors py-1 ${
              currentTab === 'my-loans'
                ? 'text-slate-900 dark:text-white border-b-2 border-[#ff0420] font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            My Loans
          </button>
          <button
            onClick={() => onSelectTab('transactions')}
            className={`whitespace-nowrap transition-colors py-1 ${
              currentTab === 'transactions'
                ? 'text-slate-900 dark:text-white border-b-2 border-[#ff0420] font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Transactions
          </button>
          <button
            onClick={() => onSelectTab('admin')}
            className={`whitespace-nowrap transition-colors py-1 ${
              currentTab === 'admin'
                ? 'text-slate-900 dark:text-white border-b-2 border-[#ff0420] font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Admin Panel
          </button>
        </nav>

        {/* Zone 3: Primary Action Cluster */}
        <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
          {/* Global High-Contrast Light / Dark Theme Toggle Button */}
          <button
            onClick={onToggleTheme}
            title={theme === 'dark' ? 'Switch to High-Contrast Light Mode' : 'Switch to Dark Mode'}
            className="p-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-100 hover:bg-slate-200 dark:bg-[#161b22] dark:hover:bg-[#21262d] border border-slate-300 dark:border-[#30363d] rounded-lg transition-colors shrink-0 flex items-center justify-center focus:outline-none"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-slate-700" />
            )}
          </button>

          {/* Help & Support FAQ trigger */}
          <button
            onClick={onOpenHelp}
            title="Help, FAQs & Documentation"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-100 hover:bg-slate-200 dark:bg-[#161b22] dark:hover:bg-[#21262d] border border-slate-300 dark:border-[#30363d] rounded-lg transition-colors whitespace-nowrap"
          >
            <HelpCircle className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
            <span className="hidden sm:inline">Help</span>
          </button>

          {/* Faucet trigger */}
          <button
            onClick={onOpenFaucet}
            title="Optimism USDC & ETH Sandbox Faucet"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-100 hover:bg-slate-200 dark:bg-[#161b22] dark:hover:bg-[#21262d] border border-slate-300 dark:border-[#30363d] rounded-lg transition-colors whitespace-nowrap"
          >
            <Droplets className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
            <span className="hidden sm:inline">Faucet</span>
          </button>

          {/* Network indicator / switch */}
          {walletState.isConnected && !walletState.isOptimism && (
            <button
              onClick={() => Web3Service.switchToOptimism()}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-amber-800 bg-amber-100 border border-amber-400 dark:text-amber-300 dark:bg-amber-950/40 dark:border-amber-600/60 rounded-lg hover:bg-amber-200 dark:hover:bg-amber-900/50 transition-colors whitespace-nowrap animate-pulse"
            >
              <AlertCircle className="w-3.5 h-3.5" />
              <span>Switch to Optimism</span>
            </button>
          )}

          {walletState.isConnected && walletState.isOptimism && (
            <div className="hidden lg:flex items-center gap-2 px-2.5 py-1 text-xs bg-slate-100 dark:bg-[#12161f] border border-slate-200 dark:border-[#232b3d] rounded-lg font-mono text-slate-700 dark:text-slate-300">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>OP Mainnet</span>
            </div>
          )}

          {/* Wallet Button */}
          {walletState.isConnected && walletState.address ? (
            <div className="flex items-center gap-2">
              <div className="hidden sm:flex flex-col text-right text-xs">
                <span className="font-mono text-slate-900 dark:text-white font-semibold tabular-nums">
                  {walletState.usdcBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USDC
                </span>
                <span className="font-mono text-slate-500 dark:text-slate-400 tabular-nums">
                  {walletState.ethBalance.toFixed(3)} ETH
                </span>
              </div>

              <div className="flex items-center gap-1 bg-slate-100 dark:bg-[#161b22] border border-slate-300 dark:border-[#30363d] rounded-lg p-1">
                <button
                  onClick={onOpenConnectModal}
                  className="px-2.5 py-1 text-xs font-mono text-slate-800 dark:text-slate-200 hover:text-slate-950 dark:hover:text-white transition-colors flex items-center gap-1.5"
                >
                  {walletState.isSigned ? (
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  ) : (
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                  )}
                  <span>{formatAddress(walletState.address)}</span>
                </button>
                <button
                  onClick={() => Web3Service.disconnect()}
                  title="Disconnect wallet"
                  className="p-1 text-slate-500 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400 hover:bg-slate-200 dark:hover:bg-[#21262d] rounded transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={onOpenConnectModal}
              className="px-4 py-2 text-xs font-semibold text-white bg-[#ff0420] hover:bg-[#e0001a] rounded-lg transition-all shadow-md shadow-[#ff0420]/20 whitespace-nowrap active:scale-[0.98]"
            >
              Connect Wallet
            </button>
          )}
        </div>
      </div>

      {/* Mobile navigation tab strip */}
      <div className="md:hidden flex items-center justify-around border-t border-slate-200 dark:border-[#21262d] bg-slate-100 dark:bg-[#0c1017] px-2 py-2 overflow-x-auto text-xs">
        {['dashboard', 'marketplace', 'my-loans', 'transactions', 'admin'].map((tab) => (
          <button
            key={tab}
            onClick={() => onSelectTab(tab)}
            className={`px-3 py-1.5 rounded font-medium capitalize whitespace-nowrap ${
              currentTab === tab 
                ? 'text-slate-900 bg-white shadow-sm dark:text-white dark:bg-[#21262d]' 
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            {tab.replace('-', ' ')}
          </button>
        ))}
      </div>
    </header>
  );
};
