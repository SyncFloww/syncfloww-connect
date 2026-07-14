
# SyncflowAI Frontend MVP — Phase 1 Plan

## Scope

Build the full Phase 1 frontend against the existing `api.syncfloww.com` backend, following a feature-based architecture. This is a large multi-turn build; this plan defines the architecture, migration approach, and delivery order so we can execute in focused batches.

## Current State

- TanStack Start v1 (SSR-capable) with file routing under `src/routes/`.
- Legacy `src/AppRoutes.tsx` uses `react-router-dom` — must be replaced with TanStack routes.
- `useAuth` hook + `apiClient` already wired to `https://api.syncfloww.com/api/auth/*`.
- shadcn UI primitives, Tailwind v4, TanStack Query available.
- Many pages exist as ports (`src/pages/*`) but not mounted as TanStack routes.

## Target Architecture

Feature-based, one folder per feature owning its slice end-to-end:

```text
src/
  routes/                 # TanStack file routes (thin — delegate to features)
    __root.tsx
    index.tsx             # Landing
    auth.login.tsx
    auth.register.tsx
    auth.forgot-password.tsx
    auth.reset-password.tsx
    auth.verify-email.tsx
    auth.callback.tsx
    _app.tsx              # protected layout (sidebar + topnav + Outlet)
    _app.onboarding.tsx
    _app.dashboard.tsx
    _app.ai-studio.tsx
    _app.content.tsx
    _app.content.$id.tsx
    _app.calendar.tsx
    _app.posts.new.tsx
    _app.posts.$id.tsx
    _app.media.tsx
    _app.brands.tsx
    _app.brands.$id.tsx
    _app.social-accounts.tsx
    _app.analytics.tsx
    _app.notifications.tsx
    _app.settings.tsx
  features/
    auth/                 { api, hooks, components, types }
    workspaces/
    brands/
    social-accounts/
    ai-studio/
    content/
    calendar/
    posts/
    media/
    analytics/
    notifications/
    settings/
  components/
    common/ layout/ forms/ charts/ editor/ ai/
    ui/                    # shadcn primitives (existing)
  contexts/                # ThemeContext, WorkspaceContext, BrandContext
  hooks/                   # generic (useHydrated, useDebounce, …)
  lib/                     # apiClient, query keys, formatters
  types/                   # shared DTOs
```

Each feature folder exports:
- `api.ts` — thin functions calling `apiClient`
- `queries.ts` — `queryOptions` + mutation hooks
- `components/` — feature-owned UI
- `types.ts` — DTOs matching backend

## State & Data Rules

- **TanStack Query** for all server state (auth, workspaces, brands, content, calendar, analytics, notifications, media).
- **React Context** only for: theme, active workspace id, active brand id.
- **URL search params** (via `validateSearch`) for filters/sort/pagination in Content Library, Calendar, Analytics.
- Loader shape: `ensureQueryData` in loader, `useSuspenseQuery` in component. `defaultPreloadStaleTime: 0`.
- Every protected route lives under `_app.tsx` which checks auth and redirects to `/auth/login` if no user.
- Every route has `errorComponent` + `notFoundComponent`.

## Backend Endpoint Mapping

Confirmed from the API screenshot:

```text
POST   /api/auth/register/
POST   /api/auth/login/
POST   /api/auth/logout/
POST   /api/auth/refresh/
GET    /api/auth/me/
GET    /api/auth/profile/         PUT /api/auth/profile/
POST   /api/auth/change-password/
POST   /api/auth/password-reset/  POST /api/auth/password-reset/confirm/
POST   /api/auth/verify-email/
DELETE /api/auth/account/
GET    /api/auth/referral/stats/  GET /api/auth/referral/validate/

GET/POST   /api/v1/workspaces/
GET/PATCH/DELETE /api/v1/workspaces/{id}/
POST   /api/v1/workspaces/{id}/invitations/
GET    /api/v1/workspaces/{id}/members/
POST   /api/v1/workspaces/invitations/{token}/accept/

GET/POST   /api/v1/brands/workspaces/{workspace_id}/
GET/PATCH/DELETE /api/v1/brands/workspaces/{workspace_id}/{id}/
```

