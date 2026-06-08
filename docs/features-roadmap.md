# SmileChain — Feature Implementation Roadmap

## 1. Leaderboard

**Goal:** Ranked list of users by `smile_points`. Weekly + all-time views.

### DB
No schema changes needed. Optional: add a Postgres view for weekly leaders.

```sql
-- Weekly leaderboard view (add to a new migration)
CREATE VIEW public.leaderboard_weekly AS
SELECT
  u.id,
  u.username,
  u.display_name,
  u.avatar_url,
  COALESCE(SUM(p.smile_points), 0) AS weekly_points,
  COUNT(p.id)                       AS post_count
FROM public.users u
LEFT JOIN public.posts p
  ON p.user_id = u.id
  AND p.created_at >= date_trunc('week', now())
GROUP BY u.id
ORDER BY weekly_points DESC
LIMIT 50;
```

### Files to create / modify

| File | Action |
|------|--------|
| `src/app/(app)/leaderboard/page.tsx` | New page |
| `src/app/(app)/layout.tsx` | Add nav link |

### Logic (`leaderboard/page.tsx`)

```ts
// All-time
const { data: allTime } = await supabase
  .from('users')
  .select('id, username, display_name, avatar_url, smile_points')
  .order('smile_points', { ascending: false })
  .limit(50);

// Weekly — query the view
const { data: weekly } = await supabase
  .from('leaderboard_weekly')
  .select('*');
```

- Tab switcher: "All Time" / "This Week"
- Medal icons for rank 1–3 (🥇🥈🥉)
- Highlight current user's row
- Show rank # + avatar + username + points

---

## 3. Smile Streaks

**Goal:** Track consecutive days a user posts. Show streak on profile. Bonus points for milestones.

### DB changes

```sql
ALTER TABLE public.users
  ADD COLUMN streak_count   int DEFAULT 0,
  ADD COLUMN last_posted_at timestamptz;
```

### Streak logic (run on every upload, server-side in upload API or Supabase Function)

```ts
const now = new Date();
const last = user.last_posted_at ? new Date(user.last_posted_at) : null;

const daysSinceLast = last
  ? Math.floor((now.getTime() - last.getTime()) / 86_400_000)
  : null;

let newStreak: number;
if (daysSinceLast === null || daysSinceLast > 1) {
  newStreak = 1;                        // broken or first post
} else if (daysSinceLast === 1) {
  newStreak = user.streak_count + 1;    // continued
} else {
  newStreak = user.streak_count;        // already posted today, no change
}

await supabase
  .from('users')
  .update({ streak_count: newStreak, last_posted_at: now.toISOString() })
  .eq('id', userId);
```

### Streak bonus points

| Streak | Bonus |
|--------|-------|
| 3 days | +10 pts |
| 7 days | +30 pts |
| 30 days | +100 pts |

Apply bonus by checking `newStreak % milestone === 0` after update.

### UI

- `🔥 {streak_count} day streak` badge on profile page
- Animate badge when streak just incremented (Framer Motion pulse)
- Show "streak broken" state in grey if `last_posted_at` > 1 day ago

### Files to modify

| File | Action |
|------|--------|
| `supabase/migrations/003_streaks.sql` | New migration |
| `src/app/(app)/upload/page.tsx` | Call streak update after post insert |
| `src/app/(app)/profile/[username]/page.tsx` | Render streak badge |
| `src/types/index.ts` | Add `streak_count`, `last_posted_at` to `User` |

---

## 4. Live Smile Camera

**Goal:** Webcam feed with real-time face-api.js detection. Auto-snap when smile peaks above threshold.

### How it works

```
getUserMedia({ video: true })
  → <video> element
  → requestAnimationFrame loop
  → detectSmile(videoElement) every ~300ms
  → overlay canvas draws bounding box + live score
  → when score >= threshold for 3 consecutive frames → auto-capture
  → canvas.toBlob() → existing upload flow
```

### Files to create / modify

| File | Action |
|------|--------|
| `src/components/SmileCamera.tsx` | New component |
| `src/app/(app)/upload/page.tsx` | Add "Use Camera" tab |

### `SmileCamera.tsx` skeleton

