# Comments + Likes — Implementation Plan

## Goal

Add a comment section and like button to each post. Authenticated users can like/unlike and post text comments; everyone can read them.

---

## 1. Database

### New table: `comments`

```sql
CREATE TABLE comments (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id     uuid REFERENCES posts(id) ON DELETE CASCADE NOT NULL,
  user_id     uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  body        text NOT NULL CHECK (char_length(body) BETWEEN 1 AND 500),
  created_at  timestamptz DEFAULT now()
);

CREATE INDEX comments_post_id_idx ON comments(post_id);
```

### RLS policies

```sql
-- Anyone who can see the post can see its comments
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "comments_select" ON comments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM posts p
      JOIN users u ON u.id = p.user_id
      WHERE p.id = comments.post_id
        AND (
          u.is_private = false
          OR p.user_id = auth.uid()
          OR EXISTS (
            SELECT 1 FROM follows f
            WHERE f.follower_id = auth.uid()
              AND f.following_id = p.user_id
              AND f.status = 'accepted'
          )
        )
    )
  );

CREATE POLICY "comments_insert" ON comments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "comments_delete" ON comments FOR DELETE
  USING (auth.uid() = user_id);
```

### New table: `likes`

```sql
CREATE TABLE likes (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id    uuid REFERENCES posts(id) ON DELETE CASCADE NOT NULL,
  user_id    uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE (post_id, user_id)   -- one like per user per post
);

CREATE INDEX likes_post_id_idx ON likes(post_id);
```

### RLS for `likes`

```sql
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;

-- same visibility rule as comments
CREATE POLICY "likes_select" ON likes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM posts p
      JOIN users u ON u.id = p.user_id
      WHERE p.id = likes.post_id
        AND (
          u.is_private = false
          OR p.user_id = auth.uid()
          OR EXISTS (
            SELECT 1 FROM follows f
            WHERE f.follower_id = auth.uid()
              AND f.following_id = p.user_id
              AND f.status = 'accepted'
          )
        )
    )
  );

CREATE POLICY "likes_insert" ON likes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "likes_delete" ON likes FOR DELETE
  USING (auth.uid() = user_id);
```

### Update notifications type

Add `'comment'` and `'like'` to the notification type values (text column — no schema change needed).

### Migration file

`supabase/migrations/002_comments_likes.sql`

---

## 2. TypeScript Types  (`src/types/index.ts`)

```ts
export interface Comment {
  id: string;
  post_id: string;
  user_id: string;
  body: string;
  created_at: string;
  user?: Pick<User, 'username' | 'display_name' | 'avatar_url'>;
}

export interface Like {
  id: string;
  post_id: string;
  user_id: string;
  created_at: string;
}
```

Add to `Post` interface:
```ts
comment_count: number;
like_count: number;
has_liked?: boolean;   // set by query when currentUserId is known
```

---

## 3. Data Layer

### `src/hooks/useComments.ts`  (new file)

Client hook that:
- fetches comments for a `post_id` (JOIN users for avatar/username)
- subscribes to Supabase Realtime `INSERT` on `comments` filtered by `post_id`
- exposes `submit(body)` → INSERT + optimistic update
- exposes `remove(id)` → DELETE (own comments only)

```ts
export function useComments(postId: string, currentUserId?: string) {
  // returns { comments, loading, submit, remove }
}
```

### `src/hooks/useLike.ts`  (new file)

Lightweight hook per-post for like toggle:

```ts
export function useLike(postId: string, initialLiked: boolean, initialCount: number, currentUserId?: string) {
  // returns { liked, likeCount, toggle }
  // toggle(): optimistic flip, INSERT or DELETE likes row, rollback on error
  // fires 'like' notification when liking someone else's post
}
```

### `PostCard.tsx` — add `comment_count`, `like_count`, `has_liked` props

Fetch all three alongside gift count in `usePosts.ts` query using subqueries:

```sql
(SELECT COUNT(*) FROM comments WHERE post_id = posts.id)   AS comment_count,
(SELECT COUNT(*) FROM likes    WHERE post_id = posts.id)   AS like_count,
(SELECT COUNT(*) FROM likes    WHERE post_id = posts.id AND user_id = auth.uid()) > 0 AS has_liked
```

---

## 4. UI Components

### `src/components/CommentSection.tsx`  (new file)

Collapsible panel rendered inside `PostCard`. Expands on toggle.

