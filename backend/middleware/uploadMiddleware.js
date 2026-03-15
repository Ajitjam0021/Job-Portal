const multer = require('multer');
const cloudinary = require('../config/cloudinary');
const path = require('path');

// Memory storage — files stay in buffer, uploaded to Cloudinary directly
const storage = multer.memoryStorage();

// Disk storage for resumes specifically
const resumeStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/resumes');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, file.fieldname + '-' + uniqueSuffix + ext);
    }
});

// File filter: allow images + PDFs
const fileFilter = (req, file, cb) => {
    const allowedImages = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    const allowedDocs = ['application/pdf'];

    if ([...allowedImages, ...allowedDocs].includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Allowed: JPEG, PNG, WebP, GIF, PDF'), false);
    }
};

// Cloudinary upload instance
const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 },
});

// Local resume upload instance
const resumeUpload = multer({
    storage: resumeStorage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/pdf') {
            cb(null, true);
        } else {
            cb(new Error('Only PDF files are allowed for resumes'), false);
        }
    },
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB for resumes
});

const uploadToCloudinary = async (buffer, folder, resourceType = 'auto', fileName = '', mimetype = '') => {
    try {
        // Convert buffer to Data URI for more robust upload
        const b64 = buffer.toString('base64');
        const dataURI = `data:${mimetype || 'application/octet-stream'};base64,${b64}`;

        const result = await cloudinary.uploader.upload(dataURI, {
            folder: `job-portal/${folder}`,
            resource_type: resourceType,
            public_id: fileName ? fileName.split('.')[0] : undefined,
            transformation: folder === 'avatars'
                ? [{ width: 400, height: 400, crop: 'fill', gravity: 'face', quality: 'auto' }]
                : folder === 'logos'
                    ? [{ width: 500, height: 500, crop: 'limit', quality: 'auto' }]
                    : undefined,
        });

        return {
            url: result.secure_url,
            publicId: result.public_id,
            resourceType: result.resource_type
        };
    } catch (error) {
        throw error;
    }
};

/**
 * Delete a file from Cloudinary by public ID.
 */
const deleteFromCloudinary = async (publicId, resourceType = 'image') => {
    try {
        await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
    } catch (err) {
        console.error('Cloudinary delete error:', err.message);
    }
};

module.exports = { upload, resumeUpload, uploadToCloudinary, deleteFromCloudinary };
