"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import api from '@/utils/api';

interface User {
    _id: string;
    name: string;
    email: string;
    role: string;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    loading: boolean;
    error: string | null;
    login: (email: string, password: string) => Promise<void>;
    signup: (name: string, email: string, password: string, role: string) => Promise<void>;
    logout: () => void;
    clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const validateStoredAuth = async () => {
            const storedUser = localStorage.getItem('user');
            const storedToken = localStorage.getItem('token');

            if (storedUser && storedToken) {
                try {
                    // Validate the stored token is still valid
                    const response = await api.get('/auth/me');
                    // Use fresh data from server, not stale localStorage
                    setUser(response.data);
                    setToken(storedToken);
                    // Update localStorage with fresh server data
                    localStorage.setItem('user', JSON.stringify(response.data));
                } catch {
                    // Token expired or invalid — clear stale auth
                    localStorage.removeItem('user');
                    localStorage.removeItem('token');
                    setUser(null);
                    setToken(null);
                }
            }
            setLoading(false);
        };

        validateStoredAuth();
    }, []);

    const login = async (email: string, password: string) => {
        try {
            setError(null);
            setLoading(true);
            const response = await api.post('/auth/login', {
                email,
                password,
            });

            const { token: authToken, ...userData } = response.data;

            localStorage.setItem('user', JSON.stringify(userData));
            localStorage.setItem('token', authToken);
            setUser(userData);
            setToken(authToken);
        } catch (err: any) {
            const message = err.response?.data?.message || 'Login failed';
            setError(message);
            throw new Error(message);
        } finally {
            setLoading(false);
        }
    };

    const signup = async (name: string, email: string, password: string, role: string) => {
        try {
            setError(null);
            setLoading(true);
            const response = await api.post('/auth/signup', {
                name,
                email,
                password,
                role,
            });

            const { token: authToken, ...userData } = response.data;

            localStorage.setItem('user', JSON.stringify(userData));
            localStorage.setItem('token', authToken);
            setUser(userData);
            setToken(authToken);
        } catch (err: any) {
            const message = err.response?.data?.message || 'Signup failed';
            setError(message);
            throw new Error(message);
        } finally {
            setLoading(false);
        }
    };

    const logout = async () => {
        try {
            await api.post('/auth/logout');
        } catch (err) {
            console.error('Logout error:', err);
        } finally {
            localStorage.removeItem('user');
            localStorage.removeItem('token');
            setUser(null);
            setToken(null);
            window.location.href = '/';
        }
    };

    const clearError = () => {
        setError(null);
    };

    return (
        <AuthContext.Provider value={{ user, token, loading, error, login, signup, logout, clearError }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
