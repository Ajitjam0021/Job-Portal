"use client";

import { useState, Suspense } from 'react';
import { useAuth } from '@/context/AuthContext';
import { motion } from 'framer-motion';
import Button from '@/components/Button';
import Input from '@/components/Input';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

export default function LoginForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const registered = searchParams.get('registered');
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { login } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await login(formData.email, formData.password);
            const userData = localStorage.getItem('user');
            if (userData) {
                const user = JSON.parse(userData);
                if (user.role === 'employer') {
                    router.push(`/profile/employer/${user._id}`);
                } else {
                    router.push(`/profile/candidate/${user._id}`);
                }
            }
        } catch (err: any) {
            setError(err.message || 'Invalid email or password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80vh', padding: '2rem' }}>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ width: '100%', maxWidth: '400px', background: 'white', padding: '2.5rem', borderRadius: '24px', boxShadow: '0 20px 40px rgba(0,0,0,0.05)', border: '1px solid #f4f4f5' }}
            >
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#18181b', marginBottom: '0.5rem' }}>Welcome Back</h1>
                    <p style={{ color: '#71717a' }}>Enter your credentials to access your account</p>
                </div>

                {registered && (
                    <div style={{ padding: '1rem', background: '#ecfdf5', color: '#059669', borderRadius: '12px', fontSize: '0.9rem', marginBottom: '1.5rem', textAlign: 'center', border: '1px solid #10b981' }}>
                        Registration successful! Please login.
                    </div>
                )}

                {error && (
                    <div style={{ padding: '1rem', background: '#fef2f2', color: '#dc2626', borderRadius: '12px', fontSize: '0.9rem', marginBottom: '1.5rem', border: '1px solid #fee2e2' }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <Input
                        label="Email Address"
                        type="email"
                        placeholder="john@example.com"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                    <Input
                        label="Password"
                        type="password"
                        placeholder="••••••••"
                        required
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    />

                    <div style={{ textAlign: 'right' }}>
                        <Link href="/auth/forgot-password" style={{ fontSize: '0.85rem', color: '#2563eb', fontWeight: 600, textDecoration: 'none' }}>
                            Forgot password?
                        </Link>
                    </div>

                    <Button type="submit" disabled={loading} style={{ padding: '0.85rem', borderRadius: '12px', background: '#18181b', marginTop: '0.5rem' }}>
                        {loading ? 'Logging in...' : 'Sign In'}
                    </Button>
                </form>

                <div style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.9rem', color: '#71717a' }}>
                    Don't have an account?{' '}
                    <Link href="/auth/signup" style={{ color: '#2563eb', fontWeight: 700, textDecoration: 'none' }}>
                        Create account
                    </Link>
                </div>
            </motion.div>
        </div>
    );
}
