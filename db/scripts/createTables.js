const db = require('../');

// jokes table
const jokeTableStmt = `CREATE TABLE IF NOT EXISTS jokes(
  joke_id serial PRIMARY KEY,
  joke VARCHAR(255) UNIQUE NOT NULL,
  num_likes INTEGER NOT NULL DEFAULT 0 CHECK(num_likes >= 0)
);`;

// categories table
const categoryTableStmt = `CREATE TABLE IF NOT EXISTS categories(
  category_id serial PRIMARY KEY,
  category VARCHAR(50) UNIQUE NOT NULL
);`;

// many to many
const jokeCategoryTableStmt = `CREATE TABLE IF NOT EXISTS joke_category(
  joke_id INTEGER NOT NULL REFERENCES jokes(joke_id) ON DELETE CASCADE ON UPDATE CASCADE,
  category VARCHAR(50) NOT NULL REFERENCES categories(category) ON DELETE CASCADE ON UPDATE CASCADE,
  PRIMARY KEY(joke_id, category)
);`;

// index
const indexStmt = `CREATE INDEX IF NOT EXISTS category ON joke_category(category);`;

async function create() {
  const statements = [jokeTableStmt, categoryTableStmt, jokeCategoryTableStmt, indexStmt];

  for (const statement of statements) {
    const result = await db.query({
      text: statement
    });
  }
  console.log('Tables created!');
}

create();