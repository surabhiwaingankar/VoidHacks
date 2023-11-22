const AppError = require('../utils/appError');
const Election = require('./../models/electionModel');
const Candidate = require('./../models/candidateModel');
const User = require('./../models/userModel');
const  catchAsync = require('./../utils/catchAsync');

exports.vote = catchAsync(async(req,res,next) => {
    if(!req.file)
    return next(new AppError('Please provide image',400))
    
    const user = await User.findById(req.user._id)
    if(!user)
    return next(new AppError('User does not exist',404))

    if(!req.body.election || !req.body.candidate)
    {
        return next(new AppError('Please provide Election and Candidate', 400));
    }
    const election = await Election.findById(req.body.election)
    const eligibleCandidates = election.candidates

    const candidateId = eligibleCandidates.map(el => el._id)
    if(!candidateId.some(id => id.equals(req.body.candidate)))
    {
        return next(new AppError('Candidate does not exist', 404));
    } 
    const candidate = await Candidate.findById(req.body.candidate)
    if(!candidate || !election)
    {
        return next(new AppError('Candidate or Election does not exist', 404));
    }
    
    console.log(user.elections)
    const electionId = user.elections.map(el => el._id)
    if(electionId.some(id => id.equals(election._id)))
    return next(new AppError('Your vote has already been cast', 403))

    candidate.votes = candidate.votes+1;
    await candidate.save({validateBeforeSave: false})
    election.totalVotes = election.totalVotes+1;
    await election.save({validateBeforeSave: false})
 
    user.elections = user.elections.push(election._id)
    await user.save({validateBeforeSave: false})

    res.status(200).json({
        status:200,
        data: {
            election,
            candidate
        }
    })
})
