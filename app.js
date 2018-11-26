const express = require('express');
const helmet = require('helmet');
const moment = require('moment');

const rateLimit = require('express-rate-limit');

const routes = require('./routes');
const errorHandlers = require('./handlers/errorHandlers');
const app = express();

app.use(helmet());

const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 10
});

app.get('/favicon.ico', (req, res) => res.status(204));

app.use(limiter);

app.use(routes);
app.use(errorHandlers.notFound);

if (process.env.NODE_ENV === 'production') {
  app.use(errorHandlers.productionErrors)
} else {
  app.use(errorHandlers.developmentErrors)
}

module.exports = app;