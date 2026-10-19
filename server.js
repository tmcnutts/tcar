const express = require('express');
const path = require('path');
const app = express();

// Basic CORS headers in case you're serving the frontend from another origin
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
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

// Endpoint to view submissions (for local testing). Remove or protect in production.
app.get('/_submissions', (req, res) => {
  res.json({ count: submissions.length, submissions });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
  console.log(`Serving static files from ${docsPath}`);
});
