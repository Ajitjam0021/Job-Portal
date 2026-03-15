"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

interface AccordionItemProps {
    question: string;
    answer: string;
    isOpen: boolean;
    onClick: () => void;
}

function AccordionItem({ question, answer, isOpen, onClick }: AccordionItemProps) {
    return (
        <div style={{ borderBottom: '1px solid #e4e4e7' }}>
            <button
                onClick={onClick}
                style={{
                    width: '100%',
                    padding: '1.5rem 0',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    textAlign: 'left'
                }}
            >
                <span style={{ fontSize: '1.1rem', fontWeight: 600, color: '#18181b' }}>{question}</span>
                <motion.div
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                >
                    <ChevronDown size={20} color="#71717a" />
                </motion.div>
            </button>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                        style={{ overflow: 'hidden' }}
                    >
                        <p style={{ paddingBottom: '1.5rem', color: '#71717a', lineHeight: 1.6 }}>{answer}</p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default function FAQAccordion({ items }: { items: { q: string, a: string }[] }) {
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    return (
        <div style={{ background: 'white', borderRadius: '24px', padding: '2rem', boxShadow: '0 4px 6px rgba(0,0,0,0.02)', border: '1px solid #e4e4e7' }}>
            {items.map((item, i) => (
                <AccordionItem
                    key={i}
                    question={item.q}
                    answer={item.a}
                    isOpen={openIndex === i}
                    onClick={() => setOpenIndex(openIndex === i ? null : i)}
                />
            ))}
        </div>
    );
}
