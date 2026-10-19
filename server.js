require('dotenv').config();
const express = require('express');
const path = require('path');
const app = express();

const ADMIN_TOKEN = process.env.ADMIN_TOKEN || null;
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || '').split(',').map(s => s.trim()).filter(Boolean);

// CORS / headers handling
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (ALLOWED_ORIGINS.length) {
    if (origin && ALLOWED_ORIGINS.includes(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
    }
  }
  // If no ALLOWED_ORIGINS provided, we do not set Access-Control-Allow-Origin
  // so browser will enforce same-origin behavior by default.
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

app.use(express.json());

// Serve the static site from the docs/ directory
const docsPath = path.join(__dirname, 'docs');
app.use(express.static(docsPath));

// Simple in-memory submissions store (for demo only)
const submissions = [];

app.post('/submit', (req, res) => {
  const { fullName, email, phone, interest, availability } = req.body || {};

  if (!fullName || !email || !availability) {
    return res.status(400).json({ error: 'Missing required fields: fullName, email, availability' });
  }

  const entry = {
    id: submissions.length + 1,
    fullName,
    email,
    phone: phone || null,
    interest: interest || null,
    availability,
    receivedAt: new Date().toISOString()
  };

  submissions.push(entry);
  console.log('Received submission:', entry);

  // In a real app you might persist the submission and send a confirmation email here.
  return res.json({ success: true, message: 'Submission received', entryId: entry.id });
});

function requireAdmin(req, res, next) {
  if (!ADMIN_TOKEN) {
    return res.status(403).json({ error: 'Admin access is not enabled on this server.' });
  }

  const auth = req.headers.authorization || '';
  if (auth.startsWith('Bearer ')) {
    const token = auth.slice(7);
    if (token === ADMIN_TOKEN) return next();
  }

  // allow token via query param for convenience over curl: /_submissions?token=...
  if (req.query && req.query.token === ADMIN_TOKEN) return next();

  return res.status(401).json({ error: 'Unauthorized' });
}

// Endpoint to view submissions (for local testing). Protected by ADMIN_TOKEN.
app.get('/_submissions', requireAdmin, (req, res) => {
  res.json({ count: submissions.length, submissions });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
  console.log(`Serving static files from ${docsPath}`);
});
