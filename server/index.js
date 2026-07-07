const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json({ limit: '1mb' }));

// Supabase se connection
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

// DARBAN: har request pe token check karega
async function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }
  const token = authHeader.split(' ')[1];
  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
  req.user = data.user; // aage ke code ko pata rahega kaun hai
  next(); // sab sahi hai, andar aane do
}

// health check - ye bina login ke bhi chalega
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// review route - ab DARBAN ke peeche hai
app.post('/api/review', requireAuth, (req, res) => {
  const { code, language } = req.body;
  if (!code || !code.trim()) {
    return res.status(400).json({ error: 'No code provided' });
  }
  res.json({
    message: 'Code received successfully',
    user: req.user.email,
    language: language || 'unknown',
    characters: code.length,
    lines: code.split('\n').length,
  });
});

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));