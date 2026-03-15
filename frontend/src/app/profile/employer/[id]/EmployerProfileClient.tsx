"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '@/utils/api';
import { useAuth } from '@/context/AuthContext';
import s from '../../../dashboard/profile.module.css';
import Link from 'next/link';
import Button from '@/components/Button';
import { Building2, MapPin, Globe, Mail, Phone, Users, Briefcase, ExternalLink, Linkedin, Twitter, Facebook } from 'lucide-react';

interface Profile {
    _id: string; name: string; email: string; phone: string;
    company: string; companyDescription: string;
    industry: string; companySize: string;
    website: string; logo: string;
    companyBenefits: string[];
    companySocialLinks: { linkedin: string; twitter: string; facebook: string };
    location: { city: string; state: string; country: string };
}

interface Job {
    _id: string;
    title: string;
    location: string;
    type: string;
    salary: string;
    createdAt: string;
    status: string;
}

export default function EmployerProfileClient({ profile: initialProfile, id }: { profile: Profile | null, id: string }) {
    const { user } = useAuth();
    const [profile, setProfile] = useState<Profile | null>(initialProfile);
    const [jobs, setJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(!initialProfile);

    const isOwnProfile = user && user._id === id;

    useEffect(() => {
        (async () => {
            try {
                if (!initialProfile) {
                    const { data } = await api.get(`/profile/${id}`);
                    setProfile(data);
                }
                const jobsRes = await api.get(`/jobs/employer/${id}`);
                setJobs(jobsRes.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        })();
    }, [id, initialProfile]);

    if (loading) return (
        <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <p className="spin" style={{ fontSize: '2rem' }}>⌛</p>
        </div>
    );

    if (!profile) return (
        <div style={{ minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
            <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>404</h1>
            <p style={{ color: 'var(--muted-foreground)' }}>Company profile not found</p>
            <Link href="/"><Button variant="outline">Back to Home</Button></Link>
        </div>
    );

    const loc = [profile.location?.city, profile.location?.country].filter(Boolean).join(', ');

    return (
        <div className="container" style={{ maxWidth: '1000px', padding: '3rem 1.5rem' }}>
            {/* ── Premium Hero ── */}
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className={s.premiumHero}>
                <div style={{ position: 'relative', zIndex: 2, display: 'flex', alignItems: 'flex-end', gap: '2rem', width: '100%', flexWrap: 'wrap' }}>
                    {profile.logo ? (
                        <img src={profile.logo} alt={profile.company} className={s.glassAvatar} style={{ background: '#fff' }} />
                    ) : (
                        <div className={s.glassAvatar} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.1)', fontSize: '3rem' }}>🏢</div>
                    )}
                    <div style={{ flex: 1, minWidth: '250px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                            <h1 style={{ fontSize: '2.5rem', fontWeight: 900, letterSpacing: '-0.03em' }}>{profile.company || profile.name}</h1>
                            {profile.website && <a href={profile.website} target="_blank" className="text-white/60 hover:text-white"><ExternalLink size={20} /></a>}
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', fontSize: '0.95rem', opacity: 0.8 }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><Building2 size={16} /> {profile.industry || 'Tech Industry'}</span>
                            {loc && <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><MapPin size={16} /> {loc}</span>}
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><Users size={16} /> {profile.companySize || '10-50'} Employees</span>
                        </div>
                    </div>
                    {isOwnProfile && (
                        <Link href="/dashboard/employer/profile">
                            <Button variant="secondary" style={{ backdropFilter: 'blur(8px)', background: 'rgba(255,255,255,0.1)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)' }}>
                                Edit Company Profile
                            </Button>
                        </Link>
                    )}
                </div>
            </motion.div>

            <div className={s.publicGrid} style={{ gridTemplateColumns: '1fr 320px', padding: 0, gap: '2rem' }}>
                {/* ── Main Content ── */}
                <main>
                    <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={s.profileCard} style={{ marginBottom: '2rem' }}>
                        <h2 className={s.publicSectionTitle}>About {profile.company || 'the Company'}</h2>
                        <p style={{ color: 'var(--foreground)', fontSize: '1rem', lineHeight: 1.8, whiteSpace: 'pre-line' }}>
                            {profile.companyDescription || `${profile.company} is a leader in ${profile.industry}, committed to innovation and excellence.`}
                        </p>

                        {profile.companyBenefits?.length > 0 && (
                            <div style={{ marginTop: '2rem' }}>
                                <p className={s.categoryTitle}>Why Join Us?</p>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                                    {profile.companyBenefits.map((b, i) => (
                                        <span key={i} className={s.statBadge} style={{ fontWeight: 600 }}>✨ {b}</span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </motion.section>

                    {/* Open Positions */}
                    <section className={s.profileCard}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h2 className={s.publicSectionTitle} style={{ margin: 0 }}>Open Positions</h2>
                            <span className={s.statBadge} style={{ fontSize: '0.7rem' }}>{jobs.filter(j => j.status !== 'closed').length} LIVE JOBS</span>
                        </div>
                        {jobs.length === 0 ? (
                            <p style={{ textAlign: 'center', padding: '3rem', color: 'var(--muted-foreground)' }}>No active job listings at the moment.</p>
                        ) : (
                            <div>
                                {jobs.filter(j => j.status !== 'closed').map(job => (
                                    <Link key={job._id} href={`/jobs/${job._id}`} className={s.liveJobCard}>
                                        <div>
                                            <h3 style={{ fontWeight: 700, fontSize: '1.05rem' }}>{job.title}</h3>
                                            <p style={{ fontSize: '0.85rem', color: 'var(--muted-foreground)', marginTop: '2px' }}>{job.location} • {job.type}</p>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <p style={{ fontWeight: 700, color: 'var(--accent)' }}>{job.salary}</p>
                                            <p style={{ fontSize: '0.7rem', color: 'var(--muted-foreground)' }}>Posted {new Date(job.createdAt).toLocaleDateString()}</p>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </section>
                </main>

                {/* ── Sidebar ── */}
                <aside className={s.stickySide} style={{ top: '2rem' }}>
                    <div className={s.profileCard}>
                        <h3 className={s.categoryTitle} style={{ marginBottom: '1.25rem' }}>Contact Information</h3>
                        <div style={{ display: 'grid', gap: '1.25rem' }}>
                            {profile.website && (
                                <div style={{ display: 'flex', gap: '0.75rem' }}>
                                    <Globe size={18} className="text-muted-foreground" />
                                    <div style={{ flex: 1 }}>
                                        <p style={{ fontSize: '0.7rem', textTransform: 'uppercase', opacity: 0.6 }}>Website</p>
                                        <a href={profile.website} target="_blank" style={{ fontSize: '0.9rem', color: 'var(--accent)', fontWeight: 600 }}>{profile.website.replace('https://', '')}</a>
                                    </div>
                                </div>
                            )}
                            <div style={{ display: 'flex', gap: '0.75rem' }}>
                                <Mail size={18} className="text-muted-foreground" />
                                <div style={{ flex: 1 }}>
                                    <p style={{ fontSize: '0.7rem', textTransform: 'uppercase', opacity: 0.6 }}>Email</p>
                                    <p style={{ fontSize: '0.9rem', fontWeight: 600 }}>{profile.email}</p>
                                </div>
                            </div>
                            {profile.phone && (
                                <div style={{ display: 'flex', gap: '0.75rem' }}>
                                    <Phone size={18} className="text-muted-foreground" />
                                    <div style={{ flex: 1 }}>
                                        <p style={{ fontSize: '0.7rem', textTransform: 'uppercase', opacity: 0.6 }}>Phone</p>
                                        <p style={{ fontSize: '0.9rem', fontWeight: 600 }}>{profile.phone}</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border)' }}>
                            <p className={s.categoryTitle}>Follow Us</p>
                            <div style={{ display: 'flex', gap: '0.75rem' }}>
                                {profile.companySocialLinks?.linkedin && <a href={profile.companySocialLinks.linkedin} className={s.statBadge} style={{ padding: '8px' }}><Linkedin size={18} /></a>}
                                {profile.companySocialLinks?.twitter && <a href={profile.companySocialLinks.twitter} className={s.statBadge} style={{ padding: '8px' }}><Twitter size={18} /></a>}
                                {profile.companySocialLinks?.facebook && <a href={profile.companySocialLinks.facebook} className={s.statBadge} style={{ padding: '8px' }}><Facebook size={18} /></a>}
                            </div>
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    );
}
