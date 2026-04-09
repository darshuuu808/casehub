const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { executeQuery, TYPES } = require('../db/sql');

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await executeQuery(
      'SELECT id, name, email, role FROM Users WHERE email = @email AND password = @password',
      [
        { name: 'email', type: TYPES.NVarChar, value: email },
        { name: 'password', type: TYPES.NVarChar, value: password }
      ]
    );
    if (result.length === 0) return res.status(401).json({ error: 'Invalid credentials' });

    const user = result[0];
    const token = jwt.sign(
      { id: user.id, name: user.name, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );
    res.json({ token, user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all users (admin/clerk only)
router.get('/', async (req, res) => {
  try {
    const result = await executeQuery('SELECT id, name, email, role FROM Users');
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;