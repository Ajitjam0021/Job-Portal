"use client";

import React, { useState, useCallback, useRef, useEffect } from 'react';
import FilterSidebar from '@/components/FilterSidebar';
import dynamic from 'next/dynamic';
const JobCard = dynamic(() => import('@/components/JobCard'), {
    loading: () => <div style={{ height: '200px', background: '#f4f4f5', borderRadius: '12px', animation: 'pulse 2s infinite' }}></div>,
    ssr: false,
});
import api from '@/utils/api';
import { Search, MapPin, Loader2 } from 'lucide-react';

interface SearchParams {
    keyword: string;
    location: string;
    types: string[];
    sort: string;
    page: number;
}

export default function JobsPageClient() {
    const [jobs, setJobs] = useState<any[]>([]);
    const [total, setTotal] = useState(0);
    const [pages, setPages] = useState(1);
    const [loading, setLoading] = useState(true);
    const [params, setParams] = useState<SearchParams>({
        keyword: '',
        location: '',
        types: [],
        sort: 'newest',
        page: 1,
    });

    // Input refs for the search bar
    const keywordRef = useRef<HTMLInputElement>(null);
    const locationRef = useRef<HTMLInputElement>(null);

    // Fetch function
    const fetchJobs = useCallback(async (searchParams: SearchParams) => {
        setLoading(true);
        try {
            const qp = new URLSearchParams();
            if (searchParams.keyword) qp.set('keyword', searchParams.keyword);
            if (searchParams.location) qp.set('location', searchParams.location);
            if (searchParams.types.length > 0) qp.set('type', searchParams.types.join(','));
            if (searchParams.sort === 'newest') qp.set('sort', 'newest');
            if (searchParams.sort === 'oldest') qp.set('sort', 'oldest');
            qp.set('page', String(searchParams.page));
            qp.set('limit', '20');

            const { data } = await api.get(`/search?${qp.toString()}`);
            setJobs(data.jobs || []);
            setTotal(data.total || 0);
            setPages(data.pages || 1);
        } catch (err) {
            console.error('Search error:', err);
            // Fallback
            try {
                const { data } = await api.get('/jobs');
                const jobList = Array.isArray(data) ? data : (data.jobs || []);
                setJobs(jobList);
                setTotal(jobList.length);
            } catch {
                setJobs([]);
                setTotal(0);
            }
        } finally {
            setLoading(false);
        }
    }, []);

    // Initial fetch
    useEffect(() => {
        fetchJobs(params);
    }, [fetchJobs, params]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        const newParams = {
            ...params,
            keyword: keywordRef.current?.value || '',
            location: locationRef.current?.value || '',
            page: 1, // Reset to first page
        };
        setParams(newParams);
    };

    const handleFilterChange = (filters: { types: string[]; location: string }) => {
        setParams(prev => ({
            ...prev,
            types: filters.types,
            location: filters.location || prev.location,
            page: 1
        }));
    };

    const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setParams(prev => ({ ...prev, sort: e.target.value, page: 1 }));
    };

    const handlePageChange = (newPage: number) => {
        setParams(prev => ({ ...prev, page: newPage }));
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div style={{ background: '#fafafa', minHeight: '100vh' }}>
            {/* Header / Search Bar */}
            <div style={{ background: 'white', borderBottom: '1px solid #e4e4e7', padding: '4rem 0' }}>
                <div className="container">
                    <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '2rem', letterSpacing: '-0.02em' }}>
                        Browse <span style={{ color: '#2563eb' }}>{total}</span> Available Jobs
                    </h1>

                    <form onSubmit={handleSearch} style={{
                        display: 'flex',
                        background: 'white',
                        padding: '0.5rem',
                        borderRadius: '20px',
                        boxShadow: '0 10px 40px rgba(0,0,0,0.08)',
                        gap: '0.5rem',
                        flexWrap: 'wrap',
                        border: '1px solid #f4f4f5'
                    }}>
                        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0 1.25rem', minWidth: '200px' }}>
                            <Search size={20} color="#94a3b8" />
                            <input
                                ref={keywordRef}
                                type="text"
                                placeholder="Job title, company, or keywords"
                                style={{ border: 'none', outline: 'none', width: '100%', height: '50px', fontSize: '1rem' }}
                            />
                        </div>
                        <div style={{ width: '1px', background: '#e4e4e7', margin: '0.75rem 0' }} className="mobile-hide" />
                        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0 1.25rem', minWidth: '200px' }}>
                            <MapPin size={20} color="#94a3b8" />
                            <input
                                ref={locationRef}
                                type="text"
                                placeholder="City, state, or remote"
                                style={{ border: 'none', outline: 'none', width: '100%', height: '50px', fontSize: '1rem' }}
                            />
                        </div>
                        <button type="submit" style={{
                            padding: '0 2.5rem',
                            background: '#2563eb',
                            color: 'white',
                            border: 'none',
                            borderRadius: '14px',
                            fontWeight: 600,
                            cursor: 'pointer',
                            fontSize: '1rem',
                            transition: 'all 0.2s',
                            boxShadow: '0 4px 12px rgba(37,99,235,0.2)'
                        }}>
                            Search
                        </button>
                    </form>
                </div>
            </div>

            <div className="container" style={{ padding: '4rem 0' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(250px, 300px) 1fr', gap: '3rem', alignItems: 'start', position: 'relative' }}>

                    {/* Sidebar Filters */}
                    <aside style={{ position: 'sticky', top: '2rem', height: 'fit-content' }} className="mobile-hide">
                        <FilterSidebar onFilterChange={handleFilterChange} />
                    </aside>

                    {/* Main Content */}
                    <main>
                        {/* Results Count & Sort */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                            <p style={{ color: '#71717a', fontSize: '0.95rem' }}>
                                Showing <strong>{jobs.length}</strong> of <strong>{total}</strong> jobs
                            </p>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <span style={{ fontSize: '0.9rem', color: '#71717a' }}>Sort by:</span>
                                <select
                                    onChange={handleSortChange}
                                    value={params.sort}
                                    style={{
                                        padding: '0.5rem 1rem',
                                        borderRadius: '8px',
                                        border: '1px solid #e4e4e7',
                                        background: 'white',
                                        fontSize: '0.9rem',
                                        outline: 'none',
                                        cursor: 'pointer'
                                    }}
                                >
                                    <option value="newest">Newest First</option>
                                    <option value="oldest">Oldest First</option>
                                    <option value="title">Title (A-Z)</option>
                                </select>
                            </div>
                        </div>

                        {/* Job List */}
                        {loading && jobs.length === 0 ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {[1, 2, 3, 4].map(i => (
                                    <div key={i} style={{ height: '180px', background: 'white', borderRadius: '16px', animation: 'pulse 2s infinite', border: '1px solid #f4f4f5' }} />
                                ))}
                            </div>
                        ) : jobs.length > 0 ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                {jobs.map((job) => (
                                    <JobCard key={job._id} {...job} />
                                ))}
                            </div>
                        ) : (
                            <div style={{ textAlign: 'center', padding: '6rem 0', background: 'white', borderRadius: '24px', border: '1px solid #e4e4e7' }}>
                                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔍</div>
                                <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>No jobs found</h3>
                                <p style={{ color: '#71717a' }}>Try adjusting your search or filters to find what you're looking for.</p>
                                <button
                                    onClick={() => {
                                        if (keywordRef.current) keywordRef.current.value = '';
                                        if (locationRef.current) locationRef.current.value = '';
                                        setParams({ keyword: '', location: '', types: [], sort: 'newest', page: 1 });
                                    }}
                                    style={{ marginTop: '2rem', background: 'none', border: '1px solid #e4e4e7', padding: '0.75rem 1.5rem', borderRadius: '10px', cursor: 'pointer', fontWeight: 600 }}
                                >
                                    Clear all filters
                                </button>
                            </div>
                        )}

                        {/* Pagination */}
                        {pages > 1 && (
                            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '4rem', alignItems: 'center' }}>
                                <button
                                    disabled={params.page === 1}
                                    onClick={() => handlePageChange(params.page - 1)}
                                    style={{
                                        padding: '0.75rem 1rem',
                                        borderRadius: '10px',
                                        border: '1px solid #e4e4e7',
                                        background: 'white',
                                        cursor: params.page === 1 ? 'not-allowed' : 'pointer',
                                        opacity: params.page === 1 ? 0.5 : 1
                                    }}
                                >
                                    Previous
                                </button>

                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    {Array.from({ length: pages }).map((_, i) => (
                                        <button
                                            key={i}
                                            onClick={() => handlePageChange(i + 1)}
                                            style={{
                                                width: '40px',
                                                height: '40px',
                                                borderRadius: '10px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontWeight: 600,
                                                cursor: 'pointer',
                                                background: params.page === i + 1 ? '#2563eb' : 'white',
                                                color: params.page === i + 1 ? 'white' : '#18181b',
                                                border: params.page === i + 1 ? 'none' : '1px solid #e4e4e7'
                                            }}
                                        >
                                            {i + 1}
                                        </button>
                                    ))}
                                </div>

                                <button
                                    disabled={params.page === pages}
                                    onClick={() => handlePageChange(params.page + 1)}
                                    style={{
                                        padding: '0.75rem 1rem',
                                        borderRadius: '10px',
                                        border: '1px solid #e4e4e7',
                                        background: 'white',
                                        cursor: params.page === pages ? 'not-allowed' : 'pointer',
                                        opacity: params.page === pages ? 0.5 : 1
                                    }}
                                >
                                    Next
                                </button>
                            </div>
                        )}
                    </main>
                </div>
            </div>
            {loading && jobs.length > 0 && (
                <div style={{
                    position: 'fixed', bottom: '2rem', right: '2rem',
                    background: 'white', padding: '0.75rem 1.5rem', borderRadius: '99px',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', gap: '0.75rem',
                    zIndex: 100, border: '1px solid #e4e4e7'
                }}>
                    <Loader2 size={20} className="spin" color="#2563eb" />
                    <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>Updating...</span>
                </div>
            )}
        </div>
    );
}
