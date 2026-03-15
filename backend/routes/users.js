const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Job = require('../models/Job');
const { protect } = require('../middleware/auth');

// @route   GET /api/users/saved-jobs
// @desc    Get user's saved jobs
// @access  Private
router.get('/saved-jobs', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate({
      path: 'savedJobs',
      match: { status: 'active' }
    });

    res.json({
      success: true,
      data: user.savedJobs
    });
  } catch (error) {
    console.error('Get saved jobs error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/users/dashboard
// @desc    Get user dashboard stats
// @access  Private
router.get('/dashboard', protect, async (req, res) => {
  try {
    let stats = {};

    if (req.user.role === 'candidate') {
      // Candidate stats
      const applications = []; // You'll need Application model
      stats = {
        totalApplications: applications.length,
        savedJobs: req.user.savedJobs.length,
        profileViews: 0,
        // Add more stats
      };
    } else {
      // Employer stats
      const postedJobs = await Job.countDocuments({ postedBy: req.user._id });
      const activeJobs = await Job.countDocuments({ 
        postedBy: req.user._id, 
        status: 'active' 
      });
      
      stats = {
        postedJobs,
        activeJobs,
        totalApplications: 0, // You'll need Application model
        // Add more stats
      };
    }

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;