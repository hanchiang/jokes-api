const db = require('../db');

async function list() {
  const result = await db.query({
    text: `SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE'`,
    name: 'list tables'
  });

  const tables = result.rows.map(row => row.table_name);
}

list();