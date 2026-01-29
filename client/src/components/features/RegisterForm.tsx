import { useState } from 'react';
import type { FormEvent } from 'react';
import { Input, Button } from '../common';
import { apiService } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

interface RegisterFormProps {
    onSuccess?: () => void;
}

export const RegisterForm = ({ onSuccess }: RegisterFormProps) => {
    const [userName, setUserName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [gender, setGender] = useState<'male' | 'female' | 'helicopter'>(
        'male'
    );
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError('');

        // Validation
        if (!userName || !email || !password || !confirmPassword) {
            setError('Please fill in all fields');
            return;
        }

        if (userName.length < 3) {
            setError('Username must be at least 3 characters');
            return;
        }

        if (!email.includes('@')) {
            setError('Please enter a valid email address');
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
            const response = await apiService.register({
                userName,
                email,
                password,
                gender
            });
            login(response.user, response.tokens);

            // Reset form
            setUserName('');
            setEmail('');
            setPassword('');
            setConfirmPassword('');
            setGender('male');

            if (onSuccess) {
                onSuccess();
            }
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : 'Registration failed. Please try again.'
            );
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <Input
                label="Username"
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="Choose a username"
                disabled={isLoading}
                helperText="At least 3 characters"
                required
            />

            <Input
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                disabled={isLoading}
                required
            />

            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Gender
                </label>
                <select
                    value={gender}
                    onChange={(e) =>
                        setGender(
                            e.target.value as 'male' | 'female' | 'helicopter'
                        )
                    }
                    disabled={isLoading}
                    className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    required
                >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="helicopter">Helicopter</option>
                </select>
            </div>

            <Input
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create a password"
                disabled={isLoading}
                helperText="At least 6 characters"
                required
            />

            <Input
                label="Confirm Password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your password"
                disabled={isLoading}
                required
            />

            <Button
                type="submit"
                variant="primary"
                disabled={isLoading}
                className="w-full"
            >
                {isLoading ? 'Creating account...' : 'Create Account'}
            </Button>

            {error && (
                <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded-lg text-sm">
                    {error}
                </div>
            )}
        </form>
    );
};
