import { useState } from 'react';
import type { FormEvent } from 'react';
import { Input, Button } from '../common';
import { apiService } from '../../services/api';

interface ForgotPasswordFormProps {
    onSuccess?: () => void;
}

export const ForgotPasswordForm = ({ onSuccess }: ForgotPasswordFormProps) => {
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError('');

        // Validation
        if (!email) {
            setError('Please enter your email address');
            return;
        }

        if (!email.includes('@')) {
            setError('Please enter a valid email address');
            return;
        }

        setIsLoading(true);

        try {
            await apiService.forgotPassword({ email });
            setIsSuccess(true);
            setEmail('');

            if (onSuccess) {
                onSuccess();
            }
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : 'Failed to send reset email. Please try again.'
            );
        } finally {
            setIsLoading(false);
        }
    };

    if (isSuccess) {
        return (
            <div className="space-y-4">
                <div className="bg-green-500/10 border border-green-500 text-green-500 px-4 py-3 rounded-lg">
                    <p className="font-medium mb-1">Check your email!</p>
                    <p className="text-sm">
                        If an account exists with that email, we've sent
                        password reset instructions.
                    </p>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                    The reset link will expire in 10 minutes.
                </p>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
                <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded-lg">
                    {error}
                </div>
            )}

            <div className="text-sm text-gray-600 dark:text-gray-400">
                Enter your email address and we'll send you a link to reset your
                password.
            </div>

            <Input
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                disabled={isLoading}
                required
            />

            <Button
                type="submit"
                variant="primary"
                disabled={isLoading}
                className="w-full"
            >
                {isLoading ? 'Sending...' : 'Send Reset Link'}
            </Button>
        </form>
    );
};
