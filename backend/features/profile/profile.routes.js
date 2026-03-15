const express = require('express');
const router = express.Router();
const {
    profileValidation,
    getProfile,
    updateProfile,
    uploadAvatar,
    uploadResume,
    uploadLogo,
    getCompleteness,
    getPublicProfile,
} = require('./profile.controller');
const { protect } = require('../../middleware/authMiddleware');
const { upload, resumeUpload } = require('../../middleware/uploadMiddleware');

// Private routes (require auth)
router.route('/')
    .get(protect, getProfile)
    .put(protect, profileValidation, updateProfile);

router.get('/completeness', protect, getCompleteness);

router.post('/upload-avatar', protect, upload.single('avatar'), uploadAvatar);
router.post('/upload-resume', protect, resumeUpload.single('resume'), uploadResume);
router.post('/upload-logo', protect, upload.single('logo'), uploadLogo);

// Public route — must come last (catches :id param)
router.get('/:id', getPublicProfile);

module.exports = router;
