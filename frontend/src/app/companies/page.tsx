import { Metadata } from 'next';
import CompaniesPageClient from './CompaniesClient';

export const metadata: Metadata = {
    title: 'Top Companies | Job Listing Portal',
    description: 'Explore world-class companies hiring right now. View company profiles, culture, benefits, and open positions at leading organizations.',
    keywords: ['top companies', 'best places to work', 'company reviews', 'tech companies hiring', 'remote companies'],
};

export default function CompaniesPage() {
    return <CompaniesPageClient />;
}
