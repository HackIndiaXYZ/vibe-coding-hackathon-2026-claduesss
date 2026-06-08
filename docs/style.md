# SmileChain — Design System

## Philosophy

Every visual decision reinforces the core emotion: **the joy of a genuine smile**. Warm, radiant, and energetic — like sunshine breaking through. No cold blues. No corporate grays. Every screen should feel like it's smiling back at you.

---

## Color Palette

### Primary — Sunshine Yellow
The dominant brand color. Evokes warmth, optimism, and the glow of a genuine smile.

| Name | Hex | Usage |
|---|---|---|
| `smile-50` | `#FFFBEB` | Page backgrounds, card backgrounds |
| `smile-100` | `#FEF3C7` | Hover states, subtle fills |
| `smile-300` | `#FCD34D` | Borders, dividers |
| `smile-400` | `#FBBF24` | Secondary buttons, badges |
| `smile-500` | `#FFD93D` | **Primary brand yellow** — buttons, highlights |
| `smile-600` | `#F59E0B` | Button hover states |

### Secondary — Warm Orange
The "energy of a smile" — the moment a smile breaks into a full beam. Used for accents, scores, and points.

| Name | Hex | Usage |
|---|---|---|
| `glow-400` | `#FB923C` | Smile score badges, tier indicators |
| `glow-500` | `#FF6B35` | **Primary accent** — CTAs, smile tier chips |
| `glow-600` | `#EA580C` | Hover on accent elements |

### Supporting Colors

| Name | Hex | Usage |
|---|---|---|
| `warm-white` | `#FFFBF0` | Page background (warm, not pure white) |
| `soft-gray` | `#6B7280` | Secondary text, metadata |
| `charcoal` | `#1F2937` | Primary text |
| `success` | `#10B981` | Follow accepted, gifted confirmation |
| `muted` | `#F3F4F6` | Disabled states, locked profile bg |

### Smile Tier Colors
Used specifically in score reveals and tier badges:

| Tier | Color | Hex |
|---|---|---|
| 😐 None | Muted gray | `#9CA3AF` |
| 😊 Mild | Warm yellow | `#FFD93D` |
| 😄 Big | Bright orange | `#FF6B35` |
| 😁 Beam | Deep coral | `#FF3D00` |

---

## Typography

