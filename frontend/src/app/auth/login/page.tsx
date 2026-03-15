import { Metadata } from 'next';
import { Suspense } from 'react';
import LoginClient from './LoginClient';

export const metadata: Metadata = {
    title: 'Login | Job Listing Portal',
    description: 'Log in to your account to manage your job applications, post new jobs, or update your professional profile.',
    keywords: ['login', 'account access', 'job portal login', 'candidate login', 'employer login'],
};

export default function LoginPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <LoginClient />
        </Suspense>
    );
}
