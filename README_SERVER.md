# Express server for TCAR docs

This repository contains a simple Express server that serves the static site in the `docs/` directory and provides a POST `/submit` endpoint to receive the volunteer/foster application submissions from `docs/contact.html`.

Files added
- `server.js` — Express server that serves `docs/` and handles `POST /submit`.
- `package.json` — minimal package file with dependencies.
- `.gitignore` — ignores `node_modules`.

How to run locally
1. Install dependencies:

   npm install

2. Create a `.env` file in the repository root to configure optional settings, for example:

   ADMIN_TOKEN=your_admin_token_here
   ALLOWED_ORIGINS=http://localhost:3000,https://yourdomain.com

   - ADMIN_TOKEN (optional): a secret token required to access the admin submissions endpoint `/_submissions`.
   - ALLOWED_ORIGINS (optional): comma-separated list of allowed origin URLs for CORS. If omitted, the server will not set Access-Control-Allow-Origin and browsers will enforce same-origin requests.

3. Start the server:

   npm start

4. Open the contact page in your browser:

   http://localhost:3000/contact.html

Admin submissions endpoint
- The `/_submissions` endpoint is protected. It requires the `Authorization: Bearer <ADMIN_TOKEN>` header or the `?token=<ADMIN_TOKEN>` query parameter.

Example curl (using Authorization header):

  curl -H "Authorization: Bearer your_admin_token_here" http://localhost:3000/_submissions

Example curl (using query token):

  curl http://localhost:3000/_submissions?token=your_admin_token_here

Notes
- The server stores submissions in memory (an array) for demonstration only. Replace with persistent storage or email sending for production.
- The admin endpoint is intentionally protected; do not leave ADMIN_TOKEN empty in a public deployment.
- Tighten CORS before production (set ALLOWED_ORIGINS explicitly to the origins you trust).
- Use environment variables for secrets — do not commit them to source control.
