const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Sub-schemas for structured data
const experienceSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true },
    company: { type: String, required: true, trim: true },
    startDate: { type: String, default: '' },
    endDate: { type: String, default: '' },
    current: { type: Boolean, default: false },
    description: { type: String, default: '' },
}, { _id: true });

const educationSchema = new mongoose.Schema({
    degree: { type: String, required: true, trim: true },
    institution: { type: String, required: true, trim: true },
    startYear: { type: String, default: '' },
    endYear: { type: String, default: '' },
    description: { type: String, default: '' },
}, { _id: true });

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a name'],
        trim: true,
        maxlength: [50, 'Name cannot exceed 50 characters'],
    },
    email: {
        type: String,
        required: [true, 'Please add an email'],
        unique: true,
        lowercase: true,
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            'Please add a valid email'
        ]
    },
    phone: { type: String, default: '', trim: true },
    password: {
        type: String,
        required: [true, 'Please add a password'],
        minlength: 8,
        select: false,
    },
    role: {
        type: String,
        enum: ['candidate', 'employer'],
        default: 'candidate'
    },
    avatar: { type: String, default: '' },
    avatarPublicId: { type: String, default: '' },
    headline: { type: String, default: '', trim: true, maxlength: 120 },

    // Structured location
    location: {
        city: { type: String, default: '' },
        state: { type: String, default: '' },
        country: { type: String, default: '' },
    },

    // — Candidate-specific fields —
    bio: { type: String, default: '', maxlength: 1000 },
    skills: { type: [String], default: [] },
    experience: { type: [experienceSchema], default: [] },
    education: { type: [educationSchema], default: [] },
    resume: { type: String, default: '' },
    resumePublicId: { type: String, default: '' },
    resumeResourceType: { type: String, default: 'raw' },
    resumeFileName: { type: String, default: '' },
    socialLinks: {
        linkedin: { type: String, default: '' },
        github: { type: String, default: '' },
        portfolio: { type: String, default: '' },
        twitter: { type: String, default: '' },
    },

    // — Employer-specific fields —
    company: { type: String, default: '', trim: true },
    companyDescription: { type: String, default: '', maxlength: 2000 },
    industry: { type: String, default: '' },
    companySize: { type: String, default: '' },
    website: { type: String, default: '' },
    logo: { type: String, default: '' },
    logoPublicId: { type: String, default: '' },
    companyBenefits: { type: [String], default: [] },
    companySocialLinks: {
        linkedin: { type: String, default: '' },
        twitter: { type: String, default: '' },
        facebook: { type: String, default: '' },
    },

    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});

// Auto-update `updatedAt` and sanitise array fields on save
userSchema.pre('save', async function (next) {
    this.updatedAt = new Date();

    // Sanitise: ensure array fields are always arrays (never strings)
    const arrayFields = ['skills', 'experience', 'education', 'companyBenefits'];
    for (const f of arrayFields) {
        if (this[f] !== undefined && !Array.isArray(this[f])) {
            this[f] = [];
        }
    }

    if (!this.isModified('password')) {
        return next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Compare passwords
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

/**
 * Calculate profile completeness (0–100).
 * Weighted by field importance.
 */
userSchema.methods.getCompleteness = function () {
    const missing = [];

    if (this.role === 'candidate') {
        const checks = [
            { field: 'name', weight: 10, label: 'Full Name' },
            { field: 'avatar', weight: 8, label: 'Profile Photo' },
            { field: 'headline', weight: 10, label: 'Professional Headline' },
            { field: 'bio', weight: 10, label: 'Bio / Summary' },
            { field: 'phone', weight: 5, label: 'Phone Number' },
            { field: 'location.city', weight: 5, label: 'Location' },
            { field: 'skills', weight: 12, label: 'Skills', isArray: true },
            { field: 'experience', weight: 15, label: 'Work Experience', isArray: true },
            { field: 'education', weight: 10, label: 'Education', isArray: true },
            { field: 'resume', weight: 10, label: 'Resume' },
            { field: 'socialLinks.linkedin', weight: 5, label: 'LinkedIn Profile' },
        ];

        let earned = 0, total = 0;
        for (const c of checks) {
            total += c.weight;
            const val = c.field.includes('.')
                ? c.field.split('.').reduce((o, k) => o?.[k], this)
                : this[c.field];
            const filled = c.isArray ? (Array.isArray(val) && val.length > 0) : !!val;
            if (filled) earned += c.weight;
            else missing.push(c.label);
        }
        return { score: Math.round((earned / total) * 100), missing };
    }

    if (this.role === 'employer') {
        const checks = [
            { field: 'name', weight: 8, label: 'Contact Name' },
            { field: 'company', weight: 15, label: 'Company Name' },
            { field: 'logo', weight: 10, label: 'Company Logo' },
            { field: 'companyDescription', weight: 12, label: 'Company Description' },
            { field: 'industry', weight: 10, label: 'Industry' },
            { field: 'companySize', weight: 8, label: 'Company Size' },
            { field: 'phone', weight: 5, label: 'Phone Number' },
            { field: 'location.city', weight: 5, label: 'Office Location' },
            { field: 'website', weight: 10, label: 'Company Website' },
            { field: 'companyBenefits', weight: 10, label: 'Benefits & Perks', isArray: true },
            { field: 'companySocialLinks.linkedin', weight: 7, label: 'LinkedIn Page' },
        ];

        let earned = 0, total = 0;
        for (const c of checks) {
            total += c.weight;
            const val = c.field.includes('.')
                ? c.field.split('.').reduce((o, k) => o?.[k], this)
                : this[c.field];
            const filled = c.isArray ? (Array.isArray(val) && val.length > 0) : !!val;
            if (filled) earned += c.weight;
            else missing.push(c.label);
        }
        return { score: Math.round((earned / total) * 100), missing };
    }

    return { score: 0, missing: [] };
};

module.exports = mongoose.model('User', userSchema);
