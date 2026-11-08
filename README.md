# Eventide – Responsive Event Management Website

K Explore Web Designing assignment: a modern, responsive site where users can browse upcoming events, search and filter them, read details, and register.

## Live demo
- Website: https://YOUR-USERNAME.github.io/eventide/
- Repository: https://github.com/YOUR-USERNAME/eventide

## Features
- Hero section with a live countdown to the next event
- Event cards with image, date, time, venue and short description
- Search by name, venue or topic, plus category filter chips
- Event details popup with seats left and its own countdown
- Registration form (name, email, phone, event) with JavaScript validation
  - Name: letters only, 3+ characters
  - Email: valid format
  - Phone: 10-digit Indian mobile number
  - Blocks duplicate registrations and full events
- Confirmation message with a reference number after registering
- Bonus: dark/light mode, countdown timers, animations, Local Storage for registrations and theme, "My registrations" with cancel
- Fully responsive (mobile, tablet, desktop), keyboard accessible, respects reduced-motion

## Tech stack
HTML5, CSS3 (Grid, Flexbox, CSS variables), vanilla JavaScript (no frameworks). Git and GitHub for version control, GitHub Pages for deployment.

## How it works
- `index.html` – page structure and dialogs
- `style.css` – theme variables, responsive layout, transitions
- `script.js` – event data, rendering, search/filter, validation, Local Storage, countdowns
- Event dates are generated relative to today, so countdowns always show upcoming events.
- Event artwork is generated as SVG in JavaScript, so no external image files are needed.

## Run locally
Open `index.html` in a browser. No build step.
