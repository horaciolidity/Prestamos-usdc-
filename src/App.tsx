import React, { useState, useEffect } from 'react';
import { 
  LoanTier, 
  Loan, 
  WalletEvaluation, 
  AdminConfig, 
  TransactionRecord, 
  AuditLogEntry, 
  Web3WalletState 
} from './types';
import { StorageService } from './services/storage';
import { Web3Service, DEMO_PROFILES } from './services/web3';
import { WalletEvaluationService } from './services/walletEvaluation';
import { Navbar } from './components/Navbar';
import { RealTimeStats } from './components/RealTimeStats';
import { NotificationBanner } from './components/NotificationBanner';
import { UserDashboard } from './components/UserDashboard';
import { LoanMarketplace } from './components/LoanMarketplace';
import { MyLoans } from './components/MyLoans';
import { TransactionHistory } from './components/TransactionHistory';
import { AdminPanel } from './components/AdminPanel';
import { WalletEvaluationModal } from './components/WalletEvaluationModal';
import { LoanOfferModal } from './components/LoanOfferModal';
import { RepayModal } from './components/RepayModal';
import { WalletConnectModal } from './components/WalletConnectModal';
import { FaucetModal } from './components/FaucetModal';
import { HelpSupportModal } from './components/HelpSupportModal';

