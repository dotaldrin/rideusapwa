# RideUSA PWA

Standalone React + TypeScript customer booking Progressive Web App for https://rideusa.rundelta.ai.

## Start locally

```powershell
cd C:\Users\jpald\source\repos\RideUsa
npm install
Copy-Item .env.example .env.local
npm run dev
```

Local Vite URL: http://localhost:5175

## Build

```powershell
npm run build
```

## Deploy

Push to `main` triggers `.github/workflows/azure-static-web-apps.yml`.
Set the GitHub Actions repository secret `AZURE_STATIC_WEB_APPS_API_TOKEN_RIDEUSA` to the deployment token from Azure Static Web App `rideusa`. In Azure add custom domain `rideusa.rundelta.ai`, then configure its CNAME in Network Solutions according to Azure's domain-validation instructions. Add `https://rideusa.rundelta.ai` to the RunDelta API's allowed CORS origins.

## Architecture

- `src/app` — app routing and global wiring
- `src/components` — reusable UI and layout
- `src/features/booking` — customer trip drafting
- `src/pages` — route pages
- `src/services` — API transport (no live requests yet)
- `src/types` — front-end types (must align with backend contracts before production)
- `src/styles` — styles
- `public` — PWA icons, Azure Static Web Apps routing config

**Important:** The booking form is a preview only. It does not submit requests, estimate prices, or accept payments. Before live bookings, integrate authentication, rate estimates, driver availability, SignalR ride updates, and Stripe through existing RunDelta backend contracts. Do not store gateway secrets in the browser.
