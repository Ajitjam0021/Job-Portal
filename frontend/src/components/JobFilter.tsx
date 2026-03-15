import Button from './Button';
import Input from './Input';

export default function JobFilter() {
    return (
        <div style={{
            backgroundColor: 'var(--background)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius)',
            padding: '1.5rem',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem',
            alignItems: 'end',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
        }}>
            <Input placeholder="Job title or keyword" icon={<span>🔍</span>} />
            <Input placeholder="Location (e.g. Remote)" icon={<span>📍</span>} />

            <div style={{ display: 'flex', gap: '0.5rem' }}>
                <select style={{
                    height: '2.5rem',
                    width: '100%',
                    borderRadius: 'var(--radius)',
                    border: '1px solid var(--border)',
                    padding: '0 0.75rem',
                    backgroundColor: 'transparent',
                    fontSize: '0.875rem',
                    color: 'var(--foreground)'
                }}>
                    <option value="">Job Type</option>
                    <option value="full-time">Full-time</option>
                    <option value="part-time">Part-time</option>
                    <option value="contract">Contract</option>
                    <option value="freelance">Freelance</option>
                </select>
            </div>

            <Button variant="primary" style={{ width: '100%' }}>
                Search Jobs
            </Button>
        </div>
    );
}
