"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import api from '@/utils/api';
import Button from '@/components/Button';
import Link from 'next/link';
import s from '../../profile.module.css';

/* ─── Types ─── */
interface LocationObj { city: string; state: string; country: string; }
interface CompanySocial { linkedin: string; twitter: string; facebook: string; }
interface ProfileForm {
    name: string; email: string; phone: string;
    company: string; companyDescription: string;
    industry: string; companySize: string;
    website: string; logo: string;
    companyBenefits: string[];
    companySocialLinks: CompanySocial;
    location: LocationObj;
}

const TABS = ['Company Details', 'Contact & Location', 'Online Presence'] as const;
type Tab = typeof TABS[number];

const INDUSTRIES = ['Technology', 'Finance', 'Healthcare', 'Education', 'Retail', 'Manufacturing', 'Consulting', 'Media & Entertainment', 'Real Estate', 'Non-Profit', 'Other'];
const SIZES = ['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+'];

export default function EmployerProfile() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [tab, setTab] = useState<Tab>('Company Details');
    const [saving, setSaving] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [msg, setMsg] = useState({ ok: false, text: '' });
    const [benefitInput, setBenefitInput] = useState('');
    const [completeness, setCompleteness] = useState({ score: 0, missing: [] as string[] });
    const [uploadingLogo, setUploadingLogo] = useState(false);
    const logoRef = useRef<HTMLInputElement>(null);

    const [form, setForm] = useState<ProfileForm>({
        name: '', email: '', phone: '',
        company: '', companyDescription: '',
        industry: '', companySize: '',
        website: '', logo: '',
        companyBenefits: [],
        companySocialLinks: { linkedin: '', twitter: '', facebook: '' },
        location: { city: '', state: '', country: '' },
    });

    // Auth guard
    useEffect(() => {
        if (!authLoading && (!user || user.role !== 'employer')) {
            router.push(user ? '/dashboard/candidate' : '/auth/login');
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
                    company: data.company || '',
                    companyDescription: data.companyDescription || '',
                    industry: data.industry || '',
                    companySize: data.companySize || '',
                    website: data.website || '',
                    logo: data.logo || '',
                    companyBenefits: Array.isArray(data.companyBenefits) ? data.companyBenefits : [],
                    companySocialLinks: { linkedin: '', twitter: '', facebook: '', ...data.companySocialLinks },
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

    const setNested = useCallback((group: 'companySocialLinks' | 'location', key: string, val: string) => {
        setForm(prev => ({ ...prev, [group]: { ...prev[group], [key]: val } }));
    }, []);

    const addBenefit = useCallback(() => {
        const trimmed = benefitInput.trim();
        if (trimmed && !form.companyBenefits.includes(trimmed) && form.companyBenefits.length < 30) {
            setForm(prev => ({ ...prev, companyBenefits: [...prev.companyBenefits, trimmed] }));
            setBenefitInput('');
        }
    }, [benefitInput, form.companyBenefits]);

    const removeBenefit = useCallback((idx: number) => {
        setForm(prev => ({ ...prev, companyBenefits: prev.companyBenefits.filter((_, i) => i !== idx) }));
    }, []);

    /* ─── Logo Upload ── */
    const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Check file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            setMsg({ ok: false, text: 'Image is too large. Please use an image smaller than 5MB.' });
            return;
        }

        setUploadingLogo(true);
        try {
            const fd = new FormData();
            fd.append('logo', file);
            const { data } = await api.post('/profile/upload-logo', fd);
            setForm(prev => ({ ...prev, logo: data.logo }));
            setMsg({ ok: true, text: 'Logo uploaded successfully!' });
        } catch (err: any) {
            const serverMsg = err.response?.data?.message || '';
            if (serverMsg.includes('file type')) {
                setMsg({ ok: false, text: 'Please upload a JPG, PNG, or WebP image.' });
            } else if (err.response?.status === 413) {
                setMsg({ ok: false, text: 'Image is too large. Please use a smaller image.' });
            } else {
                setMsg({ ok: false, text: 'Could not upload logo. Please try again.' });
            }
        } finally {
            setUploadingLogo(false);
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
                company: form.company,
                companyDescription: form.companyDescription,
                industry: form.industry,
                companySize: form.companySize,
                website: form.website,
                companyBenefits: form.companyBenefits,
                companySocialLinks: form.companySocialLinks,
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

    if (authLoading || !user || fetching) {
        return (
            <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <p style={{ color: 'var(--muted-foreground)' }}>Loading profile...</p>
            </div>
        );
    }

    const barColor = completeness.score < 40 ? '#ef4444' : completeness.score < 70 ? '#f59e0b' : '#10b981';

    return (
        <div className={s.container}>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>

                {/* ── Header ── */}
                <div className={s.header}>
                    <div className={s.avatarWrap}>
                        {form.logo ? (
                            <img src={form.logo} alt="Logo" className={s.avatar}
                                style={{ borderRadius: 'var(--radius)' }}
                                onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                        ) : (
                            <div className={s.avatarPlaceholder} onClick={() => logoRef.current?.click()}
                                style={{ borderRadius: 'var(--radius)' }}>
                                🏢
                            </div>
                        )}
                        <button className={s.avatarUploadBtn} onClick={() => logoRef.current?.click()}
                            disabled={uploadingLogo} title="Upload logo"
                            style={{ borderRadius: 'var(--radius)' }}>
                            {uploadingLogo ? '…' : '✎'}
                        </button>
                        <input ref={logoRef} type="file" accept="image/*" hidden onChange={handleLogoUpload} />
                    </div>
                    <div className={s.headerInfo}>
                        <h1>{form.company || 'Your Company'}</h1>
                        <p>{form.industry ? `${form.industry} • ${form.companySize || ''} employees` : 'Add company details'}</p>
                    </div>
                </div>

                {/* ── Completeness ── */}
                <div className={s.completeness}>
                    <div className={s.completenessHeader}>
                        <span className={s.completenessLabel}>Profile Strength</span>
                        <span className={s.completenessScore} style={{ color: barColor }}>{completeness.score}%</span>
                    </div>
                    <div className={s.completenessBar}>
                        <div className={s.completenessFill} style={{ width: `${completeness.score}%`, background: barColor }} />
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
                        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
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
                    {/* ═══ TAB 1: Company Details ═══ */}
                    {tab === 'Company Details' && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} key="company">
                            <div className={s.section}>
                                <div className={s.sectionTitle}>🏢 Company Information</div>
                                <div className={s.formGrid}>
                                    <div className={s.field}>
                                        <label className={s.label}>Company Name *</label>
                                        <input className={s.input} name="company" value={form.company} onChange={set}
                                            required placeholder="Acme Corporation" />
                                    </div>
                                    <div className={s.field}>
                                        <label className={s.label}>Company Description</label>
                                        <textarea className={s.textarea} name="companyDescription" value={form.companyDescription}
                                            onChange={set} rows={5} maxLength={2000}
                                            placeholder="What does your company do? Mission, culture, and values…" />
                                        <span className={s.hint}>{form.companyDescription.length}/2000</span>
                                    </div>
                                    <div className={s.formRow}>
                                        <div className={s.field}>
                                            <label className={s.label}>Industry</label>
                                            <select className={s.select} name="industry" value={form.industry} onChange={set}>
                                                <option value="">Select Industry</option>
                                                {INDUSTRIES.map(ind => <option key={ind} value={ind}>{ind}</option>)}
                                            </select>
                                        </div>
                                        <div className={s.field}>
                                            <label className={s.label}>Company Size</label>
                                            <select className={s.select} name="companySize" value={form.companySize} onChange={set}>
                                                <option value="">Select Size</option>
                                                {SIZES.map(sz => <option key={sz} value={sz}>{sz} employees</option>)}
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Benefits */}
                            <div className={s.section}>
                                <div className={s.sectionTitle}>🎁 Benefits & Perks</div>
                                <div className={s.tagsWrap}>
                                    {form.companyBenefits.map((b, i) => (
                                        <span key={i} className={s.tag}>
                                            {b}
                                            <button type="button" className={s.tagRemove} onClick={() => removeBenefit(i)}>×</button>
                                        </span>
                                    ))}
                                    <input className={s.tagInput} placeholder="Type a benefit & press Enter"
                                        value={benefitInput} onChange={e => setBenefitInput(e.target.value)}
                                        onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addBenefit(); } }} />
                                </div>
                                <span className={s.hint}>e.g., Remote Work, Health Insurance, Free Lunch — press Enter to add</span>
                            </div>
                        </motion.div>
                    )}

                    {/* ═══ TAB 2: Contact & Location ═══ */}
                    {tab === 'Contact & Location' && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} key="contact">
                            <div className={s.section}>
                                <div className={s.sectionTitle}>👤 Contact Person</div>
                                <div className={s.formGrid}>
                                    <div className={s.formRow}>
                                        <div className={s.field}>
                                            <label className={s.label}>Your Name *</label>
                                            <input className={s.input} name="name" value={form.name} onChange={set} required />
                                        </div>
                                        <div className={s.field}>
                                            <label className={s.label}>Email</label>
                                            <input className={s.inputReadonly} value={form.email} readOnly />
                                        </div>
                                    </div>
                                    <div className={s.field}>
                                        <label className={s.label}>Phone</label>
                                        <input className={s.input} name="phone" value={form.phone} onChange={set}
                                            placeholder="+1 (555) 123-4567" />
                                    </div>
                                </div>
                            </div>

                            <div className={s.section}>
                                <div className={s.sectionTitle}>📍 Office Location</div>
                                <div className={s.formRowThree}>
                                    <div className={s.field}>
                                        <label className={s.label}>City</label>
                                        <input className={s.input} value={form.location.city}
                                            onChange={e => setNested('location', 'city', e.target.value)} placeholder="San Francisco" />
                                    </div>
                                    <div className={s.field}>
                                        <label className={s.label}>State / Province</label>
                                        <input className={s.input} value={form.location.state}
                                            onChange={e => setNested('location', 'state', e.target.value)} placeholder="California" />
                                    </div>
                                    <div className={s.field}>
                                        <label className={s.label}>Country</label>
                                        <input className={s.input} value={form.location.country}
                                            onChange={e => setNested('location', 'country', e.target.value)} placeholder="USA" />
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* ═══ TAB 3: Online Presence ═══ */}
                    {tab === 'Online Presence' && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} key="online">
                            <div className={s.section}>
                                <div className={s.sectionTitle}>🌐 Website & Logo</div>
                                <div className={s.formGrid}>
                                    <div className={s.field}>
                                        <label className={s.label}>Company Website</label>
                                        <input className={s.input} name="website" value={form.website} onChange={set}
                                            placeholder="https://yourcompany.com" type="url" />
                                    </div>
                                    <div className={s.field}>
                                        <label className={s.label}>Company Logo</label>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                            {form.logo && (
                                                <img src={form.logo} alt="Logo" className={s.logoPreview}
                                                    onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                                            )}
                                            <Button type="button" variant="outline" size="sm"
                                                onClick={() => logoRef.current?.click()}
                                                disabled={uploadingLogo}>
                                                {uploadingLogo ? 'Uploading…' : form.logo ? 'Change Logo' : 'Upload Logo'}
                                            </Button>
                                        </div>
                                        <span className={s.hint}>Square image recommended (PNG, JPG) — max 5 MB</span>
                                    </div>
                                </div>
                            </div>

                            <div className={s.section}>
                                <div className={s.sectionTitle}>🔗 Social Profiles</div>
                                <div className={s.formGrid}>
                                    <div className={s.socialRow}>
                                        <div className={s.field}>
                                            <label className={s.label}>LinkedIn</label>
                                            <input className={s.input} placeholder="https://linkedin.com/company/…"
                                                value={form.companySocialLinks.linkedin}
                                                onChange={e => setNested('companySocialLinks', 'linkedin', e.target.value)} />
                                        </div>
                                        <div className={s.field}>
                                            <label className={s.label}>Twitter / X</label>
                                            <input className={s.input} placeholder="https://twitter.com/…"
                                                value={form.companySocialLinks.twitter}
                                                onChange={e => setNested('companySocialLinks', 'twitter', e.target.value)} />
                                        </div>
                                    </div>
                                    <div className={s.field}>
                                        <label className={s.label}>Facebook</label>
                                        <input className={s.input} placeholder="https://facebook.com/…"
                                            value={form.companySocialLinks.facebook}
                                            onChange={e => setNested('companySocialLinks', 'facebook', e.target.value)} />
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* ── Actions ── */}
                    <div className={s.actions}>
                        <Link href={`/profile/employer/${user?._id}`}>
                            <Button type="button" variant="outline" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                View Public Profile ↗
                            </Button>
                        </Link>
                        <Button type="button" variant="secondary" onClick={() => router.push('/dashboard/employer')}>
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
