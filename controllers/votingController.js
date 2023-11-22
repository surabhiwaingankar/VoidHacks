const AppError = require('../utils/appError');
const Election = require('./../models/electionModel');
const Candidate = require('./../models/candidateModel');
const  catchAsync = require('./../utils/catchAsync');

exports.vote = catchAsync(async(req,res,next) => {
    if(!req.file)
    return next(new AppError('Please provide image',400))

    if(!req.body.election || !req.body.candidate)
    {
        return next(new AppError('Please provide Election and Candidate', 400));
    }
    const election = await Election.findById(req.body.election)
    const eligibleCandidates = election.candidates

    const candidateId = eligibleCandidates.map(el => el._id)
    console.log(candidateId)
    console.log(req.body.candidate)
    if(!candidateId.some(id => id.equals(req.body.candidate)))
    {
        return next(new AppError('Candidate does not exist', 404));

    } 
    const candidate = await Candidate.findById(req.body.candidate)
    if(!candidate || !election)
    {
        return next(new AppError('Candidate or Election does not exist', 404));
    }

    candidate.votes = candidate.votes+1;
    await candidate.save({validateBeforeSave: false})
    election.totalVotes = election.totalVotes+1;
    await election.save({validateBeforeSave: false})

    res.status(200).json({
        status:200,
        data: {
            election,
            candidate
        }
    })
})
