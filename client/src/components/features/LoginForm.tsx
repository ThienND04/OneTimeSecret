import { useState, FormEvent } from 'react';
import { Input, Button } from '../common';
import { apiService } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

interface LoginFormProps {
    onSuccess?: () => void;
}

export const LoginForm = ({ onSuccess }: LoginFormProps) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError('');

        // Validation
        if (!email || !password) {
            setError('Please fill in all fields');
            return;
        }

        if (!email.includes('@')) {
            setError('Please enter a valid email address');
            return;
        }

        setIsLoading(true);

        try {
            console.log('[LoginForm] Calling login API...');
            const response = await apiService.login({ email, password });
            console.log('[LoginForm] Login response:', response);
            console.log('[LoginForm] User:', response.user);
            console.log('[LoginForm] Tokens:', response.tokens);
            login(response.user, response.tokens);
            console.log('[LoginForm] Context login() called');

            // Reset form
            setEmail('');
            setPassword('');

            if (onSuccess) {
                onSuccess();
            }
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : 'Login failed. Please try again.'
            );
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <Input
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                disabled={isLoading}
                required
            />

            <Input
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                disabled={isLoading}
                required
            />

            <Button
                type="submit"
                variant="primary"
                fullWidth
                disabled={isLoading}
            >
                {isLoading ? 'Signing in...' : 'Sign In'}
            </Button>

            {error && (
                <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded-lg text-sm">
                    {error}
                </div>
            )}
        </form>
    );
};
