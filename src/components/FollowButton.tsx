'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';

type FollowState = 'follow' | 'pending' | 'following';

interface Props {
  targetUserId: string;
  targetIsPrivate: boolean;
  currentUserId: string;
  initialState: FollowState;
  onStateChange?: (state: FollowState | null) => void;
}

const LABELS: Record<FollowState, string> = {
  follow: 'Follow',
  pending: 'Pending',
  following: 'Following',
};

const STYLES: Record<FollowState, React.CSSProperties> = {
  follow:    { background: '#FFD93D', color: '#1F2937' },
  pending:   { background: '#F3F4F6', color: '#6B7280' },
  following: { background: '#DCFCE7', color: '#16A34A' },
};

export default function FollowButton({ targetUserId, targetIsPrivate, currentUserId, initialState, onStateChange }: Props) {
  const [state, setState] = useState<FollowState>(initialState);
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    if (loading) return;
    setLoading(true);
    const supabase = createClient();

    if (state === 'follow') {
      const status = targetIsPrivate ? 'pending' : 'accepted';
      await supabase.from('follows').insert({ follower_id: currentUserId, following_id: targetUserId, status });

      if (targetIsPrivate) {
        await supabase.from('notifications').insert({
          user_id: targetUserId,
          actor_id: currentUserId,
          type: 'follow_request',
        });
      }

      const next: FollowState = targetIsPrivate ? 'pending' : 'following';
      setState(next);
      onStateChange?.(next);
    } else if (state === 'following') {
      await supabase.from('follows')
        .delete()
        .eq('follower_id', currentUserId)
        .eq('following_id', targetUserId);
      setState('follow');
      onStateChange?.(null);
    }

    setLoading(false);
  }

  return (
    <motion.button
      onClick={handleClick}
      disabled={loading || state === 'pending'}
      whileHover={state !== 'pending' ? { scale: 1.05 } : {}}
      whileTap={state !== 'pending' ? { scale: 0.95 } : {}}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      className="px-6 py-2.5 rounded-2xl font-semibold text-sm transition-colors duration-200 cursor-pointer disabled:cursor-default"
      style={{ ...STYLES[state], minHeight: '44px' }}
      aria-label={`${LABELS[state]} this user`}
    >
      {loading ? '…' : LABELS[state]}
    </motion.button>
  );
}
