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

## Customer flow

- **Visitor (not logged in):** search drivers, pick one, enter an email, book a **cash** ride. The API creates or reuses the Customer account for that email, sends the forgot-password email, and returns a ride token used to follow and cancel that one ride.
- **Activation:** the emailed link opens `/reset-password`. Setting a password confirms the email and logs the customer in.
- **Logged in:** the first page is **CASH | CARD** (`/pay`). Cash goes straight to booking. Card uses the saved Stripe card, or opens `/card` to add one.
- **Ride page** (`/ride/:id`): follows the ride through the backend `RideStatus` values by polling every 5 seconds.

Requires the backend cash-ride changes (`api/cash-rides`, `api/customer-onboarding`, `PaymentType` on ride contracts). Until those are deployed, visitor booking and the cash option return 404/400.

## Architecture

- `src/app/Ride` — booking page, ride status page, address and map components
- `src/app/Account` — log in, set password, CASH | CARD, card, account, settings
- `src/components/AppShell.tsx` — mobile shell: top icons and bottom menu
- `src/services` — API calls (`rideApi`, `accountApi`, `paymentApi`), session, per-device storage
- `src/types/contracts.ts` — TypeScript mirrors of `RunDelta.Contracts`
- `src/infrastructure/http` — `apiFetch` transport (cookie session + XSRF header)
- `public` — PWA icons, Azure Static Web Apps routing config

Stripe.js is loaded from `js.stripe.com` at runtime on the card page; no secret keys are stored in the browser.
