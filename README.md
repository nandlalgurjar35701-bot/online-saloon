# online-saloon-booking
Online saloon booking system (Node.js + Express + MongoDB).

## Local run
```bash
npm install
npm start
```

## Deploy on Render (from Git repo)
This repo includes `render.yaml`, so you can deploy directly as a Render Blueprint.

1. Push latest code to GitHub.
2. Open Render Dashboard -> New -> Blueprint.
3. Select this GitHub repo.
4. Render will detect `render.yaml` and create service `online-salon-app`.
5. Set required environment variables in Render:
   - `mongourl`
   - `SECRET`
   - `refreshToken`
   - `accessToken`
   - `key_id`
   - `key_secret`
   - `email`
   - `pass`
   - `url` (set this to your Render app URL, e.g. `https://online-salon-app.onrender.com`)
6. Click Deploy.

Build command: `npm install`  
Start command: `npm start`

## Notes
- `public/uploads` is local disk storage. On free cloud instances this storage is ephemeral, so uploaded files can be lost on restart/redeploy.
- For production, move uploads to cloud storage (Cloudinary, S3, etc.).
