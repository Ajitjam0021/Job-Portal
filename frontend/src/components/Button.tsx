import React, { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'ghost' | 'outline';
    size?: 'sm' | 'md' | 'lg';
    children: React.ReactNode;
}

export default function Button({
    variant = 'primary',
    size = 'md',
    className = '',
    children,
    style,
    ...props
}: ButtonProps) {

    const baseStyles: React.CSSProperties = {
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 'var(--radius)',
        fontWeight: 500,
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        border: '1px solid transparent',
        fontFamily: 'inherit',
        outline: 'none',
    };

    const variantStyles = {
        primary: {
            backgroundColor: 'var(--primary)',
            color: 'var(--primary-foreground)',
        },
        secondary: {
            backgroundColor: 'var(--background)',
            color: 'var(--foreground)',
            borderColor: 'var(--border)',
        },
        ghost: {
            backgroundColor: 'transparent',
            color: 'var(--muted-foreground)',
        },
        outline: {
            backgroundColor: 'transparent',
            color: 'var(--foreground)',
            border: '1px solid var(--border)',
        }
    };

    const sizeStyles = {
        sm: { padding: '0.25rem 0.75rem', fontSize: '0.875rem' },
        md: { padding: '0.5rem 1rem', fontSize: '1rem' },
        lg: { padding: '0.75rem 1.5rem', fontSize: '1.125rem' },
    };

    return (
        <button
            className={`btn-${variant} ${className}`}
            style={{
                ...baseStyles,
                ...variantStyles[variant],
                ...sizeStyles[size],
                ...style,
            }}
            {...props}
        >
            {children}
        </button>
    );
}
