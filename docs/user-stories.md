# Cezar 12 — User Stories & QA Checklist

> Last updated: May 2026  
> Use this document for manual QA and regression testing.  
> Each story includes expected outcomes and known edge cases.

---

## 1. Registration & Email Verification

### US-01 · New user registers with valid data
**Route:** `POST /api/auth/register` → UI `/register`

**Steps:**
1. Navigate to `/register`
2. Select country (e.g. Saudi Arabia), full name, email, strong password, phone
3. Click "Create Account"

**Expected:**
- API returns `201` with `message: "Account created. Please verify your email."`
- UI shows the "Check your inbox" success screen
- `isVerified: false` in DB — user cannot log in yet

**Edge cases:**
- Duplicate email → `409` → UI shows "Email already registered"
- Weak password (< 8 chars, no uppercase) → client-side validation blocks submit
- Missing country → client-side validation blocks submit
- Rate limit exceeded → `429` → UI shows rate limit message

---

### US-02 · User tries to log in before email verified
**Route:** `POST /api/auth/login`

**Steps:**
1. Register (US-01)
2. Immediately try to log in

**Expected:**
- API returns `403` with `code: EMAIL_NOT_VERIFIED`
- UI shows "Not verified" banner with "Resend link" button
- Clicking "Resend link" calls `POST /api/auth/resend-verification`

---

## 2. Authentication

### US-03 · User logs in with correct credentials
**Route:** `POST /api/auth/login` → UI `/login`

**Steps:**
1. Navigate to `/login`
2. Enter valid verified email + password
3. Click "Sign In"

**Expected:**
- API returns `200` with `accessToken`, `refreshToken`, `user`, `subscription`, `tokenBalance`
- `accessToken` and `refreshToken` stored in `localStorage`
- Zustand `useAuthStore` hydrated (`isAuthenticated: true`)
- Redirect to `/dashboard`

**Edge cases:**
- Wrong password → `401` → "Invalid credentials" banner
- Non-existent email → `401` (same message, no enumeration)
- Rate limit → `429` → UI shows rate limit message

---

### US-04 · Expired access token is refreshed automatically
**Route:** `POST /api/auth/refresh`

**Steps:**
1. Log in (US-03)
2. Wait for access token to expire (or manually invalidate)
3. Make any authenticated API call

**Expected:**
- Axios interceptor catches `401` on the failed request
- Calls `POST /api/auth/refresh` with `refresh_token` from localStorage
- New tokens stored in localStorage
- Original request retried with new `accessToken`
- User sees no interruption

**Edge cases:**
- Refresh token also expired → interceptor clears localStorage, redirects to `/login`
- Multiple concurrent requests when token expires → only one refresh call fires (queue drains)

---

### US-05 · User logs out
**Route:** Client-side only (Zustand `logout()`)

**Steps:**
1. Log in
2. Click logout (wherever exposed)

**Expected:**
- `localStorage` items `access_token` and `refresh_token` removed
- Zustand store cleared (`isAuthenticated: false`, `user: null`)
- Redirect to `/login`

---

## 3. Company Setup

### US-06 · First-time user completes company profile
**Route:** `/setup`

**Steps:**
1. After first login, navigate to `/setup`
2. Fill in company name, industry (Ecommerce / Services / Restaurant / Real Estate), size, model, etc.
3. Submit

**Expected:**
- `POST /api/projects` or company API call succeeds
- `user.hasCompanyProfile` becomes `true`
- Redirected to `/plans` to select subscription

---

## 4. Subscription & Token Purchase

### US-07 · User selects a plan
**Route:** `/plans`

**Steps:**
1. After company setup, navigate to `/plans`
2. Select Silver / Gold / Platinum, choose billing cycle
3. Click "Subscribe"

**Expected:**
- Subscription created in DB
- `subscription.status: "active"`
- Token balance initialised (Silver: 500, Gold: 1000, Platinum: 2500)
- Redirect to `/dashboard`

---

### US-08 · User runs out of tokens and purchases addon pack
**Route:** `POST /api/tokens/addon`

**Steps:**
1. Exhaust all tokens by running AI services
2. Attempt to run another service

**Expected:**
- API returns `422` with `code: INSUFFICIENT_TOKENS`
- Axios interceptor redirects to `/plans`
- On `/plans`, addon packs are available for purchase
- After purchase, token balance updated, user can re-run service

---

## 5. Project Management

### US-09 · User creates a new project
**Route:** `POST /api/projects` → UI `/projects/new`

**Steps:**
1. Navigate to `/dashboard` → click "New Project"
2. Enter project name, select domain
3. Submit

**Expected:**
- Project created with `status: "draft"`
- Appears in project list on `/dashboard`
- "Score" shows placeholder until financial data entered

---

### US-10 · User enters financial data (domain data)
**Route:** `PATCH /api/projects/:id`

**Steps:**
1. Open a draft project
2. Enter domain-specific financial inputs (revenue, costs, margins, etc.)
3. Save

**Expected:**
- `domainData` field updated in DB
- UBO score calculated
- Risk band displayed: CRITICAL (0–24) · HIGH (25–54) · MEDIUM (55–84) · LOW (85–100)

---

## 6. AI Services

### US-11 · User requests a Growth Plan (AI service)
**Route:** `POST /api/services/growth-plan`

