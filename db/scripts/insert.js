const fs = require('fs');
const util = require('util');
const path = require('path');
  
const db = require('../');

async function readFile(filename) {
  const open = util.promisify(fs.readFile);
  return await open(path.join(__dirname, filename), 'utf-8');
}

function parseJson(jsonString) {
  return new Promise((resolve, reject) => setTimeout(() => {
    resolve(JSON.parse(jsonString));
  }, 0))
}

// 1. Insert joke into jokes table, and get the joke_id
// 2. For each category, insert category and joke_id into joke_category table
async function insertJokesFromFile() {
  const content = await readFile('jokes.json');
  const jokes = await parseJson(content);
  let jokeInserted = 0;
  let categoriesInserted = 0;

  console.log(`Inserting ${jokes.length} jokes...`)
  for (const { joke, categories } of jokes) {
    /*
    You must use the same client instance for all statements within a transaction. 
    PostgreSQL isolates a transaction to individual clients. This means if you initialize or use 
    transactions with the pool.query method you will have problems. Do not use transactions 
    with pool.query.
    */
    const client = await db.getClient();
    try {
      await client.query('BEGIN');
      
      const { rows, rowCount } = await db.query({
        text: 'INSERT INTO jokes(joke) VALUES($1) ON CONFLICT DO NOTHING RETURNING (joke_id)',
        values: [joke]
      });

      const id = rows.length === 1 && rows[0].joke_id;
      if (!id) {
        throw new Error('Unable to get joke id. Rolling back insert joke operation...')
      }

      jokeInserted += rowCount;

      for (const category of categories) {
        const result2 = await db.query({
          text: `INSERT INTO joke_category(joke_id, category) VALUES($1, $2) RETURNING *`,
          values: [id, category]
        });

        categoriesInserted += result2.rowCount;
      }
      await client.query('COMMIT');
    } catch(e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  }
  console.log(`${jokeInserted} jokes and ${categoriesInserted} categories inserted!`);
}

async function insertCategoriesFromFile() {
  const content = await readFile('categories.txt');
  const categories = content.split('\n');
  let numInserted = 0;

  console.log(`Inserting ${categories.length} categories...`);
  for (const category of categories) {
    const result = await db.query({
      text: `INSERT INTO categories(category) VALUES($1) ON CONFLICT DO NOTHING`,
      values: [category]
    })
    numInserted += result.rowCount;
  }
}

async function run() {
  await insertCategoriesFromFile();
  await insertJokesFromFile();
}

run();