Structure:
```
[MessageCircle icon] 3 comments          ← toggle button in footer row
──────────────────────────────────────
[avatar] username  · 2h ago
  "Great smile! 😄"
[avatar] username  · 5m ago
  "This made my day"
──────────────────────────────────────
[avatar input] [textarea] [Send button]  ← only if authed
```

Props:
```ts
interface Props {
  postId: string;
  currentUserId?: string;
  initialCount: number;
}
```

Rules:
- Textarea: max 500 chars, show counter at 400+
- Pressing Enter (not Shift+Enter) submits
- Empty body → disabled Send button
- Own comments get a delete (×) button
- Optimistic insert: append immediately, roll back on error

### `PostCard.tsx` — changes

1. Add `CommentSection` import, `useLike` hook
2. Add `showComments` state (default `false`)
3. Footer row — three action buttons, left to right:

```
[Heart] 12        [MessageCircle] 3 comments        [Gift] Gift Smile
```

```tsx
// Like button
<motion.button onClick={toggle} whileTap={{ scale: 0.88 }} ...>
  <Heart size={15} fill={liked ? '#FF6B35' : 'none'} color={liked ? '#FF6B35' : INK} />
  {likeCount}
</motion.button>

// Comment toggle
<button onClick={() => setShowComments(v => !v)} ...>
  <MessageCircle size={15} />
  {commentCount}
</button>
```

4. Render `<CommentSection>` below footer when `showComments === true`

---

## 5. Notifications

**On comment** (inside `useComments.submit()`):
```ts
if (currentUserId !== post.user_id) {
  await supabase.from('notifications').insert({
    user_id:      post.user_id,
    type:         'comment',
    from_user_id: currentUserId,
    post_id:      postId,
  });
}
```

**On like** (inside `useLike.toggle()`, only when liking — not unliking):
```ts
if (currentUserId !== post.user_id) {
  await supabase.from('notifications').insert({
    user_id:      post.user_id,
    type:         'like',
    from_user_id: currentUserId,
    post_id:      postId,
  });
}
```

Add `'comment'` and `'like'` handling in `NotificationBell.tsx` display logic.

---

## 6. Realtime

`useComments` subscribes to:

```ts
supabase
  .channel(`comments:${postId}`)
  .on('postgres_changes', {
    event:  'INSERT',
    schema: 'public',
    table:  'comments',
    filter: `post_id=eq.${postId}`,
  }, (payload) => {
    // fetch the new comment with user join, append to state
  })
  .subscribe();
```

Unsubscribe on component unmount.

---

## 7. File Checklist

| File | Change |
|---|---|
| `supabase/migrations/002_comments_likes.sql` | CREATE TABLE comments + likes + RLS |
| `src/types/index.ts` | Add `Comment`, `Like` types; `comment_count`, `like_count`, `has_liked` to `Post` |
| `src/hooks/useComments.ts` | New hook |
| `src/hooks/useLike.ts` | New hook |
| `src/hooks/usePosts.ts` | Include `comment_count`, `like_count`, `has_liked` in query |
| `src/components/CommentSection.tsx` | New component |
| `src/components/PostCard.tsx` | Like button + comment toggle + render CommentSection |
| `src/components/NotificationBell.tsx` | Handle `'comment'` and `'like'` types |

---

## 8. Implementation Order

1. Write + run migration `002_comments_likes.sql`
2. Update `src/types/index.ts`
3. Update `usePosts.ts` query for comment count, like count, has_liked
4. Build `useLike.ts` hook
5. Build `useComments.ts` hook (no UI yet)
6. Build `CommentSection.tsx`
7. Wire like button + comment section into `PostCard.tsx`
8. Add notification send + bell display for both types

---

## Design Notes

- Match existing neo-brutalist style: `border: 2.5px solid #1A1040`, `boxShadow: 3px 3px 0 #1A1040`
- Comment avatars: 32×32, same style as PostCard header avatar
- Input: same border/shadow style, `borderRadius: 8px`
- Send button: yellow `#FFD93D` background, ink border
- Delete button: ghost, ink color, only visible on hover of own comment
- Animate CommentSection open/close with Framer Motion `AnimatePresence`
- Like button: `Heart` icon (Lucide), filled orange `#FF6B35` when liked, outline when not
- Like count sits right of the heart icon; animates +1 on tap with same float animation as gift
- No self-like: disable button when `currentUserId === post.user_id`
- Unlike fires DELETE — no notification on unlike
