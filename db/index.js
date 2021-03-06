const { Pool } = require('pg');

require('../config');
const logger = require('../utils/logger');

// default 10 sec
let idleTimeoutMillis = 10000;
if (process.argv.length === 3) {
  idleTimeoutMillis = process.argv[2];
}

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
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