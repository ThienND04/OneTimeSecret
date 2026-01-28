import { useEffect, useState } from 'react';
import MainLayout from '../layouts/MainLayout';
import { Card, GradientText, Button } from '../components/common';
import { apiService } from '../services/api';
import type { UserSecret, UserSecretStats } from '../types';

export const MySecretsPage = () => {
    const [secrets, setSecrets] = useState<UserSecret[]>([]);
    const [stats, setStats] = useState<UserSecretStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filter, setFilter] = useState<
        'all' | 'viewed' | 'unviewed' | 'revoked'
    >('all');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        fetchData();
    }, [filter, page]);

    const fetchData = async () => {
        setLoading(true);
        setError(null);

        try {
            const [secretsData, statsData] = await Promise.all([
                apiService.getUserSecrets({
                    page,
                    limit: 10,
                    status: filter,
                    sortBy: 'createdAt:desc'
                }),
                apiService.getUserStats()
            ]);

            setSecrets(secretsData.data);
            setTotalPages(secretsData.pagination.totalPages);
            setStats(statsData);
        } catch (err) {
            setError(
                err instanceof Error ? err.message : 'Failed to load secrets'
            );
        } finally {
            setLoading(false);
        }
    };

    const handleRevoke = async (secretId: string) => {
        if (!confirm('Are you sure you want to revoke this secret?')) return;

        try {
            await apiService.revokeSecret(secretId);
            fetchData();
        } catch (err) {
            alert(
                err instanceof Error ? err.message : 'Failed to revoke secret'
            );
        }
    };

    const getStatusBadge = (secret: UserSecret) => {
        if (secret.isRevoked) {
            return (
                <span className="px-2 py-1 text-xs rounded bg-red-500/20 text-red-400">
                    Revoked
                </span>
            );
        }
        if (secret.read) {
            return (
                <span className="px-2 py-1 text-xs rounded bg-gray-500/20 text-gray-400">
                    Viewed
                </span>
            );
        }
        return (
            <span className="px-2 py-1 text-xs rounded bg-green-500/20 text-green-400">
                Active
            </span>
        );
    };

    return (
        <MainLayout>
            <div className="max-w-6xl mx-auto py-12 px-4">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold mb-2">
                        My <GradientText>Secrets</GradientText>
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Manage your shared secrets
                    </p>
                </div>

                {/* Stats Cards */}
                {stats && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                        <Card className="p-4 text-center">
                            <div className="text-3xl font-bold text-cyan-500">
                                {stats.total}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                                Total
                            </div>
                        </Card>
                        <Card className="p-4 text-center">
                            <div className="text-3xl font-bold text-green-500">
                                {stats.unviewed}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                                Active
                            </div>
                        </Card>
                        <Card className="p-4 text-center">
                            <div className="text-3xl font-bold text-gray-500">
                                {stats.viewed}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                                Viewed
                            </div>
                        </Card>
                        <Card className="p-4 text-center">
                            <div className="text-3xl font-bold text-red-500">
                                {stats.revoked}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                                Revoked
                            </div>
                        </Card>
                    </div>
                )}

                {/* Filters */}
                <div className="flex gap-2 mb-6 flex-wrap">
                    {(['all', 'unviewed', 'viewed', 'revoked'] as const).map(
                        (status) => (
                            <button
                                key={status}
                                onClick={() => {
                                    setFilter(status);
                                    setPage(1);
                                }}
                                className={`px-4 py-2 rounded-lg capitalize transition-colors ${
                                    filter === status
                                        ? 'bg-cyan-500 text-white'
                                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                }`}
                            >
                                {status}
                            </button>
                        )
                    )}
                </div>

                {/* Secrets List */}
                {loading ? (
                    <div className="text-center py-12">
                        <div className="inline-block w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : error ? (
                    <Card className="p-8 text-center">
                        <p className="text-red-500">{error}</p>
                        <Button onClick={fetchData} className="mt-4">
                            Retry
                        </Button>
                    </Card>
                ) : secrets.length === 0 ? (
                    <Card className="p-8 text-center">
                        <p className="text-gray-600 dark:text-gray-400 mb-4">
                            No secrets found
                        </p>
                        <Button to="/">Create Your First Secret</Button>
                    </Card>
                ) : (
                    <div className="space-y-4">
                        {secrets.map((secret) => (
                            <Card key={secret.id} className="p-6">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="text-lg font-semibold text-white truncate">
                                                {secret.title || 'Untitled'}
                                            </h3>
                                            {getStatusBadge(secret)}
                                        </div>
                                        <div className="flex flex-wrap gap-4 text-sm text-gray-400">
                                            <span>
                                                ID:{' '}
                                                <code className="text-cyan-400">
                                                    {secret.id.slice(0, 8)}...
                                                </code>
                                            </span>
                                            <span>
                                                Created:{' '}
                                                {new Date(
                                                    secret.createdAt
                                                ).toLocaleDateString()}
                                            </span>
                                            {secret.hasPassword && (
                                                <span className="text-yellow-400">
                                                    🔒 Password Protected
                                                </span>
                                            )}
                                            {secret.filesCount > 0 && (
                                                <span className="text-blue-400">
                                                    📎 {secret.filesCount} file
                                                    {secret.filesCount > 1
                                                        ? 's'
                                                        : ''}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => {
                                                navigator.clipboard.writeText(
                                                    `${window.location.origin}/secret/${secret.id}`
                                                );
                                                alert('Link copied!');
                                            }}
                                        >
                                            Copy Link
                                        </Button>
                                        {!secret.read && !secret.isRevoked && (
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() =>
                                                    handleRevoke(secret.id)
                                                }
                                                className="text-red-400 hover:text-red-300"
                                            >
                                                Revoke
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex justify-center gap-2 mt-8">
                        <Button
                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                            disabled={page === 1}
                            size="sm"
                        >
                            Previous
                        </Button>
                        <span className="px-4 py-2 text-gray-400">
                            Page {page} of {totalPages}
                        </span>
                        <Button
                            onClick={() =>
                                setPage((p) => Math.min(totalPages, p + 1))
                            }
                            disabled={page === totalPages}
                            size="sm"
                        >
                            Next
                        </Button>
                    </div>
                )}
            </div>
        </MainLayout>
    );
};
