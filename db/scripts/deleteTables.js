const db = require('../');

const listTables = require('./listTables');

async function deleteAll() {
  const tables = await listTables();
  
  for (const table of tables) {
    const result = await db.query({
      text: `DROP TABLE IF EXISTS ${table} CASCADE`
    });
  }
  console.log('All tables deleted!');
}

deleteAll();