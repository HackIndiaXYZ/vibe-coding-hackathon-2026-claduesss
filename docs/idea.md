# 😄 SmileChain

### _A social platform where positivity is the currency_

---

## 💡 Problem Statement

> In a world full of negativity on social media, there's no platform designed to actively spread positivity. SmileChain is an AI-powered social platform where users post smiling photos, earn Smile Points based on AI-detected smile intensity, and gift points to others — turning every smile into an act of kindness and building a community driven purely by positivity.

---

## 🎯 Core Idea

Social media today is built around likes, followers, and engagement metrics that often drive anxiety and comparison. SmileChain flips this — the only currency is **a genuine smile**. You can't buy clout. You can't fake it. You just smile.

---

## 🔁 Core Loop

```
User posts a smiling photo
  → face-api.js detects smile intensity (runs in browser)
  → Smile Points awarded based on score
  → GPT-3.5 generates a personalized fun caption
  → Others can gift their own Smile Points to your post
  → Leaderboard updates in real-time
```

---

## 🤖 AI Features

### 1. Smile Detection — `face-api.js`

- Runs entirely **in the browser** (no server call, instant)
- Detects facial landmarks and returns smile probability (0.0 – 1.0)
- Maps to Smile Point tiers:

| Smile Score | Emoji | Points Earned       |
| ----------- | ----- | ------------------- |
| 0.0 – 0.4   | 😐    | 0 pts — try again!  |
| 0.4 – 0.6   | 😊    | 10 pts — mild smile |
| 0.6 – 0.8   | 😄    | 25 pts — big smile  |
| 0.8 – 1.0   | 😁    | 50 pts — full beam! |

### 2. AI Caption Generation — `GPT-3.5 Turbo`

- After smile score is computed, a caption is auto-generated
- Prompt includes smile score + tier for personalized output
- Examples:
  - _"That full beam just charged 50 people's day! ☀️"_
  - _"A gentle smile is still a superpower 💛"_
  - _"MAXIMUM SMILE ENERGY DETECTED 🚀😁"_

---

## ✨ Features (MVP)

- [ ] Google OAuth login (Supabase)
- [ ] Post a smiling photo
- [ ] AI smile detection on upload
- [ ] Smile Points awarded automatically
- [ ] AI-generated caption on every post
- [ ] Feed — see everyone's smile posts
- [ ] Gift Smile Points to others (react with 😊)
- [ ] Personal profile — your posts + total points
- [ ] Global leaderboard — top smilers of the day/week

---

## 🛠️ Tech Stack

| Layer        | Technology                    |
| ------------ | ----------------------------- |
| Framework    | Next.js 14 (App Router)       |
| Styling      | Tailwind CSS + Framer Motion  |
| Auth         | Supabase Google OAuth         |
| Database     | Supabase Postgres             |
| File Storage | Supabase Storage              |
| Smile AI     | face-api.js (browser-side ML) |
| Caption AI   | OpenAI GPT-3.5 Turbo          |
| Deployment   | Vercel                        |

---

## 🗃️ Database Schema (Supabase)

### `users`

```
id, name, email, avatar_url, total_smile_points, streak_days, created_at
```

### `posts`

```
id, user_id, image_url, smile_score, smile_tier, ai_caption, points_earned, created_at
```

### `smile_gifts`

```
id, giver_id, receiver_id, post_id, points, created_at
```

### `leaderboard` _(view)_

```
user_id, name, avatar_url, total_points — ranked by total_points DESC
```

---

## 🎨 UI Vibe

- **Style:** Bubbly & colorful — Duolingo-style fun
- **Colors:** Warm yellows, coral pinks, sky blues
- **Animations:** Bouncy point popups, confetti on high smile scores, smooth feed transitions
- **Font:** Rounded, friendly typeface
- **Key moment:** When you upload a photo and the smile score reveals with a burst animation 🎉

---

## 🏆 Hackathon Judging Targets

| Award                | How we win it                                     |
| -------------------- | ------------------------------------------------- |
| ✅ Best AI Use       | face-api.js (on-device ML) + GPT-3.5 captions     |
| ✅ Best Startup Idea | Real problem (social media negativity), clear TAM |
| ✅ Best Design       | Bubbly, animated, emotionally resonant UI         |

---

## 🚀 Build Plan (24 Hours)

| Hour  | Task                                             |
| ----- | ------------------------------------------------ |
| 0–2   | Supabase setup, Google OAuth, Next.js scaffold   |
| 2–5   | Image upload + face-api.js smile detection       |
| 5–7   | Smile Points logic + GPT-3.5 caption integration |
| 7–11  | Feed UI + post card component                    |
| 11–14 | Gifting system + profile page                    |
| 14–17 | Leaderboard + streak system                      |
| 17–20 | UI polish — animations, colors, confetti         |
| 20–22 | Deploy to Vercel + bug fixes                     |
| 22–24 | Demo prep + presentation slides                  |

---

## 🌱 Future Scope

- Mobile app (React Native)
- Smile streak rewards (badges, NFTs)
- Team smiles — companies competing for happiest workplace
- Mental health integration — daily smile as a mood tracker
- Viral challenges — #SmileForACause

---

_Built with 😄 at HackIndia Vibe Coding Hackathon 2026_
