import { useState } from 'react';
import { useParams } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import GradientText from '../components/common/GradientText';
import { apiService } from '../services/api';
import type { GetSecretResponse } from '../types';

const ViewSecretPage = () => {
    const { id } = useParams<{ id: string }>();
    const [password, setPassword] = useState('');
    const [secret, setSecret] = useState<GetSecretResponse | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [hasViewed, setHasViewed] = useState(false);

    const handleViewSecret = async () => {
        if (!id) return;

        setLoading(true);
        setError('');

        try {
            const response = await apiService.getSecret(
                id,
                password || undefined
            );
            setSecret(response);
            setHasViewed(true);
        } catch (err) {
            setError(
                err instanceof Error ? err.message : 'Failed to view secret'
            );
        } finally {
            setLoading(false);
        }
    };

    const handleCopyContent = async () => {
        if (!secret?.data?.content) return;
        try {
            await navigator.clipboard.writeText(secret.data.content);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    if (hasViewed && secret) {
        return (
            <MainLayout>
                <div className="max-w-3xl mx-auto py-12 px-4">
                    <Card className="p-8">
                        <div className="text-center mb-8">
                            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 dark:bg-green-900/30 mb-4">
                                <svg
                                    className="h-10 w-10 text-green-600 dark:text-green-400"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                    />
                                </svg>
                            </div>
                            <h1 className="text-3xl font-bold mb-2">
                                <GradientText>Secret Revealed</GradientText>
                            </h1>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <label className="block text-sm font-medium text-gray-300">
                                        Content
                                    </label>
                                    <button
                                        onClick={handleCopyContent}
                                        className="text-sm text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                                    >
                                        <svg
                                            className="w-4 h-4"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                                            />
                                        </svg>
                                        Copy
                                    </button>
                                </div>
                                <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                                    <p className="text-white whitespace-pre-wrap break-words">
                                        {secret.data?.content}
                                    </p>
                                </div>
                            </div>

                            {secret.data?.files &&
                                secret.data.files.length > 0 && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">
                                            Attached Files (
                                            {secret.data.files.length})
                                        </label>
                                        <div className="space-y-2">
                                            {secret.data.files.map(
                                                (file, index) => (
                                                    <a
                                                        key={index}
                                                        href={file.url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg hover:bg-gray-700 transition border border-gray-700 hover:border-cyan-500"
                                                    >
                                                        <svg
                                                            className="w-6 h-6 text-cyan-400 flex-shrink-0"
                                                            fill="none"
                                                            stroke="currentColor"
                                                            viewBox="0 0 24 24"
                                                        >
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                strokeWidth={2}
                                                                d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
                                                            />
                                                        </svg>
                                                        <span className="text-gray-200 flex-1">
                                                            {file.originalName}
                                                        </span>
                                                        <svg
                                                            className="w-5 h-5 text-gray-400"
                                                            fill="none"
                                                            stroke="currentColor"
                                                            viewBox="0 0 24 24"
                                                        >
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                strokeWidth={2}
                                                                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                                                            />
                                                        </svg>
                                                    </a>
                                                )
                                            )}
                                        </div>
                                    </div>
                                )}

                            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                                <div className="flex">
                                    <svg
                                        className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mr-2 flex-shrink-0 mt-0.5"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                                        />
                                    </svg>
                                    <div>
                                        <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-300">
                                            Secret Destroyed
                                        </h3>
                                        <p className="text-sm text-yellow-700 dark:text-yellow-400 mt-1">
                                            This secret has been permanently
                                            destroyed and cannot be viewed
                                            again. Make sure to save any
                                            important information now.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <Button
                                    to="/"
                                    variant="secondary"
                                    size="lg"
                                    className="flex-1"
                                >
                                    Go Home
                                </Button>
                                <Button
                                    to="/create"
                                    variant="primary"
                                    size="lg"
                                    className="flex-1"
                                >
                                    Create New Secret
                                </Button>
                            </div>
                        </div>
                    </Card>
                </div>
            </MainLayout>
        );
    }

    return (
        <MainLayout>
            <div className="max-w-2xl mx-auto py-12 px-4">
                <Card className="p-8">
                    <div className="text-center mb-8">
                        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-cyan-100 dark:bg-cyan-900/30 mb-4">
                            <svg
                                className="h-10 w-10 text-cyan-600 dark:text-cyan-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                />
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                />
                            </svg>
                        </div>
                        <h1 className="text-3xl font-bold mb-2">
                            View <GradientText>Secret</GradientText>
                        </h1>
                        <p className="text-gray-400">
                            This secret can only be viewed once. After viewing,
                            it will be permanently destroyed.
                        </p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                            <div className="flex">
                                <svg
                                    className="h-5 w-5 text-red-600 dark:text-red-400 mr-2 flex-shrink-0"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                    />
                                </svg>
                                <p className="text-sm text-red-600 dark:text-red-400">
                                    {error}
                                </p>
                            </div>
                        </div>
                    )}

                    <div className="space-y-6">
                        <Input
                            label="Password (if protected)"
                            variant="password"
                            placeholder="Enter password..."
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            helperText="Leave empty if the secret is not password-protected"
                        />

                        <Button
                            onClick={handleViewSecret}
                            variant="primary"
                            size="lg"
                            disabled={loading}
                            className="w-full"
                        >
                            {loading ? (
                                <>
                                    <svg
                                        className="animate-spin -ml-1 mr-3 h-5 w-5"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                    >
                                        <circle
                                            className="opacity-25"
                                            cx="12"
                                            cy="12"
                                            r="10"
                                            stroke="currentColor"
                                            strokeWidth="4"
                                        />
                                        <path
                                            className="opacity-75"
                                            fill="currentColor"
                                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                        />
                                    </svg>
                                    Loading...
                                </>
                            ) : (
                                <>
                                    <svg
                                        className="w-5 h-5 mr-2"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z"
                                        />
                                    </svg>
                                    🔓 View Secret (One Time Only)
                                </>
                            )}
                        </Button>
                    </div>

                    <div className="mt-8 text-center">
                        <Button to="/" variant="ghost" size="sm">
                            ← Go Home
                        </Button>
                    </div>
                </Card>
            </div>
        </MainLayout>
    );
};

export default ViewSecretPage;
