import { Metadata, ResolvingMetadata } from 'next';
import JobDetailsClient from './JobDetailsClient';

import { API_URL, SITE_URL } from '@/config/apiConfig';

type Props = {
    params: Promise<{ id: string }>
}

export async function generateMetadata(
    { params }: Props,
    parent: ResolvingMetadata
): Promise<Metadata> {
    const id = (await params).id;

    try {
        const res = await fetch(`${API_URL}/jobs/${id}`);
        const job = await res.json();

        if (!job || !job.title) throw new Error('Job not found');

        return {
            title: `${job.title} at ${job.company} | Job Listing Portal`,
            description: `Apply for the ${job.title} position at ${job.company} in ${job.location}. ${job.description.substring(0, 150)}...`,
            openGraph: {
                title: `${job.title} Job Opportunity`,
                description: `Competitive ${job.salary} position available now.`,
                url: `${SITE_URL}/jobs/${id}`,
            },
        };
    } catch (error) {
        return {
            title: 'Job Opportunity | Job Listing Portal',
            description: 'Apply for this exciting career opportunity on our platform.',
        };
    }
}

export default function JobDetailsPage() {
    return <JobDetailsClient />;
}
