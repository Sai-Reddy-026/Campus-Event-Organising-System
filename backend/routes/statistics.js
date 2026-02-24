/**
 * Statistics Routes - Dashboard stats + chart data (MongoDB aggregation)
 */
const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const Registration = require('../models/Registration');

// GET /api/statistics - Dashboard statistics
router.get('/', async (req, res) => {
    try {
        const totalEvents = await Event.countDocuments();
        const totalRegistrations = await Registration.countDocuments();

        // Count events by type (our_college vs other_college)
        const eventTypeCounts = await Event.aggregate([
            {
                $group: {
                    _id: '$type',
                    count: { $sum: 1 }
                }
            }
        ]);

        let ourCollegeCount = 0;
        let otherCollegeCount = 0;
        eventTypeCounts.forEach(item => {
            if (item._id === 'our_college') ourCollegeCount = item.count;
            if (item._id === 'other_college') otherCollegeCount = item.count;
        });

        // Most registered event
        const mostRegistered = await Registration.aggregate([
            {
                $group: {
                    _id: '$event',
                    count: { $sum: 1 }
                }
            },
            { $sort: { count: -1 } },
            { $limit: 1 },
            {
                $lookup: {
                    from: 'events',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'eventDetails'
                }
            },
            { $unwind: '$eventDetails' }
        ]);

        // Pending registrations count
        const pendingCount = await Registration.countDocuments({ status: 'pending' });
        const approvedCount = await Registration.countDocuments({ status: 'approved' });

        res.json({
            totalEvents,
            totalRegistrations,
            ourCollegeCount,
            otherCollegeCount,
            pendingCount,
            approvedCount,
            mostRegisteredEvent: mostRegistered.length > 0 ? mostRegistered[0].eventDetails.title : 'N/A'
        });
    } catch (err) {
        console.error('Statistics error:', err);
        res.status(500).json({ message: 'Error fetching statistics' });
    }
});

// GET /api/statistics/chart - Registrations per event for bar chart
router.get('/chart', async (req, res) => {
    try {
        const chartData = await Registration.aggregate([
            {
                $group: {
                    _id: '$event',
                    count: { $sum: 1 }
                }
            },
            {
                $lookup: {
                    from: 'events',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'event'
                }
            },
            { $unwind: '$event' },
            {
                $project: {
                    eventTitle: '$event.title',
                    category: '$event.category',
                    type: '$event.type',
                    count: 1
                }
            },
            { $sort: { count: -1 } }
        ]);

        res.json({
            labels: chartData.map(d => d.eventTitle),
            datasets: [{
                label: 'Registrations',
                data: chartData.map(d => d.count),
                categories: chartData.map(d => d.category),
                types: chartData.map(d => d.type)
            }]
        });
    } catch (err) {
        console.error('Chart data error:', err);
        res.status(500).json({ message: 'Error fetching chart data' });
    }
});

module.exports = router;
