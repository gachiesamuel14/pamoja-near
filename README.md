# Pamoja

Location-based matchmaking for people in Kenya. This repository is the frontend MVP hosted on Netlify.

Live demo: https://pamoja-near.netlify.app

Data stays in the browser (localStorage). It is a product prototype, not a production dating backend.

## What the demo includes

- Registration and login (18+ only)
- Profile: photo, age, bio, county, town, interests, tribe, religion, mode
- Browser GPS, with a county fallback
- Nearby cards ranked by distance, shared interests, and mode
- Filters: county, distance, age, tribe, religion, lifestyle mode
- Like / pass, mutual matches, in-app chat
- Notifications, report, and block
- Premium screen with an M-Pesa phone field (no real charge)

## Production stack when you leave the demo

- Auth: phone OTP via Africa's Talking, plus email
- API: Node.js (Netlify Functions or a small VPS)
- Database: PostgreSQL + PostGIS
- Photos: Cloudinary
- Chat: a realtime service (Ably, Supabase Realtime, or Socket.io)
- Payments: Safaricom Daraja STK Push
- Maps: Geolocation API; Google Maps only if you need a map view

## Deploy

Static site. Netlify publish directory is the repo root. No build command.
Push to `main` if the site is linked to this GitHub repo.
