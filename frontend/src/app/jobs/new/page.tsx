import Button from '@/components/Button';
import Input from '@/components/Input';
import Link from 'next/link';

export const metadata = {
    title: 'Post a Job | Job Listing Portal',
};

export default function PostJobPage() {
    return (
        <div className="container" style={{ padding: '4rem 1.5rem', maxWidth: '800px' }}>
            <div style={{ marginBottom: '2rem' }}>
                <Link href="/dashboard/employer" style={{ color: 'var(--muted-foreground)', fontSize: '0.875rem' }}>
                    ← Back to Dashboard
                </Link>
                <h1 style={{ fontSize: '2rem', fontWeight: 700, marginTop: '1rem', marginBottom: '0.5rem' }}>Post a New Job</h1>
                <p style={{ color: 'var(--muted-foreground)' }}>Find your next great hire.</p>
            </div>

            <form style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '1.5rem',
                backgroundColor: 'var(--background)',
                padding: '2rem',
                borderRadius: 'var(--radius)',
                border: '1px solid var(--border)'
            }}>
                <Input label="Job Title" placeholder="e.g. Senior Product Designer" required />

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <Input label="Company Name" placeholder="e.g. Acme Inc" required />
                    <Input label="Location" placeholder="e.g. Remote, NY" required />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>Job Type</label>
                        <select style={{
                            height: '2.5rem',
                            borderRadius: 'var(--radius)',
                            border: '1px solid var(--border)',
                            padding: '0 0.75rem',
                            backgroundColor: 'transparent'
                        }}>
                            <option>Full-time</option>
                            <option>Part-time</option>
                            <option>Contract</option>
                            <option>Freelance</option>
                        </select>
                    </div>

                    <Input label="Salary Range" placeholder="e.g. $100k - $120k" />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>Job Description</label>
                    <textarea
                        rows={6}
                        placeholder="Describe the role, responsibilities, and requirements..."
                        style={{
                            borderRadius: 'var(--radius)',
                            border: '1px solid var(--border)',
                            padding: '0.75rem',
                            fontFamily: 'inherit',
                            fontSize: '0.875rem',
                            resize: 'vertical',
                            backgroundColor: 'transparent'
                        }}
                        required
                    />
                </div>

                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
                    <Link href="/dashboard/employer">
                        <Button variant="ghost" type="button">Cancel</Button>
                    </Link>
                    <Button type="submit">Post Job</Button>
                </div>
            </form>
        </div>
    );
}
