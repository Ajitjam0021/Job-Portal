const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const User = require('../features/auth/user.model');
const axios = require('axios');

// Deployed Backend URL for Remote Verification
const AUTH_SERVER_URL = 'https://job-listing-portal-ten-omega.vercel.app/api/auth/validate-token';

const protect = asyncHandler(async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer')) {
        res.status(401);
        throw new Error('Not authorized, no token');
    }

    const token = authHeader.split(' ')[1];

    try {
        // MODE 1: ADMIN (Has Secret Key)
        if (process.env.JWT_SECRET) {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const user = await User.findById(decoded.id).select('-password');

            if (!user) {
                res.status(401);
                throw new Error('User not found');
            }

            req.user = user;
            return next();
        }

        // MODE 2: COLLABORATOR (No Secret Key)
        console.log('⚡ Using Remote Auth Verification...');
        const response = await axios.post(AUTH_SERVER_URL, { token });

        if (!response.data.valid) {
            res.status(401);
            throw new Error('Invalid Token');
        }

        req.user = response.data.user;
        return next();
    } catch (error) {
        // If res.statusCode wasn't already set to an error code
        if (res.statusCode === 200) {
            res.status(401);
        }
        throw new Error(error.message || 'Not authorized');
    }
});

// Role-based access control middleware — use after `protect`
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            res.status(403);
            throw new Error(`Role '${req.user?.role}' is not authorized to access this route`);
        }
        next();
    };
};

module.exports = { protect, authorize };
