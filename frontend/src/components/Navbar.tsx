"use client";

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence, useScroll, useMotionValueEvent, useMotionTemplate, useMotionValue, useSpring, useTransform, Variants } from 'framer-motion';
import Button from './Button';
import { Search, Bell, Menu, X } from 'lucide-react';
import toast from 'react-hot-toast';

const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Find Jobs', href: '/jobs' },
    { name: 'Companies', href: '/companies' },
    { name: 'Salaries', href: '/salaries' },
];

function MagneticButton({ children, className, style, onClick }: { children: React.ReactNode, className?: string, style?: React.CSSProperties, onClick?: () => void }) {
    const ref = useRef<HTMLButtonElement>(null);
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    const xSpring = useSpring(x, { stiffness: 150, damping: 15, mass: 0.1 });
    const ySpring = useSpring(y, { stiffness: 150, damping: 15, mass: 0.1 });

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!ref.current) return;
        const { left, top, width, height } = ref.current.getBoundingClientRect();
        const xPos = e.clientX - (left + width / 2);
        const yPos = e.clientY - (top + height / 2);
        x.set(xPos * 0.3);
        y.set(yPos * 0.3);
    };

    const handleMouseLeave = () => {
        x.set(0);
        y.set(0);
    };

    return (
        <motion.button
            ref={ref}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{ x: xSpring, y: ySpring, ...style }}
            className={className}
            onClick={onClick}
        >
            {children}
        </motion.button>
    );
}

import { useAuth } from '@/context/AuthContext';

