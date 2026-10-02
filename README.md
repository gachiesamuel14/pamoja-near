# Pamoja

Location-based matchmaking for Kenya. This repo is a deployable frontend MVP: profiles, county and distance filters, swipe, matches, chat, safety, and a place for M-Pesa premium later.

Live demo stores data in the browser. It is not a production dating backend.

## Stack for a real launch

- Frontend: this site, or Next.js if you outgrow the static app
- Auth: phone OTP (Africa's Talking or Twilio) plus email
- API: Node.js on a small host, or Netlify Functions
- Database: PostgreSQL with PostGIS for “who is within N km”
- Photos: Cloudinary or S3
- Chat: WebSockets or a hosted realtime service
- Payments: Safaricom Daraja STK push
- Maps: browser Geolocation plus county/town labels. Google Maps is optional

## Matching

Store latitude and longitude. Filter by county, age, mode (student, professional, church), then rank with haversine distance. Mutual likes create a match and open chat.

## Deploy

Static site. Netlify publish directory is the repo root. No build command.
