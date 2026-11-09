import React, { useState } from 'react';
import { 
  X, 
  HelpCircle, 
  Search, 
  ChevronDown, 
  ChevronUp, 
  ShieldCheck, 
  Coins, 
  Clock, 
  ExternalLink,
  ArrowRight,
  Droplets,
  BookOpen,
  Calculator,
  CheckCircle2,
  AlertTriangle,
  Copy,
  Check,
  Zap,
  ArrowDownRight
} from 'lucide-react';
import { OPTIMISM_EXPLORER_URL, OPTIMISM_USDC_ADDRESS, OPTIMISM_LENDING_POOL_ADDRESS } from '../contracts/contractInfo';

interface HelpSupportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenBorrow: () => void;
  onOpenFaucet: () => void;
}

type ModalViewTab = 'faqs' | 'onboarding' | 'calculator';

interface FAQItem {
  id: string;
  category: 'general' | 'collateral' | 'repayment' | 'wallet_audit' | 'security';
  question: string;
  answer: string | React.ReactNode;
}

const FAQ_DATA: FAQItem[] = [
  {
    id: 'faq-1',
    category: 'general',
    question: 'What is Optimism Lending and how does USDC borrowing work?',
    answer: (
      <div className="space-y-2 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
        <p>
          Optimism Lending is a non-custodial, decentralized micro-credit protocol operating natively on the <strong>Optimism Mainnet (Chain ID 10)</strong>.
        </p>
        <p>
          Borrowers connect their Web3 wallet, evaluate their on-chain address for eligible credit limits (Starter to Premium tiers), deposit the required 15% collateral, and receive instant USDC disbursement directly to their wallet.
        </p>
      </div>
    ),
  },
  {
    id: 'faq-2',
    category: 'collateral',
    question: 'How does the 15% collateral requirement work? When is it refunded?',
    answer: (
      <div className="space-y-2 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
        <p>
          Collateral is locked in a trustless escrow smart contract (<code className="text-slate-800 dark:text-slate-200 font-mono font-semibold">OptimismLendingPool</code>) to secure protocol liquidity:
        </p>
        <ul className="list-disc pl-4 space-y-1.5 text-slate-600 dark:text-slate-300">
          <li><strong>Separate Accounting Concept:</strong> Collateral is strictly not a fee; it remains your reserved asset while in escrow.</li>
          <li><strong>100% Automated Release:</strong> When you repay the full principal before or at maturity, 100% of your collateral is immediately returned to your wallet in the exact same transaction.</li>
          <li><strong>Zero Price Liquidation Risk:</strong> Unlike volatile crypto collateral lending (e.g. ETH/BTC liquidation crashes when prices plummet), USDC is a dollar-pegged stablecoin, meaning your collateral ratio never suffers market volatility liquidations during the active loan term.</li>
        </ul>
      </div>
    ),
  },
  {
    id: 'faq-3',
    category: 'collateral',
    question: 'What is the 15% platform commission? How does net disbursement calculate?',
    answer: (
      <div className="space-y-2 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
        <p>
          The protocol charges a flat 15% platform commission on the principal loan amount, which is deducted upfront upon disbursement:
        </p>
        <div className="p-3 bg-slate-100 dark:bg-[#090c10] border border-slate-200 dark:border-[#21262d] rounded-lg font-mono text-[11px] space-y-1 text-slate-700 dark:text-slate-300">
          <div className="flex justify-between"><span>Loan Principal:</span><span className="text-slate-900 dark:text-white font-bold">1,000.00 USDC</span></div>
          <div className="flex justify-between"><span>Platform Commission (15%):</span><span className="text-amber-600 dark:text-amber-400 font-bold">-150.00 USDC</span></div>
          <div className="flex justify-between border-t border-slate-200 dark:border-[#21262d] pt-1 text-emerald-600 dark:text-emerald-400"><span>Net Disbursed to Wallet:</span><span className="font-bold">+850.00 USDC</span></div>
          <div className="flex justify-between"><span>Required Collateral Deposit:</span><span className="text-amber-600 dark:text-amber-300 font-semibold">150.00 USDC (Held in Escrow)</span></div>
          <div className="flex justify-between border-t border-slate-200 dark:border-[#21262d] pt-1"><span>Principal Due at Maturity:</span><span className="text-slate-900 dark:text-white font-bold">1,000.00 USDC</span></div>
          <div className="flex justify-between text-emerald-600 dark:text-emerald-400"><span>Collateral Refund on Full Settlement:</span><span className="font-bold">+150.00 USDC (Returned)</span></div>
        </div>
      </div>
    ),
  },
  {
    id: 'faq-4',
    category: 'wallet_audit',
    question: 'How does the on-chain wallet address evaluation determine my credit tier?',
    answer: (
      <div className="space-y-2 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
        <p>
          Optimism Lending evaluates objective blockchain facts rather than speculative or invasive off-chain data:
        </p>
        <ul className="list-disc pl-4 space-y-1 text-slate-600 dark:text-slate-300">
          <li><strong>Transaction Nonce:</strong> Confirmed on-chain transaction frequency and maturity on Optimism.</li>
          <li><strong>Native ETH Gas Reserve:</strong> Verifies the wallet holds adequate ETH for gas fees and contract execution.</li>
          <li><strong>DeFi Protocol History:</strong> Verifiable interactions with known Optimism protocols (Velodrome, Uniswap, Aave, Synthetix).</li>
          <li><strong>Protocol Repayment Record:</strong> Timely repayments of previous loans grant immediate qualification for higher tiers.</li>
          <li><strong>Clean Invariant Check:</strong> Addresses with unresolved defaults are restricted from opening duplicate loans.</li>
        </ul>
      </div>
    ),
  },
  {
    id: 'faq-5',
    category: 'repayment',
    question: 'What are the loan terms and repayment deadlines? What happens if a loan expires?',
    answer: (
      <div className="space-y-2 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
        <p>
          Repayment durations range from <strong>15, 30, 45, to 60 days</strong> (configurable by protocol governance).
        </p>
        <ul className="list-disc pl-4 space-y-1 text-slate-600 dark:text-slate-300">
          <li><strong>Live Ticking Countdowns:</strong> Every active loan displays a real-time <code className="text-slate-800 dark:text-slate-200 font-mono font-semibold">DAYS : HOURS : MINUTES : SECONDS</code> countdown clock in the &quot;My Loans&quot; portal.</li>
          <li><strong>Advance Notifications:</strong> The platform displays alerts when deadlines are approaching (within 3 days).</li>
          <li><strong>Early Repayments:</strong> You can repay your loan at any point before the deadline with zero penalties; your collateral is refunded immediately.</li>
          <li><strong>Grace Period & Defaults:</strong> After the deadline expires, an administrator-configurable grace period (typically 5 days) allows borrowers to settle. If delinquent past the grace period, the locked collateral is liquidated to protect protocol liquidity pool solvency.</li>
        </ul>
      </div>
    ),
  },
  {
    id: 'faq-6',
    category: 'security',
    question: 'Are my private keys or funds safe? Does the protocol ask for seed phrases?',
    answer: (
      <div className="space-y-2 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
        <p className="text-emerald-600 dark:text-emerald-400 font-semibold">
          No private keys or seed phrases are ever requested, stored, or transmitted.
        </p>
        <p>
          Wallet authentication uses the industry-standard <strong>EIP-191 personal_sign</strong> cryptographic challenge, proving address ownership without spending gas or granting fund custody. All smart contracts use OpenZeppelin&apos;s audited <code className="text-slate-800 dark:text-slate-200 font-mono font-semibold">ReentrancyGuard</code> and <code className="text-slate-800 dark:text-slate-200 font-mono font-semibold">Pausable</code> architectures.
        </p>
      </div>
    ),
  },
  {
    id: 'faq-7',
    category: 'general',
    question: 'Which USDC token contract is used on Optimism?',
    answer: (
      <div className="space-y-2 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
        <p>
          The protocol strictly uses <strong>Circle&apos;s official Native USDC</strong> on Optimism Mainnet:
        </p>
        <div className="p-2.5 bg-slate-100 dark:bg-[#090c10] border border-slate-200 dark:border-[#21262d] rounded-lg font-mono text-[11px] text-slate-800 dark:text-slate-200 break-all select-all">
          0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85 (6 decimals)
        </div>
        <p className="text-[11px] text-slate-500 dark:text-slate-400">
          Note: This is Circle&apos;s native token, not the legacy bridged USDC.e token.
        </p>
      </div>
    ),
  },
  {
    id: 'faq-8',
    category: 'repayment',
    question: 'How do I download my records for taxes and accounting?',
    answer: (
      <div className="space-y-2 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
        <p>
          Navigate to the <strong>Transactions</strong> tab in the top navigation bar. Click the <strong>&quot;Export to CSV&quot;</strong> button to generate an RFC 4180-compliant CSV spreadsheet containing full transaction hashes, timestamps, token amounts, block heights, and accounting descriptions.
        </p>
      </div>
    ),
  },
];

