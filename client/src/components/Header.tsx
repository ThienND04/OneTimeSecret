import { Button, IconBox } from './common';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/api';
import { useState } from 'react';

export default function Header() {
    const { isAuthenticated, user, logout, isLoading } = useAuth();
    const navigate = useNavigate();
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    const handleLogout = async () => {
        if (isLoggingOut) return;
        setIsLoggingOut(true);

        try {
            await apiService.logout();
        } catch (error) {
            // Silently handle logout error, proceed with client-side cleanup
        } finally {
            logout();
            setShowUserMenu(false);
            setIsLoggingOut(false);
            navigate('/');
        }
    };

    return (
        <header className="sticky top-0 z-50 w-full border-b border-cyan-500/20 bg-gray-900/80 backdrop-blur-md justify-items-center">
            <div className="mx-auto flex h-20 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                <Link
                    to="/"
                    className="flex shrink-0 items-center gap-3 hover:opacity-80 transition-opacity"
                >
                    <IconBox variant="gradient" size="sm">
                        <span className="text-xl font-bold text-white">🔐</span>
                    </IconBox>
                    <div className="hidden sm:block">
                        <h1 className="text-xl font-bold tracking-tight text-white sm:text-2xl">
                            OneTimeSecret
                        </h1>
                        <p className="text-xs text-gray-400 sm:text-sm">
                            Secure message sharing
                        </p>
                    </div>
                    <div className="sm:hidden">
                        <h1 className="text-xl font-bold tracking-tight text-white">
                            OTS
                        </h1>
                    </div>
                </Link>

                <nav className="flex items-center gap-2 sm:gap-4">
                    <Button to="/" variant="ghost" size="sm">
                        Home
                    </Button>
                    {isAuthenticated && (
                        <Button to="/my-secrets" variant="ghost" size="sm">
                            My Secrets
                        </Button>
                    )}

                    {isLoading ? (
                        // Show nothing while loading auth state
                        <div className="w-24 h-10 animate-pulse bg-gray-700/50 rounded-lg"></div>
                    ) : isAuthenticated ? (
                        <div className="relative">
                            <button
                                onClick={() => setShowUserMenu(!showUserMenu)}
                                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 transition-colors"
                            >
                                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-cyan-500 to-emerald-500 flex items-center justify-center text-white font-bold">
                                    {user?.userName.charAt(0).toUpperCase()}
                                </div>
                                <span className="hidden sm:inline text-white">
                                    {user?.userName}
                                </span>
                            </button>

                            {showUserMenu && (
                                <>
                                    <div
                                        className="fixed inset-0 z-40"
                                        onClick={() => setShowUserMenu(false)}
                                    />
                                    <div className="absolute right-0 mt-2 w-48 bg-gray-800 border border-cyan-500/20 rounded-lg shadow-xl z-50">
                                        <div className="p-3 border-b border-gray-700">
                                            <p className="text-sm text-white font-medium truncate">
                                                {user?.userName}
                                            </p>
                                            <p className="text-xs text-gray-400 truncate">
                                                {user?.email}
                                            </p>
                                        </div>
                                        <Link
                                            to="/my-secrets"
                                            onClick={() =>
                                                setShowUserMenu(false)
                                            }
                                            className="block px-4 py-2 text-sm text-white hover:bg-gray-700 transition-colors"
                                        >
                                            My Secrets
                                        </Link>
                                        <Link
                                            to="/change-password"
                                            onClick={() =>
                                                setShowUserMenu(false)
                                            }
                                            className="block px-4 py-2 text-sm text-white hover:bg-gray-700 transition-colors"
                                        >
                                            Change Password
                                        </Link>
                                        <button
                                            onClick={handleLogout}
                                            disabled={isLoggingOut}
                                            className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-gray-700 transition-colors disabled:opacity-50"
                                        >
                                            {isLoggingOut
                                                ? 'Logging out...'
                                                : 'Sign Out'}
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    ) : (
                        <>
                            <Button to="/login" variant="ghost" size="sm">
                                Sign In
                            </Button>
                            <Button
                                to="/register"
                                variant="primary"
                                size="md"
                                className="whitespace-nowrap"
                            >
                                Sign Up
                            </Button>
                        </>
                    )}
                </nav>
            </div>
        </header>
    );
}
