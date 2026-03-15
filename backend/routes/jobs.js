const express = require('express');
const router = express.Router();
const { body, query, validationResult } = require('express-validator');
const Job = require('../models/Job');
const { protect, authorize } = require('../middleware/auth');

// @route   GET /api/jobs
// @desc    Get all jobs with filters
// @access  Public
router.get('/', [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 50 }),
  query('search').optional().trim(),
  query('location').optional().trim(),
  query('type').optional().trim(),
  query('category').optional().trim(),
  query('minSalary').optional().isInt(),
  query('maxSalary').optional().isInt(),
  query('sort').optional().isIn(['newest', 'oldest', 'salary-high', 'salary-low'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const {
      page = 1,
      limit = 10,
      search,
      location,
      type,
      category,
      minSalary,
      maxSalary,
      sort = 'newest'
    } = req.query;

    // Build filter
    const filter = { status: 'active' };

    if (search) {
      filter.$text = { $search: search };
    }

    if (location) {
      filter.location = { $regex: location, $options: 'i' };
    }

    if (type) {
      filter.type = type;
    }

    if (category) {
      filter.category = category;
    }

    if (minSalary || maxSalary) {
      filter['salary.min'] = {};
      if (minSalary) filter['salary.min'].$gte = parseInt(minSalary);
      if (maxSalary) filter['salary.min'].$lte = parseInt(maxSalary);
    }

    // Build sort
    let sortOption = {};
    switch (sort) {
      case 'newest':
        sortOption = { createdAt: -1 };
        break;
      case 'oldest':
        sortOption = { createdAt: 1 };
        break;
      case 'salary-high':
        sortOption = { 'salary.max': -1 };
        break;
      case 'salary-low':
        sortOption = { 'salary.min': 1 };
        break;
      default:
        sortOption = { createdAt: -1 };
    }

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Execute query
    const jobs = await Job.find(filter)
      .populate('postedBy', 'fullName companyName')
      .sort(sortOption)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Job.countDocuments(filter);

    res.json({
      success: true,
      data: jobs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get jobs error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/jobs/:id
// @desc    Get single job
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate('postedBy', 'fullName companyName companyLogo companyDescription');

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    // Increment views
    job.views += 1;
    await job.save();

    res.json({
      success: true,
      data: job
    });
  } catch (error) {
    console.error('Get job error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   POST /api/jobs
// @desc    Create a job
// @access  Private (Employer only)
router.post('/',
  protect,
  authorize('employer'),
  [
    body('title').notEmpty().trim(),
    body('company').notEmpty().trim(),
    body('location').notEmpty().trim(),
    body('type').isIn(['Full Time', 'Part Time', 'Contract', 'Internship', 'Remote']),
    body('category').notEmpty(),
    body('description').notEmpty().isLength({ min: 50 }),
    body('salary.min').optional().isInt(),
    body('salary.max').optional().isInt()
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const job = await Job.create({
        ...req.body,
        postedBy: req.user._id
      });

      res.status(201).json({
        success: true,
        data: job
      });
    } catch (error) {
      console.error('Create job error:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }
);

// @route   PUT /api/jobs/:id
// @desc    Update a job
// @access  Private (Employer only)
router.put('/:id',
  protect,
  authorize('employer'),
  async (req, res) => {
    try {
      let job = await Job.findById(req.params.id);

      if (!job) {
        return res.status(404).json({
          success: false,
          message: 'Job not found'
        });
      }

      // Check ownership
      if (job.postedBy.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to update this job'
        });
      }

      job = await Job.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
      );

      res.json({
        success: true,
        data: job
      });
    } catch (error) {
      console.error('Update job error:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }
);

// @route   DELETE /api/jobs/:id
// @desc    Delete a job
// @access  Private (Employer only)
router.delete('/:id',
  protect,
  authorize('employer'),
  async (req, res) => {
    try {
      const job = await Job.findById(req.params.id);

      if (!job) {
        return res.status(404).json({
          success: false,
          message: 'Job not found'
        });
      }

      // Check ownership
      if (job.postedBy.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to delete this job'
        });
      }

      await job.deleteOne();

      res.json({
        success: true,
        message: 'Job deleted successfully'
      });
    } catch (error) {
      console.error('Delete job error:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }
);

// @route   POST /api/jobs/:id/save
// @desc    Save/unsave a job
// @access  Private
router.post('/:id/save', protect, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    const user = req.user;
    const isSaved = user.savedJobs.includes(job._id);

    if (isSaved) {
      // Unsave
      user.savedJobs = user.savedJobs.filter(id => id.toString() !== job._id.toString());
      job.savedBy = job.savedBy.filter(id => id.toString() !== user._id.toString());
    } else {
      // Save
      user.savedJobs.push(job._id);
      job.savedBy.push(user._id);
    }

    await user.save();
    await job.save();

    res.json({
      success: true,
      saved: !isSaved
    });
  } catch (error) {
    console.error('Save job error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;