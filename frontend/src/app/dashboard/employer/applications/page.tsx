"use client";

import { motion } from 'framer-motion';
import Button from '@/components/Button';
import MotionWrapper, { staggerContainer, fadeIn } from '@/components/MotionWrapper';
import { MOCK_JOBS } from '@/lib/mock_data';
import { Check, X, MessageSquare, FileText } from 'lucide-react';
import Link from 'next/link';

// Mock Candidates Data
const MOCK_CANDIDATES = [
    { id: 1, name: "Sarah Jenkins", role: "Senior Frontend Dev", experience: "5 years", status: "New", appliedAt: "2 hours ago" },
    { id: 2, name: "Michael Chen", role: "Full Stack Engineer", experience: "3 years", status: "Reviewing", appliedAt: "1 day ago" },
    { id: 3, name: "Jessica Ford", role: "UI Engineer", experience: "4 years", status: "Rejected", appliedAt: "3 days ago" },
];

export default function ApplicationsPage() {
    return (
        <div className="container" style={{ padding: '4rem 1.5rem' }}>
            <MotionWrapper>
                <div style={{ marginBottom: '2rem' }}>
                    <Link href="/dashboard/employer" style={{ color: 'var(--muted-foreground)', fontSize: '0.875rem' }}>
                        ← Back to Dashboard
                    </Link>
                    <h1 style={{ fontSize: '2rem', fontWeight: 700, marginTop: '1rem', marginBottom: '0.5rem' }}>Applications</h1>
                    <p style={{ color: 'var(--muted-foreground)' }}>Review candidates for <strong>{MOCK_JOBS[0].title}</strong></p>
                </div>

                <motion.div
                    variants={staggerContainer}
                    initial="initial"
                    animate="animate"
                    style={{ display: 'grid', gap: '1rem' }}
                >
                    {MOCK_CANDIDATES.map((candidate) => (
                        <motion.div
                            key={candidate.id}
                            variants={fadeIn}
                            style={{
                                backgroundColor: 'var(--surface)',
                                border: '1px solid var(--border)',
                                borderRadius: 'var(--radius)',
                                padding: '1.5rem',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                boxShadow: 'var(--shadow-sm)'
                            }}
                        >
                            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, color: 'var(--primary)' }}>
                                    {candidate.name.charAt(0)}
                                </div>
                                <div>
                                    <h3 style={{ fontSize: '1.125rem', fontWeight: 600 }}>{candidate.name}</h3>
                                    <p style={{ fontSize: '0.875rem', color: 'var(--muted-foreground)' }}>
                                        {candidate.role} • {candidate.experience} exp • Applied {candidate.appliedAt}
                                    </p>
                                </div>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <div style={{ marginRight: '1rem' }}>
                                    <span style={{
                                        padding: '0.25rem 0.75rem',
                                        borderRadius: '999px',
                                        fontSize: '0.75rem',
                                        fontWeight: 600,
                                        backgroundColor: candidate.status === 'New' ? '#DBEAFE' : candidate.status === 'Rejected' ? '#FEE2E2' : '#FEF3C7',
                                        color: candidate.status === 'New' ? '#1E40AF' : candidate.status === 'Rejected' ? '#991B1B' : '#92400E'
                                    }}>
                                        {candidate.status}
                                    </span>
                                </div>

                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <Button variant="ghost" size="sm" style={{ padding: '0.5rem' }} title="View Resume">
                                        <FileText size={18} />
                                    </Button>
                                    <Button variant="ghost" size="sm" style={{ padding: '0.5rem' }} title="Message">
                                        <MessageSquare size={18} />
                                    </Button>
                                    <Button style={{ padding: '0.5rem', background: '#DC2626', border: 'none' }} title="Reject">
                                        <X size={18} />
                                    </Button>
                                    <Button style={{ padding: '0.5rem', background: '#10B981', border: 'none' }} title="Shortlist">
                                        <Check size={18} />
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>
            </MotionWrapper>
        </div>
    );
}
