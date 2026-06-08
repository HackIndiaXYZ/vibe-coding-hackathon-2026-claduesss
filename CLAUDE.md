# SmileChain — Claude Code Context

## Project
Instagram-like social platform. Smile intensity (face-api.js, browser-side) = currency. Next.js 14 App Router + Supabase + OpenAI GPT-3.5.

## Stack
- **Framework:** Next.js 14 App Router, TypeScript
- **Styling:** Tailwind CSS + shadcn/ui + Framer Motion
- **Icons:** Lucide React (`lucide-react`)
- **Auth/DB/Storage:** Supabase (Google OAuth, Postgres, Storage)
- **AI:** face-api.js (client smile detection) + OpenAI GPT-3.5 (captions via API route)
- **Deploy:** Vercel

## Key Docs
- `docs/architecture.md` — file structure, data flows, DB schema, RLS policies
- `docs/style.md` — color system, typography, animations, component styles
- `docs/instruction.md` — local setup, Supabase config, model download

## Color System
- Primary yellow: `#FFD93D` (smile-500)
- Accent orange: `#FF6B35` (glow-500)
- Background: `#FFFBF0` (warm white)
- See `docs/style.md` for full palette + Tailwind token names

## DB Tables
`users`, `posts`, `follows`, `smile_gifts`, `notifications`
Schema in `docs/architecture.md` and `supabase/migrations/001_initial.sql`

## Important Patterns

### Supabase clients
- Browser components: `import { createClient } from '@/lib/supabase/client'`
- Server components / API routes: `import { createClient } from '@/lib/supabase/server'`
- Never use service role key in client code

### Smile detection
- face-api.js runs entirely client-side
- Models served from `/public/models/` — never fetch from CDN in production
- `lib/face-api.ts` exports `detectSmile(imgElement)` → `{ score, tier, points }`
- Tier mapping in `lib/smile-points.ts` — single source of truth

### Caption generation
- Only via `POST /api/caption` — OPENAI_API_KEY is server-side only
- Never import `lib/openai.ts` in client components

### Follow logic
- Public account → INSERT follows with status='accepted' directly
- Private account → INSERT with status='pending' + INSERT notification
- RLS on posts enforces visibility — don't filter in JS, let Supabase handle it

### Auth flow
- OAuth callback: `app/api/auth/callback/route.ts`
- After login: check if users.username is null → redirect /onboarding
- Auth guard in `app/(app)/layout.tsx`

## Commit Workflow

When the user says "commit", "commit it", "push", or any variation:
1. `git add` all relevant changed files (never add .env.local or secrets)
2. Generate a clean Conventional Commits message: `type(scope): subject` — subject ≤50 chars
3. `git commit -m "..."`
4. `git push origin main`

Commit types: `feat` (new feature), `fix` (bug fix), `docs` (docs only), `style` (formatting), `refactor`, `chore` (deps/config), `build`

## Dev Commands
```bash
npm run dev       # start dev server
npm run build     # production build
npm run lint      # ESLint
```

## Environment Variables
```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
OPENAI_API_KEY            # server-side only, no NEXT_PUBLIC_
NEXT_PUBLIC_APP_URL
```
