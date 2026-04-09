const express = require('express');
const cors = require('cors');
require('dotenv').config();

const casesRouter = require('./routes/cases');
const hearingsRouter = require('./routes/hearings');
const usersRouter = require('./routes/users');
const searchRouter = require('./routes/search');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/cases', casesRouter);
app.use('/api/hearings', hearingsRouter);
app.use('/api/users', usersRouter);
app.use('/api/search', searchRouter);

app.get('/api/health', (req, res) => {
  res.json({ status: 'Casehub API running' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Casehub API running on port ${PORT}`);
});

module.exports = app;