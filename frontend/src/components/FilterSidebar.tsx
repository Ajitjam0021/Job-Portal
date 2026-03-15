"use client";

import { useState } from 'react';
import { SlidersHorizontal, Check, RotateCcw } from 'lucide-react';

interface FilterState {
    types: string[];
    location: string;
}

interface Props {
    onFilterChange: (filters: FilterState) => void;
}

const JOB_TYPES = ['Full-time', 'Part-time', 'Contract', 'Internship', 'Freelance'];
const LOCATIONS = ['Remote', 'On-site', 'Hybrid'];

export default function FilterSidebar({ onFilterChange }: Props) {
    const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
    const [selectedLocation, setSelectedLocation] = useState('');

    const toggleType = (type: string) => {
        const updated = selectedTypes.includes(type)
            ? selectedTypes.filter(t => t !== type)
            : [...selectedTypes, type];
        setSelectedTypes(updated);
        onFilterChange({ types: updated, location: selectedLocation });
    };

    const selectLocation = (loc: string) => {
        const updated = selectedLocation === loc ? '' : loc;
        setSelectedLocation(updated);
        onFilterChange({ types: selectedTypes, location: updated });
    };

    const clearAll = () => {
        setSelectedTypes([]);
        setSelectedLocation('');
        onFilterChange({ types: [], location: '' });
    };

    const hasFilters = selectedTypes.length > 0 || selectedLocation;

    const checkboxStyle = (active: boolean) => ({
        width: '20px',
        height: '20px',
        borderRadius: '6px',
        border: active ? '2px solid #2563eb' : '2px solid #d4d4d8',
        display: 'flex' as const,
        alignItems: 'center' as const,
        justifyContent: 'center' as const,
        background: active ? '#2563eb' : 'white',
        transition: 'all 0.15s ease',
        flexShrink: 0,
    });

    return (
        <div style={{ background: 'white', padding: '1.5rem', borderRadius: '16px', border: '1px solid #e4e4e7' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <SlidersHorizontal size={20} />
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>Filters</h3>
                </div>
                {hasFilters && (
                    <button
                        onClick={clearAll}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '0.3rem',
                            background: 'none', border: 'none', color: '#2563eb',
                            fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer',
                        }}
                    >
                        <RotateCcw size={14} /> Clear
                    </button>
                )}
            </div>

            {/* Job Type */}
            <div style={{ marginBottom: '2rem' }}>
                <h4 style={{
                    fontSize: '0.85rem', fontWeight: 700, color: '#71717a',
                    marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em',
                }}>
                    Job Type
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {JOB_TYPES.map(type => {
                        const active = selectedTypes.includes(type);
                        return (
                            <label
                                key={type}
                                onClick={() => toggleType(type)}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: '0.75rem',
                                    cursor: 'pointer', fontSize: '0.95rem', color: '#18181b',
                                }}
                            >
                                <div style={checkboxStyle(active)}>
                                    {active && <Check size={14} color="white" strokeWidth={3} />}
                                </div>
                                {type}
                            </label>
                        );
                    })}
                </div>
            </div>

            {/* Work Location */}
            <div style={{ marginBottom: '2rem' }}>
                <h4 style={{
                    fontSize: '0.85rem', fontWeight: 700, color: '#71717a',
                    marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em',
                }}>
                    Work Location
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {LOCATIONS.map(loc => {
                        const active = selectedLocation === loc;
                        return (
                            <label
                                key={loc}
                                onClick={() => selectLocation(loc)}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: '0.75rem',
                                    cursor: 'pointer', fontSize: '0.95rem', color: '#18181b',
                                }}
                            >
                                <div style={checkboxStyle(active)}>
                                    {active && <Check size={14} color="white" strokeWidth={3} />}
                                </div>
                                {loc}
                            </label>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