```tsx
'use client';
import { useRef, useEffect, useState } from 'react';
import { detectSmile } from '@/lib/face-api';

const THRESHOLD   = 0.65;
const HOLD_FRAMES = 3;

export default function SmileCamera({ onCapture }: { onCapture: (blob: Blob, score: number) => void }) {
  const videoRef   = useRef<HTMLVideoElement>(null);
  const canvasRef  = useRef<HTMLCanvasElement>(null);
  const holdRef    = useRef(0);
  const [score, setScore] = useState(0);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let stopped = false;
    let stream: MediaStream;

    async function start() {
      stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
      videoRef.current!.srcObject = stream;
      await videoRef.current!.play();
      setReady(true);
      loop();
    }

    async function loop() {
      if (stopped || !videoRef.current) return;
      const result = await detectSmile(videoRef.current);
      setScore(result.score);
      if (result.score >= THRESHOLD) {
        holdRef.current++;
        if (holdRef.current >= HOLD_FRAMES) {
          capture();
          return;
        }
      } else {
        holdRef.current = 0;
      }
      setTimeout(loop, 300);
    }

    function capture() {
      const canvas = canvasRef.current!;
      const ctx = canvas.getContext('2d')!;
      canvas.width  = videoRef.current!.videoWidth;
      canvas.height = videoRef.current!.videoHeight;
      ctx.drawImage(videoRef.current!, 0, 0);
      canvas.toBlob(blob => blob && onCapture(blob, score), 'image/jpeg', 0.92);
      stream.getTracks().forEach(t => t.stop());
    }

    start();
    return () => { stopped = true; stream?.getTracks().forEach(t => t.stop()); };
  }, []);

  return (
    <div className="relative">
      <video ref={videoRef} className="w-full rounded-xl" playsInline muted />
      <canvas ref={canvasRef} className="hidden" />
      {/* live score bar */}
      <div className="absolute bottom-4 left-4 right-4 h-3 rounded-full bg-white/30">
        <div
          className="h-full rounded-full transition-all duration-200"
          style={{ width: `${score * 100}%`, background: score >= THRESHOLD ? '#FF3D00' : '#FFD93D' }}
        />
      </div>
    </div>
  );
}
```

### Upload page tab change

```tsx
// In upload/page.tsx, add a tab toggle:
// [📁 Upload File]  [📷 Live Camera]
// When camera tab active, render <SmileCamera onCapture={handleCapture} />
// handleCapture receives blob → convert to File → feed into existing flow
```

---

## 5. Personal Smile Analytics

**Goal:** Stats section on own profile — avg score, total points, tier distribution, activity chart.

### Data source

All data lives in `posts` already. Aggregate client-side (small dataset per user).

```ts
// In profile/[username]/page.tsx (or a dedicated hook)
const { data: posts } = await supabase
  .from('posts')
  .select('smile_score, smile_tier, smile_points, created_at')
  .eq('user_id', profileUser.id)
  .order('created_at', { ascending: true });

const avgScore     = posts.reduce((s, p) => s + p.smile_score, 0) / posts.length;
const totalPoints  = posts.reduce((s, p) => s + p.smile_points, 0);
const tierCounts   = posts.reduce((acc, p) => ({ ...acc, [p.smile_tier]: (acc[p.smile_tier] ?? 0) + 1 }), {});
const bestPost     = posts.reduce((best, p) => p.smile_score > best.smile_score ? p : best, posts[0]);
```

### UI components

- **Stats row:** avg score card + total posts + total points
- **Tier donut chart:** none/mild/big/beam distribution using a simple SVG or `recharts` (already likely in deps via shadcn)
- **Score timeline:** sparkline of `smile_score` over last 30 posts
- **Best smile:** thumbnail of highest-score post

### Files to modify

| File | Action |
|------|--------|
| `src/app/(app)/profile/[username]/page.tsx` | Add analytics section (only visible on own profile) |
| `src/components/SmileAnalytics.tsx` | New component for charts/stats |

### Visibility rule

```tsx
// Only show analytics to the profile owner
{isOwnProfile && <SmileAnalytics posts={posts} />}
```

---

## 6. Post Deletion

**Goal:** Owner can delete their own post. Removes image from Storage + DB row.

### RLS

Already in place: `posts_delete_own` policy exists in `001_initial.sql`.

### Storage cleanup

Must delete from `posts` storage bucket before (or after) the DB row. Order: Storage first, then DB (avoids orphaned files if DB delete fails, since RLS guards re-upload).

```ts
async function deletePost(postId: string, imageUrl: string) {
  // Extract storage path from public URL
  // e.g. https://xxx.supabase.co/storage/v1/object/public/posts/user-id/filename.jpg
  const path = imageUrl.split('/posts/')[1]; // "user-id/filename.jpg"

  const { error: storageErr } = await supabase.storage.from('posts').remove([path]);
  if (storageErr) throw storageErr;

  const { error: dbErr } = await supabase.from('posts').delete().eq('id', postId);
  if (dbErr) throw dbErr;
}
```

### UI

- `···` (ellipsis) menu button on `PostCard` header, visible only when `isOwn`
- Confirmation modal before delete ("Delete this post? This can't be undone.")
- On success: remove post from local state / trigger re-fetch

### Files to modify

| File | Action |
|------|--------|
| `src/components/PostCard.tsx` | Add `···` menu + delete handler |
| `src/hooks/usePosts.ts` | Expose `removePost(id)` to update local state |

---

## 7. Achievement Badges

**Goal:** Earn badges for milestones. Display on profile.

### Badge definitions

