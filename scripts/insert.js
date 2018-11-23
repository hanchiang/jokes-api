  const db = require('../db');

  async function insert() {
    const result = await db.query({
      text: 'INSERT INTO Jokes(joke) VALUES($1::text) RETURNING *',
      values: ['random22222'],
      name: 'insert joke'
    });
    console.log(result.rowCount);
    const { rows } = result;
    const { id } = rows && rows[0];

    const category = 'geeky_jokes';

    const result2 = await db.query({
      text: `INSERT INTO ${category}(joke_id) VALUES($1) RETURNING *`,
      values: [id],
      name: 'insert joke category'
    });

    console.log(result2.rowCount);

  }

  insert();