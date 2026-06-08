# SmileChain — Architecture

## Overview

Next.js 14 App Router app. Client-side ML (face-api.js), server-side caption generation (OpenAI via API route), Supabase for everything else (auth, DB, storage).

---

## Directory Structure

```
hackIndia/
├── docs/
│   ├── architecture.md            # This file
│   ├── idea.md                    # Original concept doc
│   ├── instruction.md             # Setup guide
│   └── style.md                   # Design system
├── public/
│   └── models/                   # face-api.js model weights (downloaded once)
│       ├── tiny_face_detector/
│       ├── face_landmark_68/
│       └── face_expression/
├── src/
│   ├── app/
│   │   ├── page.tsx               # Homepage — landing + app explainer
│   │   ├── login/
│   │   │   └── page.tsx           # Google OAuth sign-in
│   │   ├── onboarding/
│   │   │   └── page.tsx           # Set username + privacy (first login only)
│   │   ├── (app)/
│   │   │   ├── layout.tsx         # Navbar + auth guard
│   │   │   ├── feed/
│   │   │   │   └── page.tsx       # Dashboard — followed users' posts
│   │   │   ├── explore/
│   │   │   │   └── page.tsx       # All public posts
│   │   │   ├── upload/
│   │   │   │   └── page.tsx       # Upload + smile detection flow
│   │   │   ├── search/
│   │   │   │   └── page.tsx       # Find users by username
│   │   │   ├── profile/
│   │   │   │   └── [username]/
│   │   │   │       └── page.tsx   # Own + others' profiles (conditions applied)
│   │   │   ├── notifications/
│   │   │   │   └── page.tsx       # Follow requests, gifts, accepted follows
│   │   │   └── settings/
│   │   │       └── page.tsx       # Username, privacy toggle, account mgmt
│   │   ├── api/
│   │   │   ├── caption/
│   │   │   │   └── route.ts       # POST → GPT-3.5 caption
│   │   │   └── auth/
│   │   │       └── callback/
│   │   │           └── route.ts   # Supabase OAuth callback
│   │   ├── layout.tsx             # Root layout (fonts, providers)
│   │   └── globals.css
│   ├── components/
│   │   ├── PostCard.tsx           # Post display card + gift button
│   │   ├── SmileReveal.tsx        # Animated score reveal component
│   │   ├── FollowButton.tsx       # Follow / Pending / Unfollow states
│   │   ├── NotificationBell.tsx   # Bell icon + unread count + dropdown
│   │   ├── UploadFlow.tsx         # Multi-step upload UI
│   │   ├── Navbar.tsx             # Top nav with bell + avatar
│   │   └── PrivateLock.tsx        # Locked state for private profiles
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts          # Browser Supabase client
│   │   │   └── server.ts          # Server Supabase client (cookies)
│   │   ├── face-api.ts            # Model loader + detectSmile()
│   │   ├── smile-points.ts        # Score → tier → points mapping
│   │   └── openai.ts              # generateCaption(score, tier)
│   ├── hooks/
│   │   ├── useCurrentUser.ts      # Fetch + cache authed user row
│   │   └── usePosts.ts            # Feed / explore post queries
│   └── types/
│       └── index.ts               # DB row TypeScript types
├── supabase/
│   └── migrations/
│       └── 001_initial.sql        # All table + RLS + view definitions
├── .env.example
├── .env.local                     # gitignored
├── CLAUDE.md                      # Claude Code context
├── README.md
├── next.config.ts
├── tsconfig.json
├── eslint.config.mjs
└── package.json
```

---

## Data Flow

### Upload Flow
```
User selects image
  → UploadFlow (client component)
  → face-api.js loads models from /public/models/
  → detectSmile(imgElement) → { score, tier, points }
  → SmileReveal animation plays
  → POST /api/caption { score, tier } → GPT-3.5 → caption string
  → Upload image blob → Supabase Storage (posts bucket)
  → INSERT posts row { user_id, image_url, smile_score, tier, caption, points_earned }
  → UPDATE users SET total_smile_points = total_smile_points + points
  → Redirect to /feed
```

