"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { Home, Briefcase, Building2, Banknote, User, LogOut } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const baseNavItems = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Jobs', href: '/jobs', icon: Briefcase },
    { name: 'Companies', href: '/companies', icon: Building2 },
    { name: 'Salaries', href: '/salaries', icon: Banknote },
];

export default function BottomNav() {
    const pathname = usePathname();
    const { user, logout } = useAuth();

    // Build nav items dynamically based on auth state
    const profileHref = user
        ? (user.role === 'employer' ? `/profile/employer/${user._id}` : `/profile/candidate/${user._id}`)
        : '/auth/login';

    const navItems = [
        ...baseNavItems,
        { name: user ? 'Profile' : 'Login', href: profileHref, icon: User },
    ];

    return (
        <>
            <motion.nav
                initial={{ y: 100 }}
                animate={{ y: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="mobile-only"
                style={{
                    position: 'fixed',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: '65px',
                    background: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(16px)',
                    borderTop: '1px solid var(--border)',
                    display: 'flex',
                    justifyContent: 'space-around',
                    alignItems: 'center',
                    paddingBottom: 'env(safe-area-inset-bottom, 0px)',
                    zIndex: 100,
                }}
            >
                {navItems.map((item) => {
                    const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
                    const Icon = item.icon;

                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '4px',
                                width: '100%',
                                height: '100%',
                                color: isActive ? 'var(--foreground)' : 'var(--muted-foreground)',
                                position: 'relative',
                                textDecoration: 'none'
                            }}
                        >
                            <div style={{ position: 'relative' }}>
                                <Icon size={24} strokeWidth={isActive ? 2 : 1.5} />
                                {isActive && (
                                    <motion.div
                                        layoutId="bottom-nav-indicator"
                                        style={{
                                            position: 'absolute',
                                            top: -8,
                                            left: '50%',
                                            x: '-50%',
                                            width: '4px',
                                            height: '4px',
                                            borderRadius: '50%',
                                            background: 'var(--foreground)',
                                        }}
                                    />
                                )}
                            </div>
                            <span style={{ fontSize: '0.7rem', fontWeight: 500 }}>
                                {item.name}
                            </span>
                        </Link>
                    );
                })}
            </motion.nav>

            {/* Spacer to prevent content from being hidden behind nav */}
            <div className="mobile-only" style={{ height: '80px' }} />

            <style jsx global>{`
        @media (min-width: 769px) {
          .mobile-only {
            display: none !important;
          }
        }
      `}</style>
        </>
    );
}
