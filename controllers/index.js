const db = require('../db');

const JOKES_COLUMNS_QUERY = 'SELECT joke_id AS id, joke, num_likes AS "numLikes"';

exports.getJokes = async(req, res) => {
  const limit = 10;
  const result = await db.query({
    text: `${JOKES_COLUMNS_QUERY} FROM Jokes LIMIT $1`,
    values: [limit]
  });
  res.json(result.rows);
}

exports.getRandom = async(req, res) => {
  const { category } = req.params;

  let query = '';
  if (!category) {
    query = `SELECT joke_id AS id, category FROM joke_category WHERE joke_id = (
      SELECT CASE WHEN id = 0 THEN 1 ELSE id END FROM 
        ROUND(RANDOM() * (SELECT MAX(joke_id) FROM joke_category)) AS id
      )`;
  } else {
    // TODO: implement...
  }

  const { rows } = await db.query({ text: query });
  const id = rows.length > 0 && rows[0].id;

  if (!id) {
    throw new Error('Unable to get random joke id.')
  }

  const categories = rows.map(row => row.category);

  const { rows: jokeRows } = await db.query({
    text: `${JOKES_COLUMNS_QUERY} FROM jokes WHERE joke_id = $1`,
    values: [id]
  });

  const joke = jokeRows.length === 1 && jokeRows[0];
  joke.categories = categories;
  res.json(joke);
}