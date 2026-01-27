import type { ReactNode } from 'react';

interface ButtonProps {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  href?: string;
  onClick?: () => void;
  className?: string;
}

const variants = {
  primary:
    'bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-white shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50',
  secondary:
    'bg-gray-800/50 hover:bg-gray-700/50 text-white border-2 border-cyan-500/30 hover:border-cyan-400/50 backdrop-blur-sm',
  ghost:
    'text-gray-300 hover:text-cyan-400 transition-colors',
};

const sizes = {
  sm: 'px-3 py-2 text-sm sm:px-4 sm:text-base',
  md: 'px-4 py-2 text-sm sm:px-6 sm:text-base',
  lg: 'px-10 py-5 text-lg sm:text-xl',
};

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  href,
  onClick,
  className = '',
}: ButtonProps) {
  const baseClasses = 'rounded-lg font-semibold transition-all duration-200 hover:scale-105 inline-block';
  const classes = `${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`.trim();

  if (href) {
    return (
      <a href={href} className={classes}>
        {children}
      </a>
    );
  }

  return (
    <button onClick={onClick} className={classes}>
      {children}
    </button>
  );
}
