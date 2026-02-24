const mongoose = require('mongoose');

const LetterSchema = new mongoose.Schema({
    registration: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Registration',
        required: true
    },
    pdfPath: {
        type: String,
        required: true
    },
    generatedAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Letter', LetterSchema);
