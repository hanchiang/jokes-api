const { Pool } = require('pg');

require('../config');
const logger = require('../utils/logger');

let idleTimeoutMillis = 10000;
if (process.argv.length === 3) {
  idleTimeoutMillis = process.argv[2];
}

const connectionString = `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`;

const pool = new Pool({
  // user: process.env.DB_USER,
  // password: process.env.DB_PASSWORD,
  // host: process.env.DB_HOST,
  // database: process.env.DB_NAME,
  // port: process.env.DB_PORT
  connectionString: connectionString,
  idleTimeoutMillis
});

// query accept either a config object, or a text and values parameter.
module.exports = {
  query: (text, values) => pool.query(text, values).catch(err => logger.error({err})),
  getClient: () => pool.connect().catch(e => err => logger.error({ err }))
};

pool.on('connect', (client) => {
  // console.log('New PostgreSQL client connected.');
})

pool.on('error', (err, client) => {
  logger.error({err})
  process.exit(-1);
});