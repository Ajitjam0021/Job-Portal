"use client";

import { useEffect, useState, useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '@/components/Button';
import Link from 'next/link';
import api from '@/utils/api';
import toast from 'react-hot-toast';

/* ─── Types ─── */
interface Job {
    _id: string; title: string; company: string;
    location: string; type: string; salary: string;
    createdAt: string; status: 'active' | 'closed' | 'draft';
}

interface Applicant {
    _id: string; name: string; email: string;
    avatar?: string; headline?: string; skills?: string[];
}

interface Application {
    _id: string;
    applicant: Applicant;
    status: 'pending' | 'reviewed' | 'shortlisted' | 'rejected' | 'accepted';
    appliedAt: string;
    resume?: string;
    coverLetter?: string;
}

/* ─── Status styling ─── */
const statusStyle: Record<string, { bg: string; color: string; label: string }> = {
    pending: { bg: '#fef3c7', color: '#92400e', label: 'Pending' },
    reviewed: { bg: '#dbeafe', color: '#1e40af', label: 'Reviewed' },
    shortlisted: { bg: '#d1fae5', color: '#065f46', label: 'Shortlisted' },
    rejected: { bg: '#fee2e2', color: '#991b1b', label: 'Rejected' },
    accepted: { bg: '#d1fae5', color: '#14532d', label: 'Accepted' },
};

export default function EmployerDashboard() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [jobs, setJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
    const [applicants, setApplicants] = useState<Application[]>([]);
    const [appsLoading, setAppsLoading] = useState(false);
    const [updatingId, setUpdatingId] = useState<string | null>(null);

    // Route guard
    useEffect(() => {
        if (!authLoading && (!user || user.role !== 'employer')) {
            router.push(user ? '/dashboard/candidate' : '/auth/login');
        }
    }, [user, authLoading, router]);

    // Fetch employer's jobs
    useEffect(() => {
        if (!user || user.role !== 'employer') return;
        (async () => {
            try {
                const { data } = await api.get('/jobs/mine');
                setJobs(data);
                if (data.length > 0) setSelectedJobId(data[0]._id);
            } catch (err) {
                console.error('Failed to fetch jobs:', err);
            } finally {
                setLoading(false);
            }
        })();
    }, [user]);

    // Fetch applicants for selected job
    useEffect(() => {
        if (!selectedJobId) { setApplicants([]); return; }
        let cancelled = false;
        (async () => {
            setAppsLoading(true);
            try {
                const { data } = await api.get(`/applications/job/${selectedJobId}`);
                if (!cancelled) setApplicants(data);
            } catch {
                if (!cancelled) setApplicants([]);
            } finally {
                if (!cancelled) setAppsLoading(false);
            }
        })();
        return () => { cancelled = true; };
    }, [selectedJobId]);

    // Toggle Job Status
    const toggleJobStatus = async (jobId: string, currentStatus: string) => {
        const newStatus = currentStatus === 'active' ? 'closed' : 'active';
        setUpdatingId(jobId);
        try {
            await api.patch(`/jobs/${jobId}`, { status: newStatus });
            setJobs(prev => prev.map(j => j._id === jobId ? { ...j, status: newStatus as any } : j));
            toast.success(`Job marked as ${newStatus}`);
        } catch (err) {
            toast.error('Failed to update job status');
        } finally {
            setUpdatingId(null);
        }
    };

    // Update application status
    const updateStatus = async (appId: string, status: string) => {
        setUpdatingId(appId);
        try {
            const { data } = await api.patch(`/applications/${appId}/status`, { status });
            setApplicants(prev => prev.map(a => a._id === appId ? { ...a, status: data.status } : a));
            toast.success(`Application ${status}`);
        } catch (err) {
            toast.error('Status update failed');
        } finally {
            setUpdatingId(null);
        }
    };

    // Stats
    const totalApplicants = applicants.length;
    const statusCounts = useMemo(() => {
        const c = { pending: 0, reviewed: 0, shortlisted: 0, rejected: 0, accepted: 0 };
        applicants.forEach(a => { if (c[a.status] !== undefined) c[a.status]++; });
        return c;
    }, [applicants]);

    if (authLoading || !user || user.role !== 'employer') {
        return (
            <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <p style={{ color: 'var(--muted-foreground)' }}>Loading...</p>
            </div>
        );
    }

    const statCards = [
        { label: 'Jobs Posted', icon: '📂', value: jobs.length, accent: '#6366f1' },
        { label: 'Total Applicants', icon: '👥', value: totalApplicants, accent: '#3b82f6' },
        { label: 'Shortlisted', icon: '⭐', value: statusCounts.shortlisted, accent: '#f59e0b' },
        { label: 'Accepted', icon: '✅', value: statusCounts.accepted, accent: '#10b981' },
    ];

    return (
        <div className="container" style={{ padding: '2rem 1.5rem 4rem', maxWidth: 1040 }}>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>

                {/* ── Header ── */}
                <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
                    <div>
                        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
                            Welcome back, {user.name?.split(' ')[0]}! 👋
                        </h1>
                        <p style={{ color: 'var(--muted-foreground)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
                            Manage your job postings and review candidates.
                        </p>
                    </div>
                    <Link href="/jobs/new">
                        <Button style={{ background: 'var(--gradient-primary)', border: 'none', boxShadow: 'var(--shadow-glow)' }}>
                            ➕ Post New Job
                        </Button>
                    </Link>
                </header>

                {/* ── Stat Cards ── */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                    {statCards.map((sc, i) => (
                        <motion.div key={sc.label}
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
                                    {loading ? '–' : sc.value}
                                </p>
                                <p style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)', marginTop: 2 }}>{sc.label}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* ── Quick Actions ── */}
                <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
                    <Link href={`/profile/employer/${user._id}`}><Button variant="outline" size="sm">🏢 Company Profile</Button></Link>
                    <Link href="/dashboard/employer/profile"><Button variant="outline" size="sm">✏️ Edit Profile</Button></Link>
                </div>

                {/* ── Two-column: Job List + Applicants ── */}
                <div style={{ display: 'grid', gridTemplateColumns: jobs.length > 0 ? '300px 1fr' : '1fr', gap: '1.5rem', alignItems: 'start' }}>

                    {/* ── Job List Side ── */}
                    <section>
                        <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.75rem' }}>📂 Your Jobs</h2>
                        {loading ? (
                            <p style={{ color: 'var(--muted-foreground)', padding: '2rem', textAlign: 'center' }}>Loading…</p>
                        ) : jobs.length === 0 ? (
                            <div style={{
                                textAlign: 'center', padding: '2.5rem 1.5rem',
                                border: '2px dashed var(--border)', borderRadius: 'var(--radius-lg)',
                            }}>
                                <p style={{ fontWeight: 600, marginBottom: '0.35rem' }}>No jobs posted yet</p>
                                <p style={{ color: 'var(--muted-foreground)', fontSize: '0.85rem', marginBottom: '1rem' }}>
                                    Post your first job to start receiving applications!
                                </p>
                                <Link href="/jobs/new"><Button size="sm">Post Your First Job</Button></Link>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                {jobs.map(job => (
                                    <div key={job._id} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                        <button onClick={() => setSelectedJobId(job._id)}
                                            style={{
                                                width: '100%', padding: '0.75rem 1rem', borderRadius: 'var(--radius)',
                                                border: selectedJobId === job._id ? '2px solid var(--foreground)' : '1px solid var(--border)',
                                                background: selectedJobId === job._id ? 'var(--secondary)' : 'var(--surface)',
                                                cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit',
                                                transition: 'all 0.15s',
                                            }}
                                        >
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <p style={{ fontWeight: 600, fontSize: '0.85rem' }}>{job.title}</p>
                                                <span style={{
                                                    fontSize: '0.6rem', padding: '1px 6px', borderRadius: '4px',
                                                    background: job.status === 'active' ? '#d1fae5' : '#f4f4f5',
                                                    color: job.status === 'active' ? '#065f46' : '#71717a',
                                                    fontWeight: 700, textTransform: 'uppercase'
                                                }}>{job.status}</span>
                                            </div>
                                            <p style={{ fontSize: '0.72rem', color: 'var(--muted-foreground)', marginTop: 2 }}>
                                                {job.location} · {new Date(job.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                            </p>
                                        </button>
                                        {selectedJobId === job._id && (
                                            <div style={{ display: 'flex', gap: '4px', padding: '0 4px' }}>
                                                <button
                                                    onClick={() => toggleJobStatus(job._id, job.status)}
                                                    disabled={updatingId === job._id}
                                                    style={{
                                                        flex: 1, fontSize: '0.65rem', padding: '4px', borderRadius: '4px',
                                                        border: '1px solid var(--border)', background: 'var(--surface)',
                                                        cursor: 'pointer', color: job.status === 'active' ? '#ef4444' : '#10b981',
                                                        fontWeight: 600
                                                    }}
                                                >
                                                    {job.status === 'active' ? '🚫 Close Job' : '✅ Reopen'}
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>

                    {/* ── Applicants Panel ── */}
                    {jobs.length > 0 && (
                        <section>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                                <h2 style={{ fontSize: '1rem', fontWeight: 700 }}>
                                    👥 Applicants {totalApplicants > 0 && `(${totalApplicants})`}
                                </h2>
                                {totalApplicants > 0 && (
                                    <div style={{ display: 'flex', gap: '0.25rem' }}>
                                        {(['pending', 'shortlisted', 'accepted', 'rejected'] as const).map(st => (
                                            <span key={st} style={{
                                                fontSize: '0.65rem', padding: '0.15rem 0.4rem', borderRadius: '999px',
                                                background: statusStyle[st].bg, color: statusStyle[st].color, fontWeight: 600,
                                            }}>{statusCounts[st]} {st}</span>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {appsLoading ? (
                                <p style={{ color: 'var(--muted-foreground)', textAlign: 'center', padding: '2rem' }}>Loading applicants…</p>
                            ) : applicants.length === 0 ? (
                                <div style={{
                                    textAlign: 'center', padding: '2.5rem 1.5rem',
                                    border: '2px dashed var(--border)', borderRadius: 'var(--radius-lg)',
                                }}>
                                    <p style={{ fontWeight: 600, marginBottom: '0.25rem' }}>No applicants yet</p>
                                    <p style={{ color: 'var(--muted-foreground)', fontSize: '0.85rem' }}>
                                        Share your job listing to start receiving applications.
                                    </p>
                                </div>
                            ) : (
                                <div style={{ display: 'grid', gap: '0.75rem' }}>
                                    <AnimatePresence>
                                        {applicants.map((app, i) => {
                                            const st = statusStyle[app.status] || statusStyle.pending;
                                            const initials = app.applicant.name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || '?';
                                            return (
                                                <motion.div key={app._id}
                                                    initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0 }} transition={{ delay: i * 0.04 }}
                                                    style={{
                                                        border: '1px solid var(--border)', borderRadius: 'var(--radius)',
                                                        padding: '1rem 1.25rem', background: 'var(--surface)',
                                                    }}
                                                >
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                            {app.applicant.avatar ? (
                                                                <img src={app.applicant.avatar} alt="" style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover' }} />
                                                            ) : (
                                                                <div style={{
                                                                    width: 36, height: 36, borderRadius: '50%', display: 'flex',
                                                                    alignItems: 'center', justifyContent: 'center',
                                                                    background: 'var(--secondary)', fontWeight: 700, fontSize: '0.75rem',
                                                                }}>{initials}</div>
                                                            )}
                                                            <div>
                                                                <Link href={`/profile/candidate/${app.applicant._id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                                                                    <p style={{ fontWeight: 600, fontSize: '0.9rem' }}>{app.applicant.name}</p>
                                                                </Link>
                                                                <p style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)' }}>
                                                                    {app.applicant.headline || app.applicant.email}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <span style={{
                                                            padding: '0.2rem 0.6rem', borderRadius: '999px', fontSize: '0.7rem',
                                                            fontWeight: 600, background: st.bg, color: st.color,
                                                        }}>{st.label}</span>
                                                    </div>

                                                    {/* Skills */}
                                                    {app.applicant.skills && app.applicant.skills.length > 0 && (
                                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem', marginBottom: '0.5rem' }}>
                                                            {app.applicant.skills.slice(0, 5).map(sk => (
                                                                <span key={sk} style={{
                                                                    fontSize: '0.65rem', padding: '0.1rem 0.4rem', borderRadius: '999px',
                                                                    background: 'var(--secondary)', border: '1px solid var(--border)',
                                                                }}>{sk}</span>
                                                            ))}
                                                            {app.applicant.skills.length > 5 && (
                                                                <span style={{ fontSize: '0.65rem', color: 'var(--muted-foreground)' }}>+{app.applicant.skills.length - 5}</span>
                                                            )}
                                                        </div>
                                                    )}

                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                                                        <p style={{ fontSize: '0.7rem', color: 'var(--muted-foreground)' }}>
                                                            Applied {new Date(app.appliedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                        </p>
                                                        <div style={{ display: 'flex', gap: '0.35rem' }}>
                                                            {app.status !== 'shortlisted' && app.status !== 'accepted' && (
                                                                <button onClick={() => updateStatus(app._id, 'shortlisted')}
                                                                    disabled={updatingId === app._id}
                                                                    style={{
                                                                        fontSize: '0.7rem', padding: '0.25rem 0.6rem', borderRadius: 'var(--radius)',
                                                                        background: '#10b981', color: '#fff', border: 'none', cursor: 'pointer',
                                                                        fontWeight: 600, fontFamily: 'inherit', opacity: updatingId === app._id ? 0.5 : 1,
                                                                    }}>⭐ Shortlist</button>
                                                            )}
                                                            {app.status !== 'accepted' && (
                                                                <button onClick={() => updateStatus(app._id, 'accepted')}
                                                                    disabled={updatingId === app._id}
                                                                    style={{
                                                                        fontSize: '0.7rem', padding: '0.25rem 0.6rem', borderRadius: 'var(--radius)',
                                                                        background: '#065f46', color: '#fff', border: 'none', cursor: 'pointer',
                                                                        fontWeight: 600, fontFamily: 'inherit', opacity: updatingId === app._id ? 0.5 : 1,
                                                                    }}>✅ Accept</button>
                                                            )}
                                                            {app.status !== 'rejected' && (
                                                                <button onClick={() => updateStatus(app._id, 'rejected')}
                                                                    disabled={updatingId === app._id}
                                                                    style={{
                                                                        fontSize: '0.7rem', padding: '0.25rem 0.6rem', borderRadius: 'var(--radius)',
                                                                        background: '#ef4444', color: '#fff', border: 'none', cursor: 'pointer',
                                                                        fontWeight: 600, fontFamily: 'inherit', opacity: updatingId === app._id ? 0.5 : 1,
                                                                    }}>❌ Reject</button>
                                                            )}
                                                            <Link href={`/profile/candidate/${app.applicant._id}`}>
                                                                <button style={{
                                                                    fontSize: '0.7rem', padding: '0.25rem 0.6rem', borderRadius: 'var(--radius)',
                                                                    background: 'var(--secondary)', color: 'var(--foreground)', border: '1px solid var(--border)',
                                                                    cursor: 'pointer', fontWeight: 500, fontFamily: 'inherit',
                                                                }}>👤 View Profile</button>
                                                            </Link>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            );
                                        })}
                                    </AnimatePresence>
                                </div>
                            )}
                        </section>
                    )}
                </div>

            </motion.div>
        </div>
    );
}
