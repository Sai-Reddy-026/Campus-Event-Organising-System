/**
 * Event Routes - CRUD operations for events (MongoDB)
 */
const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const { isAuthenticated, isAdmin } = require('../middleware/auth');

// GET /api/events - Get all events (with optional filters)
router.get('/', async (req, res) => {
    try {
        const { category, type } = req.query;
        let query = {};

        if (category) query.category = category;
        if (type) query.type = type;

        // For non-admin requests, only show visible events
        // (We check if auth header exists but don't require it)
        const authHeader = req.headers.authorization;
        let isAdminUser = false;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            try {
                const jwt = require('jsonwebtoken');
                const decoded = jwt.verify(authHeader.split(' ')[1], process.env.JWT_SECRET);
                isAdminUser = decoded.role === 'admin';
            } catch (e) { /* ignore token errors for public route */ }
        }

        if (!isAdminUser) {
            query.visible = true;
        }

        const events = await Event.find(query).sort({ date: 1 });
        res.json({ events });
    } catch (err) {
        console.error('Events fetch error:', err);
        res.status(500).json({ message: 'Error fetching events' });
    }
});

// GET /api/events/:id - Get single event
router.get('/:id', async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) return res.status(404).json({ message: 'Event not found' });
        res.json({ event });
    } catch (err) {
        res.status(500).json({ message: 'Error fetching event' });
    }
});

// POST /api/events - Create event (Admin only)
router.post('/', isAuthenticated, isAdmin, async (req, res) => {
    try {
        // Check for duplicate event title
        const existing = await Event.findOne({ title: req.body.title });
        if (existing) {
            return res.status(409).json({ message: 'An event with this title already exists' });
        }

        // Map frontend field names to schema field names
        const eventData = { ...req.body, createdBy: req.user.id };
        if (eventData.totalSlots !== undefined) {
            eventData.total_slots = Number(eventData.totalSlots);
            delete eventData.totalSlots;
        }
        if (eventData.isOwnCollege !== undefined) {
            eventData.type = eventData.isOwnCollege ? 'our_college' : 'other_college';
        }

        console.log('Creating event with data:', JSON.stringify(eventData, null, 2));
        const event = await Event.create(eventData);
        res.status(201).json({ message: 'Event created successfully', event });
    } catch (err) {
        console.error('Create event error:', err);
        res.status(500).json({ message: err.message || 'Error creating event' });
    }
});

// PUT /api/events/:id - Update event (Admin only)
router.put('/:id', isAuthenticated, isAdmin, async (req, res) => {
    try {
        // Map frontend field names to schema field names
        const updateData = { ...req.body };
        if (updateData.totalSlots !== undefined) {
            updateData.total_slots = Number(updateData.totalSlots);
            delete updateData.totalSlots;
        }
        if (updateData.isOwnCollege !== undefined) {
            updateData.type = updateData.isOwnCollege ? 'our_college' : 'other_college';
        }

        const event = await Event.findByIdAndUpdate(req.params.id, updateData, {
            new: true,
            runValidators: true
        });
        if (!event) return res.status(404).json({ message: 'Event not found' });
        res.json({ message: 'Event updated', event });
    } catch (err) {
        console.error('Update event error:', err);
        res.status(500).json({ message: err.message || 'Error updating event' });
    }
});

// DELETE /api/events/:id - Delete event (Admin only)
router.delete('/:id', isAuthenticated, isAdmin, async (req, res) => {
    try {
        await Event.findByIdAndDelete(req.params.id);
        res.json({ message: 'Event deleted' });
    } catch (err) {
        res.status(500).json({ message: 'Error deleting event' });
    }
});

module.exports = router;
