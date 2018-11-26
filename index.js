const app = require('./app');

const PORT = process.env.PORT || 3000;
const logger = require('./utils/logger');


app.listen(PORT, () => {
  logger.info(`Express is running on port ${PORT}.`)
})