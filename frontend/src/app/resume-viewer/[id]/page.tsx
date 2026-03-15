"use client";

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import api from '@/utils/api';
import Button from '@/components/Button';
import { Download, ChevronLeft, FileText, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ResumeViewerPage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;

    const [resumeUrl, setResumeUrl] = useState('');
    const [fileName, setFileName] = useState('');
    const [candidateName, setCandidateName] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!id) return;
        (async () => {
            try {
                const { data } = await api.get(`/profile/${id}`);
                if (data.resume) {
                    // Derive backend base URL from API_URL
                    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
                    const baseUrl = apiUrl.replace('/api', '');

                    const fullUrl = data.resume.startsWith('http')
                        ? data.resume
                        : `${baseUrl}${data.resume}`;

                    setResumeUrl(fullUrl);
                    setFileName(data.resumeFileName || 'resume.pdf');
                    setCandidateName(data.name || 'Candidate');
                } else {
                    setError('No resume found for this candidate');
                }
            } catch (err) {
                console.error(err);
                setError('Failed to load resume details');
            } finally {
                setLoading(false);
            }
        })();
    }, [id]);

    const handleDownload = () => {
        if (!resumeUrl) return;
        const link = document.createElement('a');
        link.href = resumeUrl;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (loading) return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#f8f9fa' }}>
            <Loader2 className="spin" size={40} color="var(--accent)" />
            <p style={{ marginTop: '1rem', color: 'var(--muted-foreground)' }}>Loading viewer...</p>
        </div>
    );

    if (error || !resumeUrl) return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#f8f9fa', padding: '2rem' }}>
            <FileText size={60} color="#e5e7eb" style={{ marginBottom: '1.5rem' }} />
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.5rem' }}>Oops!</h1>
            <p style={{ color: 'var(--muted-foreground)', textAlign: 'center', marginBottom: '2rem' }}>{error || 'Unable to display this document'}</p>
            <Button onClick={() => router.back()} variant="outline">Go Back</Button>
        </div>
    );

    return (
        <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: '#525659' }}>
            {/* LinkedIn-style Header */}
            <header style={{
                height: '64px',
                background: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0 1.5rem',
                borderBottom: '1px solid #e5e7eb',
                zIndex: 10
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <button
                        onClick={() => router.back()}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px', borderRadius: '50%' }}
                        className="hover:bg-gray-100"
                    >
                        <ChevronLeft size={24} />
                    </button>
                    <div>
                        <h1 style={{ fontSize: '1rem', fontWeight: 700, margin: 0, lineHeight: 1.2 }}>{candidateName}&apos;s Resume</h1>
                        <p style={{ fontSize: '0.75rem', color: '#6b7280', margin: 0 }}>{fileName}</p>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <Button onClick={handleDownload} variant="outline" style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', padding: '6px 16px', height: '36px' }}>
                        <Download size={16} /> Download
                    </Button>
                </div>
            </header>

            {/* Document Viewer Container */}
            <main style={{ flex: 1, position: 'relative', overflow: 'hidden', padding: '2rem', display: 'flex', justifyContent: 'center' }}>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{
                        width: '100%',
                        maxWidth: '1000px',
                        height: '100%',
                        background: 'white',
                        borderRadius: '8px',
                        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                        overflow: 'hidden'
                    }}
                >
                    <iframe
                        src={`${resumeUrl}#toolbar=0`}
                        style={{ width: '100%', height: '100%', border: 'none' }}
                        title="Resume Viewer"
                    />
                </motion.div>
            </main>
        </div>
    );
}
