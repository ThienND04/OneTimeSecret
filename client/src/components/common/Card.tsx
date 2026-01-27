import type { ReactNode } from 'react';

interface CardProps {
    children: ReactNode;
    variant?: 'cyan' | 'emerald' | 'gradient';
    className?: string;
}

const variants = {
    cyan: 'border-cyan-500/30 hover:border-cyan-400 hover:shadow-cyan-500/20',
    emerald: 'border-emerald-500/30 hover:border-emerald-400 hover:shadow-emerald-500/20',
    gradient: 'border-cyan-500/30 hover:border-cyan-400 hover:shadow-cyan-500/20',
};

export default function Card({ children, variant = 'cyan', className = '' }: CardProps) {
    const baseClasses = 'flex flex-col items-center h-full text-left bg-gray-800/30 border-2 rounded-3xl p-4 hover:bg-gray-800/50 transition-all duration-300 hover:shadow-2xl backdrop-blur-sm';
    const classes = `${baseClasses} ${variants[variant]} ${className}`.trim();

    return <div className={classes}>{children}</div>;
}
