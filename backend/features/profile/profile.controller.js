const asyncHandler = require('express-async-handler');
const mongoose = require('mongoose');
const { body, param, validationResult } = require('express-validator');
const User = require('../auth/user.model');
const { uploadToCloudinary, deleteFromCloudinary } = require('../../middleware/uploadMiddleware');

// ─── Validation rules ────────────────────────────────────────

const profileValidation = [
    body('name').optional().trim().isLength({ min: 2, max: 50 })
        .withMessage('Name must be 2–50 characters'),
    body('phone').optional().trim()
        .matches(/^[\+]?[(]?[0-9]{1,4}[)]?[-\s\./0-9]*$/)
        .withMessage('Invalid phone format'),
    body('headline').optional().trim().isLength({ max: 120 })
        .withMessage('Headline max 120 characters'),
    body('bio').optional().trim().isLength({ max: 1000 })
        .withMessage('Bio max 1000 characters'),
    body('skills').optional().isArray({ max: 30 })
        .withMessage('Skills must be an array (max 30)'),
    body('skills.*').optional().trim().isLength({ min: 1, max: 50 })
        .withMessage('Each skill max 50 characters'),
    body('experience').optional().isArray({ max: 20 })
        .withMessage('Experience entries max 20'),
    body('experience.*.title').optional().trim().notEmpty()
        .withMessage('Experience title required'),
    body('experience.*.company').optional().trim().notEmpty()
        .withMessage('Company name required'),
    body('education').optional().isArray({ max: 20 })
        .withMessage('Education entries max 20'),
    body('education.*.degree').optional().trim().notEmpty()
        .withMessage('Degree required'),
    body('education.*.institution').optional().trim().notEmpty()
        .withMessage('Institution required'),
    body('website').optional().trim(),
    body('companyDescription').optional().trim().isLength({ max: 2000 })
        .withMessage('Description max 2000 characters'),
    body('companyBenefits').optional().isArray({ max: 30 })
        .withMessage('Benefits must be an array (max 30)'),
];

/** Handle validation errors */
const handleValidation = (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(400);
        throw new Error(errors.array().map(e => e.msg).join(', '));
    }
};

// ─── GET /api/profile — own profile ──────────────────────────

const getProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    const completeness = user.getCompleteness();
    res.json({ ...user.toObject(), completeness });
});

// ─── PUT /api/profile — update own profile ───────────────────

const updateProfile = asyncHandler(async (req, res) => {
    handleValidation(req, res);

    const user = await User.findById(req.user._id);
    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    // Sanitise array fields — convert empty strings / non-arrays to []
    const arrayFields = ['skills', 'experience', 'education', 'companyBenefits'];
    for (const f of arrayFields) {
        if (req.body[f] !== undefined && !Array.isArray(req.body[f])) {
            req.body[f] = [];
        }
    }

    // Common fields
    const commonFields = ['name', 'phone', 'headline', 'avatar', 'location'];
    for (const f of commonFields) {
        if (req.body[f] !== undefined) user[f] = req.body[f];
    }

    // Candidate fields
    if (user.role === 'candidate') {
        const candidateFields = ['bio', 'skills', 'experience', 'education', 'resume', 'socialLinks'];
        for (const f of candidateFields) {
            if (req.body[f] !== undefined) user[f] = req.body[f];
        }
    }

    // Employer fields
    if (user.role === 'employer') {
        const employerFields = [
            'company', 'companyDescription', 'industry', 'companySize',
            'website', 'logo', 'companyBenefits', 'companySocialLinks'
        ];
        for (const f of employerFields) {
            if (req.body[f] !== undefined) user[f] = req.body[f];
        }
    }

    try {
        const saved = await user.save({ validateModifiedOnly: true });
        const completeness = saved.getCompleteness();
        const obj = saved.toObject();
        delete obj.password;
        res.json({ ...obj, completeness });
    } catch (err) {
        if (err.name === 'ValidationError') {
            const unique = [...new Set(Object.values(err.errors).map(e => {
                const field = e.path || 'this field';
                if (e.message.includes('is required')) return `Please fill in ${field}`;
                return 'There was a problem saving your profile. Please check your details and try again.';
            }))];
            res.status(400);
            throw new Error(unique.join('. '));
        }
        throw err;
    }
});

