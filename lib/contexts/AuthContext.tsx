'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface User {
  userId: string;
  email: string;
  tier: 'free' | 'professional' | 'business' | 'enterprise';
  storiesRemaining?: number;
  storiesThisMonth: number;
  limits: {
    storiesPerMonth: number;
    maxDatasetRows: number;
    teamMembers: number;
  };
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';
const TOKEN_EXPIRY_KEY = 'token_expiry';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state from localStorage
  useEffect(() => {
    const initAuth = () => {
      try {
        const storedToken = localStorage.getItem(TOKEN_KEY);
        const storedUser = localStorage.getItem(USER_KEY);
        const tokenExpiry = localStorage.getItem(TOKEN_EXPIRY_KEY);

        if (storedToken && storedUser && tokenExpiry) {
          const expiryDate = new Date(tokenExpiry);
          const now = new Date();

          // Check if token is expired
          if (expiryDate > now) {
            setToken(storedToken);
            setUser(JSON.parse(storedUser));
          } else {
            // Token expired, clear storage
            clearAuthStorage();
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        clearAuthStorage();
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const clearAuthStorage = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(TOKEN_EXPIRY_KEY);
    setToken(null);
    setUser(null);
  };

  const saveAuthData = (token: string, user: User, rememberMe: boolean = false) => {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    
    // Set expiry: 7 days default, 30 days if remember me
    const expiryDays = rememberMe ? 30 : 7;
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + expiryDays);
    localStorage.setItem(TOKEN_EXPIRY_KEY, expiryDate.toISOString());

    setToken(token);
    setUser(user);
  };

  const login = async (email: string, password: string, rememberMe: boolean = false) => {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password, rememberMe }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Login failed');
    }

    const data = await response.json();
    saveAuthData(data.token, {
      userId: data.userId,
      email: email,
      tier: data.tier,
      storiesRemaining: data.storiesRemaining,
      storiesThisMonth: data.storiesThisMonth || 0,
      limits: data.limits || {
        storiesPerMonth: 3,
        maxDatasetRows: 1000,
        teamMembers: 1,
      },
    }, rememberMe);
  };

  const register = async (email: string, password: string) => {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Registration failed');
    }

    const data = await response.json();
    saveAuthData(data.token, {
      userId: data.userId,
      email: email,
      tier: data.tier,
      storiesRemaining: data.storiesRemaining,
      storiesThisMonth: data.storiesThisMonth || 0,
      limits: data.limits || {
        storiesPerMonth: 3,
        maxDatasetRows: 1000,
        teamMembers: 1,
      },
    });
  };

  const logout = async () => {
    try {
      if (token) {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      clearAuthStorage();
    }
  };

  const refreshToken = async () => {
    try {
      if (!token) return;

      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        const tokenExpiry = localStorage.getItem(TOKEN_EXPIRY_KEY);
        const isLongSession = tokenExpiry ? new Date(tokenExpiry).getTime() - Date.now() > 14 * 24 * 60 * 60 * 1000 : false;
        
        saveAuthData(data.token, user!, isLongSession);
      } else {
        // Refresh failed, logout
        await logout();
      }
    } catch (error) {
      console.error('Token refresh error:', error);
      await logout();
    }
  };

  // Set up automatic token refresh
  useEffect(() => {
    if (!token) return;

    const checkTokenExpiry = () => {
      const tokenExpiry = localStorage.getItem(TOKEN_EXPIRY_KEY);
      if (!tokenExpiry) return;

      const expiryDate = new Date(tokenExpiry);
      const now = new Date();
      const timeUntilExpiry = expiryDate.getTime() - now.getTime();

      // Refresh token 5 minutes before expiry
      const refreshThreshold = 5 * 60 * 1000; // 5 minutes in milliseconds

      if (timeUntilExpiry < refreshThreshold && timeUntilExpiry > 0) {
        refreshToken();
      } else if (timeUntilExpiry <= 0) {
        // Token expired
        logout();
      }
    };

    // Check every minute
    const interval = setInterval(checkTokenExpiry, 60 * 1000);

    // Check immediately
    checkTokenExpiry();

    return () => clearInterval(interval);
  }, [token, logout, refreshToken]);

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    isAuthenticated: !!user && !!token,
    login,
    register,
    logout,
    refreshToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
