# Express server for TCAR docs

This repository contains a simple Express server that serves the static site in the `docs/` directory and provides a POST `/submit` endpoint to receive the volunteer/foster application submissions from `docs/contact.html`.

Files added
- `server.js` — Express server that serves `docs/` and handles `POST /submit`.
- `package.json` — minimal package file with `express` dependency.
- `.gitignore` — ignores `node_modules`.

How to run locally
1. Install dependencies:

   npm install

2. Start the server:

   npm start

3. Open the contact page in your browser:

   http://localhost:3000/contact.html

Notes
- The server stores submissions in memory (an array) for demonstration only. Replace with persistent storage or email sending for production.
- There is a debug endpoint at `/_submissions` that returns all received submissions; remove or secure it before deploying publicly.
- If you host the frontend separately, ensure CORS and origin settings are configured appropriately.

If you'd like, I can open a PR that:
- Adds server + README (done here), or
- Updates `docs/contact.html` to show an example of using a hosted serverless endpoint or a third-party form provider.
