# SmileChain — Design System

## Philosophy

**Neo-Brutalism** applied to joy. Bold borders, hard shadows, flat colors — but warm, playful, and emotionally expressive. Every visual decision reinforces the core emotion: **the genuine happiness of a smile**. Raw edges with a golden heart.

---

## Design Style: Neo-Brutalism

### Core Rules
| Property | Value |
|---|---|
| Borders | `2.5px solid #1A1040` on all interactive elements |
| Box Shadow | Hard offset — `5px 5px 0 #1A1040` (no blur, no spread) |
| Hover | `transform: translate(-3px, -3px)` + shadow grows to `7px 7px 0` |
| Active/Press | `transform: translate(+3px, +3px)` + shadow shrinks to `2px 2px 0` |
| Border Radius | `10px` (slightly soft, not sharp brutalism) |
| Backgrounds | Flat color fills — no gradients, no glassmorphism, no blur |
| Typography | `font-weight: 900` headings, `font-weight: 700` body |

---

## Color Palette

### Ink (replaces black)
The primary border and shadow color. Deep indigo — dark enough for full neo-brutalism contrast, with warmth that complements the yellow/orange brand.

| Name | Hex | Usage |
|---|---|---|
| `ink` | `#1A1040` | All borders, all box-shadows, primary text |

### Primary — Sunshine Yellow
The dominant brand color. Buttons, highlights, section backgrounds, badges.

| Name | Hex | Usage |
|---|---|---|
| `yellow` | `#FFD93D` | **Primary brand yellow** — buttons, How It Works section bg, labels |

### Secondary — Warm Orange
Energy of a full smile. CTAs, accent elements, points, tier indicators.

| Name | Hex | Usage |
|---|---|---|
| `orange` | `#FF6B35` | Accent CTAs, tier 3 card bg, captured results |

### Supporting

| Name | Hex | Usage |
|---|---|---|
| `cream` | `#FFFBF0` | Page background (warm, not pure white) |
| `white` | `#FFFFFF` | Card surfaces |
| `coral` | `#FF3D00` | Beam tier card, AI Captions feature card |
| `success` | `#00C48C` | Points earned, follow accepted |
| `muted-text` | `#6B7280` | Secondary text, descriptions |
| `faint-text` | `#9CA3AF` | Labels, timestamps, metadata |

### Smile Tier Colors

| Tier | Emoji | Background | Text |
|---|---|---|---|
| None | 😐 | `#F3F4F6` | `#1A1040` |
| Mild | 😊 | `#FFD93D` | `#1A1040` |
| Big | 😄 | `#FF6B35` | `#ffffff` |
| Beam | 😁 | `#FF3D00` | `#ffffff` |

### Section Backgrounds

| Section | Background |
|---|---|
| Hero | `#FFFBF0` (cream) |
| Marquee strip | `#1A1040` (ink) with yellow text |
| How It Works | `#FFD93D` (yellow) |
| Smile Tiers | `#FFFFFF` |
| Features Bento | `#FFFBF0` (cream) |
| Final CTA | `#1A1040` (ink) with white text |
| Footer | `#FFFFFF` |

---

## Typography

