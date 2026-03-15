"use client";

import MotionWrapper from '@/components/MotionWrapper';
import { Building2 } from 'lucide-react';

export default function CompaniesPageClient() {
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
                    <Building2 size={40} />
                </div>
                <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '1rem' }}>Top Companies</h1>
                <p style={{ color: 'var(--muted-foreground)', maxWidth: '500px', margin: '0 auto' }}>
                    We are currently curating a list of the best companies to work for.
                    Check back soon for detailed company profiles and reviews.
                </p>
            </MotionWrapper>
        </div>
    );
}