Endpoints **not yet visible** and needed for Phase 1 (assumed under `/api/v1/…`, will confirm with user before wiring):
social accounts, AI generation, content/posts, media, calendar/schedule, analytics, notifications.

## Delivery Order (multi-turn)

Each phase is one shippable batch that typechecks and renders.

**Batch 1 — Foundation**
- Delete `src/AppRoutes.tsx` and legacy react-router entry point.
- Add `WorkspaceContext`, `BrandContext`, `ThemeContext`.
- Add `_app.tsx` protected layout with sidebar (`AppSidebar`) + topnav (workspace switcher, brand switcher, search stub, notifications, theme toggle, profile).
- Convert existing pages to TanStack routes; wire `useAuth` gating.
- Set head metadata per route.

**Batch 2 — Auth**
- Migrate `src/pages/Auth.tsx` into `features/auth` with separate Login / Register / Forgot / Reset / Verify Email screens and TanStack routes.
- Wire all `/api/auth/*` endpoints via feature api + query hooks.

**Batch 3 — Onboarding + Workspaces + Brands**
- Onboarding wizard (Workspace → Brand → Connect Socials → Welcome).
- Workspace switcher pulling `/api/v1/workspaces/`.
- Brand management CRUD against `/api/v1/brands/workspaces/{workspace_id}/…`.

**Batch 4 — Dashboard shell**
- Dashboard cards (Today's Posts, Scheduled, Connected Accounts, AI Generations, Drafts, Analytics snapshot, Recent Activity, Quick Actions). Cards read from feature queries; empty states where endpoints aren't wired yet.

**Batch 5 — AI Studio**
- Three-pane layout, prompt form, generated output actions, history panel. Wire to AI endpoints once user confirms them.

**Batch 6 — Content Library + Editor**
- Table/grid toggle, filters via URL search params, rich text editor with AI Improve, hashtag suggestions, character counter.

**Batch 7 — Calendar + Create/Edit Post**
- Month/Week/Day/Agenda views, drag-drop reschedule, color-coded status, quick create.

**Batch 8 — Media Library**
- Grid, upload, folders, preview.

**Batch 9 — Social Accounts**
- Connect cards for IG/FB/LinkedIn/X/TikTok/Pinterest/Threads with OAuth redirect flow.

**Batch 10 — Analytics + Notifications + Settings**
- KPI cards, charts (recharts), tables. Notifications list. Settings tabs (Profile / Workspace / Brand Defaults / Notifications / Appearance / Security).

**Batch 11 — Polish**
- Command palette, global search, keyboard shortcuts, loading skeletons, empty states, error boundaries, dark mode audit, responsive audit, SEO metadata pass.

## Open Questions (need answers before Batch 5+)

1. **Endpoints for AI generation, content/posts, media, calendar, analytics, notifications, social OAuth** — can you share the OpenAPI/Swagger link or expand the same page you screenshotted? Backend URL `https://api.syncfloww.com` — is there a `/schema/` or `/redoc/`?
2. **Multi-tenant model**: does every content/AI/media/analytics endpoint scope by `workspace_id` in the path (like brands do), or by header/JWT claim?
3. **Design direction**: the doc says "Notion meets Canva meets Buffer" — do you want me to define a distinctive visual system (colors, type, spacing tokens) as part of Batch 1, or defer visual polish until Batch 11? If defining now, do you have brand colors / logo tokens to lock in, or should I propose 2–3 directions?

## Recommendation

Approve this plan, answer Q1–Q3, and I'll execute **Batch 1 (Foundation) + Batch 2 (Auth)** in the next turn since they only depend on endpoints already confirmed. Later batches unblock as you confirm the remaining endpoints.