export const HelpSupportModal: React.FC<HelpSupportModalProps> = ({
  isOpen,
  onClose,
  onOpenBorrow,
  onOpenFaucet,
}) => {
  const [activeTab, setActiveTab] = useState<ModalViewTab>('faqs');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [expandedFaqId, setExpandedFaqId] = useState<string | null>('faq-1');
  const [copiedUsdc, setCopiedUsdc] = useState<boolean>(false);

  // Calculator State
  const [calcPrincipal, setCalcPrincipal] = useState<number>(1000);
  const [calcPeriod, setCalcPeriod] = useState<number>(30);

  if (!isOpen) return null;

  const commissionRate = 0.15;
  const collateralRate = 0.15;
  const calcCommission = calcPrincipal * commissionRate;
  const calcCollateral = calcPrincipal * collateralRate;
  const calcNetDisbursed = calcPrincipal - calcCommission;

  const copyUsdcAddress = () => {
    navigator.clipboard.writeText(OPTIMISM_USDC_ADDRESS);
    setCopiedUsdc(true);
    setTimeout(() => setCopiedUsdc(false), 2000);
  };

  const filteredFaqs = FAQ_DATA.filter((faq) => {
    if (selectedCategory !== 'all' && faq.category !== selectedCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const questionMatch = faq.question.toLowerCase().includes(q);
      const answerText = typeof faq.answer === 'string' ? faq.answer.toLowerCase() : '';
      return questionMatch || answerText.includes(q);
    }
    return true;
  });

  const toggleFaq = (id: string) => {
    setExpandedFaqId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 dark:bg-black/85 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white dark:bg-[#121721] border border-slate-200 dark:border-[#21262d] rounded-2xl w-full max-w-3xl max-h-[92vh] overflow-hidden flex flex-col shadow-2xl transition-colors duration-200">
        
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-200 dark:border-[#21262d] flex items-center justify-between shrink-0 bg-slate-50 dark:bg-[#0c1017]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#ff0420]/15 dark:bg-[#ff0420]/20 border border-[#ff0420]/30 dark:border-[#ff0420]/40 flex items-center justify-center text-[#ff0420] shrink-0">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                  Help & Protocol Documentation
                </h3>
                <span className="hidden sm:inline-block text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-200 dark:bg-[#21262d] text-slate-700 dark:text-slate-300 font-semibold">
                  Optimism Mainnet
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Frequently asked questions, collateral guides, and on-chain mechanics
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 dark:hover:text-white p-1.5 rounded-lg transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Top View Selector Tabs */}
        <div className="px-5 pt-3 pb-2 border-b border-slate-200 dark:border-[#21262d] bg-white dark:bg-[#0e131d] flex items-center gap-2 shrink-0 overflow-x-auto">
          <button
            onClick={() => setActiveTab('faqs')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'faqs'
                ? 'bg-[#ff0420] text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#161b22]'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Frequently Asked Questions</span>
          </button>

          <button
            onClick={() => setActiveTab('onboarding')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'onboarding'
                ? 'bg-[#ff0420] text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#161b22]'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>4-Step Onboarding Guide</span>
          </button>

          <button
            onClick={() => setActiveTab('calculator')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'calculator'
                ? 'bg-[#ff0420] text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#161b22]'
            }`}
          >
            <Calculator className="w-3.5 h-3.5" />
            <span>Collateral Calculator</span>
          </button>
        </div>

        {/* View 1: FAQs */}
        {activeTab === 'faqs' && (
          <div className="flex flex-col flex-1 overflow-hidden">
            {/* Search & Filter Toolbar */}
            <div className="p-4 border-b border-slate-200 dark:border-[#21262d] bg-slate-50 dark:bg-[#0c1017] space-y-3 shrink-0">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search questions (e.g. collateral, commission, refund, repayment, EIP-191)..."
                  className="w-full bg-white dark:bg-[#090c10] border border-slate-300 dark:border-[#21262d] focus:border-[#ff0420] text-xs text-slate-900 dark:text-white rounded-lg pl-9 pr-3 py-2 outline-none font-sans placeholder:text-slate-400 dark:placeholder:text-slate-500"
                />
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto text-xs pb-0.5">
                {[
                  { id: 'all', label: 'All FAQs' },
                  { id: 'general', label: 'USDC Lending' },
                  { id: 'collateral', label: 'Collateral & Escrow' },
                  { id: 'repayment', label: 'Repayments & Deadlines' },
                  { id: 'wallet_audit', label: 'Wallet Audit' },
                  { id: 'security', label: 'Security & Non-Custodial' },
                ].map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-2.5 py-1 rounded-md whitespace-nowrap transition-colors font-medium text-[11px] cursor-pointer ${
                      selectedCategory === cat.id
                        ? 'bg-slate-200 dark:bg-[#21262d] text-slate-900 dark:text-white font-bold shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-[#161b22]'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Scrollable FAQ Accordion List */}
            <div className="p-6 overflow-y-auto space-y-3 flex-1 divide-y divide-slate-100 dark:divide-[#21262d]/60">
              {filteredFaqs.length === 0 ? (
                <div className="p-10 text-center text-xs text-slate-500 dark:text-slate-400">
                  No answers found matching &quot;{searchQuery}&quot;. Try a different keyword or view the 4-step onboarding guide.
                </div>
              ) : (
                filteredFaqs.map((faq) => {
                  const isExpanded = expandedFaqId === faq.id;
                  return (
                    <div key={faq.id} className="pt-3.5 first:pt-0">
                      <button
                        onClick={() => toggleFaq(faq.id)}
                        className="w-full flex items-start justify-between text-left gap-3 py-1 group cursor-pointer"
                      >
                        <span className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-white group-hover:text-[#ff0420] transition-colors">
                          {faq.question}
                        </span>
                        <span className="text-slate-400 shrink-0 mt-0.5">
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </span>
                      </button>

                      {isExpanded && (
                        <div className="mt-2.5 pl-1 pr-2 pb-2 text-slate-600 dark:text-slate-300 animate-fadeIn text-xs leading-relaxed">
                          {faq.answer}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* View 2: 4-Step Borrower Onboarding Guide */}
        {activeTab === 'onboarding' && (
          <div className="p-6 overflow-y-auto flex-1 space-y-6">
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                How Optimism Lending Works in 4 Simple Steps
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                A straightforward, transparent protocol designed for institutional liquidity and non-custodial micro-credit.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Step 1 */}
              <div className="p-4 bg-slate-50 dark:bg-[#0c1017] border border-slate-200 dark:border-[#21262d] rounded-xl space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-[#ff0420] text-white text-xs font-bold flex items-center justify-center">
                    1
                  </div>
                  <h5 className="text-xs font-bold text-slate-900 dark:text-white">
                    Connect Wallet & Network Check
                  </h5>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Connect your MetaMask, Rabby, or WalletConnect wallet to <strong>Optimism Mainnet (Chain ID 10)</strong>. Verify wallet ownership via an off-chain EIP-191 personal signature without spending gas.
                </p>
                <div className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 pt-1">
                  <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                  <span>Zero custody: Private keys never requested.</span>
                </div>
              </div>

              {/* Step 2 */}
              <div className="p-4 bg-slate-50 dark:bg-[#0c1017] border border-slate-200 dark:border-[#21262d] rounded-xl space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-cyan-600 text-white text-xs font-bold flex items-center justify-center">
                    2
                  </div>
                  <h5 className="text-xs font-bold text-slate-900 dark:text-white">
                    On-Chain Address Evaluation
                  </h5>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Enter your address in the Loan Marketplace and click <strong>&quot;Analyze Wallet&quot;</strong>. The protocol evaluates verifiable blockchain metrics (transaction nonce, gas reserves, protocol activity) to determine your eligible credit tier (Starter to Premium).
                </p>
                <div className="text-[11px] font-mono text-cyan-600 dark:text-cyan-400 flex items-center gap-1.5 pt-1">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  <span>Objective on-chain facts, no invasive data.</span>
                </div>
              </div>

              {/* Step 3 */}
              <div className="p-4 bg-slate-50 dark:bg-[#0c1017] border border-slate-200 dark:border-[#21262d] rounded-xl space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-amber-600 text-white text-xs font-bold flex items-center justify-center">
                    3
                  </div>
                  <h5 className="text-xs font-bold text-slate-900 dark:text-white">
                    Deposit Collateral & Receive USDC
                  </h5>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Choose your repayment duration (15 to 60 days). Deposit the required 15% USDC collateral into trustless escrow. The 15% platform commission is deducted upfront, and net funds are immediately transferred to your wallet.
                </p>
                <div className="text-[11px] font-mono text-amber-600 dark:text-amber-400 flex items-center gap-1.5 pt-1">
                  <Coins className="w-3.5 h-3.5 shrink-0" />
                  <span>15% collateral is escrowed, not spent as a fee.</span>
                </div>
              </div>

              {/* Step 4 */}
              <div className="p-4 bg-slate-50 dark:bg-[#0c1017] border border-slate-200 dark:border-[#21262d] rounded-xl space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-emerald-600 text-white text-xs font-bold flex items-center justify-center">
                    4
                  </div>
                  <h5 className="text-xs font-bold text-slate-900 dark:text-white">
                    Repay & 100% Collateral Release
                  </h5>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Track your live repayment countdown under &quot;My Loans&quot;. When you repay the principal before the deadline, 100% of your collateral is unlocked and returned to your wallet in the same transaction, elevating your credit standing.
                </p>
                <div className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 pt-1">
                  <ArrowDownRight className="w-3.5 h-3.5 shrink-0" />
                  <span>Early repayments are penalty-free anytime.</span>
                </div>
              </div>
            </div>

            {/* Invariant & Escrow Guarantee Box */}
            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 rounded-xl space-y-1.5">
              <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300 font-bold text-xs">
                <ShieldCheck className="w-4 h-4" />
                <span>Protocol Solvency & Escrow Security</span>
              </div>
              <p className="text-xs text-emerald-800 dark:text-emerald-300/80 leading-relaxed">
                All collateral is held strictly in the open-source <code className="font-mono font-bold">OptimismLendingPool</code> smart contract on Optimism. The protocol operates in full accordance with decentralized non-custodial standards.
              </p>
            </div>
          </div>
        )}

        {/* View 3: Collateral & Loan Calculator */}
        {activeTab === 'calculator' && (
          <div className="p-6 overflow-y-auto flex-1 space-y-6">
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                Interactive USDC Collateral & Repayment Calculator
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Simulate any loan amount to see upfront commissions, required escrow collateral, net payout, and refund amounts.
              </p>
            </div>

            {/* Slider & Presets */}
            <div className="p-5 bg-slate-50 dark:bg-[#0c1017] border border-slate-200 dark:border-[#21262d] rounded-xl space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Desired Loan Principal (USDC)
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-slate-500">Amount:</span>
                  <input
                    type="number"
                    min={50}
                    max={5000}
                    step={25}
                    value={calcPrincipal}
                    onChange={(e) => setCalcPrincipal(Math.max(50, Math.min(5000, Number(e.target.value) || 50)))}
                    className="w-28 bg-white dark:bg-[#121721] border border-slate-300 dark:border-[#21262d] text-slate-900 dark:text-white font-mono font-bold text-xs rounded-md px-2.5 py-1 text-right outline-none focus:border-[#ff0420]"
                  />
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 font-mono">USDC</span>
                </div>
              </div>

              <input
                type="range"
                min={50}
                max={5000}
                step={25}
                value={calcPrincipal}
                onChange={(e) => setCalcPrincipal(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 dark:bg-[#21262d] rounded-lg appearance-none cursor-pointer accent-[#ff0420]"
              />

              {/* Quick Presets */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] text-slate-500 font-medium">Quick Presets:</span>
                {[150, 500, 1000, 2500, 5000].map((preset) => (
                  <button
                    key={preset}
                    onClick={() => setCalcPrincipal(preset)}
                    className={`px-2.5 py-1 text-[11px] font-mono rounded-md border transition-colors cursor-pointer ${
                      calcPrincipal === preset
                        ? 'bg-[#ff0420] text-white border-[#ff0420] font-bold'
                        : 'bg-white dark:bg-[#121721] border-slate-300 dark:border-[#21262d] text-slate-700 dark:text-slate-300 hover:border-slate-400 dark:hover:border-slate-500'
                    }`}
                  >
                    ${preset.toLocaleString()}
                  </button>
                ))}
              </div>

              {/* Term Selection */}
              <div className="pt-2 border-t border-slate-200 dark:border-[#21262d] flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Repayment Duration:
                </span>
                <div className="flex items-center gap-1.5">
                  {[15, 30, 45, 60].map((days) => (
                    <button
                      key={days}
                      onClick={() => setCalcPeriod(days)}
                      className={`px-2.5 py-1 text-[11px] font-medium rounded-md border transition-colors cursor-pointer ${
                        calcPeriod === days
                          ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white font-bold'
                          : 'bg-white dark:bg-[#121721] border-slate-300 dark:border-[#21262d] text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#161b22]'
                      }`}
                    >
                      {days} Days
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Visual Breakdown Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono text-xs">
              <div className="p-3.5 bg-slate-50 dark:bg-[#0c1017] border border-slate-200 dark:border-[#21262d] rounded-xl space-y-1">
                <div className="text-slate-500 dark:text-slate-400 text-[11px]">Requested Principal</div>
                <div className="text-lg font-bold text-slate-900 dark:text-white">
                  {calcPrincipal.toLocaleString(undefined, { minimumFractionDigits: 2 })} USDC
                </div>
                <div className="text-[10px] text-slate-400">Total approved borrowing limit</div>
              </div>

              <div className="p-3.5 bg-slate-50 dark:bg-[#0c1017] border border-slate-200 dark:border-[#21262d] rounded-xl space-y-1">
                <div className="text-amber-600 dark:text-amber-400 text-[11px] font-semibold">15% Collateral Deposit</div>
                <div className="text-lg font-bold text-amber-600 dark:text-amber-300">
                  {calcCollateral.toLocaleString(undefined, { minimumFractionDigits: 2 })} USDC
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400">Held in escrow · 100% refunded at repayment</div>
              </div>

              <div className="p-3.5 bg-slate-50 dark:bg-[#0c1017] border border-slate-200 dark:border-[#21262d] rounded-xl space-y-1">
                <div className="text-amber-600 dark:text-amber-400 text-[11px] font-semibold">15% Protocol Commission</div>
                <div className="text-lg font-bold text-slate-800 dark:text-slate-200">
                  {calcCommission.toLocaleString(undefined, { minimumFractionDigits: 2 })} USDC
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400">Upfront protocol service charge</div>
              </div>

              <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 rounded-xl space-y-1">
                <div className="text-emerald-700 dark:text-emerald-400 text-[11px] font-bold">Net Disbursed to Wallet</div>
                <div className="text-lg font-extrabold text-emerald-700 dark:text-emerald-300">
                  +{calcNetDisbursed.toLocaleString(undefined, { minimumFractionDigits: 2 })} USDC
                </div>
                <div className="text-[10px] text-emerald-600 dark:text-emerald-400/80">Available immediately in your wallet</div>
              </div>
            </div>

            {/* Repayment and Refund Summary */}
            <div className="p-4 bg-slate-100 dark:bg-[#090c10] border border-slate-200 dark:border-[#21262d] rounded-xl space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-600 dark:text-slate-400">Due at {calcPeriod}-Day Maturity:</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">
                  {calcPrincipal.toLocaleString(undefined, { minimumFractionDigits: 2 })} USDC
                </span>
              </div>
              <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400 font-semibold">
                <span>Collateral Unlocked on Settlement:</span>
                <span className="font-mono font-bold">
                  +{calcCollateral.toLocaleString(undefined, { minimumFractionDigits: 2 })} USDC
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Official USDC Contract Address Strip */}
        <div className="px-5 py-2.5 bg-slate-100/70 dark:bg-[#090c10] border-t border-slate-200 dark:border-[#21262d] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-mono">
            <span className="font-semibold text-slate-700 dark:text-slate-300">Circle Native USDC:</span>
            <span className="truncate max-w-[220px] sm:max-w-xs">{OPTIMISM_USDC_ADDRESS}</span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={copyUsdcAddress}
              className="flex items-center gap-1 text-[11px] px-2.5 py-1 bg-white dark:bg-[#161b22] border border-slate-300 dark:border-[#30363d] rounded text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white font-medium transition-colors cursor-pointer"
            >
              {copiedUsdc ? (
                <>
                  <Check className="w-3 h-3 text-emerald-500" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3 text-slate-400" />
                  <span>Copy Address</span>
                </>
              )}
            </button>
            <a
              href={`${OPTIMISM_EXPLORER_URL}/token/${OPTIMISM_USDC_ADDRESS}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-[11px] px-2.5 py-1 bg-white dark:bg-[#161b22] border border-slate-300 dark:border-[#30363d] rounded text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white font-medium transition-colors"
            >
              <span>Etherscan</span>
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </a>
          </div>
        </div>

        {/* Footer Quick Action Links */}
        <div className="p-4 border-t border-slate-200 dark:border-[#21262d] bg-slate-50 dark:bg-[#0c1017] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs shrink-0">
          <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400 font-mono text-[11px]">
            <a
              href={`${OPTIMISM_EXPLORER_URL}/address/${OPTIMISM_LENDING_POOL_ADDRESS}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-slate-900 dark:hover:text-white transition-colors flex items-center gap-1"
            >
              <span>Pool Contract: {OPTIMISM_LENDING_POOL_ADDRESS.slice(0, 6)}...{OPTIMISM_LENDING_POOL_ADDRESS.slice(-4)}</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onClose();
                onOpenFaucet();
              }}
              className="px-3 py-1.5 bg-slate-100 dark:bg-[#161b22] hover:bg-slate-200 dark:hover:bg-[#21262d] border border-slate-300 dark:border-[#30363d] text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white font-medium rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Droplets className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
              <span>Sandbox Faucet</span>
            </button>
            <button
              onClick={() => {
                onClose();
                onOpenBorrow();
              }}
              className="px-3.5 py-1.5 bg-[#ff0420] hover:bg-[#e0001a] text-white font-bold rounded-lg transition-colors flex items-center gap-1 shadow-sm cursor-pointer"
            >
              <span>Apply for Loan</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
