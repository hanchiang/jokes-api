const router = require('express').Router();

const db = require('../db');
const { catchErrors } = require('../handlers/errorHandlers');
const jokesController = require('../controllers');

router.get('/', (req, res) => {
  res.json('Welcome to the jokes API!');
})

router.get('/jokes', async(req, res) => {
  const result = await db.query({
    text: 'SELECT * FROM Jokes',
    name: 'query jokes'
  });
  res.json(result.rows);
})

router.get('/jokes/random', catchErrors(jokesController.getRandom));

router.get('/jokes/random/:category', async(req, res) => {
  res.json('To be implemented');
})

module.exports = router;