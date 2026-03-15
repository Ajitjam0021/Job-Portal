import type { MetadataRoute } from 'next';

import { SITE_URL, API_URL } from '@/config/apiConfig';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    // Static routes
    const staticRoutes: MetadataRoute.Sitemap = [
        { url: SITE_URL, lastModified: new Date(), changeFrequency: 'daily', priority: 1.0 },
        { url: `${SITE_URL}/jobs`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
        { url: `${SITE_URL}/companies`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
        { url: `${SITE_URL}/salaries`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
        { url: `${SITE_URL}/auth/login`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
        { url: `${SITE_URL}/auth/signup`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    ];

    // Dynamic routes — fetch all job IDs
    let jobRoutes: MetadataRoute.Sitemap = [];
    try {
        const res = await fetch(`${API_URL}/jobs?limit=500`, { next: { revalidate: 3600 } });
        if (res.ok) {
            const data = await res.json();
            const jobs = Array.isArray(data) ? data : (data.jobs || []);
            jobRoutes = jobs.map((job: { _id: string; createdAt?: string }) => ({
                url: `${SITE_URL}/jobs/${job._id}`,
                lastModified: job.createdAt ? new Date(job.createdAt) : new Date(),
                changeFrequency: 'weekly' as const,
                priority: 0.6,
            }));
        }
    } catch {
        // Silently skip dynamic routes if API is unreachable at build time
    }

    return [...staticRoutes, ...jobRoutes];
}
