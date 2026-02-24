/**
 * Notifications Routes - Stub (MongoDB)
 */
const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../middleware/auth');

// GET /api/notifications - Return empty notifications for now
router.get('/', isAuthenticated, (req, res) => {
    res.json({ notifications: [] });
});

// PUT /api/notifications/read-all - Mark all as read (stub)
router.put('/read-all', isAuthenticated, (req, res) => {
    res.json({ message: 'All notifications marked as read' });
});

module.exports = router;
