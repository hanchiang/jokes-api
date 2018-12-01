const express = require('express');
const helmet = require('helmet');
const moment = require('moment');
const bodyParser = require('body-parser');
const childProcess = require('child_process');

const rateLimit = require('express-rate-limit');

const routes = require('./routes');
const errorHandlers = require('./handlers/errorHandlers');
const logger = require('./utils/logger');
const app = express();

app.use(helmet());

const limiter = rateLimit({
  windowMs: 30 * 60 * 1000, // 30 mins
  max: 30,
  handler(req, res, next) {
    const { resetTime } = req.rateLimit;
    const tryAgainTime = moment().to(moment(resetTime));
    const err = new Error(`Slow it down son..! Please try again ${tryAgainTime}`);
    err.status = 429;
    next(err);
  } 
});

app.get('/favicon.ico', (req, res) => res.status(204));

app.use(bodyParser.json());
app.post('/webhooks/github', (req, res) => {
  const { head_commit, ref } = req.body;

  if (!head_commit || !ref) {
    logger.warn('Oops, received invalid data from github\'s webhook!')
    res.sendStatus(500);
  }
  
  logger.info(`Received new commit: ${head_commit.message}`);
  childProcess.exec('./deploy.sh', (err, stdout, stderr) => {
    if (err) {
      logger.error({ err });
      res.sendStatus(500);
    }
    logger.info('Successfully deployed app!');
    res.sendStatus(200);
  })
});



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