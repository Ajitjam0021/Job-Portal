import { Metadata } from 'next';
import SalariesPageClient from './SalariesClient';

export const metadata: Metadata = {
    title: 'Salary Insights | Job Listing Portal',
    description: 'Compare salaries for different roles and industries. Get data on compensation trends to help your next career move or salary negotiation.',
    keywords: ['salary comparison', 'job compensation', 'salary trends', 'high paying jobs', 'tech salaries'],
};

export default function SalariesPage() {
    return <SalariesPageClient />;
}
