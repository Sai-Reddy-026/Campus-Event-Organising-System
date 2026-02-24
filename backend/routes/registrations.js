/**
 * Registration Routes - Event registration with pending approval flow (MongoDB)
 */
const express = require('express');
const router = express.Router();
const Registration = require('../models/Registration');
const Event = require('../models/Event');
const User = require('../models/User');
const { isAuthenticated, isAdmin } = require('../middleware/auth');

// POST /api/registrations - Register for an event (status = pending)
router.post('/', isAuthenticated, async (req, res) => {
    try {
        const { event_id, name, email, college, department, year } = req.body;

        // Validate required fields
        if (!event_id || !name || !email || !college || !department || !year) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        // Check if event exists
        const event = await Event.findById(event_id);
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        // Check if registration is closed
        if (event.registrationClosed) {
            return res.status(400).json({ message: 'Registration is closed for this event' });
        }

        // Check if slots available
        if (event.booked_slots >= event.total_slots) {
            return res.status(400).json({ message: 'Event is fully booked' });
        }

        // Check for duplicate registration
        const existingReg = await Registration.findOne({
            event: event_id,
            email: new RegExp(`^${email.trim()}$`, 'i')
        });
        if (existingReg) {
            return res.status(400).json({ message: 'You are already registered for this event' });
        }

        // Get student's studentId
        const currentUser = await User.findById(req.user.id);
        const studentId = currentUser?.studentId || '';

        // Create registration with status = pending
        const registration = await Registration.create({
            event: event_id,
            user: req.user.id,
            studentId,
            name,
            email,
            college,
            department,
            year,
            status: 'pending'
        });

        res.status(201).json({ message: 'Registration submitted! Awaiting admin approval.', registration });
    } catch (err) {
        console.error('Registration error:', err);
        res.status(500).json({ message: 'Error registering for event' });
    }
});

// GET /api/registrations - Get all registrations (Admin or User's own)
router.get('/', isAuthenticated, async (req, res) => {
    try {
        const { event_id } = req.query;
        let query = {};

        if (req.user.role === 'admin') {
            if (event_id) query.event = event_id;
        } else {
            query.$or = [
                { email: req.user.email },
                { user: req.user.id }
            ];
        }

        const registrations = await Registration.find(query)
            .populate('event', 'title date category location type venue')
            .sort({ registrationDate: -1 });

        // Transform for frontend
        const formattedRegistrations = registrations.map(reg => {
            const regObj = reg.toObject();
            if (reg.event) {
                regObj.event_title = reg.event.title;
                regObj.event_date = reg.event.date;
                regObj.category = reg.event.category;
            }
            return regObj;
        });

        res.json({ registrations: formattedRegistrations });
    } catch (err) {
        console.error('Fetch registrations error:', err);
        res.status(500).json({ message: 'Error fetching registrations' });
    }
});

// GET /api/registrations/all - Get all registrations filtered by status (Admin only)
router.get('/all', isAuthenticated, isAdmin, async (req, res) => {
    try {
        const { status } = req.query;
        let query = {};
        if (status) query.status = status.toLowerCase();

        const registrations = await Registration.find(query)
            .populate('event', 'title date category')
            .sort({ registrationDate: -1 });

        res.json({ registrations });
    } catch (err) {
        console.error('Fetch all registrations error:', err);
        res.status(500).json({ message: 'Error fetching registrations' });
    }
});

// GET /api/registrations/pending - Get pending registrations (Admin only)
router.get('/pending', isAuthenticated, isAdmin, async (req, res) => {
    try {
        const registrations = await Registration.find({ status: 'pending' })
            .populate('event', 'title date category')
            .sort({ registrationDate: -1 });

        res.json({ registrations });
    } catch (err) {
        console.error('Fetch pending error:', err);
        res.status(500).json({ message: 'Error fetching pending registrations' });
    }
});

// PUT /api/registrations/:id/approve - Approve a registration (Admin only)
router.put('/:id/approve', isAuthenticated, isAdmin, async (req, res) => {
    try {
        const registration = await Registration.findByIdAndUpdate(
            req.params.id,
            {
                status: 'approved',
                approvalDate: new Date()
            },
            { new: true }
        ).populate('event', 'title date category');

        if (!registration) return res.status(404).json({ message: 'Registration not found' });

        // Increment booked slots on approval
        await Event.findByIdAndUpdate(registration.event._id || registration.event, {
            $inc: { booked_slots: 1 }
        });

        res.json({ message: 'Registration approved', registration });
    } catch (err) {
        console.error('Approve error:', err);
        res.status(500).json({ message: 'Error approving registration' });
    }
});

// PUT /api/registrations/:id/reject - Reject a registration (Admin only)
router.put('/:id/reject', isAuthenticated, isAdmin, async (req, res) => {
    try {
        const registration = await Registration.findByIdAndUpdate(
            req.params.id,
            { status: 'rejected' },
            { new: true }
        );
        if (!registration) return res.status(404).json({ message: 'Registration not found' });
        res.json({ message: 'Registration rejected', registration });
    } catch (err) {
        res.status(500).json({ message: 'Error rejecting registration' });
    }
});

// GET /api/registrations/my-status - Get current user's registration statuses for events
router.get('/my-status', isAuthenticated, async (req, res) => {
    try {
        const registrations = await Registration.find({
            $or: [
                { email: req.user.email },
                { user: req.user.id }
            ]
        }).select('event status studentId');

        // Return a map: eventId -> status
        const statusMap = {};
        registrations.forEach(reg => {
            statusMap[reg.event.toString()] = reg.status;
        });

        res.json({ statusMap });
    } catch (err) {
        res.status(500).json({ message: 'Error fetching registration status' });
    }
});

// GET /api/registrations/:id - Get single registration
router.get('/:id', isAuthenticated, async (req, res) => {
    try {
        const registration = await Registration.findById(req.params.id).populate('event');
        if (!registration) return res.status(404).json({ message: 'Registration not found' });

        // Access control
        if (req.user.role !== 'admin' && registration.email !== req.user.email && String(registration.user) !== req.user.id) {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        res.json({ registration });
    } catch (err) {
        res.status(500).json({ message: 'Error fetching registration' });
    }
});

module.exports = router;
