# RoomRaven

RoomRaven is a hosted, white-label room-planning app for DIY retailers. The current implementation ships a bathroom-first planner with:

- room dimensions plus door/window constraints
- optional bathroom fixtures
- rules-based layout generation with 8 candidate concepts
- OpenRouter-powered photoreal rendering with 2D SVG fallback
- 1-vs-1 elimination matchups until one layout wins
- magic-link saved projects and generic shopping lists
- tenant-specific branding, catalog mappings, and analytics
- a public embed SDK: `RoomRaven.init({ tenantId, locale, roomType, mountTarget })`

## Stack

- Next.js 16 App Router
- React 19
- SQLite via `better-sqlite3`
- Zod validation
- Vitest unit tests

## Getting started

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Environment

Optional environment variables:

```bash
OPENROUTER_API_KEY=...
OPENROUTER_MODEL=google/gemini-2.5-flash-image-preview
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

If `OPENROUTER_API_KEY` is missing, RoomRaven automatically falls back to 2D SVG layout cards.

## Key routes

- `/` marketing homepage with demo links
- `/planner?tenantId=praxis-demo&locale=nl&roomType=bathroom` planner UI
- `/admin?tenantId=praxis-demo` white-label admin
- `/saved/[token]` saved magic-link project
- `/roomraven-embed.js` public embed script

## API surface

- `POST /api/sessions` create a layout session
- `POST /api/sessions/:sessionId/generate` generate and render layout options
- `POST /api/sessions/:sessionId/vote` store a matchup choice
- `POST /api/sessions/:sessionId/save` save the winning project and return a magic link
- `GET /api/saved-projects/:token` fetch a saved project payload
- `GET|PUT /api/tenants/:tenantId` read or update tenant settings
- `GET /api/tenants/:tenantId/analytics` fetch tenant funnel analytics
- `POST /api/catalog-imports` import generic catalog mappings
- `POST /api/events` record analytics events such as shopping list views and retailer clicks

## Demo tenants

The SQLite seed creates these tenants automatically:

- `praxis-demo`
- `hornbach-demo`
- `ikea-demo`

## Scripts

```bash
npm run dev
npm run build
npm run typecheck
npm run test
```
