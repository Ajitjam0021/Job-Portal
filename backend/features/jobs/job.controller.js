const mongoose = require('mongoose');
const Job = require('./job.model');
const Application = require('../applications/application.model');

// @desc    Get all jobs
// @route   GET /api/jobs
// @access  Public
const getJobs = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        const total = await Job.countDocuments({ status: 'active' });
        const jobs = await Job.find({ status: 'active' })
            .populate('postedBy', 'name company')
            .sort('-createdAt')
            .skip(skip)
            .limit(limit)
            .lean();

        res.status(200).json({
            jobs,
            total,
            page,
            pages: Math.ceil(total / limit)
        });
    } catch (err) {
        console.error('getJobs error:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get single job
// @route   GET /api/jobs/:id
// @access  Public
const getJob = async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ message: 'Invalid job ID' });
        }
        const job = await Job.findById(req.params.id)
            .populate('postedBy', 'name company email')
            .lean();
        if (!job) return res.status(404).json({ message: 'Job not found' });
        res.status(200).json(job);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Create new job
// @route   POST /api/jobs
// @access  Private (Employer only)
const createJob = async (req, res) => {
    try {
        const job = await Job.create({ ...req.body, postedBy: req.user._id || req.user.id });
        const populated = await job.populate('postedBy', 'name company');
        res.status(201).json(populated);
    } catch (err) {
        if (err.name === 'ValidationError') {
            const msgs = Object.values(err.errors).map(e => e.message);
            return res.status(400).json({ message: msgs.join(', ') });
        }
        console.error('createJob error:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Update job
// @route   PUT /api/jobs/:id
// @access  Private (Owner only)
const updateJob = async (req, res) => {
    try {
        const job = await Job.findById(req.params.id);
        if (!job) return res.status(404).json({ message: 'Job not found' });
        const ownerId = req.user._id || req.user.id;
        if (job.postedBy.toString() !== ownerId.toString()) {
            return res.status(403).json({ message: 'Not authorised' });
        }
        // Whitelist editable fields to prevent mass assignment
        const allowed = ['title', 'company', 'location', 'type', 'salary',
            'description', 'requirements', 'qualifications', 'responsibilities'];
        for (const key of allowed) {
            if (req.body[key] !== undefined) job[key] = req.body[key];
        }
        await job.save();
        res.status(200).json(job);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Delete job
// @route   DELETE /api/jobs/:id
// @access  Private (Owner only)
const deleteJob = async (req, res) => {
    try {
        const job = await Job.findById(req.params.id);
        if (!job) return res.status(404).json({ message: 'Job not found' });
        if (job.postedBy.toString() !== (req.user._id || req.user.id).toString()) {
            return res.status(403).json({ message: 'Not authorised' });
        }
        await job.deleteOne();

        // Cascade delete: Remove all applications associated with this job
        await Application.deleteMany({ job: req.params.id });

        res.status(200).json({ id: req.params.id });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get employer's own jobs
// @route   GET /api/jobs/mine
// @access  Private (Employer only)
const getMyJobs = async (req, res) => {
    try {
        const jobs = await Job.find({ postedBy: req.user._id || req.user.id })
            .sort('-createdAt')
            .lean();
        res.status(200).json(jobs);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get jobs by employer ID
// @route   GET /api/jobs/employer/:id
// @access  Public
const getJobsByEmployer = async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ message: 'Invalid employer ID' });
        }
        const jobs = await Job.find({ postedBy: req.params.id, status: 'active' })
            .sort('-createdAt')
            .lean();
        res.status(200).json(jobs);
    } catch (err) {
        console.error('getJobsByEmployer error:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { getJobs, getJob, createJob, updateJob, deleteJob, getMyJobs, getJobsByEmployer };
