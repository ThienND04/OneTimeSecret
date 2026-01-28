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

// Only store user info in localStorage, tokens are in httpOnly cookies
const USER_STORAGE_KEY = 'auth_user';

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
    children
}) => {
    const [user, setUser] = useState<User | null>(null);
    const [tokens, setTokens] = useState<AuthTokens | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Initialize auth state - restore user and try to refresh tokens
    useEffect(() => {
        const initializeAuth = async () => {
            console.log('[AuthContext] Initializing auth...');
            try {
                const storedUser = localStorage.getItem(USER_STORAGE_KEY);
                console.log(
                    '[AuthContext] Stored user:',
                    storedUser ? 'Found' : 'Not found'
                );

                if (storedUser) {
                    const parsedUser = JSON.parse(storedUser) as User;
                    console.log(
                        '[AuthContext] Parsed user:',
                        parsedUser.userName
                    );

                    // Try to refresh tokens using the httpOnly cookie
                    // This will restore the access token after page refresh
                    try {
                        console.log(
                            '[AuthContext] Attempting to refresh tokens...'
                        );
                        const response = await apiService.refreshTokens();
                        console.log(
                            '[AuthContext] Refresh successful!',
                            response
                        );
                        // Update both user (in case profile changed) and tokens
                        setUser(response.user);
                        setTokens(response.tokens);
                        // Update stored user info
                        localStorage.setItem(
                            USER_STORAGE_KEY,
                            JSON.stringify(response.user)
                        );
                        console.log('[AuthContext] User and tokens set');
                    } catch (error) {
                        // If refresh fails, clear user and require re-login
                        console.error(
                            '[AuthContext] Failed to refresh tokens on init:',
                            error
                        );
                        localStorage.removeItem(USER_STORAGE_KEY);
                        setUser(null);
                    }
                }
            } catch (error) {
                console.error(
                    '[AuthContext] Failed to initialize auth:',
                    error
                );
                localStorage.removeItem(USER_STORAGE_KEY);
            } finally {
                console.log('[AuthContext] Setting isLoading to false');
                setIsLoading(false);
            }
        };

        initializeAuth();
    }, []);

    const login = (user: User, tokens: AuthTokens) => {
        console.log('[AuthContext] login() called with:', { user, tokens });
        setUser(user);
        setTokens(tokens);
        // Only store user info, tokens are in httpOnly cookies managed by backend
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
        console.log('[AuthContext] User stored in localStorage');
    };

    const logout = () => {
        setUser(null);
        setTokens(null);
        localStorage.removeItem(USER_STORAGE_KEY);
    };

    const updateTokens = (newTokens: AuthTokens) => {
        setTokens(newTokens);
        // No need to store in localStorage, tokens are in httpOnly cookies
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
