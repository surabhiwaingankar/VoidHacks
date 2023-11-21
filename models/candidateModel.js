const mongoose = require('mongoose');

const candidateSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'A candidate must have a name']
    },
    party: {
        type: String,
        required: [true, 'A candidate must belong to a party']
    },
    constituency: {
        type: String,
        required: [true, 'A candidate must have a constituency']
    },
    votes: {
        type: Number,
        default: 0
    }
})
const Candidate = mongoose.model('Candidate', candidateSchema);

module.exports = Candidate;