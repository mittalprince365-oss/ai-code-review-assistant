const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json({ limit: '1mb' }));

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

// DARBAN: token check + user ka apna supabase connection banao
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
  req.user = data.user;
  req.token = token; // token aage bhi chahiye hoga
  next();
}

// health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// review route - ab database mein bhi save karega
app.post('/api/review', requireAuth, async (req, res) => {
  const { code, language } = req.body;
  if (!code || !code.trim()) {
    return res.status(400).json({ error: 'No code provided' });
  }
  if (code.length > 50000) {
    return res.status(400).json({ error: 'Code too large (max 50KB)' });
  }

  // abhi ke liye simple result (Day 6 pe ESLint, Day 8 pe AI yahan judenge)
  const reviewResult = {
    message: 'Code received successfully',
    language: language || 'unknown',
    characters: code.length,
    lines: code.split('\n').length,
  };

  // USER KE NAAM SE database mein save karo
  // (user ka apna connection banate hain taaki RLS policy kaam kare)
  const userClient = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_KEY,
    { global: { headers: { Authorization: `Bearer ${req.token}` } } }
  );

  const { data: saved, error: dbError } = await userClient
    .from('reviews')
    .insert({
      user_id: req.user.id,
      language: language || 'unknown',
      code_snippet: code,
      results: reviewResult,
    })
    .select()
    .single();

  if (dbError) {
    console.log('DB Error:', dbError.message);
    return res.status(500).json({ error: 'Could not save review' });
  }

  res.json({
    ...reviewResult,
    user: req.user.email,
    review_id: saved.id,
    saved: true,
  });
});

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));