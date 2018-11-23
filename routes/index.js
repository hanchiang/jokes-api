const router = require('express').Router();
const db = require('../db');

router.get('/jokes', async(req, res) => {
  const result = await db.query({
    text: 'SELECT * FROM Jokes',
    name: 'query jokes'
  });
  res.json(result.rows);
})

module.exports = router;