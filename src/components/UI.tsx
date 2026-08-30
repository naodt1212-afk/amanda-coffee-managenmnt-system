import React, { ReactNode } from 'react';
import { Sparkles, Check, AlertCircle, Info, X } from 'lucide-react';
import { ToastMessage } from '../types';

// Premium Coffee Inspired Theme Buttons
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost' | 'gold';
  isLoading?: boolean;
  icon?: ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  isLoading = false,
  icon,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyle = "relative inline-flex items-center justify-center font-medium transition-all duration-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none text-sm px-4 py-2";
  
  const variants = {
    primary: "bg-[#D4A373] hover:bg-[#bfa282] text-[#1A120B] font-bold shadow-sm focus:ring-[#D4A373] border-none",
    gold: "bg-[#2D1B14] hover:bg-[#3d271d] text-white font-bold shadow-sm focus:ring-[#2D1B14] border-none",
    secondary: "bg-[#F8F9FA] hover:bg-stone-200 text-[#2D1B14] focus:ring-stone-500 border-none border border-stone-200/50",
    outline: "bg-transparent hover:bg-[#F8F9FA] text-[#2D1B14] border border-[#D4A373]/30 focus:ring-[#D4A373]",
    danger: "bg-red-600 hover:bg-red-700 text-white shadow-sm focus:ring-red-500 border-none",
    ghost: "bg-transparent hover:bg-stone-100 text-[#2D1B14] focus:ring-stone-400 border-none",
  };

  return (
    <button
      disabled={disabled || isLoading}
      className={`${baseStyle} ${variants[variant]} ${className}`}
      {...props}
    >
      {isLoading && (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      )}
      {!isLoading && icon && <span className="mr-1.5 flex items-center">{icon}</span>}
      <span className="whitespace-nowrap">{children}</span>
    </button>
  );
};

// Form Input
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: ReactNode;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  icon,
  className = '',
  id,
  ...props
}) => {
  return (
    <div className="w-full flex flex-col gap-1.5">
      {label && (
        <label htmlFor={id} className="text-xs font-semibold uppercase tracking-wider text-stone-500 select-none">
          {label}
        </label>
      )}
      <div className="relative w-full">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400">
            {icon}
          </div>
        )}
        <input
          id={id}
          className={`w-full bg-white text-stone-900 border ${error ? 'border-red-400 focus:ring-red-400 focus:border-red-400' : 'border-stone-200 focus:ring-[#D4A373] focus:border-[#D4A373]'} rounded-lg py-2.5 ${icon ? 'pl-10' : 'px-3.5'} pr-3.5 text-sm transition-all focus:outline-none focus:ring-1.5`}
          {...props}
        />
      </div>
      {error && (
        <p className="text-xs text-red-600 font-medium flex items-center gap-1 mt-0.5">
          <AlertCircle size={12} /> {error}
        </p>
      )}
    </div>
  );
};

