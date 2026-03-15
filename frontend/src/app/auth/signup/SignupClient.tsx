"use client";

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { motion } from 'framer-motion';
import Button from '@/components/Button';
import Input from '@/components/Input';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import toast from 'react-hot-toast';

export default function SignupPageClient() {
    const router = useRouter();
    const { signup } = useAuth();
    const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'candidate' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await signup(formData.name, formData.email, formData.password, formData.role);
            toast.success('Account created successfully!');
            const userData = localStorage.getItem('user');
            const user = userData ? JSON.parse(userData) : null;
            if (formData.role === 'employer') {
                router.push(user?._id ? `/profile/employer/${user._id}` : '/dashboard/employer');
            } else {
                router.push(user?._id ? `/profile/candidate/${user._id}` : '/jobs');
            }
        } catch (err: any) {
            toast.error(err.response?.data?.message || err.message || 'Something went wrong');
            setError(err.response?.data?.message || err.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    const roleSelectorStyle = (active: boolean) => ({
        flex: 1,
        padding: '0.75rem',
        borderRadius: '12px',
        border: active ? '2px solid #2563eb' : '1px solid #e4e4e7',
        background: active ? '#eff6ff' : 'white',
        cursor: 'pointer',
        textAlign: 'center' as const,
        transition: 'all 0.2s',
    });

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80vh', padding: '1rem' }}>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="auth-card"
                style={{ width: '100%', maxWidth: '400px', background: 'white', padding: '2rem', borderRadius: '24px', boxShadow: '0 20px 40px rgba(0,0,0,0.05)', border: '1px solid #f4f4f5' }}
            >
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#18181b', marginBottom: '0.5rem' }}>Create Account</h1>
                    <p style={{ color: '#71717a' }}>Join our community and find your next role</p>
                </div>

                {error && (
                    <div style={{ padding: '1rem', background: '#fef2f2', color: '#dc2626', borderRadius: '12px', fontSize: '0.9rem', marginBottom: '1.5rem', border: '1px solid #fee2e2' }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <div style={{ display: 'flex', gap: '1rem', marginBottom: '0.5rem' }}>
                        <div
                            onClick={() => setFormData({ ...formData, role: 'candidate' })}
                            style={roleSelectorStyle(formData.role === 'candidate')}
                        >
                            <div style={{ fontWeight: 700, fontSize: '0.9rem', color: formData.role === 'candidate' ? '#2563eb' : '#18181b' }}>Candidate</div>
                            <div style={{ fontSize: '0.75rem', color: '#71717a', marginTop: '0.25rem' }}>I want to hire</div>
                        </div>
                        <div
                            onClick={() => setFormData({ ...formData, role: 'employer' })}
                            style={roleSelectorStyle(formData.role === 'employer')}
                        >
                            <div style={{ fontWeight: 700, fontSize: '0.9rem', color: formData.role === 'employer' ? '#2563eb' : '#18181b' }}>Employer</div>
                            <div style={{ fontSize: '0.75rem', color: '#71717a', marginTop: '0.25rem' }}>I want to hire</div>
                        </div>
                    </div>

                    <Input
                        label="Full Name"
                        placeholder="John Doe"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
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
                        placeholder="Minimum 8 characters"
                        required
                        autoComplete="new-password"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    />

                    <p style={{ fontSize: '0.75rem', color: '#71717a', textAlign: 'center', lineHeight: 1.5 }}>
                        By signing up, you agree to our <Link href="/terms" style={{ color: '#2563eb' }}>Terms of Service</Link> and <Link href="/privacy" style={{ color: '#2563eb' }}>Privacy Policy</Link>.
                    </p>

                    <Button type="submit" disabled={loading} style={{ padding: '0.85rem', borderRadius: '12px', background: '#18181b', marginTop: '0.5rem' }}>
                        {loading ? 'Creating Account...' : 'Get Started'}
                    </Button>
                </form>

                <div style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.9rem', color: '#71717a' }}>
                    Already have an account?{' '}
                    <Link href="/auth/login" style={{ color: '#2563eb', fontWeight: 700, textDecoration: 'none' }}>
                        Sign in
                    </Link>
                </div>
            </motion.div>
        </div>
    );
}
