import React from 'react';
import { cn } from '../lib/utils';

interface LogoProps {
  className?: string;
  artwork?: boolean;
  iconOnly?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  subtitle?: string;
  layout?: 'row' | 'col';
  variant?: 'default' | 'sidebar';
}

export const Logo: React.FC<LogoProps> = ({ 
  className, 
  artwork = false,
  iconOnly = false,
  size = 'md',
  subtitle,
  layout = 'row',
  variant = 'default'
}) => {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24'
  };

  const artworkClasses = {
    sm: 'w-28',
    md: 'w-36',
    lg: 'w-44',
    xl: 'w-52 sm:w-60'
  };

  if (artwork) {
    return (
      <span className={cn("block shrink-0 overflow-hidden rounded-3xl bg-white/90 p-1 shadow-sm dark:bg-white", artworkClasses[size], className)}>
        <img
          src="/brand/easyone-logo.svg"
          alt="EasyOne"
          className="block h-auto w-full object-contain"
        />
      </span>
    );
  }

  if (iconOnly) {
    return (
      <span className={cn("block shrink-0 overflow-hidden rounded-lg bg-white p-0.5 shadow-sm", sizeClasses[size], className)}>
        <img
          src="/brand/easyone-logo.svg"
          alt="EasyOne"
          className="block h-full w-full object-contain"
        />
      </span>
    );
  }

  return (
    <div className={cn(
      "flex min-w-0 items-center", 
      layout === 'col' ? "flex-col gap-4 text-center justify-center" : "gap-3",
      className
    )}>
      <div className="flex min-w-0 flex-col justify-center">
        <span className={cn(
          "block shrink-0 overflow-hidden bg-white p-1 shadow-sm",
          variant === 'sidebar' ? "w-32 rounded-2xl" : cn(artworkClasses[size], "rounded-3xl")
        )}>
          <img
            src="/brand/easyone-logo.svg"
            alt="EasyOne"
            className="block h-auto w-full object-contain"
          />
        </span>
        {subtitle && (
          <span className={cn(
            "mt-1.5 text-center text-[10px] font-extrabold uppercase tracking-wider leading-none",
            variant === 'sidebar' ? "text-slate-400" : "text-violet-500 dark:text-violet-400"
          )}>
            {subtitle}
          </span>
        )}
      </div>
    </div>
  );
};
