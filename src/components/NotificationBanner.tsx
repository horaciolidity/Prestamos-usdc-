import React from 'react';
import { Loan } from '../types';
import { AlertTriangle, Clock, CheckCircle2, Gift, X } from 'lucide-react';

interface NotificationBannerProps {
  loans: Loan[];
  userAddress: string | null;
  onViewLoan: (loanId: string) => void;
  onDismiss: (key: string) => void;
  dismissedKeys: Set<string>;
}

export const NotificationBanner: React.FC<NotificationBannerProps> = ({
  loans,
  userAddress,
  onViewLoan,
  onDismiss,
  dismissedKeys,
}) => {
  if (!userAddress) return null;

  const userLoans = loans.filter((l) => l.borrowerAddress.toLowerCase() === userAddress.toLowerCase());
  const now = Date.now();

  const notifications: {
    key: string;
    type: 'warning' | 'alert' | 'success' | 'info';
    icon: React.ReactNode;
    title: string;
    description: string;
    loanId?: string;
  }[] = [];

  userLoans.forEach((loan) => {
    if (loan.status === 'active') {
      const msRemaining = loan.expiresAt - now;
      const daysRemaining = Math.floor(msRemaining / (1000 * 60 * 60 * 24));

      if (msRemaining <= 0) {
        notifications.push({
          key: `overdue-${loan.id}`,
          type: 'alert',
          icon: <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />,
          title: `Loan #${loan.id} is Overdue`,
          description: `Repayment deadline expired. Repay now to avoid default and release your ${loan.collateralAmount} USDC collateral.`,
          loanId: loan.id,
        });
      } else if (daysRemaining <= 3) {
        notifications.push({
          key: `deadline-${loan.id}`,
          type: 'warning',
          icon: <Clock className="w-4 h-4 text-amber-400 shrink-0" />,
          title: `Upcoming Deadline: Loan #${loan.id}`,
          description: `Repayment due in ${daysRemaining === 0 ? 'less than 24 hours' : `${daysRemaining} days`}. Amount: ${loan.principalAmount} USDC.`,
          loanId: loan.id,
        });
      }
    } else if (loan.status === 'repaid' && !loan.collateralRefunded) {
      notifications.push({
        key: `refund-${loan.id}`,
        type: 'success',
        icon: <Gift className="w-4 h-4 text-emerald-400 shrink-0" />,
        title: `Collateral Refund Ready: Loan #${loan.id}`,
        description: `Your ${loan.collateralAmount} USDC collateral deposit is unlocked and ready for withdrawal.`,
        loanId: loan.id,
      });
    }
  });

  const activeNotifications = notifications.filter((n) => !dismissedKeys.has(n.key));
  if (activeNotifications.length === 0) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4 space-y-2">
      {activeNotifications.map((notif) => {
        const bgColors = {
          alert: 'bg-red-950/40 border-red-900/60 text-red-200',
          warning: 'bg-amber-950/40 border-amber-900/60 text-amber-200',
          success: 'bg-emerald-950/40 border-emerald-900/60 text-emerald-200',
          info: 'bg-sky-950/40 border-sky-900/60 text-sky-200',
        }[notif.type];

        return (
          <div
            key={notif.key}
            className={`flex items-center justify-between p-3 rounded-lg border ${bgColors} text-xs transition-all`}
          >
            <div className="flex items-center gap-3">
              {notif.icon}
              <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2">
                <span className="font-semibold text-white">{notif.title}</span>
                <span className="text-slate-300">{notif.description}</span>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0 ml-4">
              {notif.loanId && (
                <button
                  onClick={() => onViewLoan(notif.loanId!)}
                  className="px-2.5 py-1 text-xs font-semibold bg-white/10 hover:bg-white/20 rounded text-white transition-colors whitespace-nowrap"
                >
                  Manage Loan
                </button>
              )}
              <button
                onClick={() => onDismiss(notif.key)}
                className="text-slate-400 hover:text-white transition-colors"
                title="Dismiss"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};