// ─── POST /api/profile/upload-avatar — upload avatar ─────────

const uploadAvatar = asyncHandler(async (req, res) => {
    if (!req.file) {
        res.status(400);
        throw new Error('Please select a photo to upload');
    }

    const user = await User.findById(req.user._id);
    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    // Delete old avatar if exists
    if (user.avatarPublicId) {
        await deleteFromCloudinary(user.avatarPublicId);
    }

    const result = await uploadToCloudinary(req.file.buffer, 'avatars', 'image', '', req.file.mimetype);

    // Use findByIdAndUpdate to avoid full-document validation
    await User.findByIdAndUpdate(req.user._id, {
        avatar: result.url,
        avatarPublicId: result.publicId,
    });

    res.json({ avatar: result.url, message: 'Profile photo uploaded!' });
});

const fs = require('fs');
const path = require('path');

// ─── POST /api/profile/upload-resume — upload resume (LOCAL) ─

const uploadResume = asyncHandler(async (req, res) => {
    if (!req.file) {
        res.status(400);
        throw new Error('Please select a file to upload');
    }

    const user = await User.findById(req.user._id);
    if (!user || user.role !== 'candidate') {
        res.status(403);
        throw new Error('Only candidates can upload resumes');
    }

    // Delete old resume if it exists locally
    if (user.resume && user.resume.startsWith('/uploads/')) {
        const oldPath = path.join(__dirname, '../../..', user.resume);
        if (fs.existsSync(oldPath)) {
            try {
                fs.unlinkSync(oldPath);
            } catch (err) {
                console.error('Local delete error:', err.message);
            }
        }
    } else if (user.resumePublicId) {
        // Fallback for old Cloudinary files
        await deleteFromCloudinary(user.resumePublicId, user.resumeResourceType || 'raw');
    }

    // Construct local URL path
    const fileUrl = `/uploads/resumes/${req.file.filename}`;

    await User.findByIdAndUpdate(req.user._id, {
        resume: fileUrl,
        resumePublicId: '', // Clear cloudinary ID
        resumeResourceType: 'local',
        resumeFileName: req.file.originalname,
    });

    res.json({
        resume: fileUrl,
        resumeFileName: req.file.originalname,
        message: 'Resume uploaded locally!',
    });
});

// ─── POST /api/profile/upload-logo — upload company logo ─────

const uploadLogo = asyncHandler(async (req, res) => {
    if (!req.file) {
        res.status(400);
        throw new Error('Please select an image to upload');
    }

    const user = await User.findById(req.user._id);
    if (!user || user.role !== 'employer') {
        res.status(403);
        throw new Error('Only employers can upload logos');
    }

    if (user.logoPublicId) {
        await deleteFromCloudinary(user.logoPublicId);
    }

    const result = await uploadToCloudinary(req.file.buffer, 'logos', 'image', '', req.file.mimetype);

    // Use findByIdAndUpdate to avoid full-document validation
    await User.findByIdAndUpdate(req.user._id, {
        logo: result.url,
        logoPublicId: result.publicId,
    });

    res.json({ logo: result.url, message: 'Logo uploaded!' });
});

// ─── GET /api/profile/completeness — profile score ───────────

const getCompleteness = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }
    res.json(user.getCompleteness());
});

// ─── GET /api/profile/:id — public profile ───────────────────

const getPublicProfile = asyncHandler(async (req, res) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        res.status(400);
        throw new Error('Invalid profile ID format');
    }

    const user = await User.findById(req.params.id).select(
        '-password -avatarPublicId -resumePublicId -logoPublicId -__v'
    );

    if (!user) {
        res.status(404);
        throw new Error('Profile not found');
    }

    // Strip sensitive contact info for candidate public profiles
    const profile = user.toObject();
    if (profile.role === 'candidate') {
        delete profile.email;
        delete profile.phone;
    }

    res.json(profile);
});

module.exports = {
    profileValidation,
    getProfile,
    updateProfile,
    uploadAvatar,
    uploadResume,
    uploadLogo,
    getCompleteness,
    getPublicProfile,
};
