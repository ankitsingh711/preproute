# PrepRoute — Test Management Application

A 5-page test authoring tool (login → dashboard → create test → add questions → preview & publish) built for the Preproute frontend evaluation task, against the live staging API at `https://admin-moderator-backend-staging.up.railway.app/api`.

## Stack

- **Vite + React 19 + TypeScript**
- **React Router** — routing across the 5 pages
- **TanStack Query** — server state, caching, mutations
- **Zustand** (`persist` middleware) — auth session and the in-progress question-authoring draft
- **React Hook Form + Zod** — all forms
- **Axios** — HTTP client with request/response interceptors
- **Tailwind CSS v4** — styling, theme tokens sampled directly from the Figma exports

## Running locally

```bash
npm install
npm run dev
```

Opens on `http://localhost:3000`. No `.env` needed — API calls go through a same-origin `/api` path that `vite.config.ts` proxies to the staging backend (see **CORS**, below, for why).

```bash
npm run build   # typecheck + production build
npm run lint    # oxlint
```

## Architecture

```
src/
  api/        axios client + one module per resource (auth, subjects, tests, questions)
  types/      TS types matching the API's *actual* response shapes (see below)
  store/      zustand: authStore (session), testDraftStore (question-authoring wizard state)
  components/
    ui/       design-system primitives (Button, Input, Select, MultiSelect, Tabs, Modal, ...)
    layout/   AppShell (sidebar+header), ProtectedRoute
    tests/    TestDetailsForm (shared by the full-page create/edit flow and the edit modal)
    questions/ rich-text editor, question list/editor panels
  pages/      one component per route
```

The **Create/Edit Test** form is a single shared component (`TestDetailsForm`) rendered two ways: as a full page (`/tests/new`, `/tests/:id/edit`, "Next"/"Save as Draft" buttons) and inside a modal (`EditTestModal`, "Save" button) reachable from the pencil icon on the test summary card in the Add Questions and Preview pages — matching the two corresponding Figma frames.

Dashboard and the full question-by-question preview list have no corresponding Figma frame (confirmed with the task owner) — both were designed to match the visual language of the frames that do exist (sidebar/header chrome, card and pill styles, spacing).

## Technical decisions worth calling out

**The provided API doc doesn't match the live server.** Before writing any UI code, I hit every endpoint directly with curl using the real credentials to nail down the actual contract. Notable differences:

- The response envelope is `{status: "success"|"error", message, data}`, not `{success: true, data}`.
- `POST /tests` rejects `status: null` (the doc's own example payload) — it must be omitted or set to one of `live|unpublished|scheduled|expired|draft`. Same for `PUT /tests/:id` with `scheduled_date`/`expiry_date: null` — found this one live, mid-testing, when publishing a test threw a 400.
- `GET /tests/:id` resolves `subject`/`topics`/`sub_topics` to **names**, but `POST /tests` requires **UUIDs** for the same fields. Editing an existing test re-resolves names back to ids by cross-referencing `/subjects`, `/topics/subject/:id`, and `/sub-topics/multi-topics` (`src/hooks/useResolveTestIds.ts`).
- `POST /questions/bulk` requires a `subject` UUID per question — undocumented, and the request fails without it. The `topic`/`sub_topic` field contract was inconsistent across otherwise-identical requests during testing (intermittent PostgREST schema-cache errors on the staging server) — the client sends them best-effort and retries once without them if the first attempt fails (`src/api/questions.ts`).
- `DELETE /tests/:id` isn't documented but works.
- `POST /questions/fetchBulk` was observed to intermittently return an empty result for question ids that the owning test still references (same class of staging flakiness). Since this call is only needed to render the question preview list, the "ready to publish" gate is based on the test's own `questions` array length instead, and the preview list degrades to a message rather than blocking publish (`src/pages/PreviewPublishPage.tsx`).
- There's no endpoint to update or delete a single question. "Editing" a question already synced to the backend works by creating a replacement via bulk-create and swapping its id into the test's `questions` array — the orphaned old row is harmless.

**CORS.** The staging API's CORS allowlist only includes `http://localhost:3000` — not this app's other local ports, and not any deployed domain. Rather than depend on that allowlist (which a production deployment can't rely on), the app calls a same-origin `/api/*` path everywhere; `vite.config.ts` proxies it in dev, `vercel.json` rewrites it in production. The browser never makes a cross-origin request.

**Rich text question editor.** The Figma toolbar (bold/italic/underline/strike/link/align/table/image/formula) is implemented in full visually; bold/italic/underline/strikethrough/link are wired to real `contentEditable`/`execCommand` formatting since the `question` field is a plain string. Table/image/formula are present but inert — out of scope for a plain-string field without a real rich-text backend.

## Test credentials

```
Username: vedant-admin
Password: vedant123
```
