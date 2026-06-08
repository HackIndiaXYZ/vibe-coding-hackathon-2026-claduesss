'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export function useLike(
  postId: string,
  postOwnerId: string,
  initialLiked: boolean,
  initialCount: number,
  currentUserId?: string,
) {
  const [liked,     setLiked]     = useState(initialLiked);
  const [likeCount, setLikeCount] = useState(initialCount);
  const [loading,   setLoading]   = useState(false);

  async function toggle() {
    if (!currentUserId || loading) return;
    const supabase = createClient();
    const optimisticLiked = !liked;
    const optimisticCount = liked ? likeCount - 1 : likeCount + 1;

    setLiked(optimisticLiked);
    setLikeCount(optimisticCount);
    setLoading(true);

    if (optimisticLiked) {
      const { error } = await supabase.from('likes').insert({ post_id: postId, user_id: currentUserId });
      if (error) {
        setLiked(liked);
        setLikeCount(likeCount);
      } else if (currentUserId !== postOwnerId) {
        await supabase.from('notifications').insert({
          user_id:  postOwnerId,
          actor_id: currentUserId,
          type:     'like',
          post_id:  postId,
        });
      }
    } else {
      const { error } = await supabase.from('likes').delete()
        .eq('post_id', postId).eq('user_id', currentUserId);
      if (error) {
        setLiked(liked);
        setLikeCount(likeCount);
      }
    }

    setLoading(false);
  }

  return { liked, likeCount, toggle };
}