export default function Navbar() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const pathname = usePathname();
    const { scrollY } = useScroll();
    const { user, logout } = useAuth();

    // Mouse Spotlight Logic
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    function handleMouseMove({ currentTarget, clientX, clientY }: React.MouseEvent) {
        const { left, top } = currentTarget.getBoundingClientRect();
        mouseX.set(clientX - left);
        mouseY.set(clientY - top);
    }

    useMotionValueEvent(scrollY, "change", (latest) => {
        setIsScrolled(latest > 10);
    });

    const menuVariants: Variants = {
        open: { x: 0, transition: { type: "spring", stiffness: 300, damping: 30 } },
        closed: { x: "100%", transition: { type: "spring", stiffness: 300, damping: 30 } },
    } as any;

    const overlayVariants = {
        open: { opacity: 1 },
        closed: { opacity: 0 },
    };

    return (
        <>
            <motion.header
                initial={{ y: -100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 100, damping: 20 }}
                onMouseMove={handleMouseMove}
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    width: '100vw',
                    height: '80px', // Slightly taller for premium feel
                    zIndex: 50,
                    backgroundColor: 'rgba(9, 9, 11, 0.9)', // Always dark
                    backdropFilter: 'blur(20px)',
                    borderBottom: '1px solid rgba(255,255,255,0.08)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden'
                }}
            >
                {/* Spotlight Effect Background */}
                <motion.div
                    className="spotlight"
                    style={{
                        pointerEvents: 'none',
                        position: 'absolute',
                        inset: 0,
                        opacity: 0.5,
                        background: useMotionTemplate`
                radial-gradient(
                  600px circle at ${mouseX}px ${mouseY}px,
                  rgba(255, 255, 255, 0.06),
                  transparent 80%
                )
              `,
                    }}
                />

                <div className="container" style={{
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    position: 'relative',
                    zIndex: 10
                }}>
                    {/* Logo */}
                    <Link href="/" style={{ textDecoration: 'none', zIndex: 20 }}>
                        <motion.div
                            className="logo-container"
                            whileHover="hover"
                            initial="initial"
                            style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}
                        >
                            <motion.div
                                variants={{
                                    initial: { rotate: 0, scale: 1 },
                                    hover: { rotate: 180, scale: 1.1, boxShadow: '0 0 20px rgba(255,255,255,0.3)' }
                                }}
                                transition={{ type: 'spring', stiffness: 200 }}
                                style={{
                                    width: '40px', height: '40px',
                                    background: 'linear-gradient(135deg, #ffffff 0%, #a1a1aa 100%)',
                                    borderRadius: '12px',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    color: '#09090b', fontWeight: 900,
                                    fontSize: '1.2rem'
                                }}
                            >
                                J
                            </motion.div>
                            <motion.span
                                variants={{
                                    initial: { x: 0 },
                                    hover: { x: 5 }
                                }}
                                style={{ fontWeight: 700, fontSize: '1.4rem', color: '#ffffff', letterSpacing: '-0.03em' }}
                            >
                                JobPortal
                            </motion.span>
                        </motion.div>
                    </Link>

                    {/* Desktop Nav Links - Staggered Entry */}
                    <nav className="desktop-only" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {navLinks.map((item, i) => {
                            const isActive = pathname === item.href;
                            return (
                                <motion.div
                                    key={item.href}
                                    initial={{ opacity: 0, y: -20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.1 + 0.2 }}
                                >
                                    <Link href={item.href} style={{ position: 'relative', textDecoration: 'none' }}>
                                        <motion.div
                                            style={{
                                                padding: '0.6rem 1.2rem',
                                                borderRadius: '12px',
                                                color: isActive ? '#ffffff' : '#a1a1aa',
                                                fontSize: '0.95rem',
                                                fontWeight: 500,
                                                position: 'relative'
                                            }}
                                            whileHover={{ color: '#ffffff', backgroundColor: 'rgba(255,255,255,0.05)' }}
                                        >
                                            {item.name}
                                            {isActive && (
                                                <motion.div
                                                    layoutId="nav-glow"
                                                    style={{
                                                        position: 'absolute',
                                                        bottom: -2,
                                                        left: '50%',
                                                        x: '-50%',
                                                        width: '20px',
                                                        height: '2px',
                                                        background: '#ffffff',
                                                        borderRadius: '2px',
                                                        boxShadow: '0 0 10px rgba(255,255,255,0.8)'
                                                    }}
                                                />
                                            )}
                                        </motion.div>
                                    </Link>
                                </motion.div>
                            )
                        })}
                    </nav>

                    {/* Actions */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <motion.button
                            whileHover={{ scale: 1.1, rotate: 15 }}
                            whileTap={{ scale: 0.9 }}
                            aria-label="Search"
                            style={{
                                padding: '12px', borderRadius: '50%', border: '1px solid rgba(255,255,255,0.1)',
                                background: 'rgba(255,255,255,0.03)', cursor: 'pointer', color: '#e4e4e7',
                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}
                        >
                            <Search size={20} />
                        </motion.button>

                        <div className="desktop-only" style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                            {user ? (
                                <>
                                    <Link href={user.role === 'employer' ? `/profile/employer/${user._id}` : `/profile/candidate/${user._id}`}>
                                        <MagneticButton style={{ fontSize: '0.95rem', padding: '0.75rem 1.5rem', background: 'transparent', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
                                            My Profile
                                        </MagneticButton>
                                    </Link>
                                    <MagneticButton
                                        onClick={async () => {
                                            await logout();
                                            toast.success('Logged out successfully');
                                        }}
                                        style={{ fontSize: '0.95rem', padding: '0.75rem 1.75rem', background: '#DC2626', color: '#ffffff', fontWeight: 700, borderRadius: '99px', border: 'none', cursor: 'pointer', boxShadow: '0 0 20px rgba(220, 38, 38, 0.2)' }}
                                    >
                                        Logout
                                    </MagneticButton>
                                </>
                            ) : (
                                <>
                                    <Link href="/auth/login">
                                        <MagneticButton style={{ fontSize: '0.95rem', padding: '0.75rem 1.5rem', background: 'transparent', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
                                            Log in
                                        </MagneticButton>
                                    </Link>
                                    <Link href="/auth/signup">
                                        <MagneticButton style={{ fontSize: '0.95rem', padding: '0.75rem 1.75rem', background: '#ffffff', color: '#09090b', fontWeight: 700, borderRadius: '99px', border: 'none', cursor: 'pointer', boxShadow: '0 0 20px rgba(255,255,255,0.2)' }}>
                                            Get Started
                                        </MagneticButton>
                                    </Link>
                                </>
                            )}
                        </div>

                        {/* Mobile Menu Icon */}
                        <button
                            className="mobile-only"
                            onClick={() => setIsOpen(true)}
                            aria-label="Menu"
                            style={{ padding: '8px', border: 'none', background: 'transparent', cursor: 'pointer', color: '#ffffff' }}
                        >
                            <Menu size={28} />
                        </button>
                    </div>
                </div>
            </motion.header>

            {/* Spacing for fixed header */}
            <div style={{ height: '80px' }} />

            {/* Mobile Drawer */}
            <AnimatePresence>
                {isOpen && (
                    <>
                        <motion.div
                            variants={overlayVariants}
                            initial="closed"
                            animate="open"
                            exit="closed"
                            onClick={() => setIsOpen(false)}
                            style={{
                                position: 'fixed',
                                inset: 0,
                                background: 'rgba(0,0,0,0.6)',
                                backdropFilter: 'blur(8px)',
                                zIndex: 100
                            }}
                        />
                        <motion.div
                            variants={menuVariants}
                            initial="closed"
                            animate="open"
                            exit="closed"
                            style={{
                                position: 'fixed',
                                top: 0,
                                right: 0,
                                bottom: 0,
                                width: '85%',
                                maxWidth: '360px',
                                background: '#09090b',
                                borderLeft: '1px solid rgba(255,255,255,0.08)',
                                padding: '2rem',
                                zIndex: 101,
                                display: 'flex',
                                flexDirection: 'column'
                            }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
                                <span style={{ fontWeight: 800, fontSize: '1.5rem', color: '#ffffff' }}>Menu</span>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ffffff' }}
                                >
                                    <X size={28} />
                                </button>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                {navLinks.map((item) => (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        onClick={() => setIsOpen(false)}
                                        style={{
                                            fontSize: '1.25rem',
                                            fontWeight: 600,
                                            color: pathname === item.href ? '#ffffff' : '#a1a1aa',
                                            textDecoration: 'none'
                                        }}
                                    >
                                        {item.name}
                                    </Link>
                                ))}
                            </div>

                            <div style={{ marginTop: 'auto', paddingTop: '2rem', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                                {user ? (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                            <div style={{
                                                width: '48px', height: '48px', borderRadius: '12px',
                                                background: 'linear-gradient(135deg, #ffffff 0%, #a1a1aa 100%)',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                color: '#09090b', fontWeight: 800
                                            }}>
                                                {user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: 700, color: '#ffffff' }}>{user.name}</div>
                                                <div style={{ fontSize: '0.85rem', color: '#a1a1aa' }}>{user.email}</div>
                                            </div>
                                        </div>
                                        <Link href={user.role === 'employer' ? `/profile/employer/${user._id}` : `/profile/candidate/${user._id}`} onClick={() => setIsOpen(false)}>
                                            <Button style={{ width: '100%', background: '#ffffff', color: '#09090b' }}>My Profile</Button>
                                        </Link>
                                        <button
                                            onClick={async () => {
                                                await logout();
                                                setIsOpen(false);
                                                toast.success('Logged out');
                                            }}
                                            style={{
                                                padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444',
                                                border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '12px',
                                                fontWeight: 600, cursor: 'pointer'
                                            }}
                                        >
                                            Logout
                                        </button>
                                    </div>
                                ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                        <Link href="/auth/login" onClick={() => setIsOpen(false)}>
                                            <Button variant="outline" style={{ width: '100%', color: 'white', borderColor: 'rgba(255,255,255,0.1)' }}>Log in</Button>
                                        </Link>
                                        <Link href="/auth/signup" onClick={() => setIsOpen(false)}>
                                            <Button style={{ width: '100%', background: '#ffffff', color: '#09090b' }}>Get Started</Button>
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            <style jsx global>{`
        @media (max-width: 768px) {
          .desktop-only { display: none !important; }
        }
        @media (min-width: 769px) {
          .mobile-only { display: none !important; }
        }
      `}</style>
        </>
    );
}
