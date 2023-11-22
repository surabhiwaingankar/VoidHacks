const AppError = require('../utils/appError');
const User = require('./../models/userModel');
const  catchAsync = require('./../utils/catchAsync');
const multer = require('multer');

const storage = multer.diskStorage({
  destination: function (req, file, cb){
    return cb(null, './images');
  },
  filename: function(req, file, cb){
    return cb(null, `${Date.now()}-${file.originalname}`)
  }
})

const upload = multer({storage})


exports.uploadUserPhoto = upload.single('image')

const filterObj = (obj, ...allowedFields) => {
    const newObj = {};
    Object.keys(obj).forEach(el => {
      if (allowedFields.includes(el)) newObj[el] = obj[el];
    });
    return newObj;
  };

  exports.updateMe = catchAsync(async (req, res, next) => {
    if (req.body.password || req.body.passwordConfirm) {
      return next(
        new AppError(
          'This route is not for password updates. Please use /updateMyPassword.',
          400
        )
      );
    }
  
    const filteredBody = filterObj(req.body, 'name', 'email', 'mobileNo', 'location');
    if(req.file) filteredBody.image = req.file.filename
  
    const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
      new: true,
      runValidators: true
    });
  
    res.status(200).json({
      status: 'success',
      data: {
        user: updatedUser
      }
    });
  });


exports.getMe = (req, res, next) => {
  console.log(req.user)
  req.params.id = req.user._id;
  next();
}  

exports.getUser = catchAsync(async (req,res,next) =>{
  console.log(req.params.id)
    const user = await User.findById(req.params.id);
    if(!user)
    {
        next(new AppError("No user found with that id", 404));
        return; 
    }
     res.status(200).json({
         status: 'success',
         data: {
             user: user  
            }
    }); 
  })

exports.deleteMe = catchAsync(async (req,res,next) =>{
    const user = await User.findByIdAndDelete(req.user._id);

    if (!user) {
      return next(new AppError('No user found with that ID', 404));
    }

    res.status(204).json({
      status: 'success',
      data: null
    });
})  
