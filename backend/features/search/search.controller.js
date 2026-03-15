const Job = require('../jobs/job.model');

// @desc    Search jobs with filters
// @route   GET /api/search
// @access  Public
const searchJobs = async (req, res) => {
    try {
        const { keyword, location, type, sort, page = 1, limit = 20 } = req.query;
        const query = { status: 'active' };

        // Keyword search — matches title, company, or description using Text Index
        if (keyword && keyword.trim()) {
            query.$text = { $search: keyword.trim() };
        }

        // Location filter (case-insensitive partial match)
        if (location && location.trim()) {
            query.location = { $regex: location.trim(), $options: 'i' };
        }

        // Job type filter — can be comma-separated (e.g., "Full-time,Part-time")
        if (type && type.trim()) {
            const types = type.split(',').map(t => t.trim()).filter(Boolean);
            if (types.length > 0) {
                query.type = { $in: types };
            }
        }

        // Sort options
        let sortOption = { createdAt: -1 }; // default: newest
        if (sort === 'oldest') sortOption = { createdAt: 1 };
        if (sort === 'title') sortOption = { title: 1 };

        // Pagination
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const [jobs, total] = await Promise.all([
            Job.find(query)
                .populate('postedBy', 'name company avatar')
                .sort(sortOption)
                .skip(skip)
                .limit(parseInt(limit))
                .lean(),
            Job.countDocuments(query),
        ]);

        res.json({
            jobs,
            total,
            page: parseInt(page),
            pages: Math.ceil(total / parseInt(limit)),
        });
    } catch (err) {
        console.error('searchJobs error:', err);
        res.status(500).json({ message: 'Could not search jobs. Please try again.' });
    }
};

module.exports = { searchJobs };
