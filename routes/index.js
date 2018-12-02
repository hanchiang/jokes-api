const router = require('express').Router();

const db = require('../db');
const { catchErrors } = require('../handlers/errorHandlers');
const jokesController = require('../controllers');

router.get('/', (req, res) => {
  res.json({ message: 'Welcome to the jokes API!'});
})

// TODO: Pagination
router.get('/jokes', catchErrors(jokesController.getJokes));

router.get('/jokes/random', catchErrors(jokesController.getRandom));

router.get('/jokes/random/:category', async(req, res) => {
  res.json('To be implemented');
})

module.exports = router;