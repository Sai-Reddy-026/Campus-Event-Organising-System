/**
 * Authentication Middleware - JWT-based
 */
const jwt = require('jsonwebtoken');
// api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
// Verify JWT token
const isAuthenticated = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Please login to access this resource' });
    }

    try {
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ message: 'Invalid or expired token' });
    }
};

// Check if user is admin
const isAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        return next();
    }
    return res.status(403).json({ message: 'Admin access required' });
};

// Check if user is student
const isStudent = (req, res, next) => {
    if (req.user && req.user.role === 'student') {
        return next();
    }
    return res.status(403).json({ message: 'Student access required' });
};

module.exports = { isAuthenticated, isAdmin, isStudent };
