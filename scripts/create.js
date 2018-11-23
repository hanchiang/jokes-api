const nodeEnv = process.env.NODE_ENV || 'development';
if (nodeEnv === 'development') {
  require('dotenv').config();
}

const db = require('../db');

const jokeTableStmt = `CREATE TABLE jokes(
  joke_id serial PRIMARY KEY,
  joke VARCHAR(255) UNIQUE NOT NULL,
  category VARCHAR(50) NOT NULL DEFAULT 'general',
  num_likes INTEGER NOT NULL DEFAULT 0 CHECK(num_likes >= 0)
);`;

const categoryTableStmt = `CREATE TABLE categories(
  category_id serial PRIMARY KEY,
  category VARCHAR(50) NOT NULL
);`;

// many to many
const jokeCategoryTableStmt = `CREATE TABLE joke_category(
  joke_id INTEGER NOT NULL REFERENCES jokes ON DELETE CASCADE,
  category_id INTEGER NOT NULL REFERENCES categories,
  PRIMARY KEY(joke_id, category_id)
);`;

async function create() {
  const statements = [jokeTableStmt, categoryTableStmt, jokeCategoryTableStmt];

  for (i = 0; i < statements.length; i++) {
    const result = await db.query({
      text: statements[i]
    });
  }
}


async function run() {
  create();
}

run();