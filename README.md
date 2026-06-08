# SmileChain

### 🌐 Live — [smilechain.ashwinsi.in](https://smilechain.ashwinsi.in)

---

## The World Needs More Real Smiles

We live in a world where social media has taught people to perform happiness rather than feel it. Every scroll is a highlight reel — filters, angles, forced poses, fake smiles for likes. People have learned to optimize for approval instead of joy.

**SmileChain exists because real smiles are rare, and they deserve to be celebrated.**

This is not another platform where you chase followers or stress over engagement. It is a place where the only thing that matters is whether you are genuinely smiling — and AI is the judge, not people.

---

## The Problem

Instagram, TikTok, and every platform like them reward content that performs well — not people who feel well. The result:

- People fake happiness to fit in
- Anxiety and comparison culture dominate
- The metric for "doing well" online has nothing to do with actually being happy

The tools meant to connect us have made authentic expression rarer, not more common.

---

## How SmileChain Solves It

SmileChain replaces every vanity metric with one honest signal: **your genuine smile**.

You post a photo. AI detects your smile intensity in the browser — no server, no privacy risk. The bigger and more genuine your smile, the more Smile Points you earn. You cannot buy points. You cannot fake your way to the top. You just smile.

Points can be gifted to others whose smiles made you happy. The economy runs entirely on real human warmth.

| Smile | Tier | Points |
|-------|------|--------|
| 😐 Flat | None | 0 pts |
| 😊 Genuine | Mild | 10 pts |
| 😄 Joyful | Big | 30 pts |
| 😁 Beaming | Beam | 50 pts |

---

## How It Works

1. **Sign in** with Google
2. **Post a photo** — upload or take a selfie
3. **AI detects your smile** entirely in the browser using face-api.js
4. **Earn Smile Points** based on smile intensity — tier shown instantly
5. **AI writes your caption** using GPT-3.5, tuned to your smile tier
6. **Share it** — public feed or just your followers
7. **Gift points** to posts that genuinely made you smile

---

## The Startup Vision

SmileChain is not just a social app. It is infrastructure for a happiness economy.

### The Core Insight

Every business wants happy customers, happy employees, and happy communities. SmileChain has what no other platform has — a **verified, AI-measured signal of genuine human happiness**. That data and that engagement loop is valuable far beyond a consumer app.

### Business Model Canvas

**Customer Segments**
- Consumers: anyone who wants a social feed that feels good
- Enterprises: HR teams running employee wellness programs
- Brands: companies that want authentic emotional connection with customers
- Healthcare: mental health platforms, therapists, wellness apps
- Insurers: health insurance companies incentivizing positive behaviours

**Value Propositions**
- For users: a social platform that rewards you for actually being happy
- For businesses: verified happiness engagement — not impressions, not clicks
- For insurers: measurable daily wellness signal tied to a real person
- For brands: sponsoring joy instead of anxiety

**Revenue Streams**

| Stream | Model |
|--------|-------|
| **B2B Wellness API** | Companies pay per employee/month to run internal smile challenges — teams earn Smile Points redeemable for perks |
| **Brand Smile Challenges** | Brands sponsor weekly challenges (e.g. "Coca-Cola Smile Week") — winners get brand rewards, brand gets authentic UGC |
| **Insurance Tie-ups** | Health insurers offer premium discounts to users who maintain smile streaks — SmileChain provides the verified score feed |
| **Premium Subscriptions** | Users pay for advanced analytics, custom profile themes, streak shields |
| **Smile Credits (B2C)** | Users can buy Smile Credits to gift to others — like tipping on Twitch but for happiness |

**Key Partners**
- Corporate HR platforms (Darwinbox, BambooHR, Workday) — embed SmileChain wellness modules
- Health insurers (Star Health, Niva Bupa) — reward streak data as wellness proof
- Consumer brands (beverage, snacks, lifestyle) — sponsor smile challenges
- Mental health apps (YourDost, Wysa) — SmileChain as daily mood-tracking surface
- Gyms and fitness chains — smile as post-workout celebration metric

**Key Activities**
- AI smile detection accuracy improvements
- B2B API and dashboard for enterprise clients
- Brand challenge campaign tooling
- Community growth and content moderation

**Key Resources**
- Proprietary browser-based smile scoring (privacy-first, no data stored)
- Smile Points economy and gifting loop
- User-generated happiness content

**Cost Structure**
- Supabase hosting + storage
- OpenAI API (caption generation)
- Vercel compute
- B2B sales and integrations team (post-seed)

### How the B2B Loop Works

```
Company pays SmileChain
  → Employees get a company SmileChain workspace
  → Post smiles daily → earn Smile Points
  → Points convert to company perks (leave, vouchers, recognition)
  → HR dashboard shows team happiness trends over time
  → Company renews because engagement and morale data is real
```

### Why This Is Defensible

Competitors cannot replicate the core loop without rebuilding the community. The smile score is not just a feature — it is the identity of every user on the platform. A brand doing a "Smile Campaign" on Instagram gets engagement metrics. On SmileChain they get **verified smile scores** from real faces. That is a fundamentally different product.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 App Router + TypeScript |
| Styling | Tailwind CSS + shadcn/ui + Framer Motion |
| Auth | Supabase Google OAuth |
| Database | Supabase Postgres + Row Level Security |
| Storage | Supabase Storage |
| Smile AI | face-api.js — runs 100% in browser |
| Caption AI | OpenAI GPT-3.5 via server-side API route |
| Deployment | Vercel |

---

## Features

- Google OAuth sign-in
- Upload photo or webcam selfie
- Client-side smile detection — no data leaves your browser
- Smile Points earned per post (tier-based)
- AI-generated captions tuned to your smile
- Follow system — instant for public, request-based for private
- Feed from people you follow
- Explore public posts globally
- Gift Smile Points to others
- Comments and likes
- Notifications — gifts, follows, comments, likes
- Search users by username
- Public / private account toggle

---

## Architecture

System diagrams, data flows, DB schema, and project structure → **[docs/architecture.md](docs/architecture.md)**

---

## Getting Started

```bash
npm install

cp .env.example .env.local
# Fill in: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, OPENAI_API_KEY

# Run in Supabase SQL Editor:
# supabase/migrations/001_initial.sql

npm run dev
```

---

_Built at HackIndia Vibe Coding Hackathon 2026 — by team **Claduesss**_
