const express = require('express');
const router = express.Router();
const {
    registerUser,
    loginUser,
    getMe,
    validateToken,
    refreshToken,
    logoutUser,
} = require('./auth.controller');
const { protect } = require('../../middleware/authMiddleware');
const { authLimiter } = require('../../middleware/rateLimitMiddleware');

router.post('/signup', authLimiter, registerUser);
router.post('/login', authLimiter, loginUser);
router.post('/logout', logoutUser);
router.post('/refresh', refreshToken);
router.post('/validate-token', validateToken);
router.get('/me', protect, getMe);

module.exports = router;
