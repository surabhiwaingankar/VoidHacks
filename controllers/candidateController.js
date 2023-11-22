const Candidate = require('./../models/candidateModel');
const  catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');

exports.getAllCandidates = catchAsync(async (req,res,next) =>{

        res.status(200).json({
         status: 'success',
         results: candidates.length,
         data: {
             candidates
         }
     });
})

exports.getCandidate = catchAsync(async (req,res,next) =>{
    const candidate = await Candidate.findById(req.params.id);

    if(!candidate)
    return next(new AppError("No candidate found with that id", 404));

     res.status(200).json({
         status: 'success',
         data: {
             candidate
         }
     });
})

exports.createCandidate = catchAsync(async (req,res,next) =>{
    const newCandidate = await Candidate.create({
        name: req.body.name,
        party: req.body.party,
        constituency: req.body.constituency
    });
     res.status(200).json({
         status: 'success',
         data: {
             candidate: newCandidate
         }
     });
})

exports.deleteCandidate= catchAsync(async (req,res,next) =>{   

    const candidate = await Candidate.findByIdAndDelete(req.params.id);
    if(!candidate)
    {
        next(new AppError("No candidate found with that id", 404));
        return; 
    }

    res.status(204).json({
        status: "success",
        data: null
    })
})

exports.updateCandidate = catchAsync(async (req,res,next) =>{
    
    const candidate = await Candidate.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });

    if(!candidate)
{
    next(new AppError("No candidate found with that id", 404));
    return; 
}

    res.status(200).json({
        status: "success",
        data: {
            candidate
        }
    });
})