export default function App() {
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [walletState, setWalletState] = useState<Web3WalletState>(() => Web3Service.getState());
  
  // Protocol State
  const [tiers, setTiers] = useState<LoanTier[]>(() => StorageService.getTiers());
  const [loans, setLoans] = useState<Loan[]>(() => StorageService.getLoans());
  const [adminConfig, setAdminConfig] = useState<AdminConfig>(() => StorageService.getAdminConfig());
  const [transactions, setTransactions] = useState<TransactionRecord[]>(() => StorageService.getTransactions());
  const [evaluations, setEvaluations] = useState<WalletEvaluation[]>(() => StorageService.getEvaluations());
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(() => StorageService.getAuditLog());
  const [statsRefreshTrigger, setStatsRefreshTrigger] = useState<number>(0);

  // Modals & Active Flows
  const [isConnectModalOpen, setIsConnectModalOpen] = useState<boolean>(false);
  const [isFaucetModalOpen, setIsFaucetModalOpen] = useState<boolean>(false);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState<boolean>(false);
  const [selectedEvaluation, setSelectedEvaluation] = useState<WalletEvaluation | null>(null);
  const [isEvaluationModalOpen, setIsEvaluationModalOpen] = useState<boolean>(false);
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);
  
  const [selectedOfferTier, setSelectedOfferTier] = useState<LoanTier | null>(null);
  const [initialOfferAmount, setInitialOfferAmount] = useState<number>(1000);
  const [isOfferModalOpen, setIsOfferModalOpen] = useState<boolean>(false);

  const [selectedRepayLoan, setSelectedRepayLoan] = useState<Loan | null>(null);
  const [isRepayModalOpen, setIsRepayModalOpen] = useState<boolean>(false);

  const [dismissedNotifications, setDismissedNotifications] = useState<Set<string>>(new Set());

  // Global Theme Management (Dark / High-Contrast Light)
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem('optimism_lending_theme');
    if (saved === 'light' || saved === 'dark') return saved;
    return 'dark'; // Default dark mode
  });

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('optimism_lending_theme', theme);
  }, [theme]);

  const handleToggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Subscribe to Web3 state
  useEffect(() => {
    const unsubscribe = Web3Service.subscribe((state) => {
      setWalletState(state);
    });

    // Auto-connect first demo profile if no wallet connected to make application immediately testable
    const currentState = Web3Service.getState();
    if (!currentState.isConnected) {
      Web3Service.activateDemoMode(DEMO_PROFILES[0]);
    }

    return () => unsubscribe();
  }, []);

  const refreshAllData = () => {
    setTiers(StorageService.getTiers());
    setLoans(StorageService.getLoans());
    setAdminConfig(StorageService.getAdminConfig());
    setTransactions(StorageService.getTransactions());
    setEvaluations(StorageService.getEvaluations());
    setAuditLogs(StorageService.getAuditLog());
    setStatsRefreshTrigger((prev) => prev + 1);
  };

  // Wallet address evaluation workflow
  const handleAnalyzeAddress = async (address: string) => {
    setIsEvaluating(true);
    try {
      const evaluation = await WalletEvaluationService.evaluateAddress(address);
      setSelectedEvaluation(evaluation);
      setEvaluations(StorageService.getEvaluations());
      setIsEvaluationModalOpen(true);
    } catch (err: any) {
      alert(err.message || 'Evaluation failed');
    } finally {
      setIsEvaluating(false);
    }
  };

  // Open loan offer
  const handleOpenLoanOffer = (tier: LoanTier, prefilledAmount?: number) => {
    setSelectedOfferTier(tier);
    setInitialOfferAmount(prefilledAmount || tier.minAmount);
    setIsOfferModalOpen(true);
    setIsEvaluationModalOpen(false);
  };

  // Handle loan issuance success
  const handleLoanIssued = (newLoan: Loan) => {
    refreshAllData();
  };

  // Handle loan repayment success
  const handleRepaymentSuccess = () => {
    refreshAllData();
    setIsRepayModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 dark:bg-[#090c10] dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      {/* Top Bar Navigation (Top Bar Contract Compliant) */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        walletState={walletState}
        onOpenFaucet={() => setIsFaucetModalOpen(true)}
        onOpenConnectModal={() => setIsConnectModalOpen(true)}
        onOpenHelp={() => setIsHelpModalOpen(true)}
        theme={theme}
        onToggleTheme={handleToggleTheme}
      />

      {/* Real-Time Protocol Counter Strip */}
      <RealTimeStats statsRefreshTrigger={statsRefreshTrigger} />

      {/* Protocol Emergency Pause Notice */}
      {adminConfig.isProtocolPaused && (
        <div className="bg-amber-950/60 border-b border-amber-800/80 px-4 py-2.5 text-center text-xs font-semibold text-amber-200">
          ⚠️ Protocol issuance is temporarily paused by protocol administrator. Active loans and repayments continue normally.
        </div>
      )}

      {/* Urgent Notifications (Loan Deadlines, Overdue, Collateral Refunds) */}
      <NotificationBanner
        loans={loans}
        userAddress={walletState.address}
        onViewLoan={() => setCurrentTab('my-loans')}
        onDismiss={(key) => {
          setDismissedNotifications((prev) => new Set([...prev, key]));
        }}
        dismissedKeys={dismissedNotifications}
      />

      {/* Main Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentTab === 'dashboard' && (
          <UserDashboard
            loans={loans}
            walletState={walletState}
            evaluations={evaluations}
            tiers={tiers}
            onOpenBorrow={() => setCurrentTab('marketplace')}
            onOpenMyLoans={() => setCurrentTab('my-loans')}
            onOpenRepayModal={(loan) => {
              setSelectedRepayLoan(loan);
              setIsRepayModalOpen(true);
            }}
            onReAnalyze={(addr) => handleAnalyzeAddress(addr)}
            onOpenHelp={() => setIsHelpModalOpen(true)}
          />
        )}

        {currentTab === 'marketplace' && (
          <LoanMarketplace
            tiers={tiers}
            walletState={walletState}
            lastEvaluation={selectedEvaluation}
            onAnalyzeAddress={handleAnalyzeAddress}
            onApplyForTier={(tier) => handleOpenLoanOffer(tier)}
            isEvaluating={isEvaluating}
            onOpenConnectModal={() => setIsConnectModalOpen(true)}
            onOpenHelp={() => setIsHelpModalOpen(true)}
          />
        )}

        {currentTab === 'my-loans' && (
          <MyLoans
            loans={loans}
            walletState={walletState}
            onOpenRepayModal={(loan) => {
              setSelectedRepayLoan(loan);
              setIsRepayModalOpen(true);
            }}
            onOpenBorrow={() => setCurrentTab('marketplace')}
            onRefresh={refreshAllData}
            onOpenHelp={() => setIsHelpModalOpen(true)}
          />
        )}

        {currentTab === 'transactions' && (
          <TransactionHistory transactions={transactions} />
        )}

        {currentTab === 'admin' && (
          <AdminPanel
            adminConfig={adminConfig}
            onUpdateConfig={(newConfig) => {
              StorageService.saveAdminConfig(newConfig);
              setAdminConfig(newConfig);
              refreshAllData();
            }}
            tiers={tiers}
            onUpdateTiers={(newTiers) => {
              StorageService.saveTiers(newTiers);
              setTiers(newTiers);
              refreshAllData();
            }}
            loans={loans}
            evaluations={evaluations}
            auditLogs={auditLogs}
            walletState={walletState}
            onRefresh={refreshAllData}
          />
        )}
      </main>

      {/* Protocol Footer */}
      <footer className="mt-auto border-t border-slate-200 dark:border-[#21262d] bg-slate-100 dark:bg-[#0c1017] py-8 text-xs text-slate-600 dark:text-slate-500 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800 dark:text-slate-300">OPTIMISM LENDING</span>
            <span>·</span>
            <span>USDC Credit Protocol</span>
            <span>·</span>
            <span className="font-mono text-slate-500 dark:text-slate-400">Chain ID 10</span>
          </div>

          <div className="flex items-center gap-6">
            <a
              href="https://optimistic.etherscan.io"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-slate-900 dark:hover:text-slate-300 transition-colors"
            >
              Optimism Etherscan
            </a>
            <a
              href="https://www.circle.com/en/usdc/optimism"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-slate-900 dark:hover:text-slate-300 transition-colors"
            >
              Circle Native USDC
            </a>
            <button
              onClick={() => setIsHelpModalOpen(true)}
              className="hover:text-slate-900 dark:hover:text-slate-300 transition-colors"
            >
              Help & FAQs
            </button>
            <button
              onClick={() => setCurrentTab('admin')}
              className="hover:text-slate-900 dark:hover:text-slate-300 transition-colors"
            >
              Administrator Panel
            </button>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <WalletConnectModal
        isOpen={isConnectModalOpen}
        onClose={() => setIsConnectModalOpen(false)}
        walletState={walletState}
      />

      <FaucetModal
        isOpen={isFaucetModalOpen}
        onClose={() => setIsFaucetModalOpen(false)}
        walletState={walletState}
        onMintSuccess={refreshAllData}
      />

      <WalletEvaluationModal
        isOpen={isEvaluationModalOpen}
        onClose={() => setIsEvaluationModalOpen(false)}
        evaluation={selectedEvaluation}
        tiers={tiers}
        onProceedToLoan={(tier, amount) => handleOpenLoanOffer(tier, amount)}
        onReAnalyze={() => {
          if (selectedEvaluation) {
            handleAnalyzeAddress(selectedEvaluation.address);
          }
        }}
      />

      {selectedOfferTier && (
        <LoanOfferModal
          isOpen={isOfferModalOpen}
          onClose={() => {
            setIsOfferModalOpen(false);
            setSelectedOfferTier(null);
          }}
          tier={selectedOfferTier}
          initialAmount={initialOfferAmount}
          walletState={walletState}
          onLoanIssued={(loan) => {
            handleLoanIssued(loan);
            setCurrentTab('my-loans');
          }}
        />
      )}

      {selectedRepayLoan && (
        <RepayModal
          isOpen={isRepayModalOpen}
          onClose={() => {
            setIsRepayModalOpen(false);
            setSelectedRepayLoan(null);
          }}
          loan={selectedRepayLoan}
          walletState={walletState}
          onRepaymentSuccess={handleRepaymentSuccess}
        />
      )}

      <HelpSupportModal
        isOpen={isHelpModalOpen}
        onClose={() => setIsHelpModalOpen(false)}
        onOpenBorrow={() => setCurrentTab('marketplace')}
        onOpenFaucet={() => setIsFaucetModalOpen(true)}
      />
    </div>
  );
}
