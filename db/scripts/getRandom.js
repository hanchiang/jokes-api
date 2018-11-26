const db = require('../');

exports.getRandom = async (category = '') => {
  let query = '';
  if (category === '') {
    query = `SELECT ROUND(RANDOM() * (SELECT MAX(joke_id) FROM joke_category)) AS id`
  } else {
    // TODO:
  }


  const { rows } = await db.query({ text: query });
  const id = rows.length === 1 && rows[0].id;

  if (!id) {
    throw new Error('Unable to get random joke id. Rolling back...')
  }

  const { rows: jokeRows } = await db.query({
    text: `SELECT * FROM jokes WHERE joke_id = $1`,
    values: [id]
  });

  const joke = jokeRows.length === 1 && jokeRows[0];
  return joke;
}