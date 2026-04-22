const express = require('express');
const router = express.Router();
const Groq = require('groq-sdk');
const { executeQuery, TYPES } = require('../db/sql');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Generate AI summary for a case (judge and clerk only)
router.post('/summarize/:case_id', authenticateToken, authorizeRoles('judge', 'clerk'), async (req, res) => {
  try {
    // Fetch case details
    const caseResult = await executeQuery(
      'SELECT * FROM Cases WHERE id = @id',
      [{ name: 'id', type: TYPES.Int, value: parseInt(req.params.case_id) }]
    );

    if (caseResult.length === 0) return res.status(404).json({ error: 'Case not found' });
    const caseData = caseResult[0];

    // Fetch hearing history
    const hearings = await executeQuery(
      'SELECT * FROM Hearings WHERE case_id = @id ORDER BY hearing_date ASC',
      [{ name: 'id', type: TYPES.Int, value: parseInt(req.params.case_id) }]
    );

    const hearingText = hearings.length === 0
      ? 'No hearings scheduled yet.'
      : hearings.map(h => `- ${new Date(h.hearing_date).toLocaleDateString()}: ${h.status} — ${h.judgment || 'No judgment recorded'}`).join('\n');

    const prompt = `You are a legal assistant AI for an Indian court case management system.

Here is the case details:
- Case Title: ${caseData.title}
- Petitioner: ${caseData.petitioner}
- Respondent: ${caseData.respondent}
- Description: ${caseData.description}
- Current Status: ${caseData.status}
- Filed Date: ${new Date(caseData.filed_date).toLocaleDateString()}

Hearing History:
${hearingText}

Please provide:
1. A concise 3-4 sentence summary of this case
2. Current stage of the case
3. Suggested next action for the judge

Keep the response professional and concise.`;

    const completion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'llama-3.3-70b-versatile',
      max_tokens: 400
    });

    const summary = completion.choices[0].message.content;

    res.json({ summary, case_id: req.params.case_id });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;