**Font: [Nunito](https://fonts.google.com/specimen/Nunito)**
Rounded, friendly, approachable. Feels like a smile in letterform.

```css
--font-sans: 'Nunito', sans-serif;
```

| Role | Weight | Size | Usage |
|---|---|---|---|
| Display | 800 | 2.25rem / 36px | Landing headline |
| Heading 1 | 700 | 1.875rem / 30px | Page titles |
| Heading 2 | 700 | 1.5rem / 24px | Section headers |
| Heading 3 | 600 | 1.25rem / 20px | Card titles, usernames |
| Body | 500 | 1rem / 16px | Default text |
| Small | 500 | 0.875rem / 14px | Metadata, timestamps |
| Micro | 400 | 0.75rem / 12px | Labels, badges |

---

## Spacing & Layout

- **Base unit:** 4px
- **Container max-width:** 640px (mobile-first, centered)
- **Card padding:** 16px
- **Section gap:** 24px
- **Border radius:** 16px (cards), 12px (buttons), 999px (pills/badges)

---

## Component Styles

### Buttons

**Primary (Yellow CTA)**
```
bg-smile-500 text-charcoal font-700 rounded-full px-6 py-3
hover:bg-smile-600 active:scale-95
transition: all 150ms ease
shadow: 0 4px 14px rgba(255, 217, 61, 0.4)
```

**Secondary (Orange Accent)**
```
bg-glow-500 text-white font-700 rounded-full px-6 py-3
hover:bg-glow-600 active:scale-95
shadow: 0 4px 14px rgba(255, 107, 53, 0.35)
```

**Ghost**
```
border-2 border-smile-400 text-charcoal bg-transparent rounded-full px-6 py-3
hover:bg-smile-50
```

### Cards
```
bg-white rounded-2xl shadow-sm border border-smile-100
hover:shadow-md transition-shadow duration-200
```

### Smile Score Badge
```
rounded-full px-3 py-1 font-700 text-sm
Tier colors applied (see Smile Tier Colors above)
```

### Post Feed
- Max width 640px, centered
- Cards stacked vertically, gap-4
- Avatar + username top left, timestamp top right
- Image fills card width, rounded-xl
- Smile tier badge overlaid bottom-left on image
- AI caption below image in italic
- Gift button bottom right with point count

---

## Animations

All animations via **Framer Motion** (`framer-motion` package). Use `motion` components and `AnimatePresence` throughout. No CSS keyframe animations — keep everything in Framer Motion for consistency and control.

### Install
```bash
npm install framer-motion
```

### Page Transitions
Wrap route content in `AnimatePresence`. Each page fades + slides up on enter, fades out on exit.
```tsx
// Shared page wrapper variant
initial:  { opacity: 0, y: 24 }
animate:  { opacity: 1, y: 0 }
exit:     { opacity: 0, y: -12 }
transition: { duration: 0.35, ease: 'easeOut' }
```

### Homepage — Section Reveals (scroll-triggered)
Use `whileInView` + `viewport={{ once: true }}` on each section.
```tsx
initial:  { opacity: 0, y: 40 }
whileInView: { opacity: 1, y: 0 }
transition: { duration: 0.6, ease: 'easeOut' }
```
Stagger children using `staggerChildren: 0.1` on the parent `variants`.

### Smile Score Reveal (key UI moment)
```tsx
initial:  { scale: 0, opacity: 0, filter: 'blur(10px)' }
animate:  { scale: 1, opacity: 1, filter: 'blur(0px)' }
transition: { type: 'spring', stiffness: 260, damping: 20, delay: 0.3 }
```

### Confetti (Beam tier only)
- Trigger: `smile_tier === 'beam'`
- Library: `canvas-confetti`
- Colors: `#FFD93D`, `#FF6B35`, `#FF3D00`, `#FFF`
- Duration: 3 seconds, spread 120°

### Point Popup (on gift)
```tsx
// Floating +1 that fades out upward
initial:  { opacity: 1, y: 0 }
animate:  { opacity: 0, y: -40 }
transition: { duration: 0.8, ease: 'easeOut' }
```
Mount/unmount with `AnimatePresence`.

### Feed Card Entry (staggered list)
```tsx
// Parent
variants: { show: { transition: { staggerChildren: 0.08 } } }

// Each card
variants: {
  hidden: { opacity: 0, y: 20 },
  show:   { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 200 } }
}
```

### Follow Button State Change
```tsx
whileTap: { scale: 0.92 }
// Layout animation handles color/text transition
transition: { type: 'spring', stiffness: 300, damping: 22 }
```

### Notification Bell Badge
```tsx
// Unread count badge pops in
initial:  { scale: 0 }
animate:  { scale: 1 }
transition: { type: 'spring', stiffness: 400, damping: 15 }
```

### Navbar (app layout)
```tsx
// Slides down on mount
initial:  { y: -60, opacity: 0 }
animate:  { y: 0, opacity: 1 }
transition: { duration: 0.4, ease: 'easeOut' }
```

### Modal / Dialog Open
Use `AnimatePresence` + `motion.div`:
```tsx
initial:  { opacity: 0, scale: 0.95 }
animate:  { opacity: 1, scale: 1 }
exit:     { opacity: 0, scale: 0.95 }
transition: { duration: 0.2 }
```

---

## Icons

Use **Lucide React** for all UI icons. Key icons:

| Action | Icon |
|---|---|
| Notifications | `Bell` |
| Upload | `Camera` |
| Home/Feed | `Home` |
| Explore | `Compass` |
| Search | `Search` |
| Profile | `User` |
| Gift | `Gift` (or 😊 emoji) |
| Follow | `UserPlus` |
| Settings | `Settings` |
| Lock (private) | `Lock` |
| Back | `ArrowLeft` |

---

## Tone & Copy

- Warm, playful, encouraging
- Never punish a low smile score — reframe as "try again"
- Use second person ("your smile", "you earned")
- Exclamation points used sparingly — save for beam tier moments
- Emoji used contextually in captions and tier badges, not in UI chrome

**Microcopy examples:**
- Upload CTA: "Share your smile"
- No posts yet: "Be the first to smile here 😄"
- Private profile locked: "Follow to see their smiles"
- 0 pt score: "No face detected — try again with good lighting!"
- Gift sent: "You just made someone smile harder 😊"