```ts
// src/lib/badges.ts
export const BADGES = [
  { id: 'first_beam',      label: 'First Beam',      emoji: '😁', desc: 'First beam smile post',             check: (s: Stats) => s.beamCount >= 1 },
  { id: 'streak_7',        label: '7-Day Streak',    emoji: '🔥', desc: '7 day posting streak',              check: (s: Stats) => s.maxStreak >= 7 },
  { id: 'streak_30',       label: 'Month of Smiles', emoji: '🏆', desc: '30 day posting streak',             check: (s: Stats) => s.maxStreak >= 30 },
  { id: 'gifts_10',        label: 'Gift Magnet',     emoji: '🎁', desc: 'Received 10 smile gifts',           check: (s: Stats) => s.giftsReceived >= 10 },
  { id: 'points_100',      label: 'Century',         emoji: '💯', desc: 'Earned 100 smile points',           check: (s: Stats) => s.totalPoints >= 100 },
  { id: 'points_1000',     label: 'Smile King',      emoji: '👑', desc: 'Earned 1000 smile points',          check: (s: Stats) => s.totalPoints >= 1000 },
  { id: 'posts_10',        label: 'Consistent',      emoji: '📸', desc: 'Posted 10 times',                   check: (s: Stats) => s.postCount >= 10 },
];
```

### Storage options

**Option A — computed on the fly (no DB changes):**
Derive from existing `posts` + `smile_gifts` + `users.streak_count` on profile load. Simple, no migration.

**Option B — persisted badges table (recommended for scale):**
```sql
CREATE TABLE public.user_badges (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid NOT NULL REFERENCES public.users ON DELETE CASCADE,
  badge_id   text NOT NULL,
  earned_at  timestamptz DEFAULT now(),
  UNIQUE (user_id, badge_id)
);
```
Grant badge with `INSERT ... ON CONFLICT DO NOTHING`. Check + award after upload, after gift received.

### Files to create / modify

| File | Action |
|------|--------|
| `src/lib/badges.ts` | Badge definitions + `computeBadges(stats)` |
| `supabase/migrations/004_badges.sql` | New table (Option B) |
| `src/app/(app)/profile/[username]/page.tsx` | Render badge row |
| `src/app/(app)/upload/page.tsx` | Check + award badges after post |

### Profile UI

```tsx
<div className="flex flex-wrap gap-2">
  {earnedBadges.map(b => (
    <Tooltip key={b.id} content={b.desc}>
      <span className="px-3 py-1 rounded-full text-sm font-bold border-2 border-ink"
            style={{ background: '#FFD93D' }}>
        {b.emoji} {b.label}
      </span>
    </Tooltip>
  ))}
</div>
```

---

## 8. Infinite Scroll / Pagination

**Goal:** Feed and explore load 12 posts at a time. Fetch next page when user nears bottom.

### Supabase pagination

```ts
// Page 0: range(0, 11)  → 12 posts
// Page 1: range(12, 23) → 12 posts
const PAGE_SIZE = 12;

const { data } = await supabase
  .from('posts')
  .select('...')
  .order('created_at', { ascending: false })
  .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);
```

### Hook pattern (update `usePosts.ts`)

```ts
const [posts, setPosts] = useState<Post[]>([]);
const [page,  setPage]  = useState(0);
const [hasMore, setHasMore] = useState(true);
const [loading, setLoading] = useState(false);

async function loadMore() {
  if (loading || !hasMore) return;
  setLoading(true);
  const newPosts = await fetchPage(page);
  if (newPosts.length < PAGE_SIZE) setHasMore(false);
  setPosts(prev => [...prev, ...newPosts]);
  setPage(p => p + 1);
  setLoading(false);
}
```

### Scroll trigger (IntersectionObserver — no library needed)

```tsx
// In feed/page.tsx and explore/page.tsx
const sentinelRef = useRef<HTMLDivElement>(null);

useEffect(() => {
  const obs = new IntersectionObserver(
    ([entry]) => { if (entry.isIntersecting) loadMore(); },
    { rootMargin: '200px' }
  );
  if (sentinelRef.current) obs.observe(sentinelRef.current);
  return () => obs.disconnect();
}, [loadMore]);

// At the bottom of the post list:
<div ref={sentinelRef} />
{loading && <Spinner />}
{!hasMore && <p className="text-center text-sm text-gray-400">You've seen everything 🎉</p>}
```

### Files to modify

| File | Action |
|------|--------|
| `src/hooks/usePosts.ts` | Add `page`, `hasMore`, `loadMore` to hook |
| `src/app/(app)/feed/page.tsx` | Add sentinel div + IntersectionObserver |
| `src/app/(app)/explore/page.tsx` | Same as feed |

---

## Implementation Order (suggested)

| Priority | Feature | Effort | Impact |
|----------|---------|--------|--------|
| 1 | Post Deletion (#6) | ~1h | Fixes UX gap |
| 2 | Infinite Scroll (#8) | ~2h | Fixes scale gap |
| 3 | Leaderboard (#1) | ~2h | Core gamification |
| 4 | Streaks (#3) | ~3h | Engagement hook |
| 5 | Analytics (#5) | ~3h | Profile depth |
| 6 | Badges (#7) | ~4h | Retention loop |
| 7 | Live Camera (#4) | ~5h | Wow factor / demo |
