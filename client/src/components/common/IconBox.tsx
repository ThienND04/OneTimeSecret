import type { ReactNode } from 'react';

interface IconBoxProps {
  children: ReactNode;
  variant?: 'cyan' | 'emerald' | 'gradient';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  shape?: 'rounded' | 'circle';
  className?: string;
}

const variants = {
  cyan: 'bg-gradient-to-br from-cyan-500 to-cyan-600 shadow-cyan-500/30',
  emerald: 'bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-emerald-500/30',
  gradient: 'bg-gradient-to-br from-cyan-500 to-emerald-500 shadow-cyan-500/30',
};

const sizes = {
  sm: 'w-11 h-11',
  md: 'w-20 h-20',
  lg: 'w-28 h-28 sm:w-32 sm:h-32',
  xl: 'w-32 h-32',
};

const shapes = {
  rounded: 'rounded-xl sm:rounded-2xl',
  circle: 'rounded-full',
};

export default function IconBox({
  children,
  variant = 'cyan',
  size = 'md',
  shape = 'rounded',
  className = '',
}: IconBoxProps) {
  const baseClasses = 'flex items-center justify-center shadow-lg';
  const classes = `${baseClasses} ${variants[variant]} ${sizes[size]} ${shapes[shape]} ${className}`.trim();

  return <div className={classes}>{children}</div>;
}
