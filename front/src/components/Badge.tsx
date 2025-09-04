// components/Badge.tsx
import { HTMLAttributes } from 'react';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'outline';
}

export default function Badge({ className = '', variant = 'default', ...props }: BadgeProps) {
  const baseClasses = 'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors';
  
  const variantClasses = {
    default: 'border-transparent bg-primary text-primary-foreground',
    outline: 'text-foreground border-border'
  };

  return (
    <span className={`${baseClasses} ${variantClasses[variant]} ${className}`} {...props} />
  );
}