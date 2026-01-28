import { forwardRef } from 'react';
import type { TextareaHTMLAttributes } from 'react';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
    label?: string;
    error?: string;
    helperText?: string;
    showCharCount?: boolean;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
    (
        {
            label,
            error,
            helperText,
            showCharCount,
            className = '',
            maxLength,
            value,
            ...props
        },
        ref
    ) => {
        const charCount = typeof value === 'string' ? value.length : 0;

        return (
            <div className="w-full">
                {label && (
                    <div className="flex justify-between items-center mb-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            {label}
                        </label>
                        {showCharCount && maxLength && (
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                                {charCount}/{maxLength}
                            </span>
                        )}
                    </div>
                )}
                <textarea
                    ref={ref}
                    value={value}
                    maxLength={maxLength}
                    className={`
            w-full px-4 py-3 rounded-lg
            bg-white dark:bg-gray-800
            border-2 ${error ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}
            text-gray-900 dark:text-gray-100
            placeholder-gray-400 dark:placeholder-gray-500
            focus:outline-none focus:ring-2 focus:ring-cyan-500 dark:focus:ring-cyan-400
            transition-all duration-200
            resize-none
            ${className}
          `}
                    {...props}
                />
                {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
                {helperText && !error && (
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        {helperText}
                    </p>
                )}
            </div>
        );
    }
);

Textarea.displayName = 'Textarea';

export default Textarea;
