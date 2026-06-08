# SmileChain — Implementation Todo

Step-by-step execution order. Each phase must be complete before the next begins.

---

## Phase 1 — Project Setup

- [ ] Install core dependencies
  ```bash
  npm install @supabase/supabase-js @supabase/ssr
  npm install framer-motion
  npm install openai
  npm install face-api.js
  npm install canvas-confetti
  npm install lucide-react
  ```
- [ ] Install + init shadcn/ui
  ```bash
  npx shadcn@latest init
  npx shadcn@latest add button card avatar badge dialog dropdown-menu input label separator sheet
  ```
- [ ] Update `tailwind.config.ts` — add custom colors (`smile-*`, `glow-*`), Nunito font, extend border-radius
- [ ] Update `globals.css` — Nunito import, CSS variables, base styles
- [ ] Update `layout.tsx` — Nunito font, correct metadata (title, description, OG)
- [ ] Create `.env.local` from `.env.example`, fill in keys
- [ ] Download face-api.js model weights into `public/models/`
  - `tiny_face_detector_model-weights_manifest.json` + shard
  - `face_landmark_68_model-weights_manifest.json` + shard
  - `face_expression_model-weights_manifest.json` + shard
- [ ] Run `npm run dev` — confirm blank app loads at localhost:3000

---

## Phase 2 — Supabase + Auth Foundation

- [ ] Run `supabase/migrations/001_initial.sql` in Supabase SQL Editor
  - Creates: `users`, `posts`, `follows`, `smile_gifts`, `notifications` tables
  - Creates: all indexes, RLS policies, `handle_new_user` trigger
- [ ] Create Supabase Storage bucket `posts` (public read, authenticated write)
- [ ] Enable Google OAuth in Supabase → Authentication → Providers
- [ ] Create `src/lib/supabase/client.ts` — browser Supabase client
- [ ] Create `src/lib/supabase/server.ts` — server Supabase client (cookie-based)
- [ ] Create `src/app/api/auth/callback/route.ts` — OAuth callback handler
  - Exchange code for session
  - Check if `users.username` is null → redirect `/onboarding`
  - Else redirect `/feed`
- [ ] Create `src/types/index.ts` — TypeScript types for all DB rows

---

## Phase 3 — Core Library

- [ ] Create `src/lib/smile-points.ts`
  - `getSmileTier(score)` → `{ tier, points, emoji, label }`
  - Score → tier mapping (0–0.4 none, 0.4–0.6 mild, 0.6–0.8 big, 0.8–1.0 beam)
- [ ] Create `src/lib/face-api.ts`
  - `loadModels()` — loads all 3 models from `/public/models/`
  - `detectSmile(imgElement)` → `{ score, tier, points, emoji }`
- [ ] Create `src/lib/openai.ts`
  - `generateCaption(score, tier)` → string (server-side only)
- [ ] Create `src/app/api/caption/route.ts`
  - POST `{ score, tier }` → call `generateCaption` → return `{ caption }`
- [ ] Create `src/hooks/useCurrentUser.ts`
  - Fetch authed user row from `users` table, cache with SWR or React state

---

## Phase 4 — Homepage (Public)

- [ ] Build `src/app/page.tsx` — full landing page
  - Hero section: tagline, subheading, Google sign-in CTA button
  - How it works: 4-step flow with icons + Framer Motion scroll reveals
  - Smile tiers: 4 tier cards with tier-specific glow colors
  - Features grid: 6 feature cards
  - Footer: team name, hackathon
  - All entrance animations via Framer Motion `whileInView`
- [ ] Floating emoji decorations with `animate` loop (float up/down)
- [ ] Google sign-in button links to `/login`

---

## Phase 5 — Login + Onboarding

- [ ] Build `src/app/login/page.tsx`
  - Centered card with SmileChain logo + tagline
  - "Continue with Google" button → triggers Supabase OAuth
  - Framer Motion entrance animation on card
- [ ] Build `src/app/onboarding/page.tsx`
  - Username input (validate unique against `users` table)
  - Public / Private toggle with description
  - Submit → UPDATE users row → redirect `/feed`
  - Guard: if user already has username → redirect `/feed`

---

## Phase 6 — App Shell (Navbar + Layout)

- [ ] Build `src/components/Navbar.tsx`
  - Logo left
  - Nav links: Feed, Explore, Search, Upload (icon button)
  - Right side: NotificationBell + avatar → profile link
  - Framer Motion slide-down on mount
  - Mobile: bottom tab bar
- [ ] Build `src/app/(app)/layout.tsx`
  - Auth guard: no session → redirect `/login`
  - Onboarding guard: no username → redirect `/onboarding`
  - Renders `<Navbar />` + `{children}`

---

## Phase 7 — Feed (Dashboard)

- [ ] Build `src/app/(app)/feed/page.tsx`
  - Fetch posts from followed users (accepted follows only) ordered by `created_at DESC`
  - Render staggered list of `<PostCard />`
  - Empty state: "Follow people to see their smiles" with Explore CTA
