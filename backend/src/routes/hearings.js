const express = require('express');
const router = express.Router();
const { executeQuery, TYPES } = require('../db/sql');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

// Schedule a hearing (clerk only)
router.post('/', authenticateToken, authorizeRoles('clerk'), async (req, res) => {
  const { case_id, hearing_date, notes } = req.body;
  try {
    await executeQuery(
      `INSERT INTO Hearings (case_id, hearing_date, notes, status)
       VALUES (@case_id, @hearing_date, @notes, 'Scheduled')`,
      [
        { name: 'case_id', type: TYPES.Int, value: case_id },
        { name: 'hearing_date', type: TYPES.DateTime, value: new Date(hearing_date) },
        { name: 'notes', type: TYPES.NVarChar, value: notes || '' }
      ]
    );
    res.status(201).json({ message: 'Hearing scheduled successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get hearings for a case
router.get('/case/:case_id', authenticateToken, async (req, res) => {
  try {
    const result = await executeQuery(
      'SELECT * FROM Hearings WHERE case_id = @case_id ORDER BY hearing_date ASC',
      [{ name: 'case_id', type: TYPES.Int, value: parseInt(req.params.case_id) }]
    );
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update hearing status (judge only)
router.patch('/:id', authenticateToken, authorizeRoles('judge'), async (req, res) => {
  const { status, judgment } = req.body;
  try {
    await executeQuery(
      'UPDATE Hearings SET status = @status, judgment = @judgment WHERE id = @id',
      [
        { name: 'status', type: TYPES.NVarChar, value: status },
        { name: 'judgment', type: TYPES.NVarChar, value: judgment || '' },
        { name: 'id', type: TYPES.Int, value: parseInt(req.params.id) }
      ]
    );
    res.json({ message: 'Hearing updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;