const express = require('express');
const router = express.Router();
const { executeQuery, TYPES } = require('../db/sql');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const { BlobServiceClient } = require('@azure/storage-blob');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

// File a new case (Lawyer only)
router.post('/', authenticateToken, authorizeRoles('lawyer'), async (req, res) => {
  const { title, description, petitioner, respondent } = req.body;
  try {
    await executeQuery(
      `INSERT INTO Cases (title, description, petitioner, respondent, filed_by, status, filed_date)
       VALUES (@title, @desc, @petitioner, @respondent, @filed_by, 'Pending', GETDATE())`,
      [
        { name: 'title', type: TYPES.NVarChar, value: title },
        { name: 'desc', type: TYPES.NVarChar, value: description },
        { name: 'petitioner', type: TYPES.NVarChar, value: petitioner },
        { name: 'respondent', type: TYPES.NVarChar, value: respondent },
        { name: 'filed_by', type: TYPES.Int, value: req.user.id }
      ]
    );
    res.status(201).json({ message: 'Case filed successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all cases
router.get('/', authenticateToken, authorizeRoles('clerk', 'judge', 'lawyer'), async (req, res) => {
  try {
    let query = 'SELECT * FROM Cases';
    if (req.user.role === 'lawyer') {
      query += ' WHERE filed_by = ' + req.user.id;
    }
    const result = await executeQuery(query);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update case status (clerk only)
router.patch('/:id/status', authenticateToken, authorizeRoles('clerk'), async (req, res) => {
  const { status, judge_id } = req.body;
  try {
    await executeQuery(
      'UPDATE Cases SET status = @status, judge_id = @judge_id WHERE id = @id',
      [
        { name: 'status', type: TYPES.NVarChar, value: status },
        { name: 'judge_id', type: TYPES.Int, value: judge_id },
        { name: 'id', type: TYPES.Int, value: parseInt(req.params.id) }
      ]
    );
    res.json({ message: 'Case updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Upload document for a case (lawyer only)
router.post('/:id/documents', authenticateToken, authorizeRoles('lawyer'), upload.single('document'), async (req, res) => {
  try {
    const blobServiceClient = BlobServiceClient.fromConnectionString(process.env.AZURE_STORAGE_CONNECTION_STRING);
    const containerClient = blobServiceClient.getContainerClient('case-documents');

    const blobName = `case-${req.params.id}-${Date.now()}-${req.file.originalname}`;
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);

    await blockBlobClient.uploadData(req.file.buffer, {
      blobHTTPHeaders: { blobContentType: req.file.mimetype }
    });

    const documentUrl = blockBlobClient.url;

    await executeQuery(
      'INSERT INTO Documents (case_id, file_name, blob_url, uploaded_by, uploaded_at) VALUES (@case_id, @file_name, @blob_url, @uploaded_by, GETDATE())',
      [
        { name: 'case_id', type: TYPES.Int, value: parseInt(req.params.id) },
        { name: 'file_name', type: TYPES.NVarChar, value: req.file.originalname },
        { name: 'blob_url', type: TYPES.NVarChar, value: documentUrl },
        { name: 'uploaded_by', type: TYPES.Int, value: req.user.id }
      ]
    );

    res.status(201).json({ message: 'Document uploaded successfully', url: documentUrl });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;