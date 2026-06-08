# SmileChain

> A social platform where your genuine smile is the only currency.

SmileChain is an Instagram-like app where smile intensity = points. Post a photo, let AI detect your smile, earn Smile Points, and gift them to others. Built for **HackIndia Vibe Coding Hackathon 2026**.

---

## Core Idea

Social media drives anxiety through likes and follower counts. SmileChain replaces all of that with one metric — **your genuine smile**. You can't buy clout. You can't fake it. You just smile.

---

## Smile Point Tiers

| Score | Tier | Points | Vibe |
|---|---|---|---|
| 0.0 – 0.4 | 😐 None | 0 pts | Try again! |
| 0.4 – 0.6 | 😊 Mild | 10 pts | Gentle warmth |
| 0.6 – 0.8 | 😄 Big | 30 pts | Full sunshine |
| 0.8 – 1.0 | 😁 Beam | 50 pts | Maximum smile energy |

---

## System Architecture

```mermaid
%%{init: {'theme': 'base', 'themeVariables': {'primaryColor': '#FFD93D', 'primaryTextColor': '#1F2937', 'primaryBorderColor': '#FF6B35', 'lineColor': '#FF6B35', 'secondaryColor': '#FFF3CD', 'tertiaryColor': '#FFFBF0', 'clusterBkg': '#FFFBF0', 'clusterBorder': '#FFD93D'}}}%%
graph TD
    classDef client fill:#FFD93D,stroke:#FF6B35,color:#1F2937,font-weight:bold
    classDef server fill:#FF6B35,stroke:#c04e1c,color:#ffffff,font-weight:bold
    classDef db fill:#1F2937,stroke:#374151,color:#ffffff,font-weight:bold
    classDef store fill:#374151,stroke:#6B7280,color:#ffffff

    subgraph Client["🌐 Browser"]
        UI[Next.js App Router]:::client
        FA[face-api.js - Smile Detection]:::client
        FM[Framer Motion - Animations]:::client
    end

    subgraph Server["⚡ API Routes"]
        CAP["/api/caption - Caption Generator"]:::server
        AUTH["/api/auth/callback - OAuth Handler"]:::server
    end

    subgraph Supabase["🗄️ Supabase"]
        DB[(Postgres DB)]:::db
        ST[(Storage - Images)]:::store
        AU[Google OAuth]:::db
        RLS[Row Level Security]:::store
    end

    UI -->|upload photo| FA
    FA -->|smile score + tier| CAP
    CAP -->|caption| UI
    UI -->|store image| ST
    UI -->|insert post row| DB
    AU -->|OAuth callback| AUTH
    AUTH -->|session cookie| UI
    DB --- RLS
```

---

## Upload Flow

```mermaid
%%{init: {'theme': 'base', 'themeVariables': {'primaryColor': '#FFD93D', 'primaryTextColor': '#1F2937', 'primaryBorderColor': '#FF6B35', 'lineColor': '#FF6B35', 'edgeLabelBackground': '#FFFBF0'}}}%%
flowchart LR
    classDef start fill:#FFD93D,stroke:#FF6B35,color:#1F2937,font-weight:bold
    classDef process fill:#FFF3CD,stroke:#FFD93D,color:#1F2937
    classDef decision fill:#FF6B35,stroke:#c04e1c,color:#ffffff,font-weight:bold
    classDef tier0 fill:#F3F4F6,stroke:#9CA3AF,color:#374151
    classDef tier1 fill:#FEF9C3,stroke:#EAB308,color:#713F12
    classDef tier2 fill:#FFD93D,stroke:#FF6B35,color:#1F2937,font-weight:bold
    classDef tier3 fill:#FF6B35,stroke:#c04e1c,color:#ffffff,font-weight:bold
    classDef finish fill:#1F2937,stroke:#374151,color:#ffffff,font-weight:bold

    A([📷 Pick Photo\nor Camera]):::start --> B[face-api.js\nDetects Smile]:::process
    B --> C{Score?}:::decision
    C -->|0–40%| D[😐 None - 0 pts]:::tier0
    C -->|40–60%| E[😊 Mild - 10 pts]:::tier1
    C -->|60–80%| F[😄 Big - 30 pts]:::tier2
    C -->|80–100%| G[😁 Beam - 50 pts\n🎉 Confetti!]:::tier3
    D & E & F & G --> H[AI Caption\nGenerated]:::process
    H --> I[User Edits\nCaption]:::process
    I --> J[Upload to\nSupabase Storage]:::process
    J --> K[Insert Post\nRow in DB]:::process
    K --> L([🚀 Redirect\nto Feed]):::finish
```

---

## Auth Flow

