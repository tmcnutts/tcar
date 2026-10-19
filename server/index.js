const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const submissionsDir = path.join(__dirname, 'submissions');

fs.mkdirSync(submissionsDir, { recursive: true });

app.use(express.json());

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
