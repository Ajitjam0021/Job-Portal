const Application = require('./application.model');
const Job = require('../jobs/job.model');

// @desc    Apply for a job
// @route   POST /api/applications/:jobId
// @access  Private (Candidate only)
const applyJob = async (req, res) => {
    try {
        const jobId = req.params.jobId;
        const userId = req.user._id || req.user.id;
        const job = await Job.findById(jobId);
        if (!job) return res.status(404).json({ message: 'Job not found' });

        // Validate resume is provided
        if (!req.body.resume) {
            return res.status(400).json({ message: 'Please upload a resume before applying' });
        }

        const exists = await Application.findOne({ job: jobId, applicant: userId });
        if (exists) return res.status(400).json({ message: 'You have already applied for this job' });

        const application = await Application.create({
            job: jobId,
            applicant: userId,
            resume: req.body.resume,
            coverLetter: req.body.coverLetter,
        });

        const populated = await application.populate('job', 'title company location type salary');
        res.status(201).json(populated);
    } catch (err) {
        console.error('applyJob error:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get current user's applications
// @route   GET /api/applications/me
// @access  Private
const getMyApplications = async (req, res) => {
    try {
        const apps = await Application.find({ applicant: req.user._id || req.user.id })
            .populate('job', 'title company location type salary')
            .sort('-appliedAt')
            .lean();
        res.status(200).json(apps);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get applications for a specific job (Employer only)
// @route   GET /api/applications/job/:jobId
// @access  Private (Employer only)
const getJobApplications = async (req, res) => {
    try {
        if (!req.user || req.user.role !== 'employer') {
            return res.status(403).json({ message: 'Only employers can view job applications' });
        }
        // Verify job belongs to this employer
        const job = await Job.findById(req.params.jobId);
        if (!job) return res.status(404).json({ message: 'Job not found' });
        if (job.postedBy.toString() !== (req.user._id || req.user.id).toString()) {
            return res.status(403).json({ message: 'Not authorised' });
        }

        const apps = await Application.find({ job: req.params.jobId })
            .populate('applicant', 'name email avatar headline skills')
            .sort('-appliedAt')
            .lean();
        res.status(200).json(apps);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Update application status (Employer only)
// @route   PATCH /api/applications/:id/status
// @access  Private (Employer only)
const updateApplicationStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const valid = ['pending', 'reviewed', 'shortlisted', 'rejected', 'accepted'];
        if (!valid.includes(status)) {
            return res.status(400).json({ message: `Invalid status. Must be one of: ${valid.join(', ')}` });
        }

        const app = await Application.findById(req.params.id).populate('job');
        if (!app) return res.status(404).json({ message: 'Application not found' });

        // Verify employer owns the job
        if (app.job.postedBy.toString() !== (req.user._id || req.user.id).toString()) {
            return res.status(403).json({ message: 'Not authorised' });
        }

        app.status = status;
        await app.save();

        const populated = await app.populate('applicant', 'name email avatar headline skills');
        res.status(200).json(populated);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { applyJob, getMyApplications, getJobApplications, updateApplicationStatus };