```mermaid
%%{init: {'theme': 'base', 'themeVariables': {'actorBkg': '#FFD93D', 'actorBorder': '#FF6B35', 'actorTextColor': '#1F2937', 'actorLineColor': '#FF6B35', 'signalColor': '#FF6B35', 'signalTextColor': '#1F2937', 'labelBoxBkgColor': '#FFF3CD', 'labelBoxBorderColor': '#FFD93D', 'labelTextColor': '#1F2937', 'loopTextColor': '#1F2937', 'noteBkgColor': '#FFD93D', 'noteBorderColor': '#FF6B35', 'noteTextColor': '#1F2937', 'activationBkgColor': '#FFF3CD', 'activationBorderColor': '#FF6B35', 'sequenceNumberColor': '#ffffff'}}}%%
sequenceDiagram
    actor User
    participant App as ⚡ Next.js App
    participant Supabase as 🗄️ Supabase
    participant Google as 🔵 Google

    User->>App: Click "Sign in with Google"
    App->>Supabase: signInWithOAuth(google)
    Supabase->>Google: Redirect to consent screen
    Google->>User: Show consent
    User->>Google: Approve
    Google->>Supabase: Auth code
    Supabase->>App: Redirect /api/auth/callback
    App->>Supabase: exchangeCodeForSession()
    Supabase->>App: Session + user data

    alt username is null (first login)
        App->>User: Redirect /onboarding
        User->>App: Set username + privacy
        App->>Supabase: UPDATE users SET username
        App->>User: Redirect /feed
    else has username
        App->>User: Redirect /feed
    end
```

---

## Follow System

```mermaid
%%{init: {'theme': 'base', 'themeVariables': {'primaryColor': '#FFD93D', 'primaryTextColor': '#1F2937', 'primaryBorderColor': '#FF6B35', 'lineColor': '#FF6B35', 'edgeLabelBackground': '#FFFBF0'}}}%%
flowchart TD
    classDef start fill:#FFD93D,stroke:#FF6B35,color:#1F2937,font-weight:bold
    classDef decision fill:#FF6B35,stroke:#c04e1c,color:#ffffff,font-weight:bold
    classDef action fill:#FFF3CD,stroke:#FFD93D,color:#1F2937
    classDef accept fill:#D1FAE5,stroke:#10B981,color:#064E3B,font-weight:bold
    classDef decline fill:#FEE2E2,stroke:#EF4444,color:#7F1D1D,font-weight:bold
    classDef finish fill:#1F2937,stroke:#374151,color:#ffffff,font-weight:bold

    A([👆 User clicks Follow]):::start --> B{Private\naccount?}:::decision
    B -->|No — Public| C[INSERT follows\nstatus = accepted]:::action
    B -->|Yes — Private| D[INSERT follows\nstatus = pending]:::action
    D --> E[INSERT notification\ntype = follow_request]:::action
    E --> F[Target sees\nnotification 🔔]:::action
    F --> G{Decision?}:::decision
    G -->|Accept ✅| H[UPDATE follows\nstatus = accepted]:::accept
    H --> I[INSERT notification\ntype = follow_accepted]:::accept
    G -->|Decline ❌| J[DELETE follows row]:::decline
    C --> K([👀 Follower sees\ntarget's posts]):::finish
    I --> K
```

---

## Gifting System

```mermaid
%%{init: {'theme': 'base', 'themeVariables': {'actorBkg': '#FFD93D', 'actorBorder': '#FF6B35', 'actorTextColor': '#1F2937', 'actorLineColor': '#FF6B35', 'signalColor': '#FF6B35', 'signalTextColor': '#1F2937', 'labelBoxBkgColor': '#FFF3CD', 'labelBoxBorderColor': '#FFD93D', 'labelTextColor': '#1F2937', 'noteBkgColor': '#FFD93D', 'noteBorderColor': '#FF6B35', 'noteTextColor': '#1F2937', 'activationBkgColor': '#FFF3CD', 'activationBorderColor': '#FF6B35'}}}%%
sequenceDiagram
    actor Giver as 😊 Giver
    participant App as ⚡ SmileChain
    participant DB as 🗄️ Supabase DB

    Giver->>App: Click "Gift Smile" on post
    App->>App: Check — not own post,\nnot already gifted,\nhas ≥1 point
    App->>DB: INSERT smile_gifts row
    DB->>DB: Trigger: UPDATE posts\nSET gift_count + 1
    DB->>DB: Trigger: UPDATE users\ngiver points − 1
    DB->>DB: Trigger: UPDATE users\nreceiver points + 1
    DB->>DB: INSERT notification\ntype = gift_received
    App->>Giver: Show floating +1 animation 🎁
```

---

## Database Schema

