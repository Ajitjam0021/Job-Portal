const Application = require('../applications/application.model');
const Job = require('../jobs/job.model');
const User = require('../auth/user.model');

// @desc    Get Dashboard Statistics (Role based — real DB queries)
// @route   GET /api/dashboard
// @access  Private
const getDashboardStats = async (req, res) => {
    try {
        const role = req.user?.role || 'candidate';
        const userId = req.user._id || req.user.id;

        if (role === 'employer') {
            // Single query for job IDs, reuse for all counts
            const jobIds = await Job.find({ postedBy: userId }).distinct('_id');
            const [totalApps, shortlisted] = await Promise.all([
                Application.countDocuments({ job: { $in: jobIds } }),
                Application.countDocuments({ job: { $in: jobIds }, status: 'shortlisted' }),
            ]);

            return res.json({
                role: 'employer',
                stats: { activeJobs: jobIds.length, totalApplications: totalApps, shortlistedCandidates: shortlisted },
            });
        }

        // ── Candidate Dashboard ──
        const apps = await Application.find({ applicant: userId })
            .populate('job', 'title company location type salary')
            .sort('-appliedAt')
            .lean();

        const statusCounts = { pending: 0, reviewed: 0, shortlisted: 0, rejected: 0, accepted: 0 };
        apps.forEach(a => { if (statusCounts[a.status] !== undefined) statusCounts[a.status]++; });

        // Profile completeness
        const user = await User.findById(userId);
        const completeness = user ? user.getCompleteness() : { score: 0, missing: [] };

        // Recent jobs matching skills (up to 6)
        const skills = user?.skills || [];
        let recommendedJobs = [];
        if (skills.length) {
            recommendedJobs = await Job.find({
                $or: [
                    { requirements: { $in: skills.map(s => new RegExp(s, 'i')) } },
                    { title: { $in: skills.map(s => new RegExp(s, 'i')) } },
                ],
            })
                .sort('-createdAt')
                .limit(6)
                .select('title company location type salary createdAt')
                .lean();
        }
        if (recommendedJobs.length < 6) {
            const ids = recommendedJobs.map(j => j._id);
            const extra = await Job.find({ _id: { $nin: ids } })
                .sort('-createdAt')
                .limit(6 - recommendedJobs.length)
                .select('title company location type salary createdAt')
                .lean();
            recommendedJobs = [...recommendedJobs, ...extra];
        }

        return res.json({
            role: 'candidate',
            stats: {
                totalApplications: apps.length,
                ...statusCounts,
            },
            completeness,
            applications: apps.slice(0, 10), // latest 10
            recommendedJobs,
        });
    } catch (err) {
        console.error('Dashboard error:', err);
        res.status(500).json({ message: 'Server error' });
    }
};



module.exports = { getDashboardStats };
