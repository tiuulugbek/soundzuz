# Soundz cPanel deployment

This branch packages the `apps/web` Next.js frontend for cPanel Passenger.

## cPanel Node.js application settings

- Node.js: 22.x
- Mode: Production
- Application root: `test.soundz.uz`
- Application URL: `test.soundz.uz`
- Startup file: `server.js`

## Deploy

Upload or clone the complete contents of this branch into:

`/home/soundzuz/test.soundz.uz`

Then in cPanel:

1. Click **Install NPM Packages**.
2. Open Terminal and activate the Node.js environment shown by cPanel.
3. Run `cd /home/soundzuz/test.soundz.uz`.
4. Run `npm run build`.
5. Return to Setup Node.js App and click **Restart Application**.

## Environment variables

Set these in the cPanel Node.js application interface when the real values are available:

- `NEXT_PUBLIC_SITE_URL=https://test.soundz.uz`
- `NEXT_PUBLIC_API_URL=<public API URL>`

This branch deploys the frontend only. Docker, Redis, workers, monitoring, and the API are not started by Passenger.
