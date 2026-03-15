import React, { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    icon?: React.ReactNode;
}

export default function Input({ label, icon, className = '', style, ...props }: InputProps) {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', width: '100%' }}>
            {label && (
                <label style={{
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    color: 'var(--foreground)'
                }}>
                    {label}
                </label>
            )}
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                {icon && (
                    <div style={{
                        position: 'absolute',
                        left: '0.75rem',
                        color: 'var(--muted-foreground)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        {icon}
                    </div>
                )}
                <input
                    className={`input ${className}`}
                    style={{
                        ...style,
                        paddingLeft: icon ? '2.5rem' : '0.75rem'
                    }}
                    {...props}
                />
            </div>
        </div>
    );
}
