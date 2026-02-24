const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { isAuthenticated } = require('../middleware/auth');

// POST /api/auth/login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const emailRegex = new RegExp(`^${email.trim()}$`, 'i');
        const user = await User.findOne({ email: emailRegex }).select('+password');

        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Compare plain text password
        const dbPassword = user.password || '';
        const isMatch = (password.trim() === dbPassword.trim());
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Normalize roles for manually inserted DB entries
        const normalizedRole = (user.role || 'student').toLowerCase().trim();

        // Generate JWT token
        const token = jwt.sign(
            { id: user._id, name: user.name, email: user.email, role: normalizedRole },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({
            token,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: normalizedRole,
                studentId: user.studentId || null
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// GET /api/auth/me - Verify token and return user
router.get('/me', isAuthenticated, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        const normalizedRole = (user.role || 'student').toLowerCase().trim();
        res.json({
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: normalizedRole,
                studentId: user.studentId || null
            }
        });
    } catch (error) {
        console.error('Auth check error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
