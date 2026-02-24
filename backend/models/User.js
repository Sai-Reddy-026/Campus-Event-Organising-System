const mongoose = require('mongoose');

// Auto-increment counter for student IDs
const CounterSchema = new mongoose.Schema({
    _id: { type: String, required: true },
    seq: { type: Number, default: 0 }
});
const Counter = mongoose.models.Counter || mongoose.model('Counter', CounterSchema);

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
        minlength: 6,
        select: false
    },
    role: {
        type: String,
        enum: ['student', 'admin'],
        default: 'student'
    },
    studentId: {
        type: String,
        unique: true,
        sparse: true
    },
    phone: {
        type: String,
        trim: true
    }
});

// Pre-save hook: auto-generate studentId for students
UserSchema.pre('save', async function () {
    if (this.isNew && this.role === 'student' && !this.studentId) {
        try {
            const counter = await Counter.findByIdAndUpdate(
                'studentId',
                { $inc: { seq: 1 } },
                { new: true, upsert: true }
            );
            this.studentId = `STU-${String(counter.seq).padStart(6, '0')}`;
        } catch (err) {
            throw err;
        }
    }
});

module.exports = mongoose.model('User', UserSchema);