```mermaid
%%{init: {'theme': 'base', 'themeVariables': {'primaryColor': '#FFD93D', 'primaryTextColor': '#1F2937', 'primaryBorderColor': '#FF6B35', 'lineColor': '#FF6B35', 'tertiaryColor': '#FFF3CD', 'edgeLabelBackground': '#FFFBF0', 'attributeBackgroundColorEven': '#FFFBF0', 'attributeBackgroundColorOdd': '#FFF3CD'}}}%%
erDiagram
    users {
        uuid id PK
        text username
        text display_name
        text avatar_url
        int smile_points
        bool is_private
        timestamptz created_at
    }

    posts {
        uuid id PK
        uuid user_id FK
        text image_url
        float smile_score
        text smile_tier
        text caption
        int smile_points
        int gift_count
        timestamptz created_at
    }

    follows {
        uuid id PK
        uuid follower_id FK
        uuid following_id FK
        text status
        timestamptz created_at
    }

    smile_gifts {
        uuid id PK
        uuid giver_id FK
        uuid receiver_id FK
        uuid post_id FK
        timestamptz created_at
    }

    notifications {
        uuid id PK
        uuid user_id FK
        uuid actor_id FK
        text type
        uuid post_id FK
        bool is_read
        timestamptz created_at
    }

    users ||--o{ posts : "creates"
    users ||--o{ follows : "follower_id"
    users ||--o{ follows : "following_id"
    users ||--o{ smile_gifts : "gives"
    users ||--o{ smile_gifts : "receives"
    posts ||--o{ smile_gifts : "receives"
    users ||--o{ notifications : "receives"
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 App Router + TypeScript |
| Styling | Tailwind CSS v4 |
| Animations | Framer Motion |
| Icons | Lucide React |
| Auth | Supabase Google OAuth |
| Database | Supabase Postgres + RLS |
| Storage | Supabase Storage |
| Smile AI | face-api.js (runs 100% in browser) |
| Caption | Tier-based caption pool (no API needed) |
| Deployment | Vercel |

---

## Features

- **Google OAuth** — sign in with Google via Supabase
- **Webcam + Upload** — take a selfie or upload a photo
- **Smile Detection** — face-api.js runs entirely client-side, no privacy risk
- **3-second countdown** — camera capture with animated countdown
- **Confetti** — fires on Beam smile tier
- **Public / Private accounts** — control who sees your posts
- **Follow system** — instant for public, request-based for private
- **Feed** — posts from people you follow
- **Explore** — discover public posts from everyone
- **Search** — find users by username (debounced)
- **Gifting** — send Smile Points to posts you love
- **Profile** — posts grid, smile score, follower/following counts
- **Notifications** — follow requests, gifts, accepted follows
- **Settings** — update username, toggle privacy, delete account

---

## Getting Started

```bash
# 1. Install dependencies
npm install

# 2. Set environment variables
cp .env.example .env.local
# Fill in: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, OPENAI_API_KEY

# 3. Run SQL migration in Supabase SQL Editor
# → supabase/migrations/001_initial.sql

# 4. Download face-api.js models
mkdir -p public/models && cd public/models
BASE="https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights"
curl -sL -O "$BASE/tiny_face_detector_model-weights_manifest.json"
curl -sL -O "$BASE/tiny_face_detector_model-shard1"
curl -sL -O "$BASE/face_landmark_68_model-weights_manifest.json"
curl -sL -O "$BASE/face_landmark_68_model-shard1"
curl -sL -O "$BASE/face_expression_model-weights_manifest.json"
curl -sL -O "$BASE/face_expression_model-shard1"

# 5. Start dev server
npm run dev
```

---

## Pages

| Route | Description |
|---|---|
| `/` | Landing page — hero, how it works, tiers, CTA |
| `/login` | Google OAuth sign-in |
| `/onboarding` | Set username + public/private (first login only) |
| `/feed` | Posts from followed users |
| `/explore` | Public posts from everyone |
| `/upload` | Upload or take a smiling photo |
| `/search` | Find users by username |
| `/profile/[username]` | Profile with posts grid + follow system |
| `/notifications` | Follow requests, gifts, accepted follows |
| `/settings` | Username, privacy, delete account |

---

## Project Structure

```
src/
├── app/
│   ├── page.tsx                  # Landing page
│   ├── login/page.tsx            # Google OAuth
│   ├── onboarding/page.tsx       # Username setup
│   ├── (app)/                    # Auth-guarded routes
│   │   ├── layout.tsx            # Navbar + auth guard
│   │   ├── feed/page.tsx
│   │   ├── explore/page.tsx
│   │   ├── upload/page.tsx
│   │   ├── search/page.tsx
│   │   ├── profile/[username]/page.tsx
│   │   ├── notifications/page.tsx
│   │   └── settings/page.tsx
│   └── api/
│       ├── caption/route.ts      # Caption generation
│       └── auth/callback/route.ts
├── components/
│   ├── Navbar.tsx
│   ├── PostCard.tsx
│   ├── SmileReveal.tsx
│   ├── FollowButton.tsx
│   └── PrivateLock.tsx
├── lib/
│   ├── face-api.ts               # Smile detection
│   ├── smile-points.ts           # Tier mapping
│   ├── openai.ts                 # Caption pool
│   └── supabase/{client,server}.ts
├── hooks/
│   ├── useCurrentUser.ts
│   └── usePosts.ts
└── types/index.ts
```

---

_Built with 😄 at HackIndia Vibe Coding Hackathon 2026 by team **Claduesss**_
