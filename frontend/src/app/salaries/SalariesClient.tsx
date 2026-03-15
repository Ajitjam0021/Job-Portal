"use client";

import MotionWrapper from '@/components/MotionWrapper';
import { Banknote } from 'lucide-react';

export default function SalariesPageClient() {
    return (
        <div className="container" style={{ padding: '6rem 1.5rem', textAlign: 'center', minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <MotionWrapper>
                <div style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: '50%',
                    background: 'var(--muted)',
                    color: 'var(--muted-foreground)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 1.5rem'
                }}>
                    <Banknote size={40} />
                </div>
                <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '1rem' }}>Salary Insights</h1>
                <p style={{ color: 'var(--muted-foreground)', maxWidth: '500px', margin: '0 auto' }}>
                    Explore salary trends across different roles and industries.
                    This feature is coming soon!
                </p>
            </MotionWrapper>
        </div>
    );
}
