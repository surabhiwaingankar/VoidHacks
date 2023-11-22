const Election = require('./../models/electionModel');
const  catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');

exports.getAllElections = catchAsync(async (req,res,next) =>{
    if(req.query && req.query.level)
    {
        const elections = await Election.find({level: req.query.level}).populate('candidates');
        res.status(200).json({
         status: 'success',
         results: elections.length,
         data: {
            elections
         }
     });
    }
    else{
        const elections = await Election.find().populate('candidates');
        res.status(200).json({
         status: 'success',
         results: elections.length,
         data: {
            elections
         }
     });
    }
})

exports.getElection = catchAsync(async (req,res,next) =>{
    const election = await Election.findById(req.params.id).populate('candidates');
    if(!election)
    return next(new AppError("No election found with that id", 404));

     res.status(200).json({
         status: 'success',
         data: {
             election
         }
     });
})

exports.createElection = catchAsync(async (req,res,next) =>{
    const newElection = await Election.create({
        name:req.body.name,
        lastDate: req.body.lastDate,
        resultDate: req.body.resultDate,
        level: req.body.level,
        candidates: req.body.candidates
    });
     res.status(200).json({
         status: 'success',
         data: {
             election: newElection
         }
     });
})

exports.deleteElection= catchAsync(async (req,res,next) =>{   

    const election = await Election.findByIdAndDelete(req.params.id);
    if(!election)
    {
        next(new AppError("No election found with that id", 404));
        return; 
    }

    res.status(204).json({
        status: "success",
        data: null
    })
})

exports.updateElection = catchAsync(async (req,res,next) =>{
    
    const election = await Election.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });

    if(!election)
{
    next(new AppError("No election found with that id", 404));
    return; 
}

    res.status(200).json({
        status: "success",
        data: {
            election
        }
    });
})
