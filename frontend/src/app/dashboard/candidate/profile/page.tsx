"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import api from '@/utils/api';
import Button from '@/components/Button';
import Link from 'next/link';
import s from '../../profile.module.css';

/* ─── Types ───────────────────────────────────── */
interface ExpEntry {
    _id?: string; title: string; company: string;
    startDate: string; endDate: string; current: boolean; description: string;
}
interface EduEntry {
    _id?: string; degree: string; institution: string;
    startYear: string; endYear: string; description: string;
}
interface SocialLinks { linkedin: string; github: string; portfolio: string; twitter: string; }
interface LocationObj { city: string; state: string; country: string; }
interface ProfileForm {
    name: string; email: string; phone: string; headline: string;
    avatar: string; bio: string; skills: string[];
    experience: ExpEntry[]; education: EduEntry[];
    resume: string; resumeFileName: string;
    socialLinks: SocialLinks; location: LocationObj;
}

const TABS = ['Personal', 'Professional', 'Resume & Links'] as const;
type Tab = typeof TABS[number];

const emptyExp: ExpEntry = { title: '', company: '', startDate: '', endDate: '', current: false, description: '' };
const emptyEdu: EduEntry = { degree: '', institution: '', startYear: '', endYear: '', description: '' };

export default function CandidateProfile() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [tab, setTab] = useState<Tab>('Personal');
    const [saving, setSaving] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [msg, setMsg] = useState({ ok: false, text: '' });
    const [skillInput, setSkillInput] = useState('');
    const [completeness, setCompleteness] = useState({ score: 0, missing: [] as string[] });
    const [uploadingAvatar, setUploadingAvatar] = useState(false);
    const [uploadingResume, setUploadingResume] = useState(false);
    const avatarRef = useRef<HTMLInputElement>(null);
    const resumeRef = useRef<HTMLInputElement>(null);

    const [form, setForm] = useState<ProfileForm>({
        name: '', email: '', phone: '', headline: '',
        avatar: '', bio: '', skills: [],
        experience: [], education: [],
        resume: '', resumeFileName: '',
        socialLinks: { linkedin: '', github: '', portfolio: '', twitter: '' },
        location: { city: '', state: '', country: '' },
    });

    // Auth guard
    useEffect(() => {
        if (!authLoading && (!user || user.role !== 'candidate')) {
            router.push(user ? '/dashboard/employer' : '/auth/login');
        }
    }, [user, authLoading, router]);

    // Load profile
    useEffect(() => {
        if (!user) return;
        (async () => {
            try {
                const { data } = await api.get('/profile');
                setForm({
                    name: data.name || '',
                    email: data.email || '',
                    phone: data.phone || '',
                    headline: data.headline || '',
                    avatar: data.avatar || '',
                    bio: data.bio || '',
                    skills: Array.isArray(data.skills) ? data.skills : [],
                    experience: Array.isArray(data.experience)
                        ? data.experience.map((e: any) => ({
                            _id: e._id || '', title: e.title || '', company: e.company || '',
                            startDate: e.startDate || '', endDate: e.endDate || '',
                            current: !!e.current, description: e.description || '',
                        }))
                        : [],
                    education: Array.isArray(data.education)
                        ? data.education.map((e: any) => ({
                            _id: e._id || '', degree: e.degree || '', institution: e.institution || '',
                            startYear: e.startYear || '', endYear: e.endYear || '',
                            description: e.description || '',
                        }))
                        : [],
                    resume: data.resume || '',
                    resumeFileName: data.resumeFileName || '',
                    socialLinks: { linkedin: '', github: '', portfolio: '', twitter: '', ...data.socialLinks },
                    location: { city: '', state: '', country: '', ...data.location },
                });
                if (data.completeness) setCompleteness(data.completeness);
            } catch (err) {
                console.error('Error loading profile:', err);
            } finally {
                setFetching(false);
            }
        })();
    }, [user]);

    /* ─── Helpers ── */
    const set = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    }, []);

    const setNested = useCallback((group: 'socialLinks' | 'location', key: string, val: string) => {
        setForm(prev => ({ ...prev, [group]: { ...prev[group], [key]: val } }));
    }, []);

    const addSkill = useCallback(() => {
        const trimmed = skillInput.trim();
        if (trimmed && !form.skills.includes(trimmed) && form.skills.length < 30) {
            setForm(prev => ({ ...prev, skills: [...prev.skills, trimmed] }));
            setSkillInput('');
        }
    }, [skillInput, form.skills]);

    const removeSkill = useCallback((idx: number) => {
        setForm(prev => ({ ...prev, skills: prev.skills.filter((_, i) => i !== idx) }));
    }, []);

    const updateExp = useCallback((idx: number, key: keyof ExpEntry, val: string | boolean) => {
        setForm(prev => {
            const list = [...prev.experience];
            list[idx] = { ...list[idx], [key]: val };
            return { ...prev, experience: list };
        });
    }, []);

    const addExp = useCallback(() => {
        setForm(prev => ({ ...prev, experience: [...prev.experience, { ...emptyExp }] }));
    }, []);

    const removeExp = useCallback((idx: number) => {
        setForm(prev => ({ ...prev, experience: prev.experience.filter((_, i) => i !== idx) }));
    }, []);

    const updateEdu = useCallback((idx: number, key: keyof EduEntry, val: string) => {
        setForm(prev => {
            const list = [...prev.education];
            list[idx] = { ...list[idx], [key]: val };
            return { ...prev, education: list };
        });
    }, []);

    const addEdu = useCallback(() => {
        setForm(prev => ({ ...prev, education: [...prev.education, { ...emptyEdu }] }));
    }, []);

    const removeEdu = useCallback((idx: number) => {
        setForm(prev => ({ ...prev, education: prev.education.filter((_, i) => i !== idx) }));
    }, []);

    /* ─── Avatar Upload ── */
    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.size > 5 * 1024 * 1024) {
            setMsg({ ok: false, text: 'Image is too large. Please use an image smaller than 5MB.' });
            return;
        }
        setUploadingAvatar(true);
        try {
            const fd = new FormData();
            fd.append('avatar', file);
            const { data } = await api.post('/profile/upload-avatar', fd);
            setForm(prev => ({ ...prev, avatar: data.avatar }));
            setMsg({ ok: true, text: 'Profile photo uploaded!' });
        } catch (err: any) {
            const serverMsg = err.response?.data?.message || '';
            if (serverMsg.includes('file type')) {
                setMsg({ ok: false, text: 'Please upload a JPG, PNG, or WebP image.' });
            } else {
                setMsg({ ok: false, text: 'Could not upload photo. Please try again.' });
            }
        } finally {
            setUploadingAvatar(false);
        }
    };

    /* ─── Resume Upload ── */
    const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.size > 5 * 1024 * 1024) {
            setMsg({ ok: false, text: 'File is too large. Please use a file smaller than 5MB.' });
            return;
        }
        setUploadingResume(true);
        try {
            const fd = new FormData();
            fd.append('resume', file);
            const { data } = await api.post('/profile/upload-resume', fd);
            setForm(prev => ({ ...prev, resume: data.resume, resumeFileName: data.resumeFileName }));
            setMsg({ ok: true, text: 'Resume uploaded!' });
        } catch (err: any) {
            const serverMsg = err.response?.data?.message || '';
            if (serverMsg.includes('file type')) {
                setMsg({ ok: false, text: 'Please upload a PDF file.' });
            } else {
                setMsg({ ok: false, text: 'Could not upload resume. Please try again.' });
            }
        } finally {
            setUploadingResume(false);
        }
    };

    /* ─── Save ── */
    const save = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setMsg({ ok: false, text: '' });
        try {
            const { data } = await api.put('/profile', {
                name: form.name,
                phone: form.phone,
                headline: form.headline,
                bio: form.bio,
                skills: form.skills,
                experience: form.experience,
                education: form.education,
                socialLinks: form.socialLinks,
                location: form.location,
            });
            if (data.completeness) setCompleteness(data.completeness);
            setMsg({ ok: true, text: 'Profile saved successfully!' });
        } catch (err: any) {
            setMsg({ ok: false, text: err.response?.data?.message || 'Failed to save' });
        } finally {
            setSaving(false);
        }
    };

    /* ─── Loading ── */
    if (authLoading || !user || fetching) {
        return (
            <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <p style={{ color: 'var(--muted-foreground)' }}>Loading profile...</p>
            </div>
        );
    }

    const initials = form.name ? form.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) : '?';
    const barColor = completeness.score < 40 ? '#ef4444' : completeness.score < 70 ? '#f59e0b' : '#10b981';

    return (
        <div className={s.container}>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>

                {/* ── Header ── */}
                <div className={s.header}>
                    <div className={s.avatarWrap}>
                        {form.avatar ? (
                            <img src={form.avatar} alt="Avatar" className={s.avatar} />
                        ) : (
                            <div className={s.avatarPlaceholder} onClick={() => avatarRef.current?.click()}>
                                {initials}
                            </div>
                        )}
                        <button className={s.avatarUploadBtn} onClick={() => avatarRef.current?.click()}
                            disabled={uploadingAvatar} title="Upload photo">
                            {uploadingAvatar ? '…' : '✎'}
                        </button>
                        <input ref={avatarRef} type="file" accept="image/*" hidden onChange={handleAvatarUpload} />
                    </div>
                    <div className={s.headerInfo}>
                        <h1>{form.name || 'Your Profile'}</h1>
                        <p>{form.headline || 'Add a professional headline'}</p>
                        {(form.location.city || form.location.country) && (
                            <p style={{ fontSize: '0.8rem' }}>
                                📍 {[form.location.city, form.location.state, form.location.country].filter(Boolean).join(', ')}
                            </p>
                        )}
                    </div>
                </div>

                {/* ── Completeness Meter ── */}
                <div className={s.completeness}>
                    <div className={s.completenessHeader}>
                        <span className={s.completenessLabel}>Profile Strength</span>
                        <span className={s.completenessScore} style={{ color: barColor }}>{completeness.score}%</span>
                    </div>
                    <div className={s.completenessBar}>
                        <div className={s.completenessFill}
                            style={{ width: `${completeness.score}%`, background: barColor }} />
                    </div>
                    {completeness.missing.length > 0 && (
                        <div className={s.completenessTips}>
                            {completeness.missing.slice(0, 5).map(tip => (
                                <span key={tip} className={s.completenessTip}>+ {tip}</span>
                            ))}
                        </div>
                    )}
                </div>

                {/* ── Toast ── */}
                <AnimatePresence>
                    {msg.text && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                            className={msg.ok ? s.toastSuccess : s.toastError}>
                            {msg.ok ? '✓' : '✕'} {msg.text}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* ── Tabs ── */}
                <div className={s.tabs}>
                    {TABS.map(t => (
                        <button key={t} className={`${s.tab} ${tab === t ? s.tabActive : ''}`}
                            onClick={() => setTab(t)}>{t}</button>
                    ))}
                </div>

                <form onSubmit={save}>
                    {/* ═══ TAB 1: Personal ═══ */}
                    {tab === 'Personal' && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} key="personal">
                            <div className={s.section}>
                                <div className={s.sectionTitle}>👤 Personal Information</div>
                                <div className={s.formGrid}>
                                    <div className={s.formRow}>
                                        <div className={s.field}>
                                            <label className={s.label}>Full Name *</label>
                                            <input className={s.input} name="name" value={form.name} onChange={set} required />
                                        </div>
                                        <div className={s.field}>
                                            <label className={s.label}>Email</label>
                                            <input className={s.inputReadonly} value={form.email} readOnly />
                                        </div>
                                    </div>
                                    <div className={s.field}>
                                        <label className={s.label}>Professional Headline</label>
                                        <input className={s.input} name="headline" value={form.headline} onChange={set}
                                            placeholder="e.g. Senior React Developer | Full-Stack Engineer" maxLength={120} />
                                        <span className={s.hint}>{form.headline.length}/120 characters</span>
                                    </div>
                                    <div className={s.formRow}>
                                        <div className={s.field}>
                                            <label className={s.label}>Phone</label>
                                            <input className={s.input} name="phone" value={form.phone} onChange={set}
                                                placeholder="+1 (555) 123-4567" />
                                        </div>
                                        <div className={s.field}>
                                            <label className={s.label}>Location</label>
                                            <div className={s.formRowThree}>
                                                <input className={s.input} placeholder="City" value={form.location.city}
                                                    onChange={e => setNested('location', 'city', e.target.value)} />
                                                <input className={s.input} placeholder="State" value={form.location.state}
                                                    onChange={e => setNested('location', 'state', e.target.value)} />
                                                <input className={s.input} placeholder="Country" value={form.location.country}
                                                    onChange={e => setNested('location', 'country', e.target.value)} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* ═══ TAB 2: Professional ═══ */}
                    {tab === 'Professional' && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} key="professional">
                            {/* Bio */}
                            <div className={s.section}>
                                <div className={s.sectionTitle}>📝 Bio / Summary</div>
                                <div className={s.field}>
                                    <textarea className={s.textarea} name="bio" value={form.bio} onChange={set} rows={4}
                                        placeholder="Write a short summary about yourself, career goals, and what you bring to the table…"
                                        maxLength={1000} />
                                    <span className={s.hint}>{form.bio.length}/1000</span>
                                </div>
                            </div>

                            {/* Skills */}
                            <div className={s.section}>
                                <div className={s.sectionTitle}>🎯 Skills</div>
                                <div className={s.tagsWrap}>
                                    {form.skills.map((sk, i) => (
                                        <span key={i} className={s.tag}>
                                            {sk}
                                            <button type="button" className={s.tagRemove} onClick={() => removeSkill(i)}>×</button>
                                        </span>
                                    ))}
                                    <input className={s.tagInput} placeholder="Type a skill & press Enter"
                                        value={skillInput} onChange={e => setSkillInput(e.target.value)}
                                        onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addSkill(); } }} />
                                </div>
                                <span className={s.hint}>{form.skills.length}/30 skills — press Enter to add</span>
                            </div>

                            {/* Experience */}
                            <div className={s.section}>
                                <div className={s.sectionTitle}>💼 Work Experience</div>
                                <div className={s.formGrid}>
                                    {form.experience.map((exp, i) => (
                                        <div key={exp._id || i} className={s.entry}>
                                            <button type="button" className={s.entryRemove} onClick={() => removeExp(i)}>×</button>
                                            <div className={s.formGrid}>
                                                <div className={s.formRow}>
                                                    <div className={s.field}>
                                                        <label className={s.label}>Job Title *</label>
                                                        <input className={s.input} value={exp.title}
                                                            onChange={e => updateExp(i, 'title', e.target.value)} required />
                                                    </div>
                                                    <div className={s.field}>
                                                        <label className={s.label}>Company *</label>
                                                        <input className={s.input} value={exp.company}
                                                            onChange={e => updateExp(i, 'company', e.target.value)} required />
                                                    </div>
                                                </div>
                                                <div className={s.formRow}>
                                                    <div className={s.field}>
                                                        <label className={s.label}>Start Date</label>
                                                        <input className={s.input} type="month" value={exp.startDate}
                                                            onChange={e => updateExp(i, 'startDate', e.target.value)} />
                                                    </div>
                                                    <div className={s.field}>
                                                        <label className={s.label}>End Date</label>
                                                        <input className={s.input} type="month" value={exp.endDate}
                                                            disabled={exp.current}
                                                            onChange={e => updateExp(i, 'endDate', e.target.value)} />
                                                        <label className={s.checkRow}>
                                                            <input type="checkbox" checked={exp.current}
                                                                onChange={e => updateExp(i, 'current', e.target.checked)} />
                                                            Currently working here
                                                        </label>
                                                    </div>
                                                </div>
                                                <div className={s.field}>
                                                    <label className={s.label}>Description</label>
                                                    <textarea className={s.textarea} rows={2} value={exp.description}
                                                        onChange={e => updateExp(i, 'description', e.target.value)}
                                                        placeholder="Key responsibilities and achievements…" />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    <button type="button" className={s.addEntry} onClick={addExp}>+ Add Experience</button>
                                </div>
                            </div>

                            {/* Education */}
                            <div className={s.section}>
                                <div className={s.sectionTitle}>🎓 Education</div>
                                <div className={s.formGrid}>
                                    {form.education.map((edu, i) => (
                                        <div key={edu._id || i} className={s.entry}>
                                            <button type="button" className={s.entryRemove} onClick={() => removeEdu(i)}>×</button>
                                            <div className={s.formGrid}>
                                                <div className={s.formRow}>
                                                    <div className={s.field}>
                                                        <label className={s.label}>Degree *</label>
                                                        <input className={s.input} value={edu.degree}
                                                            onChange={e => updateEdu(i, 'degree', e.target.value)} required />
                                                    </div>
                                                    <div className={s.field}>
                                                        <label className={s.label}>Institution *</label>
                                                        <input className={s.input} value={edu.institution}
                                                            onChange={e => updateEdu(i, 'institution', e.target.value)} required />
                                                    </div>
                                                </div>
                                                <div className={s.formRow}>
                                                    <div className={s.field}>
                                                        <label className={s.label}>Start Year</label>
                                                        <input className={s.input} type="number" min="1950" max="2030"
                                                            value={edu.startYear}
                                                            onChange={e => updateEdu(i, 'startYear', e.target.value)} />
                                                    </div>
                                                    <div className={s.field}>
                                                        <label className={s.label}>End Year</label>
                                                        <input className={s.input} type="number" min="1950" max="2030"
                                                            value={edu.endYear}
                                                            onChange={e => updateEdu(i, 'endYear', e.target.value)} />
                                                    </div>
                                                </div>
                                                <div className={s.field}>
                                                    <label className={s.label}>Description</label>
                                                    <textarea className={s.textarea} rows={2} value={edu.description}
                                                        onChange={e => updateEdu(i, 'description', e.target.value)}
                                                        placeholder="Major, honors, relevant coursework…" />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    <button type="button" className={s.addEntry} onClick={addEdu}>+ Add Education</button>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* ═══ TAB 3: Resume & Links ═══ */}
                    {tab === 'Resume & Links' && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} key="resume">
                            {/* Resume Upload */}
                            <div className={s.section}>
                                <div className={s.sectionTitle}>📄 Resume / CV</div>
                                {form.resume ? (
                                    <div className={s.uploadedFile}>
                                        <div style={{
                                            width: 36, height: 36, borderRadius: 8, background: 'rgba(37,99,235,0.1)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem'
                                        }}>
                                            📎
                                        </div>
                                        <div className={s.uploadedFileInfo}>
                                            <div className={s.uploadedFileName}>{form.resumeFileName || 'Resume'}</div>
                                            <Link href={`/resume-viewer/${user?._id}`} className={s.uploadedFileMeta}
                                                style={{ color: 'var(--accent)', textDecoration: 'none' }}>
                                                View file ↗
                                            </Link>
                                        </div>
                                        <button type="button" style={{
                                            background: 'none', border: 'none', cursor: 'pointer',
                                            color: 'var(--muted-foreground)', fontSize: '0.85rem'
                                        }}
                                            onClick={() => resumeRef.current?.click()}>
                                            Replace
                                        </button>
                                    </div>
                                ) : (
                                    <div className={s.uploadArea} onClick={() => resumeRef.current?.click()}>
                                        <div className={s.uploadIcon}>📤</div>
                                        <div className={s.uploadText}>
                                            <span className={s.uploadTextAccent}>Click to upload</span> your resume
                                        </div>
                                        <div className={s.hint}>PDF only — max 5 MB</div>
                                    </div>
                                )}
                                <input ref={resumeRef} type="file" accept=".pdf,application/pdf" hidden
                                    onChange={handleResumeUpload} />
                                {uploadingResume && <p className={s.hint} style={{ marginTop: 8 }}>Uploading…</p>}
                            </div>

                            {/* Social Links */}
                            <div className={s.section}>
                                <div className={s.sectionTitle}>🔗 Social & Portfolio Links</div>
                                <div className={s.formGrid}>
                                    <div className={s.socialRow}>
                                        <div className={s.field}>
                                            <label className={s.label}>LinkedIn</label>
                                            <input className={s.input} placeholder="https://linkedin.com/in/your-profile"
                                                value={form.socialLinks.linkedin}
                                                onChange={e => setNested('socialLinks', 'linkedin', e.target.value)} />
                                        </div>
                                        <div className={s.field}>
                                            <label className={s.label}>GitHub</label>
                                            <input className={s.input} placeholder="https://github.com/username"
                                                value={form.socialLinks.github}
                                                onChange={e => setNested('socialLinks', 'github', e.target.value)} />
                                        </div>
                                    </div>
                                    <div className={s.socialRow}>
                                        <div className={s.field}>
                                            <label className={s.label}>Portfolio / Website</label>
                                            <input className={s.input} placeholder="https://your-portfolio.com"
                                                value={form.socialLinks.portfolio}
                                                onChange={e => setNested('socialLinks', 'portfolio', e.target.value)} />
                                        </div>
                                        <div className={s.field}>
                                            <label className={s.label}>Twitter / X</label>
                                            <input className={s.input} placeholder="https://twitter.com/handle"
                                                value={form.socialLinks.twitter}
                                                onChange={e => setNested('socialLinks', 'twitter', e.target.value)} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* ── Actions ── */}
                    <div className={s.actions}>
                        <Link href={`/profile/candidate/${user?._id}`}>
                            <Button type="button" variant="outline" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                View Public Profile ↗
                            </Button>
                        </Link>
                        <Button type="button" variant="secondary" onClick={() => router.push('/dashboard/candidate')}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={saving}
                            style={{ background: 'var(--gradient-primary)', border: 'none', boxShadow: 'var(--shadow-glow)' }}>
                            {saving ? 'Saving…' : 'Save Profile'}
                        </Button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
}
