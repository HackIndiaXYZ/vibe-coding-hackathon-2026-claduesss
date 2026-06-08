'use client';

import { useState, useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Comment } from '@/types';

export function useComments(postId: string, postOwnerId: string, currentUserId?: string) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading,  setLoading]  = useState(true);
  const channelRef = useRef<ReturnType<ReturnType<typeof createClient>['channel']> | null>(null);

  useEffect(() => {
    const supabase = createClient();

    async function fetchComments() {
      const { data } = await supabase
        .from('comments')
        .select('*, user:users(username, display_name, avatar_url)')
        .eq('post_id', postId)
        .order('created_at', { ascending: true });
      setComments((data as Comment[]) ?? []);
      setLoading(false);
    }

    fetchComments();

    channelRef.current = supabase
      .channel(`comments:${postId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'comments', filter: `post_id=eq.${postId}` },
        async (payload) => {
          const { data } = await supabase
            .from('comments')
            .select('*, user:users(username, display_name, avatar_url)')
            .eq('id', (payload.new as Comment).id)
            .single();
          if (data) setComments(prev => [...prev, data as Comment]);
        },
      )
      .subscribe();

    return () => {
      channelRef.current?.unsubscribe();
    };
  }, [postId]);

  async function submit(body: string) {
    if (!currentUserId || !body.trim()) return;
    const supabase = createClient();
    const optimistic: Comment = {
      id:         `opt-${Date.now()}`,
      post_id:    postId,
      user_id:    currentUserId,
      body:       body.trim(),
      created_at: new Date().toISOString(),
    };
    setComments(prev => [...prev, optimistic]);

    const { data, error } = await supabase
      .from('comments')
      .insert({ post_id: postId, user_id: currentUserId, body: body.trim() })
      .select('*, user:users(username, display_name, avatar_url)')
      .single();

    if (error) {
      setComments(prev => prev.filter(c => c.id !== optimistic.id));
    } else {
      setComments(prev => prev.map(c => c.id === optimistic.id ? (data as Comment) : c));
      if (currentUserId !== postOwnerId) {
        await supabase.from('notifications').insert({
          user_id:  postOwnerId,
          actor_id: currentUserId,
          type:     'comment',
          post_id:  postId,
        });
      }
    }
  }

  async function remove(id: string) {
    if (!currentUserId) return;
    setComments(prev => prev.filter(c => c.id !== id));
    await createClient().from('comments').delete().eq('id', id).eq('user_id', currentUserId);
  }

  return { comments, loading, submit, remove };
}
