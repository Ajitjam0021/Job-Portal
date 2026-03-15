"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UploadCloud, X, FileText, CheckCircle } from 'lucide-react';

export default function FileUpload({ label, accept = ".pdf,.doc,.docx" }: { label: string, accept?: string }) {
    const [file, setFile] = useState<File | null>(null);
    const [isDragging, setIsDragging] = useState(false);

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            setFile(e.dataTransfer.files[0]);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--foreground)' }}>{label}</label>

            <AnimatePresence mode="wait">
                {!file ? (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        whileHover={{ scale: 1.01, borderColor: 'var(--primary)' }}
                        style={{
                            border: `2px dashed ${isDragging ? 'var(--primary)' : 'var(--border)'}`,
                            borderRadius: 'var(--radius)',
                            padding: '2rem',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '1rem',
                            cursor: 'pointer',
                            backgroundColor: isDragging ? 'rgba(99, 102, 241, 0.05)' : 'var(--background)',
                            transition: 'background-color 0.2s, border-color 0.2s',
                            position: 'relative'
                        }}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                    >
                        <input
                            type="file"
                            accept={accept}
                            onChange={handleFileChange}
                            style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }}
                        />
                        <div style={{
                            width: '48px',
                            height: '48px',
                            borderRadius: '50%',
                            background: 'var(--muted)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'var(--primary)'
                        }}>
                            <UploadCloud size={24} />
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <p style={{ fontSize: '0.875rem', fontWeight: 500 }}>
                                <span style={{ color: 'var(--primary)' }}>Click to upload</span> or drag and drop
                            </p>
                            <p style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)', marginTop: '0.25rem' }}>
                                PDF, DOC up to 10MB
                            </p>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        style={{
                            border: '1px solid var(--border)',
                            borderRadius: 'var(--radius)',
                            padding: '1rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '1rem',
                            backgroundColor: 'var(--surface)'
                        }}
                    >
                        <div style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '8px',
                            background: 'rgba(99, 102, 241, 0.1)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'var(--primary)'
                        }}>
                            <FileText size={20} />
                        </div>
                        <div style={{ flex: 1 }}>
                            <p style={{ fontSize: '0.875rem', fontWeight: 500 }}>{file.name}</p>
                            <p style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)' }}>{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                        </div>
                        <button
                            onClick={() => setFile(null)}
                            style={{
                                padding: '0.5rem',
                                borderRadius: '50%',
                                color: 'var(--muted-foreground)',
                                background: 'transparent',
                                border: 'none',
                                cursor: 'pointer'
                            }}
                        >
                            <X size={18} />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
