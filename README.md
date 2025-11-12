MiniSNS — Frontend-only Social Networking Site Assignment

What this is
- A small, self-contained frontend app (HTML/CSS/JS) that simulates a simple social network.
- No backend. Data is stored in your browser's localStorage.

Features
- Signup and login (stored locally; passwords are stored in localStorage — this is for assignment/demo only).
- Create text posts with optional image upload (images are stored as data URLs in localStorage).
- Like posts, add comments, delete your own posts.
- Edit your profile bio.

Run
1. Open `index.html` in a browser (double-click or use "Open with" in your OS).
2. Click "Sign up / Login" to create an account or sign in.

Notes & assumptions
- The provided PDF was used as a reference, but if any instructions were ambiguous, this implementation follows common SNS assignment expectations: auth (client-side), create/read posts, likes, comments, profile edits.
- This is intentionally simple and readable so HR / reviewers can understand the code.

Files
- `index.html` — primary markup and structure
- `styles.css` — styles
- `app.js` — application logic (localStorage)

New/updated features in this version
- Navbar with Home, Profile, Friends, Messages, Notifications and Search
- Simple SPA-style navigation (show/hide pages) without server
- Banner slider on Home
- Trending topics and footer links
- Friends list (add/remove friend)
- Conversations/messages (localStorage)
- Notifications for likes, comments and messages

Next steps (optional improvements)
- Add client-side image size limits and cropping
- Add local-only pagination or infinite scroll for large feeds
- Separate modules and add automated tests

If you'd like, I can adapt this to match exact PDF requirements (please paste the PDF text or the key requirements).