- [ ] Build `src/components/PostCard.tsx`
  - Avatar + username + timestamp header
  - Post image (rounded)
  - Smile tier badge overlaid on image (bottom-left)
  - AI caption in italic below image
  - Gift button (😊) + total gifts count
  - Framer Motion card entry animation
- [ ] Build `src/hooks/usePosts.ts` — reusable feed + explore query hook

---

## Phase 8 — Explore

- [ ] Build `src/app/(app)/explore/page.tsx`
  - Fetch all public posts ordered by `created_at DESC`
  - Same `<PostCard />` grid/list
  - Empty state if no posts yet

---

## Phase 9 — Upload Flow

- [ ] Build `src/app/(app)/upload/page.tsx` + `src/components/UploadFlow.tsx`
  - **Step 1:** Drag-or-click image picker, preview
  - **Step 2:** Run `detectSmile()` → `<SmileReveal />` animated score display
    - Confetti via `canvas-confetti` if tier === 'beam'
    - 0 pts: friendly "try again" message
  - **Step 3:** Show AI-generated caption (fetch `/api/caption`)
  - **Step 4:** Submit button → upload to Supabase Storage → INSERT post → UPDATE user points → redirect `/feed`
  - Step indicator with Framer Motion transitions between steps
- [ ] Build `src/components/SmileReveal.tsx`
  - Animated score number counting up
  - Tier emoji + label reveal
  - Spring animation on mount

---

## Phase 10 — Profile Page

- [ ] Build `src/app/(app)/profile/[username]/page.tsx`
  - Fetch user by username from `users` table
  - **Own profile:** edit button → settings, shows all posts + total smile points
  - **Others — public:** shows posts, follow/unfollow button
  - **Others — private + not following:** locked state (`<PrivateLock />`)
  - **Others — private + following:** shows posts
  - Follower / following counts (click to see list — modal or inline)
  - Posts grid (3-col)
- [ ] Build `src/components/FollowButton.tsx`
  - States: Follow / Pending / Following / Unfollow
  - Handles public (instant accept) vs private (pending) logic
  - Framer Motion spring on state change
- [ ] Build `src/components/PrivateLock.tsx`
  - Lock icon, "This account is private" message, follow CTA

---

## Phase 11 — Search

- [ ] Build `src/app/(app)/search/page.tsx`
  - Search input (debounced, 300ms)
  - Query `users` by username ILIKE
  - Results list: avatar + username + follow button
  - Empty state for no results

---

## Phase 12 — Gifting System

- [ ] Add gift logic to `<PostCard />`
  - On 😊 click: guard (not self, not already gifted, has points)
  - INSERT `smile_gifts` row
  - UPDATE giver points -1, receiver points +1
  - INSERT `gift_received` notification for post owner
  - Animate gift count increment + floating +1 popup (Framer Motion)
  - Optimistic UI update

---

## Phase 13 — Notifications

- [ ] Build `src/app/(app)/notifications/page.tsx`
  - List all notifications ordered by `created_at DESC`
  - `follow_request`: avatar + name + Accept / Decline buttons
    - Accept: UPDATE follows status → INSERT follow_accepted notification
    - Decline: DELETE follows row
  - `follow_accepted`: "X started following you"
  - `gift_received`: "X gifted you a smile on [post]"
  - Mark all as read on page load
- [ ] Build `src/components/NotificationBell.tsx`
  - Unread count badge (Framer Motion scale-pop)
  - Dropdown preview of last 5 notifications
  - "See all" link → `/notifications`

---

## Phase 14 — Settings

- [ ] Build `src/app/(app)/settings/page.tsx`
  - Update display name
  - Update username (validate uniqueness)
  - Toggle public / private account
  - Sign out button
  - Danger zone: delete account (with confirmation dialog)

---

## Phase 15 — Polish + Animations

- [ ] Add `AnimatePresence` page transitions in `(app)/layout.tsx`
- [ ] Add `whileInView` scroll reveals to all major section headings
- [ ] Audit all interactive elements for `whileHover` / `whileTap` feedback
- [ ] Add loading skeletons for feed, profile, explore (Framer Motion pulse)
- [ ] Test confetti on beam smile upload
- [ ] Test floating +1 gift animation
- [ ] Mobile responsiveness pass — all pages

---

## Phase 16 — Deploy

- [ ] `npm run build` — fix all TypeScript + ESLint errors
- [ ] Push to GitHub
- [ ] Connect repo to Vercel → deploy
- [ ] Add all env vars in Vercel dashboard
- [ ] Update Supabase Google OAuth redirect URI to production URL
- [ ] Smoke test on production: login → onboarding → upload → feed → gift → notifications
- [ ] Test private account flow end-to-end on production

---

## Page Summary

| Page | Route | Auth Required |
|---|---|---|
| Homepage | `/` | No |
| Login | `/login` | No |
| Onboarding | `/onboarding` | Yes (first login) |
| Feed | `/feed` | Yes |
| Explore | `/explore` | Yes |
| Upload | `/upload` | Yes |
| Search | `/search` | Yes |
| Profile | `/profile/[username]` | Yes |
| Notifications | `/notifications` | Yes |
| Settings | `/settings` | Yes |
