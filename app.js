const express = require('express');
const helmet = require('helmet');
const moment = require('moment');
const bodyParser = require('body-parser');
const childProcess = require('child_process');
const requestIp = require('request-ip');

const rateLimit = require('express-rate-limit');

const routes = require('./routes');
const errorHandlers = require('./handlers/errorHandlers');
const logger = require('./utils/logger');
const app = express();

app.use(helmet());

app.get('/favicon.ico', (req, res) => res.sendStatus(204));
app.get('/robots.txt', (req, res) => {
  res.type('text/plain');
  res.send('User-agent: *\nDisallow: /');
})

app.use(bodyParser.json());
// Deploy app when new changes are pushed to github repo
app.post('/webhooks/github', (req, res) => {
  const { head_commit, ref } = req.body;

  if (!head_commit || !ref) {
    logger.warn('Oops, received invalid data from github\'s webhook!')
    res.sendStatus(500);
  }

  logger.info(`Received new commit: ${head_commit.message}`);
  res.sendStatus(200);
  childProcess.exec('./deploy.sh', (err, stdout, stderr) => {
    if (err) {
      console.error(`exec error: ${error}`);
    }
    console.log(`stdout: ${stdout}`);
    console.log(`stderr: ${stderr}`);
  })
});


app.use(requestIp.mw());
app.use((req, res, next) => {
  logger.info(`IP: ${req.clientIp}, path: ${req.path}`);
  next();
})

const { minutes, max } = require('./rateLimit.json');
const multiplier = Math.random() / 2 + 0.75;  // 0.75 - 1.25
// TODO: If an IP hits the server at an abnormally high rate, ban his ass!
const limiter = rateLimit({
  windowMs: multiplier * minutes * 60 * 1000, // multipler * minutes mins
  max: max,
  handler(req, res, next) {
    const { resetTime } = req.rateLimit;
    const tryAgainTime = moment().to(moment(resetTime));
    const err = new Error(`Slow it down son..! Please try again ${tryAgainTime}`);
    err.status = 429;
    next(err);
  },
  keyGenerator(req, res) {
    return req.clientIp
  }
});
app.use(limiter);

// Modify response to include rate limit info
app.use((req, res, next) => {
  if (req.path !== '/') {
    const oldSend = res.json;
    res.json = (data) => {
      const { remaining, resetTime } = req.rateLimit;
      data.remaining = remaining;
      data.resetTime = resetTime;
      oldSend.call(res, data);
    }
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