**Heading font: [Nunito](https://fonts.google.com/specimen/Nunito)** — rounded, friendly, bold.
**Body font: [DM Sans](https://fonts.google.com/specimen/DM+Sans)** — clean, readable, modern.

```css
--font-display: 'Nunito', sans-serif;
--font-sans:    'DM Sans', sans-serif;
```

| Role | Weight | Size | Usage |
|---|---|---|---|
| Hero H1 | 900 | clamp(52px, 8vw, 100px) | Landing hero |
| Section H2 | 900 | clamp(32px, 5vw, 56px) | Section titles |
| Card title | 900 | 18–24px | Feature/step titles |
| Body | 600 | 16px | Descriptions |
| Meta / label | 700–900 | 11px, uppercase, tracked | Tags, pills, badges |

---

## Spacing & Layout

- **Base unit:** 4px grid
- **Page max-width:** `max-w-5xl` (1024px) for content sections
- **Section padding:** `py-24` (96px vertical)
- **Card padding:** `p-6` to `p-8`
- **Gap between cards:** `gap-5` or `gap-6`
- **Border radius:** `10px` uniform (CSS var `--nb-radius`)

---

## Components

### Buttons

**Primary (Yellow)**
```css
background: #FFD93D;
color: #1A1040;
border: 2.5px solid #1A1040;
box-shadow: 5px 5px 0 #1A1040;
border-radius: 10px;
font-weight: 900;
padding: 13px 28px;
/* Hover: translate(-2px,-2px), shadow → 7px 7px */
/* Active: translate(+3px,+3px), shadow → 2px 2px */
```
CSS class: `.nb-btn`

**Orange Variant** — `.nb-btn.nb-btn-orange`
**Ink/Dark Variant** — `.nb-btn.nb-btn-black` (uses `#1A1040`)
**White Variant** — `.nb-btn.nb-btn-white`
**Ghost Variant** — `.nb-btn.nb-btn-ghost` (transparent bg)

### Cards
```css
background: #ffffff;
border: 2.5px solid #1A1040;
box-shadow: 5px 5px 0 #1A1040;
border-radius: 10px;
/* Hover: translate(-3px,-3px), shadow → 7px 7px */
```
CSS class: `.nb-card`

### Labels / Section Tags
```css
background: #FFD93D;
color: #1A1040;
border: 2.5px solid #1A1040;
box-shadow: 3px 3px 0 #1A1040;
border-radius: 6px;
font-size: 11px;
font-weight: 900;
text-transform: uppercase;
letter-spacing: 0.09em;
```
CSS class: `.nb-label`

### Inputs
```css
background: #ffffff;
border: 2.5px solid #1A1040;
box-shadow: 3px 3px 0 #1A1040;
border-radius: 10px;
padding: 12px 16px;
font-weight: 600;
/* Focus: shadow → 5px 5px, translate(-1px,-1px) */
```
CSS class: `.nb-input`

---

## Animations

Framer Motion (`framer-motion`) for all scroll-triggered and entrance animations.

### Page/section reveals
```tsx
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};
const stagger: Variants = {
  hidden: {},
  show:   { transition: { staggerChildren: 0.1 } },
};
```

### Card interactions (neo-brutalism press)
```css
transition: transform 0.12s ease, box-shadow 0.12s ease;
:hover  → translate(-3px, -3px) + shadow 7px 7px 0 #1A1040
:active → translate(+3px, +3px) + shadow 2px 2px 0 #1A1040
```

### Marquee (social proof strip)
```css
@keyframes marquee {
  from { transform: translateX(0); }
  to   { transform: translateX(-50%); }
}
animation: marquee 24s linear infinite;
```

### Floating emoji deco
```css
@keyframes float {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  33%       { transform: translateY(-12px) rotate(3deg); }
  66%       { transform: translateY(-5px) rotate(-2deg); }
}
```

### CTA pulse
```css
@keyframes nb-pulse {
  0%, 100% { box-shadow: 5px 5px 0 #1A1040; }
  50%       { box-shadow: 10px 10px 0 #1A1040; }
}
```

### Confetti (Beam tier only)
- Library: `canvas-confetti`
- Colors: `#FFD93D`, `#FF6B35`, `#FF3D00`
- Trigger: `smile_tier === 'beam'`, 4s cooldown

---

## Icons

Use **Lucide React** exclusively. Key icons:

| Action | Icon |
|---|---|
| Smile detection | `Smile` |
| Earn / AI | `Zap` |
| Gift | `Gift` |
| Follow / Circle | `Users` |
| Private / Lock | `Lock` |
| Stars / Feature | `Star` |
| Camera / Playground | `Camera` |
| Navigate | `ArrowRight` |
| Security | `Shield` |
| Trending | `TrendingUp` |

---

## Tone & Copy

- Bold, punchy, direct — matches the neo-brutalism aesthetic
- Never punish a low smile score — "try again with good lighting"
- Use second person ("your smile", "you earned")
- Beam tier moments get exclamation points
- No emoji in UI chrome — only in smile tier indicators and captions

**Microcopy examples:**
- Upload CTA: "Share your smile"
- No posts yet: "Be the first to smile here 😄"
- Private locked: "Follow to see their smiles"
- 0 pts: "No face detected — try again with good lighting!"
- Gift sent: "You just made someone smile harder 😊"
