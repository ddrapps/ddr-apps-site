const express = require('express');
const { autocompletePlaces } = require('../lib/googlePlaces');

const router = express.Router();

router.post('/autocomplete', async (req, res) => {
  try {
    const { query = '', category = 'coffee' } = req.body || {};
    if (query.trim().length < 2) {
      return res.json({ results: [] });
    }

    const results = await autocompletePlaces({ query, category });
    return res.json({ results });
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Unknown error' });
  }
});

module.exports = router;
