# SmileChain — Setup Instructions

## Prerequisites

- Node.js 18+
- npm / pnpm
- Supabase account
- OpenAI account (GPT-3.5 access)
- Google Cloud Console project (for OAuth)

---

## 1. Clone & Install

```bash
git clone <repo-url>
cd hackIndia
npm install

# Key dependencies installed automatically:
# framer-motion, lucide-react, face-api.js, openai
# @supabase/supabase-js, @supabase/ssr, canvas-confetti
```

---

## 2. Supabase Setup

### 2a. Create project
1. Go to [supabase.com](https://supabase.com) → New project
2. Note your **Project URL** and **Anon Key** from Settings → API

### 2b. Run migrations
In Supabase Dashboard → SQL Editor, run:
```
supabase/migrations/001_initial.sql
```
This creates all tables, enums, RLS policies, and the leaderboard view.

### 2c. Storage bucket
1. Supabase Dashboard → Storage → New bucket
2. Name: `posts`
3. Public: **Yes** (images must be publicly readable)
4. Add policy: allow authenticated users to INSERT

### 2d. Google OAuth
1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Create OAuth 2.0 credentials (Web application)
3. Authorized redirect URI: `https://<your-supabase-project>.supabase.co/auth/v1/callback`
4. Copy Client ID + Secret
5. Supabase Dashboard → Authentication → Providers → Google → paste credentials
6. Enable Google provider

---

## 3. OpenAI Setup

1. Go to [platform.openai.com](https://platform.openai.com) → API Keys
2. Create a new secret key
3. Add it to `.env.local` as `OPENAI_API_KEY`

---

## 4. face-api.js Models

Download model weights into `public/models/`:

```bash
# From project root
mkdir -p public/models

# Download from face-api.js GitHub releases or use the helper script:
node scripts/download-models.js
```

Required model files:
```
public/models/
  tiny_face_detector_model-weights_manifest.json
  tiny_face_detector_model-shard1
  face_landmark_68_model-weights_manifest.json
  face_landmark_68_model-shard1
  face_expression_model-weights_manifest.json
  face_expression_model-shard1
```

> Models are ~6MB total. Committed to repo for offline/hackathon use.

---

## 5. Environment Variables

Copy the example file:
```bash
cp .env.example .env.local
```

Fill in `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
OPENAI_API_KEY=sk-...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 6. Run Locally

```bash
npm run dev
# → http://localhost:3000
```

---

## 7. Deploy to Vercel

```bash
npm install -g vercel
vercel
```

Add all env vars in Vercel dashboard → Settings → Environment Variables.

Update Supabase Google OAuth redirect URI to your production URL:
```
https://<your-vercel-app>.vercel.app/api/auth/callback
```

---

## Troubleshooting

| Issue | Fix |
|---|---|
| Smile detection not working | Check `/public/models/` has all 6 model files |
| Caption returns error | Verify `OPENAI_API_KEY` is set and has GPT-3.5 access |
| Login redirect fails | Check Supabase OAuth redirect URI matches exactly |
| Posts not visible | Check RLS policies — user must be public or followed |
| Storage upload 403 | Check storage bucket policy allows authenticated INSERT |
