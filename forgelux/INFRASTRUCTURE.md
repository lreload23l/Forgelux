# Forgelux — Infrastructure & Backend Plan

## What needs to exist for this to be a real product

---

## 1. Hosting & Deployment

### Frontend
- **Vercel** (recommended) or Netlify
- All HTML/CSS/JS files deploy as static assets
- Custom domain: `forgelux.io` + `app.forgelux.io` for published user apps
- CDN-cached globally — sub-100ms load times worldwide

### User-published apps
- Each published app gets a subdomain: `appname.forgelux.io`
- Or custom domain if on Enterprise plan
- Apps are rendered server-side from saved JSON definitions
- Hosted on Vercel Edge Functions or Cloudflare Workers

---

## 2. Backend API

### Stack recommendation
- **Runtime**: Node.js with Fastify (fast, low overhead)
- **Language**: TypeScript throughout
- **API style**: REST for CRUD, WebSockets for real-time (live builder collaboration, automation run logs)

### Core services
```
/api/v1/
  auth/           login, signup, refresh, logout, 2FA
  workspaces/     CRUD workspace settings
  apps/           CRUD apps, publish, unpublish
  builder/        save/load canvas state, template library
  automations/    CRUD flows, trigger, run history
  connectors/     OAuth handshakes, token storage, test calls
  team/           invite, remove, update roles
  billing/        Stripe webhooks, plan changes, invoices
  analytics/      aggregate run data, usage metrics
  webhooks/       register, test, deliver events
```

---

## 3. Database

### Primary database: PostgreSQL (via Supabase or Railway)
```sql
-- Core tables
users             id, email, name, avatar, created_at
workspaces        id, name, slug, owner_id, plan, settings_json
workspace_members workspace_id, user_id, role, invited_at, joined_at
apps              id, workspace_id, name, type, status, canvas_json, published_at
automations       id, workspace_id, name, flow_json, status, last_run_at
automation_runs   id, automation_id, status, started_at, completed_at, error_msg
connectors        id, workspace_id, type, credentials_encrypted, config_json
api_keys          id, workspace_id, key_hash, label, last_used_at
webhooks          id, workspace_id, url, events_json, secret, active
```

### Cache layer: Redis (via Upstash)
- Session tokens
- Rate limiting counters
- Real-time automation run status
- Connector response caching (TTL: 60s)

### File storage: Cloudflare R2 or AWS S3
- User-uploaded assets (images, logos)
- App exports and backups
- Connector OAuth tokens (encrypted at rest)

---

## 4. Authentication

### Stack: Better Auth or Auth.js
- Email + password (bcrypt hashing)
- Google OAuth
- GitHub OAuth
- Magic link (passwordless)
- TOTP two-factor (speakeasy library)
- SSO / SAML (Enterprise plan only — use WorkOS)

### Session strategy
- Short-lived JWT access tokens (15 min)
- Long-lived refresh tokens in httpOnly cookies (30 days)
- Token rotation on every refresh
- Session revocation stored in Redis

---

## 5. Billing — Stripe

### Products to create in Stripe
```
Starter  — £29/mo  or £23/mo billed annually (£276/yr)
Pro      — £99/mo  or £79/mo billed annually (£948/yr)
Enterprise — custom pricing, annual contract
```

### Stripe features needed
- Stripe Checkout for signup flow
- Stripe Customer Portal for self-serve plan changes
- Webhooks: payment_succeeded, payment_failed, subscription_cancelled
- Metered billing for automation runs over plan limit (Pro: 50k, Enterprise: custom)
- Proration handling for mid-cycle upgrades
- VAT/tax via Stripe Tax (auto-calculates for UK/EU customers)
- Invoice PDF generation

### Plan enforcement (server-side)
```typescript
// Check before every automation run
const workspace = await getWorkspace(workspaceId);
const runsThisMonth = await countRunsThisMonth(workspaceId);
if (runsThisMonth >= workspace.plan.runLimit) {
  throw new PlanLimitError('Run limit reached. Upgrade to continue.');
}
```

---

## 6. Automation Engine

The automation runner is the most technically complex piece.

### Architecture
```
Trigger fires
    ↓
Job added to queue (BullMQ + Redis)
    ↓
Worker picks up job
    ↓
Execute steps sequentially:
  - Call external APIs (HubSpot, Slack, etc.)
  - Run AI steps (call Claude/OpenAI API)
  - Evaluate conditions
  - Branch if needed
    ↓
Log each step result to DB
    ↓
Stream status to frontend via WebSocket
```

