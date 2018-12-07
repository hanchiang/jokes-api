const fs = require('fs');
const util = require('util');
const path = require('path');
  
const db = require('../');

async function readFile(filename) {
  const open = util.promisify(fs.readFile);
  return await open(path.join(__dirname, '..', 'data', filename), 'utf-8');
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

  console.log(`Inserting ${jokes.length} jokes...`);
  for (const { joke, categories } of jokes) {
    const client = await db.getClient();
    try {
      await client.query('BEGIN');
      
      // Insert into jokes table
      const { rows, rowCount } = await db.query({
        text: 'INSERT INTO jokes(joke) VALUES($1) ON CONFLICT DO NOTHING RETURNING joke_id',
        values: [joke]
      });

      const id = rows.length === 1 && rows[0].joke_id;
      if (!id) {
        throw new Error('Unable to get joke id after inserting joke. Rolling back insert joke operation...')
      }

      jokeInserted += rowCount;

      // Insert into joke_category table
      for (const category of categories) {
        const { rowCount: rowCount2 } = await db.query({
          text: `INSERT INTO joke_category(joke_id, category) VALUES($1, $2) RETURNING *`,
          values: [id, category]
        });

        if (rowCount2 !== 1) {
          throw new Error('Unable to insert into joke_category. Rolling back...')
        }
        categoriesInserted += rowCount2;
      }
      await client.query('COMMIT');
    } catch(e) {
      await client.query('ROLLBACK');
      // console.log(e);
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

