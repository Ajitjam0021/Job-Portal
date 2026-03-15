import { Metadata } from 'next';
import SignupPageClient from './SignupClient';

export const metadata: Metadata = {
    title: 'Sign Up | Job Listing Portal',
    description: 'Create your account on the Job Listing Portal. Join thousands of job seekers and employers finding their perfect match.',
    keywords: ['signup', 'create account', 'register', 'job portal signup', 'join candidate pool', 'employer registration'],
};

export default function SignupPage() {
    return <SignupPageClient />;
}