### Libraries
- **BullMQ** — job queue with retries, delays, concurrency control
- **Axios** — HTTP calls to external services
- **node-cron** — scheduled triggers
- **zod** — schema validation for step inputs/outputs

### Error handling
- Automatic retry with exponential backoff (3 attempts)
- Dead letter queue for permanently failed jobs
- Alert via email + Slack webhook on failure
- Full step-by-step audit log stored in DB

---

## 7. Connector OAuth

For connectors like Google Sheets, Salesforce, HubSpot:

```
User clicks "Connect"
    ↓
Redirect to provider OAuth screen
    ↓
Provider redirects back with auth code
    ↓
Server exchanges code for access + refresh token
    ↓
Tokens encrypted (AES-256) and stored in DB
    ↓
On each automation run: decrypt token, call API
    ↓
Auto-refresh expired tokens silently
```

### Security
- Tokens encrypted at rest with AES-256-GCM
- Encryption key stored in environment variable, not DB
- Tokens never exposed to frontend
- Connector calls proxied through backend only

---

## 8. Real-time Features

### WebSocket server (Socket.io or Partykit)
- Live automation run progress shown in UI
- Multi-user builder collaboration (cursors, locked components)
- Live data refresh in published apps

---

## 9. Email

### Provider: Resend (recommended) or SendGrid
```
Transactional emails:
  - Welcome + email verification
  - Password reset
  - Team invitation
  - Automation error alert
  - Payment failed warning
  - Trial ending in 3 days
  - Invoice receipt

Marketing emails (via Loops.so or Customer.io):
  - Onboarding sequence (days 1, 3, 7)
  - Feature announcements
  - Upgrade prompts when near limits
```

---

## 10. Monitoring & Observability

| Tool | Purpose |
|---|---|
| Sentry | Frontend + backend error tracking |
| Datadog or Axiom | Logs, metrics, alerting |
| Uptime Robot | Uptime monitoring + status page |
| PostHog | Product analytics, funnels, session replay |
| Stripe Dashboard | Revenue, churn, MRR |

---

## 11. Launch Checklist

### Legal (must-haves before charging money)
- [ ] Privacy Policy (covers GDPR, UK GDPR)
- [ ] Terms of Service
- [ ] Cookie Policy + consent banner
- [ ] Data Processing Agreement (for Enterprise)
- [ ] Company registered (Forgelux Ltd — Companies House)
- [ ] Business bank account

### Technical
- [ ] SSL certificates (automatic via Vercel)
- [ ] WAF + DDoS protection (Cloudflare)
- [ ] Rate limiting on all API routes
- [ ] Input validation + SQL injection protection
- [ ] OWASP Top 10 review
- [ ] Penetration test before enterprise sales
- [ ] SOC 2 audit (needed for enterprise — use Vanta to prepare)
- [ ] Automated backups every 6 hours

### Product
- [ ] Onboarding flow (guided first app creation)
- [ ] In-app help docs
- [ ] Support chat (Intercom or Crisp)
- [ ] Status page (statuspage.io)
- [ ] Feedback widget

---

## 12. Recommended Tech Stack Summary

| Layer | Choice | Monthly cost (est.) |
|---|---|---|
| Frontend hosting | Vercel Pro | £18 |
| Database | Supabase Pro | £20 |
| Cache | Upstash Redis | £10 |
| File storage | Cloudflare R2 | £5 |
| Auth | Better Auth (self-hosted) | £0 |
| Email | Resend | £17 |
| Queue | BullMQ + Upstash | £10 |
| Monitoring | Sentry + PostHog | £25 |
| SSO (Enterprise) | WorkOS | £0 until revenue |
| **Total** | | **~£105/mo** |

This covers infrastructure for up to ~500 workspaces comfortably. At scale, move database to dedicated Postgres and add more queue workers.

---

## 13. Build Order Recommendation

1. **Auth + DB schema** — nothing works without this
2. **Billing (Stripe)** — validate people will pay before building features
3. **App builder save/load API** — replace localStorage with real persistence
4. **Automation engine** — the core value proposition
5. **Connector OAuth** — Sheets, HubSpot, Slack first (highest demand)
6. **Analytics + monitoring** — know what's breaking
7. **Enterprise features** — SSO, audit logs, custom domain
