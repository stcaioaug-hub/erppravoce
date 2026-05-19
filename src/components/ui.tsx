/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { Check, X, AlertTriangle, AlertCircle, Info } from 'lucide-react';

/// --- Card ---
interface CardProps {
  className?: string;
  children: React.ReactNode;
  whileHover?: any;
  whileTap?: any;
  onClick?: () => void;
  interactive?: boolean;
}

export const Card: React.FC<CardProps> = ({ className, children, whileHover, whileTap, onClick, interactive }) => {
  const isInteractive = interactive || !!onClick || !!whileHover || !!whileTap;
  return (
    <motion.div
      whileHover={isInteractive ? (whileHover ?? { scale: 1.01, y: -2 }) : undefined}
      whileTap={isInteractive ? (whileTap ?? { scale: 0.98 }) : undefined}
      onClick={onClick}
      className={cn(
        "bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800/80 shadow-sm overflow-hidden transition-colors duration-300",
        isInteractive && "cursor-pointer",
        className
      )}
    >
      {children}
    </motion.div>
  );
};

// --- Button ---
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, children, ...props }, ref) => {
    const variants = {
      primary: 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm dark:bg-blue-600 dark:hover:bg-blue-500',
      secondary: 'bg-slate-100 text-slate-900 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700',
      outline: 'border border-slate-200 bg-transparent hover:bg-slate-50 text-slate-700 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800/50',
      ghost: 'bg-transparent hover:bg-slate-100 text-slate-600 dark:text-slate-300 dark:hover:bg-slate-800/50',
      danger: 'bg-red-500 text-white hover:bg-red-600 shadow-sm dark:bg-red-600 dark:hover:bg-red-500',
      success: 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-sm dark:bg-emerald-600 dark:hover:bg-emerald-500',
    };

    const sizes = {
      sm: 'h-8 px-3 text-xs',
      md: 'h-10 px-4 py-2 text-sm',
      lg: 'h-12 px-6 text-base',
      icon: 'h-10 w-10 flex items-center justify-center',
    };

    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-lg font-medium transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-indigo-400 disabled:pointer-events-none disabled:opacity-50",
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {isLoading ? (
          <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        ) : null}
        {children}
      </button>
    );
  }
);

// --- Badge ---
export const Badge: React.FC<{ 
  children: React.ReactNode; 
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'blue';
  className?: string;
}> = ({ 
  children, 
  variant = 'default',
  className 
}) => {
  const styles = {
    default: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20',
    warning: 'bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20',
    danger: 'bg-red-50 text-red-700 border-red-100 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20',
    info: 'bg-indigo-50 text-indigo-700 border-indigo-100 dark:bg-indigo-500/10 dark:text-indigo-400 dark:border-indigo-500/20',
    blue: 'bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20',
  };

  return (
    <span className={cn("inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors", styles[variant], className)}>
      {children}
    </span>
  );
};

// --- Input ---
export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-full border border-slate-200 dark:border-slate-800 bg-slate-100/50 dark:bg-slate-900/50 px-4 py-2 text-sm text-slate-900 dark:text-slate-100 ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-400 dark:placeholder:text-slate-500 focus-visible:outline-none focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-blue-500 transition-all disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);

// --- Page Header ---
export const PageHeader = ({ 
  title, 
  subtitle, 
  actions 
}: { 
  title: string; 
  subtitle?: string; 
  actions?: React.ReactNode 
 }) => (
  <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
    <div>
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight transition-colors">{title}</h1>
      {subtitle && <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 transition-colors">{subtitle}</p>}
    </div>
    {actions && <div className="flex items-center gap-3">{actions}</div>}
  </div>
);

// --- Table components ---
export const Table = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <div className={cn("w-full overflow-auto", className)}>
    <table className="w-full text-sm text-left border-collapse">
      {children}
    </table>
  </div>
);

export const THead = ({ children }: { children: React.ReactNode }) => (
  <thead className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 transition-colors duration-300">
    {children}
  </thead>
);