**Steps:**
1. Open a diagnosed project
2. Click "Generate Growth Plan"
3. Confirm token cost

**Expected:**
- `TokenService.deductTokens()` runs → balance decreases
- BullMQ job enqueued with `status: "queued"`
- UI shows loading state
- Worker picks up job, calls Anthropic Claude claude-opus-4-6
- `ai_jobs.status` changes to `"completed"`
- Arabic disclaimer appended to result
- User sees the generated plan

**Edge cases:**
- Not enough tokens → `422 INSUFFICIENT_TOKENS` → redirect to `/plans`
- AI provider call fails → job status `"failed"`, tokens refunded

---

### US-12 · User approves / rejects / defers an AI result
**Route:** `PATCH /api/services/:jobId/status`

**Steps:**
1. View a completed AI job
2. Click "Approve" / "Reject" / "Defer"

**Expected:**
- `ai_jobs.status` updated accordingly
- Approved results available in the relevant dashboard view
- Deferred results can be revisited later

---

## 7. Domain Intelligence Dashboards

### US-13 · Restaurant domain dashboard loads
**Route:** `/restaurant`

**Steps:**
1. Have a project with `domain: "restaurant"` and financial data
2. Navigate to `/restaurant`

**Expected:**
- KPI grid shows revenue, covers, COGS, GP margin
- Charts render without console errors
- Tabs for Kitchen / Revenue / Menu Analysis all load

---

### US-14 · Ecommerce domain dashboard loads
**Route:** `/ecommerce`

**Steps:**
1. Have a project with `domain: "ecommerce"` and financial data
2. Navigate to `/ecommerce`

**Expected:**
- Unit Economics tab: waterfall chart, KPI grid
- Product Mix tab: bar chart, sortable table with status badges
- Channel Profitability tab: revenue chart, ROAS table

---

### US-15 · Services domain dashboard loads
**Route:** `/services`

**Expected:**
- Capacity Analysis tab: utilisation gauge, scenario bar chart
- Rate Ladder tab: break-even line chart
- Pipeline Health tab: deal funnel with `<Cell>`-coloured bars

---

### US-16 · Real Estate domain dashboard loads
**Route:** `/real-estate`

**Expected:**
- Deal Pipeline tab: stage funnel, weighted KPIs
- Commission Tracker tab: earned vs target chart
- Market Index tab: demand score chart, buy/hold/watch signals

---

## 8. Admin Panel

### US-17 · Admin views user list
**Route:** `GET /api/admin/users`

**Steps:**
1. Log in as `role: "admin"`
2. Navigate to admin area

**Expected:**
- List of all users returned
- `audit_log` entry created for admin access

---

### US-18 · Support role is read-only
**Route:** Any mutating admin route

**Steps:**
1. Log in as `role: "support"`
2. Attempt to modify user subscription

**Expected:**
- `readOnly: true` set on request
- Mutating actions rejected with `403` or silent no-op

---

## 9. Known Bugs Fixed (Regression Checklist)

| # | Bug | Fix | Regression test |
|---|-----|-----|-----------------|
| 1 | `process.env.NEXT_PUBLIC_API_URL` in Vite app | Changed to `import.meta.env.VITE_API_URL` | `api.ts` baseURL resolves correctly |
| 2 | Redirect to `/packages` on token exhaustion | Changed to `/plans` | Token exhaustion flow redirects correctly |
| 3 | JWT RS256 in server.ts, HS256 in auth.ts | Unified to HS256 via `JWT_SECRET` | Login + refresh token round-trip succeeds |
| 4 | Routes not registered in `server.ts` | Added dynamic import of `routes/index.js` | All API endpoints respond |
| 5 | No `POST /auth/register` or `/auth/login` routes | Created `auth.ts` route file | Registration and login work end-to-end |
| 6 | `fakeLogin()` / `fakeRegister()` in UI | Replaced with real `apiPost()` calls | Login/register hit the real API |
| 7 | `docker-compose.yml` references missing `init.sql` | Removed volume mount | `docker compose up` succeeds without the file |
| 8 | CORS origin defaulted to port 3000 | Changed default to port 8080 (Vite) | Frontend can call API without CORS errors |
| 9 | `<Bar>` nested inside `<Bar>` in ServicesDashboard | Replaced with `<Cell>` | No runtime Recharts error |
| 10 | `routes.tsx` missing 3 domain routes | Synced with `App.tsx` | Lazy routes load correctly |

---

## 10. Environment Smoke Test

Before running QA, verify:

```bash
# 1. Infrastructure running
docker compose up -d
docker compose ps   # all services healthy

# 2. Dependencies installed
pnpm install --ignore-scripts

# 3. .env exists and has correct values
# Check: DATABASE_URL, REDIS_URL, JWT_SECRET, VITE_API_URL, FRONTEND_URL

# 4. Schema pushed
npx drizzle-kit push

# 5. API starts without error
pnpm --filter @cezar12/api dev
# → should say "API server running on port 3001"
# → GET http://localhost:3001/health → { status: "ok" }

# 6. Frontend starts
pnpm --filter @cezar12/web dev
# → should say "Local: http://localhost:8080"

# 7. Worker starts
pnpm --filter @cezar12/worker dev
```
