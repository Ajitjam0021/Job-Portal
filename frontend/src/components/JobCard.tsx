"use client";

import Link from 'next/link';
import { motion } from 'framer-motion';
import { MapPin, Briefcase, DollarSign, Clock, ArrowRight } from 'lucide-react';
import Button from './Button';

interface JobCardProps {
    id: string;
    title: string;
    company: string;
    location: string;
    type: string;
    salary: string;
    postedAt: string;
}

export default function JobCard({ id, title, company, location, type, salary, postedAt }: JobCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            whileHover={{ y: -5, borderColor: '#a1a1aa' }}
            transition={{ duration: 0.2 }}
            style={{
                borderRadius: '16px',
                padding: '1.5rem',
                backgroundColor: 'white',
                border: '1px solid #e4e4e7',
                display: 'flex',
                flexDirection: 'column',
                gap: '1.5rem',
                position: 'relative',
                cursor: 'pointer',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.02)'
            }}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    {/* Company Logo Placeholder */}
                    <div style={{
                        width: '56px', height: '56px', borderRadius: '12px', background: '#fafafa',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '1.5rem', fontWeight: 800, color: '#18181b',
                        border: '1px solid #f4f4f5'
                    }}>
                        {company.charAt(0)}
                    </div>
                    <div>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#18181b', marginBottom: '0.25rem' }}>
                            <Link href={`/jobs/${id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                                {title}
                            </Link>
                        </h3>
                        <p style={{ fontSize: '0.95rem', color: '#71717a', fontWeight: 500 }}>{company}</p>
                    </div>
                </div>

                <motion.div whileHover={{ scale: 1.1 }}>
                    <Link href={`/jobs/${id}`}>
                        <div style={{
                            width: '40px', height: '40px', borderRadius: '50%', border: '1px solid #e4e4e7',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#18181b'
                        }}>
                            <ArrowRight size={20} />
                        </div>
                    </Link>
                </motion.div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                {[location, type, salary].map((tag, i) => (
                    <span key={i} style={{
                        fontSize: '0.85rem', fontWeight: 600, color: '#52525b',
                        background: '#f4f4f5', padding: '0.4rem 0.8rem', borderRadius: '8px'
                    }}>
                        {tag}
                    </span>
                ))}
            </div>

            <div style={{
                borderTop: '1px solid #f4f4f5', paddingTop: '1rem', marginTop: 'auto',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem', color: '#a1a1aa'
            }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Clock size={14} /> {postedAt}
                </span>
                <span style={{ fontWeight: 500, color: '#22c55e' }}>Active recruiting</span>
            </div>
        </motion.div>
    );
}
