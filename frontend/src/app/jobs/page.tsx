import { Metadata } from 'next';
import JobsPageClient from './JobsClient';

export const metadata: Metadata = {
    title: 'Browse Jobs | Job Listing Portal',
    description: 'Find your next career opportunity. Browse through thousands of job listings in technology, design, marketing, and more. Filter by location, job type, and salary.',
    keywords: ['search jobs', 'job listings', 'career opportunities', 'hiring now', 'remote jobs', 'full-time jobs', 'software engineer jobs'],
    openGraph: {
        title: 'Find Your Dream Job',
        description: 'Thousands of job opportunities are waiting for you. Start your search today.',
        images: ['https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?q=80&w=2072&auto=format&fit=crop']
    }
};

export default function JobsPage() {
    return <JobsPageClient />;
}
