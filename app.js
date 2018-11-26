const express = require('express');
const helmet = require('helmet');

const routes = require('./routes');
const errorHandlers = require('./handlers/errorHandlers');
const app = express();

app.use(helmet());

app.use(routes);
app.use(errorHandlers.notFound);

if (process.env.NODE_ENV === 'production') {
  app.use(errorHandlers.productionErrors)
} else {
  app.use(errorHandlers.developmentErrors)
}

module.exports = app;