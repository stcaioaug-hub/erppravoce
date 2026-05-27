import React from 'react';
import { cn } from '../lib/utils';

const STUDIO_NAME = 'Leandro Della Riva';

interface StudioBrandProps {
  className?: string;
  inverse?: boolean;
  variant?: 'lockup' | 'mark' | 'signature';
}

export const StudioBrand: React.FC<StudioBrandProps> = ({
  className,
  inverse = false,
  variant = 'lockup',
}) => {
  if (variant === 'signature') {
    return (
      <img
        src="/brand/leandro-della-riva-signature.svg"
        alt={`${STUDIO_NAME} - Cabeleireiro`}
        className={cn('block h-auto w-full object-contain', className)}
      />
    );
  }

  if (variant === 'mark') {
    return (
      <img
        src="/brand/leandro-della-riva-mark.webp"
        alt={STUDIO_NAME}
        className={cn('block rounded-2xl object-cover shadow-sm', className)}
      />
    );
  }

  return (
    <div className={cn('flex min-w-0 items-center gap-3', className)}>
      <img
        src="/brand/leandro-della-riva-mark.webp"
        alt=""
        aria-hidden="true"
        className="h-11 w-11 shrink-0 rounded-xl object-cover shadow-sm shadow-red-950/20"
      />
      <div className="min-w-0">
        <p
          className={cn(
            'truncate font-serif text-base font-semibold leading-tight tracking-tight',
            inverse ? 'text-white' : 'text-slate-900 dark:text-white',
          )}
        >
          {STUDIO_NAME}
        </p>
        <p
          className={cn(
            'mt-0.5 truncate text-[9px] font-bold uppercase tracking-[0.25em]',
            inverse ? 'text-rose-200' : 'text-rose-700 dark:text-rose-300',
          )}
        >
          Estúdio de beleza
        </p>
      </div>
    </div>
  );
};
