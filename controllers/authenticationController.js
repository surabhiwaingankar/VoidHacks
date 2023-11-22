const util = require('util');
const crypto = require('crypto');
const User = require('./../models/userModel');
const  catchAsync = require('./../utils/catchAsync');
const jwt = require('jsonwebtoken');
const AppError = require('./../utils/appError');
const Email = require('./../utils/email');

exports.signup = catchAsync(async(req, res, next) =>{
    const newUser = await User.create({
        name: req.body.name,
        email: req.body.email,
        mobileNo: req.body.mobileNo,
        password: req.body.password,
        passwordConfirm: req.body.passwordConfirm,
        role: req.body.role,
        image: req.file.filename,
        location: req.body.location
    });

    OTP = newUser.generateOTP();

    const url = `${req.protocol}://${req.get('host')}/me`; 
    await new Email(newUser, url, OTP).sendWelcome();

    const token = jwt.sign({ id: newUser._id},process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
    })
    const cookieOptions = {
        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN*24*60*60*1000),
        httpOnly: true
    }

     if(process.env.NODE_ENV==='production')
    cookieOptions.secure= true;

    res.cookie('jwt', token, cookieOptions)
    newUser.password= undefined;

    res.status(201).json({
        status: "success",
        token: token,  
        data: {
            user: newUser
        }
    })
});

exports.login = catchAsync(async (req, res, next) => {
    if(!req.file)
    return next(new AppError("Please provide image", 400))

    const password = req.body.password;
    const email = req.body.email;

    if(!email || !password)
    {
        next(new AppError("Please provide email and password", 400));
    }

    const user = await User.findOne({email: req.body.email}).select('+password');

    if(!user || !(await user.correctPassword(password, user.password)))
    {
        return next(new AppError("Incorrect username or password", 401));
    }

    const token = jwt.sign({id: user._id}, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
    });

    const cookieOptions = {
        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN*24*60*60*1000),
        httpOnly: true
    }

    if(process.env.NODE_ENV==='production')
    cookieOptions.secure= true;

    res.cookie('jwt', token, cookieOptions)
    user.password=undefined;

    res.status(200).json({
        status: "success",
        token: token
    })

})

exports.logout= (req,res) =>{
    res.cookie('jwt', 'loggedout', {
        expires: new Date(Date.now()+ 10*1000),
        httpOnly: true
    });
    res.status(200).json({
        status: "success"
    });
}

exports.protect = catchAsync( async (req,res,next)=> {
    let token;
    if(req && req.headers && req.headers.authorization && req.headers.authorization.startsWith('Bearer'))
    {
        token = req.headers.authorization.split(' ')[1];
    }
    else if(req && req.cookies && req.cookies.jwt)
    {
        token = req.cookies.jwt;
    }

    if(!token)
    {
        return next(new AppError("You have not logged in! Please login to view this", 401));
    }

   const decoded = await util.promisify(jwt.verify)(token, process.env.JWT_SECRET);

   const checkUser = await User.findById(decoded.id);
   if(!checkUser)
   return next(new AppError("The user belonging to this token no longer exists.", 401));

   if(checkUser.changedPasswordAfter(decoded.iat)){
    return next(new AppError("User recently changed password! Please login again", 401));
   }

    req.user = checkUser;
    next(); 
})

exports.restrictTo = (...roles) =>{
    return (req, res, next) => {
        if(!roles.includes(req.user.role))
        return next(new AppError("You do not have permission to do this",403))

        next();
    }
}

exports.forgotPassword = catchAsync(async (req, res, next) =>{
    const user = await User.findOne({email: req.body.email});

    if(!user)
    return next(new AppError("There is no user with that email address",404));

    const resetToken = user.createPasswordResetToken(); //instance method on doc in schema
    await user.save({ validateBeforeSave: false});
    
    try {
        const resetURL = `${req.protocol}://${req.get(
        'host'
      )}/api/users/resetPassword/${resetToken}`;

        await new Email(user, resetURL, undefined).sendPasswordReset();
    
        res.status(200).json({
          status: 'success',
          message: 'Token sent to email!'
        });
      } catch (err) {
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save({ validateBeforeSave: false });
        return next(new AppError("There was an error sending the email. Try again later!",500));
    }
})

exports.resetPassword = catchAsync( async (req, res, next) =>{
    //1) get user based on token

    const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

    const user = await User.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: { $gt: Date.now() }
      });
    

    if(!user){
    return next(new AppError("Token is invalid or has expired", 400));
    }

    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    const token = jwt.sign({id: user._id}, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
    });

    const cookieOptions = {
        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN*24*60*60*1000),
        httpOnly: true
    }

    if(process.env.NODE_ENV==='production')
    cookieOptions.secure= true;

    res.cookie('jwt', token, cookieOptions);
    user.password=undefined;

    res.status(200).json({
        status: "success",
        token: token
    })
})

exports.updatePassword = catchAsync( async (req,res,next) =>{
    const user = await User.findById(req.user._id).select('+password');

    if(!user.correctPassword(req.body.passwordCurrent, user.password))
    return next(new AppError("Your current password is wrong",401));

    user.password = req.body.password;
    user.passwordConfirm= req.body.password
    await user.save();

    const token = jwt.sign({id: user._id}, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
    });

    const cookieOptions = {
        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN*24*60*60*1000),
        httpOnly: true
    }

    if(process.env.NODE_ENV==='production')
    cookieOptions.secure= true;

    res.cookie('jwt', token, cookieOptions);
    user.password=undefined;

    res.status(200).json({
        status: "success",
        token: token
    })
})

exports.verifyOTP = catchAsync( async (req, res, next) =>{
    const hashedOTP = crypto
    .createHash('sha256')
    .update(req.body.OTP.toString())
    .digest('hex');

    const user = await User.findOne({
        OTP: hashedOTP,
        OTPExpires: { $gt: Date.now() }
      });
    
    if(!user){
    return next(new AppError("OTP is invalid or has expired", 400));
    }

    req.user = user;
    next();
})