export const TBody = ({ children }: { children: React.ReactNode }) => (
  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 transition-colors duration-300">
    {children}
  </tbody>
);

export const TH = ({ children, className, ...props }: React.ThHTMLAttributes<HTMLTableCellElement>) => (
  <th className={cn("px-4 py-3 font-semibold text-slate-600 dark:text-slate-300 whitespace-nowrap transition-colors duration-300", className)} {...props}>
    {children}
  </th>
);

export const TD = ({ children, className, ...props }: React.TdHTMLAttributes<HTMLTableCellElement>) => (
  <td className={cn("px-4 py-4 text-slate-600 dark:text-slate-300 transition-colors duration-300", className)} {...props}>
    {children}
  </td>
);

export const TR = ({ children, className, ...props }: React.HTMLAttributes<HTMLTableRowElement>) => (
  <tr className={cn("border-b border-slate-50 dark:border-slate-800/60 last:border-0 transition-colors duration-300", className)} {...props}>
    {children}
  </tr>
);

// --- Modal ---
export const Modal = ({ 
  isOpen, 
  onClose, 
  title, 
  children,
  footer,
  maxWidth = "max-w-lg"
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  title: string; 
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: string;
}) => (
  <AnimatePresence>
    {isOpen && (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 print:static print:inset-auto print:p-0 print:flex-none print:block">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm print:hidden"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className={cn("relative w-full bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden transition-colors duration-300 print:shadow-none print:border-none print:rounded-none print:w-full print:max-w-none print:bg-white print:text-black print:overflow-visible print:p-0", maxWidth)}
        >
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 transition-colors duration-300 print:hidden">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white transition-colors">{title}</h3>
            <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 dark:text-slate-500 transition-colors">
              <X size={20} />
            </button>
          </div>
          <div className="px-6 py-6 overflow-y-auto max-h-[85vh] print:max-h-none print:overflow-visible print:p-0">
            {children}
          </div>
          {footer && (
            <div className="flex items-center justify-end px-6 py-4 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800 gap-3 transition-colors duration-300 print:hidden">
              {footer}
            </div>
          )}
        </motion.div>
      </div>
    )}
  </AnimatePresence>
);

// --- Stat Card ---
export const StatCard = ({ 
  title, 
  value, 
  icon: Icon, 
  trend, 
  color = "blue",
  onClick
}: { 
  title: string; 
  value: string | number; 
  icon: any; 
  trend?: { value: number; positive: boolean };
  color?: "blue" | "emerald" | "amber" | "red" | "sky" | "indigo";
  onClick?: () => void;
}) => {
  const colorMap = {
    blue: "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400",
    emerald: "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400",
    amber: "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400",
    red: "bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400",
    sky: "bg-sky-50 text-sky-600 dark:bg-sky-500/10 dark:text-sky-400",
    indigo: "bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400",
  };

  return (
    <Card 
      interactive={true}
      onClick={onClick}
      className="p-6 transition-all hover:shadow-md border border-slate-100 dark:border-slate-800/80 group flex flex-col justify-between h-full"
    >
      <div className="flex items-start justify-between">
        <div className={cn("p-2 rounded-xl transition-colors", colorMap[color])}>
          <Icon size={24} />
        </div>
        {trend && (
          <span className={cn(
            "text-xs font-bold px-2 py-0.5 rounded-full",
            trend.positive ? "bg-emerald-50 text-emerald-500 dark:bg-emerald-500/10 dark:text-emerald-400" : "bg-red-50 text-red-500 dark:bg-red-500/10 dark:text-red-400"
          )}>
            {trend.positive ? '+' : '-'}{Math.abs(trend.value)}%
          </span>
        )}
      </div>
      <div className="mt-4">
        <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider mb-1 transition-colors">{title}</p>
        <h2 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight transition-colors">{value}</h2>
      </div>
    </Card>
  );
};

