const express = require('express');
const helmet = require('helmet');
const moment = require('moment');

const rateLimit = require('express-rate-limit');

const routes = require('./routes');
const errorHandlers = require('./handlers/errorHandlers');
const app = express();

app.use(helmet());

const limiter = rateLimit({
  windowMs: 30 * 60 * 1000, // 30 mins
  max: 60,
  handler(req, res, next) {
    const { resetTime } = req.rateLimit;
    const tryAgainTime = moment().to(moment(resetTime));
    const err = new Error(`Slow it down son..! Please try again ${tryAgainTime}`);
    err.status = 429;
    next(err);
  } 
});

app.get('/favicon.ico', (req, res) => res.status(204));

app.use(limiter);

// Modify response to include rate limit info
app.use((req, res, next) => {
  const oldSend = res.json;
  res.json = (data) => {
    const { remaining, resetTime } = req.rateLimit;
    data.remaining = remaining;
    oldSend.call(res, data);
  }
  next();
})

app.use(routes);
app.use(errorHandlers.notFound);

if (process.env.NODE_ENV === 'production') {
  app.use(errorHandlers.productionErrors)
} else {
  app.use(errorHandlers.developmentErrors)
}

module.exports = app;