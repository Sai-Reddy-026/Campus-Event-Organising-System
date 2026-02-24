const mongoose = require('mongoose');

const EventSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    category: {
        type: String,
        enum: ['hackathon', 'game', 'celebration'],
        required: true
    },
    type: {
        type: String,
        enum: ['our_college', 'other_college'],
        default: 'our_college'
    },
    description: {
        type: String
    },
    location: {
        type: String
    },
    venue: {
        type: String
    },
    total_slots: {
        type: Number,
        required: true
    },
    booked_slots: {
        type: Number,
        default: 0
    },
    maxParticipants: {
        type: Number
    },
    status: {
        type: String,
        enum: ['upcoming', 'completed', 'cancelled'],
        default: 'upcoming'
    },
    image_url: {
        type: String
    },
    subcategory: {
        type: String
    },
    college: {
        type: String
    },
    isOwnCollege: {
        type: Boolean,
        default: true
    },
    rules: {
        type: [String],
        default: []
    },
    teamSize: {
        type: Number,
        default: 1
    },
    prizeDetails: {
        type: String
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    visible: {
        type: Boolean,
        default: true
    },
    registrationClosed: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Virtual to map isOwnCollege to type
EventSchema.pre('save', function () {
    if (this.isOwnCollege !== undefined) {
        this.type = this.isOwnCollege ? 'our_college' : 'other_college';
    }
    if (this.maxParticipants && !this.total_slots) {
        this.total_slots = this.maxParticipants;
    }
});

module.exports = mongoose.model('Event', EventSchema);
