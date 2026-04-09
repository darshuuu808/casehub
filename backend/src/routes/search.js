const express = require('express');
const router = express.Router();
const { executeQuery, TYPES } = require('../db/sql');

// Public case search — no auth required
router.get('/', async (req, res) => {
  const { q } = req.query;
  if (!q) return res.status(400).json({ error: 'Search query required' });
  try {
    const result = await executeQuery(
      `SELECT id, title, petitioner, respondent, status, filed_date
       FROM Cases
       WHERE title LIKE @q OR petitioner LIKE @q OR respondent LIKE @q`,
      [{ name: 'q', type: TYPES.NVarChar, value: `%${q}%` }]
    );
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;