import { useState } from 'react';
import type { FormEvent } from 'react';
import { Input, Button } from '../common';
import { apiService } from '../../services/api';
import { useNavigate } from 'react-router-dom';

export const ChangePasswordForm = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError(null);

        // Validate passwords
        if (formData.newPassword !== formData.confirmPassword) {
            setError('New passwords do not match');
            return;
        }

        if (formData.newPassword.length < 8) {
            setError('New password must be at least 8 characters');
            return;
        }

        if (formData.currentPassword === formData.newPassword) {
            setError('New password must be different from current password');
            return;
        }

        setIsLoading(true);

        try {
            await apiService.changePassword({
                currentPassword: formData.currentPassword,
                newPassword: formData.newPassword
            });

            setSuccess(true);
            setFormData({
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            });

            // Redirect to home after 2 seconds
            setTimeout(() => {
                navigate('/');
            }, 2000);
        } catch (err) {
            setError(
                err instanceof Error ? err.message : 'Failed to change password'
            );
        } finally {
            setIsLoading(false);
        }
    };

    if (success) {
        return (
            <div className="text-center py-8">
                <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-3xl">✓</span>
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">
                    Password Changed Successfully!
                </h3>
                <p className="text-gray-400">Redirecting...</p>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm">
                    {error}
                </div>
            )}

            <Input
                label="Current Password"
                type="password"
                value={formData.currentPassword}
                onChange={(e) =>
                    setFormData({
                        ...formData,
                        currentPassword: e.target.value
                    })
                }
                required
                disabled={isLoading}
                autoComplete="current-password"
            />

            <Input
                label="New Password"
                type="password"
                value={formData.newPassword}
                onChange={(e) =>
                    setFormData({ ...formData, newPassword: e.target.value })
                }
                required
                disabled={isLoading}
                autoComplete="new-password"
                minLength={8}
            />

            <Input
                label="Confirm New Password"
                type="password"
                value={formData.confirmPassword}
                onChange={(e) =>
                    setFormData({
                        ...formData,
                        confirmPassword: e.target.value
                    })
                }
                required
                disabled={isLoading}
                autoComplete="new-password"
                minLength={8}
            />

            <Button
                type="submit"
                variant="primary"
                disabled={isLoading}
                className="w-full"
            >
                {isLoading ? 'Changing Password...' : 'Change Password'}
            </Button>
        </form>
    );
};
