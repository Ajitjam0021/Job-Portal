const jwt = require('jsonwebtoken');
const axios = require('axios');
const User = require('./user.model');
const asyncHandler = require('express-async-handler');

// Deployed Backend URL for Remote Auth Proxy
const AUTH_SERVER_URL = 'https://job-listing-portal-ten-omega.vercel.app/api/auth';

// Password strength validation
const validatePassword = (password) => {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (password.length < minLength) {
        return 'Password must be at least 8 characters long';
    }
    if (!hasUpperCase) {
        return 'Password must contain at least one uppercase letter';
    }
    if (!hasLowerCase) {
        return 'Password must contain at least one lowercase letter';
    }
    if (!hasNumbers) {
        return 'Password must contain at least one number';
    }
    if (!hasSpecialChar) {
        return 'Password must contain at least one special character';
    }
    return null;
};



// Generate JWT Token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '7d', // 7 days for better security
    });
};

// Generate Refresh Token — 30 day lifespan for persistent sessions
const generateRefreshToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};



// @desc    Register new user
// @route   POST /api/auth/signup
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
    // PROXY MODE: If no secret key (Colleague), forward request to Deployed Backend
    if (!process.env.JWT_SECRET) {
        console.log('⚡ Proxying Registration to Deployed Backend...');
        try {
            const response = await axios.post(`${AUTH_SERVER_URL}/signup`, req.body);
            return res.status(response.status).json(response.data);
        } catch (error) {
            console.error('Remote Register Failed:', error.message);
            res.status(error.response?.status || 500);
            throw new Error(error.response?.data?.message || 'Remote Registration Failed');
        }
    }

    let { name, email, password, role } = req.body;

    // Trim inputs (NoSQL injection prevented by express-mongo-sanitize middleware)
    name = typeof name === 'string' ? name.trim() : name;
    email = typeof email === 'string' ? email.trim().toLowerCase() : email;

    // Validation
    if (!name || !email || !password) {
        res.status(400);
        throw new Error('Please add all fields');
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        res.status(400);
        throw new Error('Please provide a valid email address');
    }

    // Password strength validation
    const passwordError = validatePassword(password);
    if (passwordError) {
        res.status(400);
        throw new Error(passwordError);
    }

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
        res.status(400);
        throw new Error('User already exists');
    }

    // Validate role
    if (role && !['candidate', 'employer'].includes(role)) {
        res.status(400);
        throw new Error('Invalid role');
    }

    // Create user
    const user = await User.create({
        name,
        email,
        password,
        role: role || 'candidate',
    });

    if (user) {
        const token = generateToken(user._id);
        const refreshToken = generateRefreshToken(user._id);

        // Set HTTP-only cookie for refresh token
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', // 'none' for cross-domain production
            maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
        });

        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: token,
        });
    } else {
        res.status(400);
        throw new Error('Invalid user data');
    }
});

// @desc    Authenticate a user
// @route   POST /api/auth/login
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
    // PROXY MODE: If no secret key (Colleague), forward request to Deployed Backend
    if (!process.env.JWT_SECRET) {
        console.log('⚡ Proxying Login to Deployed Backend...');
        try {
            const response = await axios.post(`${AUTH_SERVER_URL}/login`, req.body);
            return res.status(response.status).json(response.data);
        } catch (error) {
            console.error('Remote Login Failed:', error.message);
            res.status(error.response?.status || 401);
            throw new Error(error.response?.data?.message || 'Remote Login Failed');
        }
    }

    let { email, password } = req.body;

    // Trim input (NoSQL injection prevented by express-mongo-sanitize middleware)
    email = typeof email === 'string' ? email.trim().toLowerCase() : email;

    if (!email || !password) {
        res.status(400);
        throw new Error('Please provide email and password');
    }

    // Check for user email
    const user = await User.findOne({ email }).select('+password');

    if (user && (await user.matchPassword(password))) {
        const token = generateToken(user._id);
        const refreshToken = generateRefreshToken(user._id);

        // Set HTTP-only cookie for refresh token
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
            maxAge: 30 * 24 * 60 * 60 * 1000
        });

        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: token,
        });
    } else {
        res.status(401);
        throw new Error('Invalid email or password');
    }
});

// @desc    Get user data
// @route   GET /api/auth/me
// @access  Private
const getMe = asyncHandler(async (req, res) => {
    res.status(200).json(req.user);
});

// @desc    Validate a token (For Remote Verification)
// @route   POST /api/auth/validate-token
// @access  Public (Protected by signature verification)
const validateToken = asyncHandler(async (req, res) => {
    const { token } = req.body;

    if (!token) {
        res.status(400);
        throw new Error('Token is required');
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select('_id name email role');

        if (!user) {
            res.status(404);
            throw new Error('User not found');
        }

        // Return ONLY minimal data needed for auth — never expose sensitive fields
        res.status(200).json({
            valid: true,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
            }
        });
    } catch (error) {
        res.status(401).json({ valid: false, message: 'Invalid token' });
    }
});

// @desc    Refresh access token (with Rotation)
// @route   POST /api/auth/refresh
// @access  Public (Uses Cookie)
const refreshToken = asyncHandler(async (req, res) => {
    const cookies = req.cookies;
    if (!cookies?.refreshToken) {
        return res.status(401).json({ message: 'No refresh token provided' });
    }

    const oldToken = cookies.refreshToken;

    // Clear the old refresh token cookie immediately
    res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    });

    try {
        const decoded = jwt.verify(oldToken, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select('_id name email role');

        if (!user) {
            return res.status(401).json({ message: 'User not found' });
        }

        // Generate NEW tokens (Rotation)
        const accessToken = generateToken(user._id);
        const newRefreshToken = generateRefreshToken(user._id);

        // Set the NEW refresh token cookie
        res.cookie('refreshToken', newRefreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
            maxAge: 30 * 24 * 60 * 60 * 1000
        });

        res.json({ token: accessToken, user });
    } catch (error) {
        // Token might be expired or tampered with
        res.status(401).json({ message: 'Invalid or expired refresh token' });
    }
});

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Public
const logoutUser = asyncHandler(async (req, res) => {
    res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    });
    res.status(200).json({ message: 'Logged out successfully' });
});

module.exports = {
    registerUser,
    loginUser,
    getMe,
    validateToken,
    refreshToken,
    logoutUser,
};
