/**
 * Analytics Routes - Admin dashboard charts and stats (MongoDB)
 */
const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const Registration = require('../models/Registration');
const User = require('../models/User');
const { isAuthenticated, isAdmin } = require('../middleware/auth');

// GET /api/analytics/stats - Summary stats for admin dashboard
router.get('/stats', isAuthenticated, isAdmin, async (req, res) => {
    try {
        const totalStudents = await User.countDocuments({ role: 'student' });
        const totalEvents = await Event.countDocuments();
        const pendingApprovals = await Registration.countDocuments({ status: 'pending' });
        const approvedRegistrations = await Registration.countDocuments({ status: 'approved' });
        const totalRegistrations = await Registration.countDocuments();

        res.json({
            totalStudents,
            totalEvents,
            pendingApprovals,
            approvedRegistrations,
            totalRegistrations
        });
    } catch (err) {
        console.error('Stats error:', err);
        res.status(500).json({ message: 'Error fetching stats' });
    }
});

// GET /api/analytics/event-registrations - Registration count per event (bar chart)
router.get('/event-registrations', isAuthenticated, isAdmin, async (req, res) => {
    try {
        const data = await Registration.aggregate([
            {
                $group: {
                    _id: '$event',
                    registrations: { $sum: 1 }
                }
            },
            {
                $lookup: {
                    from: 'events',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'eventDetails'
                }
            },
            { $unwind: '$eventDetails' },
            {
                $project: {
                    title: '$eventDetails.title',
                    registrations: 1
                }
            },
            { $sort: { registrations: -1 } },
            { $limit: 10 }
        ]);

        res.json({ data });
    } catch (err) {
        console.error('Event registrations error:', err);
        res.status(500).json({ message: 'Error fetching event registration data' });
    }
});

// GET /api/analytics/category-distribution - Event count per category (pie chart)
router.get('/category-distribution', isAuthenticated, isAdmin, async (req, res) => {
    try {
        const data = await Event.aggregate([
            {
                $group: {
                    _id: '$category',
                    count: { $sum: 1 }
                }
            }
        ]);

        res.json({ data });
    } catch (err) {
        console.error('Category distribution error:', err);
        res.status(500).json({ message: 'Error fetching category data' });
    }
});

// GET /api/analytics/monthly-growth - Monthly registration count (line chart)
router.get('/monthly-growth', isAuthenticated, isAdmin, async (req, res) => {
    try {
        const data = await Registration.aggregate([
            {
                $group: {
                    _id: {
                        year: { $year: '$registrationDate' },
                        month: { $month: '$registrationDate' }
                    },
                    registrations: { $sum: 1 }
                }
            },
            { $sort: { '_id.year': 1, '_id.month': 1 } },
            { $limit: 12 }
        ]);

        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const formatted = data.map(d => ({
            month: `${months[d._id.month - 1]} ${d._id.year}`,
            registrations: d.registrations
        }));

        res.json({ data: formatted });
    } catch (err) {
        console.error('Monthly growth error:', err);
        res.status(500).json({ message: 'Error fetching monthly data' });
    }
});

module.exports = router;
