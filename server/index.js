const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json({ limit: '1mb' }));

// health check - server zinda hai ya nahi
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// main route - abhi sirf code receive karke wapas bhejega
app.post('/api/review', (req, res) => {
  const { code, language } = req.body;
  if (!code || !code.trim()) {
    return res.status(400).json({ error: 'No code provided' });
  }
  res.json({
    message: 'Code received successfully',
    language: language || 'unknown',
    characters: code.length,
    lines: code.split('\n').length,
  });
});

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));