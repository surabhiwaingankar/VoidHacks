const mongoose = require('mongoose');

const electionSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'An election must have a name'],
        unique: true
    },
    lastDate: {
        type: Date,
        required: [true, 'An election must have a last date']
    },
    resultDate: {
        type: Date,
        required: [true, 'An election must have a last date'],
        validate: {
            validator: function(el){
                if(this.resultDate >= this.lastDate)
                return true;

                return false;
            },
            message: "Results cannot be declared before last date of elections"
        }
    },
    level: {
        type: String,
        enum: ['state', 'country'],
        required: [true, 'An election should have a level']
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

const Election = mongoose.model('Election', electionSchema);

module.exports = Election;