const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const cookieParser = require('cookie-parser');
const compression = require('compression');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const userRouter = require(`${__dirname}/routes/userRoutes`);
const candidateRouter = require(`${__dirname}/routes/candidateRoutes`);
const electionRouter = require(`${__dirname}/routes/electionRoutes`);
const votingRouter = require(`${__dirname}/routes/votingRoutes`);

const app = express();

app.use(helmet());

console.log(process.env.NODE_ENV);

if(process.env.NODE_ENV === 'development')
{
    app.use(morgan('dev'));
}

const limiter = rateLimit({
    max: 100,
    windowMs: 60*60*1000,
    message: "Too many messages from this IP! Please try again in an hour!"
})

app.use('/api', limiter)

app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());

app.use(mongoSanitize());

app.use(xss());

app.use(compression());

app.use('/api/users', userRouter);
app.use('/api/candidates', candidateRouter);
app.use('/api/elections', electionRouter);
app.use('/api/votings', votingRouter);

app.all('*', (req, res, next) => {
    next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
  });

app.use(globalErrorHandler);

module.exports = app;
