"use client";

import { useEffect, useState, useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Button from '@/components/Button';
import Link from 'next/link';
import api from '@/utils/api';

/* ─── Types ─── */
interface AppJob {
    _id: string; title: string; company: string;
    location: string; type: string; salary: string;
}

interface Application {
    _id: string;
    job: AppJob;
    status: 'pending' | 'reviewed' | 'shortlisted' | 'rejected' | 'accepted';
    appliedAt: string;
    coverLetter?: string;
}

interface RecommendedJob {
    _id: string; title: string; company: string;
    location: string; type: string; salary: string;
    createdAt: string;
}

interface DashboardData {
    stats: {
        totalApplications: number;
        pending: number; reviewed: number;
        shortlisted: number; rejected: number; accepted: number;
    };
    completeness: { score: number; missing: string[] };
    applications: Application[];
    recommendedJobs: RecommendedJob[];
}

/* ─── Status styling ─── */
const statusStyle: Record<string, { bg: string; color: string; label: string }> = {
    pending: { bg: '#fef3c7', color: '#92400e', label: 'Pending' },
    reviewed: { bg: '#dbeafe', color: '#1e40af', label: 'Reviewed' },
    shortlisted: { bg: '#d1fae5', color: '#065f46', label: 'Shortlisted' },
    rejected: { bg: '#fee2e2', color: '#991b1b', label: 'Rejected' },
    accepted: { bg: '#d1fae5', color: '#14532d', label: 'Accepted' },
};

/* ─── Stat card icons ─── */
const statCards = [
    { key: 'totalApplications', label: 'Total Applied', icon: '📋', accent: '#6366f1' },
    { key: 'shortlisted', label: 'Shortlisted', icon: '⭐', accent: '#f59e0b' },
    { key: 'accepted', label: 'Accepted', icon: '✅', accent: '#10b981' },
    { key: 'rejected', label: 'Rejected', icon: '❌', accent: '#ef4444' },
];

/* ─── Application filter tabs ─── */
const filterTabs = ['all', 'pending', 'reviewed', 'shortlisted', 'accepted', 'rejected'] as const;

export default function CandidateDashboard() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [appFilter, setAppFilter] = useState<string>('all');

    // Route guard
    useEffect(() => {
        if (!authLoading && (!user || user.role !== 'candidate')) {
            router.push(user ? '/dashboard/employer' : '/auth/login');
        }
    }, [user, authLoading, router]);

    // Fetch dashboard data
    useEffect(() => {
        if (!user || user.role !== 'candidate') return;
        (async () => {
            try {
                const { data: d } = await api.get('/dashboard');
                setData(d);
            } catch (err) {
                console.error('Dashboard fetch error:', err);
            } finally {
                setLoading(false);
            }
        })();
    }, [user]);

    const filteredApps = useMemo(() => {
        if (!data) return [];
        return appFilter === 'all'
            ? data.applications
            : data.applications.filter(a => a.status === appFilter);
    }, [data, appFilter]);

    if (authLoading || !user || user.role !== 'candidate') {
        return (
            <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <p style={{ color: 'var(--muted-foreground)' }}>Loading...</p>
            </div>
        );
    }

    const stats = data?.stats;
    const completeness = data?.completeness;
    const barColor = (completeness?.score ?? 0) >= 80 ? '#10b981' : (completeness?.score ?? 0) >= 50 ? '#f59e0b' : '#ef4444';

    return (
        <div className="container" style={{ padding: '2rem 1.5rem 4rem', maxWidth: 960 }}>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>

                {/* ── Header ── */}
                <header style={{ marginBottom: '2rem' }}>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
                        Welcome back, {user.name?.split(' ')[0]}! 👋
                    </h1>
                    <p style={{ color: 'var(--muted-foreground)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
                        Here's your career overview and recent activity.
                    </p>
                </header>

                {/* ── Stat Cards ── */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                    {statCards.map((sc, i) => (
                        <motion.div key={sc.key}
                            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.08 }}
                            style={{
                                padding: '1.25rem', borderRadius: 'var(--radius-lg)',
                                border: '1px solid var(--border)', background: 'var(--surface)',
                                display: 'flex', alignItems: 'center', gap: '1rem',
                            }}
                        >
                            <div style={{
                                width: 44, height: 44, borderRadius: 12, display: 'flex',
                                alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem',
                                background: `${sc.accent}15`, flexShrink: 0,
                            }}>{sc.icon}</div>
                            <div>
                                <p style={{ fontSize: '1.5rem', fontWeight: 800, lineHeight: 1 }}>
                                    {loading ? '–' : (stats as any)?.[sc.key] ?? 0}
                                </p>
                                <p style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)', marginTop: 2 }}>{sc.label}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* ── Profile Completeness ── */}
                {completeness && completeness.score < 100 && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
                        style={{
                            padding: '1.25rem 1.5rem', borderRadius: 'var(--radius-lg)',
                            border: '1px solid var(--border)', background: 'var(--surface)',
                            marginBottom: '2rem',
                        }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Profile Strength</span>
                            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: barColor }}>{completeness.score}%</span>
                        </div>
                        <div style={{ height: 8, borderRadius: 4, background: 'var(--secondary)', overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: `${completeness.score}%`, borderRadius: 4, background: barColor, transition: 'width 0.7s ease' }} />
                        </div>
                        {completeness.missing.length > 0 && (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem', marginTop: '0.5rem' }}>
                                {completeness.missing.map(m => (
                                    <Link key={m} href="/dashboard/candidate/profile" style={{ textDecoration: 'none' }}>
                                        <span style={{
                                            fontSize: '0.7rem', padding: '0.2rem 0.5rem', borderRadius: '999px',
                                            background: 'rgba(37,99,235,0.08)', color: 'var(--accent)', fontWeight: 500, cursor: 'pointer',
                                        }}>+ {m}</span>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </motion.div>
                )}

                {/* ── Quick Actions ── */}
                <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
                    <Link href="/jobs"><Button size="sm">🔍 Browse Jobs</Button></Link>
                    <Link href={`/profile/candidate/${user._id}`}><Button variant="outline" size="sm">👤 My Public Profile</Button></Link>
                    <Link href="/dashboard/candidate/profile"><Button variant="outline" size="sm">✏️ Edit Profile</Button></Link>
                </div>

                {/* ── Applications Section ── */}
                <section style={{ marginBottom: '2.5rem' }}>
                    <h2 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '1rem' }}>📋 My Applications</h2>

                    {/* Filter tabs */}
                    <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid var(--border)', marginBottom: '1rem', overflowX: 'auto' }}>
                        {filterTabs.map(tab => (
                            <button key={tab} onClick={() => setAppFilter(tab)}
                                style={{
                                    padding: '0.5rem 1rem', fontSize: '0.8rem', fontWeight: appFilter === tab ? 600 : 500,
                                    color: appFilter === tab ? 'var(--foreground)' : 'var(--muted-foreground)',
                                    background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit',
                                    borderBottom: appFilter === tab ? '2px solid var(--foreground)' : '2px solid transparent',
                                    whiteSpace: 'nowrap', textTransform: 'capitalize',
                                }}
                            >{tab === 'all' ? `All (${data?.applications.length ?? 0})` : `${tab} (${(stats as any)?.[tab] ?? 0})`}</button>
                        ))}
                    </div>

                    {loading ? (
                        <p style={{ color: 'var(--muted-foreground)', textAlign: 'center', padding: '3rem' }}>Loading…</p>
                    ) : filteredApps.length === 0 ? (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                            style={{
                                textAlign: 'center', padding: '3rem 2rem',
                                border: '2px dashed var(--border)', borderRadius: 'var(--radius-lg)',
                            }}
                        >
                            <p style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                                {appFilter === 'all' ? 'No applications yet' : `No ${appFilter} applications`}
                            </p>
                            <p style={{ color: 'var(--muted-foreground)', marginBottom: '1rem', fontSize: '0.85rem' }}>
                                {appFilter === 'all' ? 'Start applying to jobs to track your progress!' : 'Check back later.'}
                            </p>
                            {appFilter === 'all' && (
                                <Link href="/jobs"><Button size="sm">Browse Jobs</Button></Link>
                            )}
                        </motion.div>
                    ) : (
                        <div style={{ display: 'grid', gap: '0.75rem' }}>
                            {filteredApps.map((app, i) => {
                                const st = statusStyle[app.status] || statusStyle.pending;
                                return (
                                    <motion.div key={app._id}
                                        initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.04 }}
                                        style={{
                                            border: '1px solid var(--border)', borderRadius: 'var(--radius)',
                                            padding: '1rem 1.25rem', background: 'var(--surface)',
                                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                            flexWrap: 'wrap', gap: '0.75rem',
                                        }}
                                    >
                                        <div style={{ flex: 1, minWidth: 200 }}>
                                            <Link href={`/jobs/${app.job._id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                                                <h3 style={{ fontWeight: 600, fontSize: '0.95rem', marginBottom: 2 }}>{app.job.title}</h3>
                                            </Link>
                                            <p style={{ fontSize: '0.8rem', color: 'var(--muted-foreground)' }}>
                                                {app.job.company} · {app.job.location}
                                                {app.job.type && ` · ${app.job.type}`}
                                            </p>
                                            <p style={{ fontSize: '0.7rem', color: 'var(--muted-foreground)', marginTop: 4 }}>
                                                Applied {new Date(app.appliedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                            </p>
                                        </div>
                                        <span style={{
                                            padding: '0.3rem 0.7rem', borderRadius: '999px', fontSize: '0.75rem',
                                            fontWeight: 600, background: st.bg, color: st.color, whiteSpace: 'nowrap',
                                        }}>{st.label}</span>
                                    </motion.div>
                                );
                            })}
                        </div>
                    )}
                </section>

                {/* ── Recommended Jobs ── */}
                {(data?.recommendedJobs?.length ?? 0) > 0 && (
                    <section>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                            <h2 style={{ fontSize: '1.15rem', fontWeight: 700 }}>💡 Recommended Jobs</h2>
                            <Link href="/jobs" style={{ fontSize: '0.8rem', color: 'var(--accent)', textDecoration: 'none', fontWeight: 500 }}>View all →</Link>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
                            {data!.recommendedJobs.map((job, i) => (
                                <motion.div key={job._id}
                                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.06 }}
                                    style={{
                                        border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)',
                                        padding: '1.25rem', background: 'var(--surface)',
                                        display: 'flex', flexDirection: 'column', gap: '0.5rem',
                                        transition: 'box-shadow 0.2s',
                                    }}
                                    whileHover={{ boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}
                                >
                                    <h3 style={{ fontWeight: 600, fontSize: '0.95rem' }}>{job.title}</h3>
                                    <p style={{ fontSize: '0.8rem', color: 'var(--muted-foreground)' }}>{job.company} · {job.location}</p>
                                    <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginTop: 'auto' }}>
                                        {job.type && (
                                            <span style={{
                                                fontSize: '0.7rem', padding: '0.15rem 0.5rem', borderRadius: '999px',
                                                background: 'var(--secondary)', border: '1px solid var(--border)',
                                            }}>{job.type}</span>
                                        )}
                                        {job.salary && (
                                            <span style={{
                                                fontSize: '0.7rem', padding: '0.15rem 0.5rem', borderRadius: '999px',
                                                background: '#d1fae5', color: '#065f46',
                                            }}>{job.salary}</span>
                                        )}
                                    </div>
                                    <Link href={`/jobs/${job._id}`} style={{ marginTop: '0.5rem' }}>
                                        <Button variant="outline" size="sm" style={{ width: '100%' }}>View Details</Button>
                                    </Link>
                                </motion.div>
                            ))}
                        </div>
                    </section>
                )}

            </motion.div>
        </div>
    );
}
