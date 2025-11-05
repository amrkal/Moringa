````markdown
# Moringa Frontend (Next.js)

This is the Next.js App Router frontend for the Moringa system.

## Quick start

1) Configure environment

Create `.env.local` (or copy from `.env.local.example`):

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

2) Install and run the dev server (default E2E port: 3002)

```powershell
npm install
npx playwright install chromium
npm run dev -- -p 3002
```

Open http://localhost:3002

## E2E tests (Playwright)

With backend running at :8000 and this dev server at :3002:

```powershell
npm run test:e2e
```

The test `tests/e2e/analytics-exports.spec.ts` logs in via API, loads `/admin/dashboard`, triggers CSV/PDF exports, and verifies:
- Filenames: `sales-report-*.csv` and `sales-report-*.pdf`
- CSV contains header `Date,Orders,Revenue`
- PDF file is non-empty

Tip: You can override the base URL by setting `BASE_URL` when running tests.

```powershell
$env:BASE_URL='http://localhost:3002'; npm run test:e2e
```

## Notes

- API base URL is read from `NEXT_PUBLIC_API_URL` (default: http://localhost:8000/api/v1)
- The admin dashboard expects an authenticated admin token in localStorage (`token`).
  The Playwright test primes this via API login to +254712345678 / admin123.

```bash
```
````
