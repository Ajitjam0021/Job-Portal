"use client";

import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import Button from './Button';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    footer?: React.ReactNode;
}

export default function Modal({ isOpen, onClose, title, children, footer }: ModalProps) {
    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        style={{
                            position: 'fixed',
                            inset: 0,
                            backgroundColor: 'rgba(0, 0, 0, 0.5)',
                            backdropFilter: 'blur(4px)',
                            zIndex: 100
                        }}
                    />

                    {/* Modal Content */}
                    <div style={{
                        position: 'fixed',
                        inset: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 101,
                        pointerEvents: 'none'
                    }}>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            style={{
                                width: '100%',
                                maxWidth: '500px',
                                backgroundColor: 'var(--surface)',
                                borderRadius: 'var(--radius)',
                                border: '1px solid var(--border)',
                                boxShadow: 'var(--shadow-xl)',
                                pointerEvents: 'auto',
                                overflow: 'hidden'
                            }}
                        >
                            <div style={{
                                padding: '1.5rem',
                                borderBottom: '1px solid var(--border)',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                            }}>
                                <h3 style={{ fontSize: '1.25rem', fontWeight: 600 }}>{title}</h3>
                                <button
                                    onClick={onClose}
                                    style={{
                                        background: 'transparent',
                                        border: 'none',
                                        cursor: 'pointer',
                                        color: 'var(--muted-foreground)'
                                    }}
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <div style={{ padding: '1.5rem' }}>
                                {children}
                            </div>

                            {footer && (
                                <div style={{
                                    padding: '1rem 1.5rem',
                                    backgroundColor: 'var(--muted)',
                                    borderTop: '1px solid var(--border)',
                                    display: 'flex',
                                    justifyContent: 'flex-end',
                                    gap: '1rem'
                                }}>
                                    {footer}
                                </div>
                            )}
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
}
