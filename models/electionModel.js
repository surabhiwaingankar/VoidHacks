const mongoose = require('mongoose');

const electionSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'An election must have a name'],
        unique: true
    },
    lastdate: {
        type: Date,
        required: [true, 'An election must have a last date']
    },
    resultDate: {
        type: Date,
        required: [true, 'An election must have a last date']
    },
    candidates: [{
        type: mongoose.Schema.ObjectId,
        ref: 'Candidate'
    }],
    totalVotes: {
        type: Number,
        default: 0
    }
})

electionSchema.pre(/^find/, function(next){
    this.populate({
        path: 'candidates'
    });
    next();
})

const Election = mongoose.model('Election', electionSchema);

module.exports = Election;