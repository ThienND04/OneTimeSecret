import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { User, AuthTokens } from '../types';
import { apiService } from '../services/api';

interface AuthContextType {
    user: User | null;
    tokens: AuthTokens | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (user: User, tokens: AuthTokens) => void;
    logout: () => void;
    updateTokens: (tokens: AuthTokens) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Storage keys
const USER_STORAGE_KEY = 'auth_user';
const TOKENS_STORAGE_KEY = 'auth_tokens';

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
    children
}) => {
    const [user, setUser] = useState<User | null>(null);
    const [tokens, setTokens] = useState<AuthTokens | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Initialize auth state - restore user and try to refresh tokens
    useEffect(() => {
        const initializeAuth = async () => {
            try {
                const storedUser = localStorage.getItem(USER_STORAGE_KEY);

                if (storedUser) {
                    // Try to refresh tokens using the httpOnly cookie
                    // This will restore the access token after page refresh
                    try {
                        const response = await apiService.refreshTokens();
                        // Update both user (in case profile changed) and tokens
                        setUser(response.user);
                        setTokens(response.tokens);
                        // Store user info and tokens
                        localStorage.setItem(
                            USER_STORAGE_KEY,
                            JSON.stringify(response.user)
                        );
                        localStorage.setItem(
                            TOKENS_STORAGE_KEY,
                            JSON.stringify(response.tokens)
                        );
                    } catch (error) {
                        // If refresh fails, clear user and require re-login
                        console.error('Failed to refresh tokens:', error);
                        localStorage.removeItem(USER_STORAGE_KEY);
                        localStorage.removeItem(TOKENS_STORAGE_KEY);
                        setUser(null);
                        setTokens(null);
                    }
                }
            } catch (error) {
                console.error('Failed to initialize auth:', error);
                localStorage.removeItem(USER_STORAGE_KEY);
                localStorage.removeItem(TOKENS_STORAGE_KEY);
            } finally {
                setIsLoading(false);
            }
        };

        initializeAuth();
    }, []);

    const login = (user: User, tokens: AuthTokens) => {
        setUser(user);
        setTokens(tokens);
        // Store both user info and tokens
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
        localStorage.setItem(TOKENS_STORAGE_KEY, JSON.stringify(tokens));
    };

    const logout = () => {
        setUser(null);
        setTokens(null);
        localStorage.removeItem(USER_STORAGE_KEY);
        localStorage.removeItem(TOKENS_STORAGE_KEY);
    };

    const updateTokens = (newTokens: AuthTokens) => {
        setTokens(newTokens);
        // Store updated tokens
        localStorage.setItem(TOKENS_STORAGE_KEY, JSON.stringify(newTokens));
    };

    const value: AuthContextType = {
        user,
        tokens,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        updateTokens
    };

    return (
        <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
    );
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