### Follow Flow
```
Click Follow on profile
  → Check target.is_private
  → Public:  INSERT follows { follower_id, following_id, status: 'accepted' }
  → Private: INSERT follows { follower_id, following_id, status: 'pending' }
             INSERT notifications { user_id: target, type: 'follow_request', from_user_id: me }
  → Target accepts: UPDATE follows SET status='accepted'
                    INSERT notifications { user_id: me, type: 'follow_accepted' }
```

### Gift Flow
```
Click 😊 on a post
  → Guard: not self, not already gifted
  → UPDATE users SET total_smile_points = total_smile_points - 1 WHERE id = giver
  → UPDATE users SET total_smile_points = total_smile_points + 1 WHERE id = receiver
  → INSERT smile_gifts { giver_id, receiver_id, post_id, points: 1 }
  → INSERT notifications { user_id: receiver, type: 'gift_received', from_user_id: giver, post_id }
```

---

## Database Schema

### `users`
```sql
id            uuid PRIMARY KEY REFERENCES auth.users
username      text UNIQUE NOT NULL
name          text
email         text
avatar_url    text
total_smile_points  int DEFAULT 0
is_private    boolean DEFAULT false
streak_days   int DEFAULT 0
created_at    timestamptz DEFAULT now()
```

### `posts`
```sql
id            uuid PRIMARY KEY DEFAULT gen_random_uuid()
user_id       uuid REFERENCES users NOT NULL
image_url     text NOT NULL
smile_score   float NOT NULL
smile_tier    text NOT NULL  -- 'none' | 'mild' | 'big' | 'beam'
ai_caption    text
points_earned int DEFAULT 0
created_at    timestamptz DEFAULT now()
```

### `follows`
```sql
id            uuid PRIMARY KEY DEFAULT gen_random_uuid()
follower_id   uuid REFERENCES users NOT NULL
following_id  uuid REFERENCES users NOT NULL
status        text NOT NULL  -- 'pending' | 'accepted'
created_at    timestamptz DEFAULT now()
UNIQUE (follower_id, following_id)
```

### `smile_gifts`
```sql
id            uuid PRIMARY KEY DEFAULT gen_random_uuid()
giver_id      uuid REFERENCES users NOT NULL
receiver_id   uuid REFERENCES users NOT NULL
post_id       uuid REFERENCES posts NOT NULL
points        int DEFAULT 1
created_at    timestamptz DEFAULT now()
UNIQUE (giver_id, post_id)  -- one gift per user per post
```

### `notifications`
```sql
id            uuid PRIMARY KEY DEFAULT gen_random_uuid()
user_id       uuid REFERENCES users NOT NULL
type          text NOT NULL  -- 'follow_request' | 'follow_accepted' | 'gift_received'
from_user_id  uuid REFERENCES users NOT NULL
post_id       uuid REFERENCES posts
read          boolean DEFAULT false
created_at    timestamptz DEFAULT now()
```

---

## RLS Policies

| Table | Policy |
|---|---|
| `users` | SELECT: public. UPDATE: own row only. |
| `posts` | SELECT: owner is public OR viewer follows with status=accepted. INSERT/DELETE: own rows. |
| `follows` | SELECT: own rows (follower or following). INSERT: authenticated. UPDATE: following_id = auth.uid() (accept/reject). |
| `smile_gifts` | SELECT: giver or receiver. INSERT: authenticated + giver = auth.uid(). |
| `notifications` | SELECT/UPDATE: user_id = auth.uid() only. |

---

## API Routes

### `POST /api/caption`
Request: `{ score: number, tier: string }`
Response: `{ caption: string }`
Uses OpenAI GPT-3.5 Turbo. Server-side only — OPENAI_API_KEY never exposed to client.

### `GET /api/auth/callback`
Handles Supabase OAuth redirect. Creates `users` row if first login. Redirects to `/onboarding` if no username, else `/feed`.

---

## Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL        # Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY   # Supabase anon key (safe to expose)
OPENAI_API_KEY                  # OpenAI key (server-side only, no NEXT_PUBLIC_)
NEXT_PUBLIC_APP_URL             # e.g. https://smilechain.vercel.app
```
