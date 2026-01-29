import { useState } from 'react';
import type { FormEvent } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Input, Button } from '../common';
import { apiService } from '../../services/api';

interface ResetPasswordFormProps {
    onSuccess?: () => void;
}

export const ResetPasswordForm = ({ onSuccess }: ResetPasswordFormProps) => {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError('');

        if (!token) {
            setError('Invalid or missing reset token');
            return;
        }

        // Validation
        if (!password || !confirmPassword) {
            setError('Please fill in all fields');
            return;
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setIsLoading(true);

        try {
            await apiService.resetPassword({ token, password });
            setIsSuccess(true);
            setPassword('');
            setConfirmPassword('');

            if (onSuccess) {
                onSuccess();
            }
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : 'Failed to reset password. The link may have expired.'
            );
        } finally {
            setIsLoading(false);
        }
    };

    if (!token) {
        return (
            <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded-lg">
                Invalid or missing reset token. Please request a new password
                reset link.
            </div>
        );
    }

    if (isSuccess) {
        return (
            <div className="space-y-4">
                <div className="bg-green-500/10 border border-green-500 text-green-500 px-4 py-3 rounded-lg">
                    <p className="font-medium mb-1">
                        Password reset successful!
                    </p>
                    <p className="text-sm">
                        You can now sign in with your new password.
                    </p>
                </div>
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
                Enter your new password below. Make sure it's at least 6
                characters long.
            </div>

            <Input
                label="New Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create a new password"
                disabled={isLoading}
                helperText="At least 6 characters"
                required
            />

            <Input
                label="Confirm Password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your new password"
                disabled={isLoading}
                required
            />

            <Button
                type="submit"
                variant="primary"
                disabled={isLoading}
                className="w-full"
            >
                {isLoading ? 'Resetting...' : 'Reset Password'}
            </Button>
        </form>
    );
};
