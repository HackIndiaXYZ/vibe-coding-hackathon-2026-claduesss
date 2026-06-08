# 😄 SmileChain

> A social platform where positivity is the only currency.

SmileChain is an Instagram-like app where your smile earns points. Post a photo, let AI detect your smile intensity, earn Smile Points, and gift them to others. Built for HackIndia Vibe Coding Hackathon 2026.

---

## 🌟 Core Idea

Social media today drives anxiety through likes and follower counts. SmileChain replaces all of that with one metric — **your genuine smile**. You can't buy clout. You can't fake it. You just smile.

---

## 🔁 Core Loop

```
Post a smiling photo
  → face-api.js detects smile score (runs in browser, no server)
  → Smile Points awarded by tier
  → GPT-3.5 generates a personalized caption
  → Friends can gift their own Smile Points to your post
  → Your profile shows your total smile score
```

---

## ✨ Smile Point Tiers

| Score | Tier | Points | Vibe |
|---|---|---|---|
| 0.0 – 0.4 | 😐 None | 0 pts | Try again! |
| 0.4 – 0.6 | 😊 Mild | 10 pts | Gentle warmth |
| 0.6 – 0.8 | 😄 Big | 25 pts | Full sunshine |
| 0.8 – 1.0 | 😁 Beam | 50 pts | Maximum smile energy |

---

## 🎯 Features (MVP)

- **Google OAuth** — sign in with Google via Supabase
- **Public / Private accounts** — control who sees your posts
- **Follow system** — direct follow for public, request-based for private
- **Upload flow** — photo → smile detection → AI caption → post
- **Feed** — posts from people you follow
- **Explore** — discover public posts from everyone
- **Search** — find users by username
- **Gifting** — send your Smile Points to posts you love
- **Profile** — your posts, smile score, followers/following count (own + others)
- **Notifications** — follow requests, gifts, accepted follows (bell icon)
- **Settings** — update username, toggle public/private, manage account

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Styling | Tailwind CSS + shadcn/ui |
| Animations | Framer Motion |
| Icons | Lucide React |
| Auth | Supabase Google OAuth |
| Database | Supabase Postgres |
| File Storage | Supabase Storage |
| Smile AI | face-api.js (browser-side ML) |
| Caption AI | OpenAI GPT-3.5 Turbo |
| Deployment | Vercel |

---

## 🚀 Getting Started

See [docs/instruction.md](./docs/instruction.md) for full setup guide.

```bash
# 1. Install dependencies
npm install

# 2. Set environment variables
cp .env.example .env.local
# Fill in Supabase + OpenAI keys

# 3. Run dev server
npm run dev
```

---

## 📄 Pages

| Route | Description |
|---|---|
| `/` | Homepage — landing, app explainer, login CTA |
| `/login` | Google OAuth sign-in |
| `/onboarding` | Set username + public/private (first login only) |
| `/feed` | Dashboard — posts from followed users |
| `/explore` | Discover public posts from everyone |
| `/upload` | Post a smiling photo |
| `/search` | Find users by username |
| `/profile/[username]` | Own profile + others' profiles (conditions applied) |
| `/notifications` | Follow requests, gifts, accepted follows |
| `/settings` | Username, privacy toggle, account management |

---

## 📁 Project Structure

See [docs/architecture.md](./docs/architecture.md) for full breakdown.

## 🎨 Design System

See [docs/style.md](./docs/style.md) for color palette, typography, animation guidelines.

---

_Built with 😄 at HackIndia Vibe Coding Hackathon 2026 by team Claduesss_
