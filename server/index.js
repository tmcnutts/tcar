const express = require('express');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const app = express();
const PORT = process.env.PORT || 3000;
// allow overriding the submissions directory with an env var for private storage
const submissionsDir = path.resolve(process.env.SUBMISSIONS_DIR || path.join(__dirname, 'submissions'));
const adminToken = process.env.ADMIN_TOKEN || 'change-me';

// create the submissions directory with restrictive permissions (0700)
fs.mkdirSync(submissionsDir, { recursive: true, mode: 0o700 });

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

function requireAdmin(req, res, next) {
  const authHeader = req.get('authorization') || '';
  const tokenFromHeader = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;
  const tokenFromQuery = req.query.admin_token || '';
  const supplied = tokenFromHeader || tokenFromQuery;

  if (!supplied || supplied !== adminToken) {
    return res.status(401).json({ error: 'admin access required' });
  }

  next();
}

app.get('/admin/submissions', requireAdmin, (req, res) => {
  fs.readdir(submissionsDir, (err, files) => {
    if (err) {
      console.error('Failed to list submissions', err);
      return res.status(500).json({ error: 'Failed to list submissions' });
    }

    const jsonFiles = files
      .filter((file) => file.endsWith('.json'))
      .sort()
      .reverse();

    return res.json({ files: jsonFiles });
  });
});

app.get('/admin/submissions/:file', requireAdmin, (req, res) => {
  const file = req.params.file;
  if (!/^[a-zA-Z0-9._-]+$/.test(file)) {
    return res.status(400).json({ error: 'Invalid file name' });
  }

  const requestedFile = path.join(submissionsDir, file);
  if (!requestedFile.startsWith(submissionsDir)) {
    return res.status(400).json({ error: 'Invalid path' });
  }

  return res.sendFile(requestedFile, (err) => {
    if (err) {
      return res.status(404).json({ error: 'Submission not found' });
    }
  });
});

app.post('/submit', (req, res) => {
  const { fullName, email, phone, interest, availability } = req.body || {};

  if (!fullName || typeof fullName !== 'string' || fullName.trim().length < 2) {
    return res.status(400).json({ error: 'fullName is required' });
  }
  if (!email || typeof email !== 'string' || !/^\S+@\S+\.\S+$/.test(email)) {
    return res.status(400).json({ error: 'valid email is required' });
  }
  if (!availability || availability.trim().length < 10) {
    return res.status(400).json({ error: 'availability/experience is required' });
  }

  const submittedAt = new Date().toISOString();
  const safeName = fullName
    .replace(/[^a-z0-9-_ ]/gi, '')
    .replace(/\s+/g, '_')
    .slice(0, 50);

  const timestamp = submittedAt.replace(/[:.]/g, '-');
  const filename = `${timestamp}_${safeName || 'applicant'}.json`;
  const filepath = path.join(submissionsDir, filename);

  const record = {
    submittedAt,
    fullName,
    email,
    phone: phone || '',
    interest: interest || '',
    availability
  };

  fs.writeFile(filepath, JSON.stringify(record, null, 2), (err) => {
    if (err) {
      console.error('Failed to save submission', err);
      return res.status(500).json({ error: 'Failed to save submission' });
    }

    res.json({ status: 'ok', file: `submissions/${filename}` });
  });
});

app.listen(PORT, () => {
  console.log(`TCAR server listening on http://localhost:${PORT}`);
});
