import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { User, AuthTokens } from '../types';

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

const TOKEN_STORAGE_KEY = 'auth_tokens';
const USER_STORAGE_KEY = 'auth_user';

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
    children
}) => {
    const [user, setUser] = useState<User | null>(null);
    const [tokens, setTokens] = useState<AuthTokens | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Initialize auth state from localStorage on mount
    useEffect(() => {
        const initializeAuth = () => {
            try {
                const storedTokens = localStorage.getItem(TOKEN_STORAGE_KEY);
                const storedUser = localStorage.getItem(USER_STORAGE_KEY);

                if (storedTokens && storedUser) {
                    const parsedTokens = JSON.parse(storedTokens) as AuthTokens;
                    const parsedUser = JSON.parse(storedUser) as User;

                    // Check if access token is expired
                    const now = Date.now();
                    if (parsedTokens.access.expires > now) {
                        setTokens(parsedTokens);
                        setUser(parsedUser);
                    } else {
                        // Token expired, clear storage
                        localStorage.removeItem(TOKEN_STORAGE_KEY);
                        localStorage.removeItem(USER_STORAGE_KEY);
                    }
                }
            } catch (error) {
                console.error('Failed to initialize auth:', error);
                localStorage.removeItem(TOKEN_STORAGE_KEY);
                localStorage.removeItem(USER_STORAGE_KEY);
            } finally {
                setIsLoading(false);
            }
        };

        initializeAuth();
    }, []);

    const login = (user: User, tokens: AuthTokens) => {
        setUser(user);
        setTokens(tokens);
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
        localStorage.setItem(TOKEN_STORAGE_KEY, JSON.stringify(tokens));
    };

    const logout = () => {
        setUser(null);
        setTokens(null);
        localStorage.removeItem(USER_STORAGE_KEY);
        localStorage.removeItem(TOKEN_STORAGE_KEY);
    };

    const updateTokens = (newTokens: AuthTokens) => {
        setTokens(newTokens);
        localStorage.setItem(TOKEN_STORAGE_KEY, JSON.stringify(newTokens));
    };

    const value: AuthContextType = {
        user,
        tokens,
        isAuthenticated: !!user && !!tokens,
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
