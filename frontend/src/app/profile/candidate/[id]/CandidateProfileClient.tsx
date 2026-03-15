"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '@/utils/api';
import { useAuth } from '@/context/AuthContext';
import s from '../../../dashboard/profile.module.css';
import Link from 'next/link';
import Button from '@/components/Button';
import { Mail, MapPin, Linkedin, Github, Globe, Twitter, FileText, Briefcase, GraduationCap, Award } from 'lucide-react';

interface Profile {
    _id: string; name: string; headline: string;
    avatar: string; bio: string; skills: string[];
    experience: { _id?: string; title: string; company: string; startDate: string; endDate: string; current: boolean; description: string }[];
    education: { _id?: string; degree: string; institution: string; startYear: string; endYear: string; description: string }[];
    resume: string; resumeFileName: string;
    socialLinks: { linkedin: string; github: string; portfolio: string; twitter: string };
    location: { city: string; state: string; country: string };
    createdAt: string;
}

export default function CandidateProfileClient({ profile: initialProfile, id }: { profile: Profile | null, id: string }) {
    const { user } = useAuth();
    const [profile, setProfile] = useState<Profile | null>(initialProfile);
    const [loading, setLoading] = useState(!initialProfile);

    const isOwnProfile = user && user._id === id;

    useEffect(() => {
        if (initialProfile) return;
        (async () => {
            try {
                const { data } = await api.get(`/profile/${id}`);
                setProfile(data);
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
            <p style={{ color: 'var(--muted-foreground)' }}>Profile not found</p>
            <Link href="/"><Button variant="outline">Back to Home</Button></Link>
        </div>
    );

    const loc = [profile.location?.city, profile.location?.country].filter(Boolean).join(', ');
    const initials = profile.name ? profile.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) : '?';

    // Skill Categorization
    const coreSkills = profile.skills?.slice(0, 4) || [];
    const otherSkills = profile.skills?.slice(4) || [];

    return (
        <div className={s.publicGrid}>
            {/* ── Left Sidebar ── */}
            <aside className={s.stickySide}>
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className={s.profileCard}>
                    <div className={s.sidebarInfo}>
                        {profile.avatar ? (
                            <img src={profile.avatar} alt={profile.name} className={s.glassAvatar} style={{ width: '100%', height: 'auto', aspectRatio: '1/1', marginBottom: '1.5rem' }} />
                        ) : (
                            <div className={s.publicAvatarFallback} style={{ width: '100px', height: '100px', margin: '0 auto 1.5rem', fontSize: '2.5rem' }}>{initials}</div>
                        )}
                        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.25rem' }}>{profile.name}</h1>
                        <p style={{ color: 'var(--muted-foreground)', fontSize: '0.9rem', marginBottom: '1rem' }}>{profile.headline || 'Professional Candidate'}</p>

                        {loc && (
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--muted-foreground)', marginBottom: '1.5rem' }}>
                                <MapPin size={14} /> {loc}
                            </div>
                        )}

                        <div style={{ display: 'grid', gap: '0.75rem' }}>
                            {isOwnProfile ? (
                                <Link href="/dashboard/candidate/profile" style={{ width: '100%' }}>
                                    <Button variant="outline" style={{ width: '100%' }}>Edit Profile</Button>
                                </Link>
                            ) : (
                                <Button style={{ width: '100%', background: 'var(--gradient-primary)', border: 'none' }}>Connect</Button>
                            )}
                            {profile.resume && (
                                <Link href={`/resume-viewer/${profile._id}`}>
                                    <Button variant="secondary" style={{ width: '100%', gap: '0.5rem' }}>
                                        <FileText size={16} /> Resume
                                    </Button>
                                </Link>
                            )}
                        </div>
                    </div>

                    {/* Socials */}
                    <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border)' }}>
                        <p className={s.categoryTitle}>Social Links</p>
                        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                            {profile.socialLinks?.linkedin && <a href={profile.socialLinks.linkedin} target="_blank" className={s.statBadge} style={{ padding: '8px' }}><Linkedin size={18} /></a>}
                            {profile.socialLinks?.github && <a href={profile.socialLinks.github} target="_blank" className={s.statBadge} style={{ padding: '8px' }}><Github size={18} /></a>}
                            {profile.socialLinks?.twitter && <a href={profile.socialLinks.twitter} target="_blank" className={s.statBadge} style={{ padding: '8px' }}><Twitter size={18} /></a>}
                            {profile.socialLinks?.portfolio && <a href={profile.socialLinks.portfolio} target="_blank" className={s.statBadge} style={{ padding: '8px' }}><Globe size={18} /></a>}
                        </div>
                    </div>
                </motion.div>
            </aside>

            {/* ── Main Content ── */}
            <main>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    {/* About Section */}
                    <section className={s.profileCard} style={{ marginBottom: '2rem' }}>
                        <h2 className={s.publicSectionTitle} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Award size={20} className="text-accent" /> About Me
                        </h2>
                        <p style={{ color: 'var(--foreground)', fontSize: '0.95rem', lineHeight: 1.8, whiteSpace: 'pre-line' }}>
                            {profile.bio || `${profile.name} is a dedicated professional with a focus on ${profile.skills?.[0] || 'their field'}.`}
                        </p>
                    </section>

                    {/* Experience Section */}
                    {profile.experience?.length > 0 && (
                        <section className={s.profileCard} style={{ marginBottom: '2rem' }}>
                            <h2 className={s.publicSectionTitle} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                                <Briefcase size={20} className="text-accent" /> Experience
                            </h2>
                            <div className={s.modernTimeline}>
                                {profile.experience.map((exp, i) => (
                                    <div key={i} className={s.timelineNode}>
                                        <div className={s.timelineCard}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                                                <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>{exp.title}</h3>
                                                <span style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)', fontWeight: 600 }}>
                                                    {exp.startDate} — {exp.current ? 'Present' : exp.endDate}
                                                </span>
                                            </div>
                                            <p style={{ color: 'var(--accent)', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.75rem' }}>{exp.company}</p>
                                            <p style={{ fontSize: '0.85rem', color: 'var(--muted-foreground)', lineHeight: 1.5 }}>{exp.description}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Skills Section */}
                    {profile.skills?.length > 0 && (
                        <section className={s.profileCard} style={{ marginBottom: '2rem' }}>
                            <h2 className={s.publicSectionTitle} style={{ marginBottom: '1.5rem' }}>Skills & Expertise</h2>

                            <div className={s.skillCategory}>
                                <span className={s.categoryTitle}>Core Competencies</span>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                    {coreSkills.map((sk, i) => (
                                        <span key={i} className={s.statBadge} style={{ fontWeight: 700, fontSize: '0.85rem', padding: '0.6rem 1.2rem', background: 'var(--primary)', color: 'white' }}>
                                            {sk}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {otherSkills.length > 0 && (
                                <div className={s.skillCategory}>
                                    <span className={s.categoryTitle}>Other Skills</span>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                        {otherSkills.map((sk, i) => (
                                            <span key={i} className={s.statBadge} style={{ fontWeight: 500, fontSize: '0.85rem', padding: '0.5rem 1rem' }}>
                                                {sk}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </section>
                    )}

                    {/* Education Section */}
                    {profile.education?.length > 0 && (
                        <section className={s.profileCard}>
                            <h2 className={s.publicSectionTitle} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                                <GraduationCap size={20} className="text-accent" /> Education
                            </h2>
                            <div className={s.modernTimeline}>
                                {profile.education.map((edu, i) => (
                                    <div key={i} className={s.timelineNode}>
                                        <div className={s.timelineCard}>
                                            <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>{edu.degree}</h3>
                                            <p style={{ color: 'var(--muted-foreground)', fontSize: '0.85rem', margin: '0.25rem 0' }}>{edu.institution}</p>
                                            <span style={{ fontSize: '0.75rem', color: 'var(--accent)', fontWeight: 600 }}>
                                                {edu.startYear} — {edu.endYear}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}
                </motion.div>
            </main>
        </div>
    );
}
