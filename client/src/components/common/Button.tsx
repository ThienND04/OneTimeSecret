import type { ReactNode, ButtonHTMLAttributes } from 'react';
import { Link } from 'react-router-dom';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    children: ReactNode;
    variant?: 'primary' | 'secondary' | 'ghost' | 'outline';
    size?: 'sm' | 'md' | 'lg';
    href?: string;
    to?: string;
    className?: string;
}

const variants = {
    primary:
        'bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-white shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50',
    secondary:
        'bg-gray-800/50 hover:bg-gray-700/50 text-white border-2 border-cyan-500/30 hover:border-cyan-400/50 backdrop-blur-sm',
    ghost: 'text-gray-300 hover:text-cyan-400 transition-colors',
    outline:
        'border-2 border-gray-300 dark:border-gray-600 hover:border-cyan-500 dark:hover:border-cyan-400 text-gray-700 dark:text-gray-300 hover:text-cyan-600 dark:hover:text-cyan-400'
};

const sizes = {
    sm: 'px-3 py-2 text-sm sm:px-4 sm:text-base',
    md: 'px-4 py-2 text-sm sm:px-6 sm:text-base',
    lg: 'px-10 py-5 text-lg sm:text-xl'
};

export default function Button({
    children,
    variant = 'primary',
    size = 'md',
    href,
    to,
    onClick,
    className = '',
    disabled,
    type = 'button',
    ...props
}: ButtonProps) {
    const baseClasses =
        'rounded-lg font-semibold transition-all duration-200 inline-flex items-center justify-center';
    const hoverClasses = disabled
        ? 'opacity-50 cursor-not-allowed'
        : 'hover:scale-105';
    const classes =
        `${baseClasses} ${variants[variant]} ${sizes[size]} ${hoverClasses} ${className}`.trim();

    if (to) {
        return (
            <Link to={to} className={classes}>
                {children}
            </Link>
        );
    }

    if (href) {
        return (
            <a href={href} className={classes}>
                {children}
            </a>
        );
    }

    return (
        <button
            onClick={onClick}
            className={classes}
            disabled={disabled}
            type={type}
            {...props}
        >
            {children}
        </button>
    );
}
