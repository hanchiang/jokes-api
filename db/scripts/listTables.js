const db = require('../');

async function list() {
  const result = await db.query({
    text: `SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE'`,
  });
  
  const tables = result.rows.map(row => row.table_name);
  return tables;
}

module.exports = list;