// Modal Card Panel
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footerActions?: ReactNode;
  maxWidth?: string;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  footerActions,
  maxWidth = "max-w-md"
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4 text-center">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-stone-900/40 backdrop-blur-xs transition-opacity" 
          onClick={onClose} 
        />

        {/* Modal Window */}
        <div className={`relative inline-block w-full ${maxWidth} transform overflow-hidden rounded-xl bg-white p-6 text-left align-middle shadow-xl transition-all`}>
          <div className="flex items-center justify-between border-b border-stone-100 pb-4 mb-4">
            <h3 className="font-display text-xl font-bold text-stone-900">{title}</h3>
            <button 
              onClick={onClose} 
              className="rounded-lg p-1 text-stone-400 hover:bg-stone-50 hover:text-stone-700 transition"
            >
              <X size={18} />
            </button>
          </div>

          <div className="max-h-[70vh] overflow-y-auto pr-1">
            {children}
          </div>

          {footerActions && (
            <div className="mt-6 flex justify-end gap-2 border-t border-stone-100 pt-4">
              {footerActions}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Status Badge indicator
interface BadgeProps {
  status: string;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info' | 'royal';
}

export const Badge: React.FC<BadgeProps> = ({ status, variant }) => {
  const getBadgeStyles = () => {
    const s = status.toLowerCase();
    
    if (variant) {
      const variants = {
        default: "bg-stone-100 text-stone-800 border-stone-200",
        success: "bg-emerald-50 text-emerald-700 border-emerald-200",
        warning: "bg-amber-50 text-amber-700 border-amber-200",
        error: "bg-rose-50 text-rose-700 border-rose-200",
        info: "bg-sky-50 text-sky-700 border-sky-200",
        royal: "bg-indigo-50 text-indigo-700 border-indigo-200"
      };
      return variants[variant];
    }

    // Auto-detect based on string value
    if (['completed', 'served', 'paid', 'in stock', 'in_stock'].includes(s)) {
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    }
    if (['preparing', 'occupied', 'low stock', 'low_stock'].includes(s)) {
      return "bg-amber-50 text-amber-700 border-amber-200";
    }
    if (['pending', 'critical'].includes(s)) {
      return "bg-amber-600/10 text-amber-800 border-amber-600/20";
    }
    if (['cancelled', 'out of stock', 'out_of_stock', 'unpaid', 'critical_stock'].includes(s)) {
      return "bg-rose-50 text-rose-700 border-rose-200";
    }
    if (['ready'].includes(s)) {
      return "bg-sky-50 text-sky-700 border-sky-200";
    }
    return "bg-stone-100 text-stone-800 border-stone-200";
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getBadgeStyles()}`}>
      {status.replace('_', ' ').toUpperCase()}
    </span>
  );
};

// Card Wrapper
interface CardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  hoverable?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  onClick,
  hoverable = false
}) => {
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-xl border border-stone-100 p-5 ${hoverable ? 'hover:shadow-md hover:border-[#D4A373]/30 transition-all duration-200 cursor-pointer' : 'shadow-xs'} ${className}`}
    >
      {children}
    </div>
  );
};

// Stat Card
interface StatCardProps {
  title: string;
  value: string | number;
  label?: string;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  icon?: ReactNode;
  colorClass?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  label,
  trend,
  icon,
  colorClass = 'bg-[#D4A373]/10 text-[#1A120B]'
}) => {
  return (
    <div className="bg-white rounded-xl border border-stone-100 p-6 flex items-center justify-between shadow-xs">
      <div className="flex flex-col gap-1">
        <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">{title}</span>
        <span className="text-2xl font-bold text-stone-900">{value}</span>
        {trend && (
          <div className="flex items-center gap-1.5 mt-1">
            <span className={`text-xs font-semibold ${trend.isPositive ? 'text-emerald-600' : 'text-red-500'}`}>
              {trend.value}
            </span>
            <span className="text-xs text-stone-400">vs last month</span>
          </div>
        )}
        {label && <span className="text-xs text-stone-400 mt-1">{label}</span>}
      </div>
      {icon && (
        <div className={`p-3 rounded-xl ${colorClass}`}>
          {icon}
        </div>
      )}
    </div>
  );
};

// Toast Notification Popups
export const ToastContainer: React.FC<{ toasts: ToastMessage[] }> = ({ toasts }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-5 right-5 z-[100] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        const icons = {
          success: <Check className="text-emerald-500" size={18} />,
          error: <AlertCircle className="text-red-500" size={18} />,
          info: <Info className="text-sky-500" size={18} />
        };

        const borders = {
          success: "border-emerald-100",
          error: "border-red-100",
          info: "border-sky-100"
        };

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center gap-3 bg-white border ${borders[toast.type]} rounded-xl p-4 shadow-lg animate-slide-in`}
          >
            <div className="flex-shrink-0">
              {icons[toast.type]}
            </div>
            <p className="text-xs font-semibold text-stone-800 flex-1">{toast.message}</p>
          </div>
        );
      })}
    </div>
  );
};

// Empty State message
interface EmptyStateProps {
  title: string;
  description: string;
  actionButton?: ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ title, description, actionButton }) => {
  return (
    <div className="w-full flex flex-col items-center justify-center text-center p-12 border border-dashed border-stone-200 rounded-xl bg-stone-50/50">
      <div className="p-3 bg-stone-100 rounded-full text-stone-400 mb-4">
        <Sparkles size={28} />
      </div>
      <h3 className="text-base font-semibold text-stone-800">{title}</h3>
      <p className="text-xs text-stone-500 max-w-xs mt-1 mb-6">{description}</p>
      {actionButton}
    </div>
  );
};
