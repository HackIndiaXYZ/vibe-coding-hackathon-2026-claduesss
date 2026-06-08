'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { Gift, User } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { TIER_CONFIG, GIFT_COST } from '@/lib/smile-points';
import type { Post } from '@/types';

function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

interface Props {
  post: Post;
  currentUserId?: string;
  currentUserPoints?: number;
  hasGifted?: boolean;
  onGift?: () => void;
}

export default function PostCard({ post, currentUserId, currentUserPoints = 0, hasGifted = false, onGift }: Props) {
  const [gifted, setGifted] = useState(hasGifted);
  const [giftCount, setGiftCount] = useState(post.gift_count);
  const [showFloating, setShowFloating] = useState(false);
  const [giftLoading, setGiftLoading] = useState(false);

  const tier = TIER_CONFIG[post.smile_tier];
  const user = post.user as { username: string; display_name: string | null; avatar_url: string | null } | undefined;
  const isOwn = currentUserId === post.user_id;
  const canGift = !isOwn && !gifted && currentUserPoints >= GIFT_COST;

  async function handleGift() {
    if (!canGift || giftLoading) return;
    setGiftLoading(true);
    const supabase = createClient();

    const { error } = await supabase.from('smile_gifts').insert({
      giver_id: currentUserId,
      receiver_id: post.user_id,
      post_id: post.id,
    });

    if (!error) {
      setGifted(true);
      setGiftCount(c => c + 1);
      setShowFloating(true);
      setTimeout(() => setShowFloating(false), 1500);
      onGift?.();
    }
    setGiftLoading(false);
  }

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="rounded-3xl overflow-hidden glass-panel hover-glow-smile"
      style={{ background: 'rgba(255, 255, 255, 0.7)' }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-4 pb-3">
        <Link
          href={`/profile/${user?.username ?? ''}`}
          className="flex-shrink-0 h-10 w-10 rounded-full overflow-hidden border-2 cursor-pointer"
          style={{ borderColor: '#FFD93D' }}
          aria-label={`View ${user?.display_name ?? user?.username}'s profile`}
        >
          {user?.avatar_url ? (
            <img src={user.avatar_url} alt="" className="h-full w-full object-cover" aria-hidden="true" />
          ) : (
            <div className="h-full w-full flex items-center justify-center" style={{ background: '#FEF3C7' }}>
              <User size={18} aria-hidden="true" style={{ color: '#F59E0B' }} />
            </div>
          )}
        </Link>
        <div className="flex-1 min-w-0">
          <Link
            href={`/profile/${user?.username ?? ''}`}
            className="font-semibold text-sm truncate block cursor-pointer hover:underline"
            style={{ color: '#1F2937' }}
          >
            {user?.display_name ?? user?.username ?? 'Unknown'}
          </Link>
          <span className="text-xs" style={{ color: '#9CA3AF' }}>{timeAgo(post.created_at)}</span>
        </div>
        <span
          className="px-3 py-1 rounded-full text-xs font-bold"
          style={{ background: tier.color + '22', color: tier.color === '#9CA3AF' ? '#6B7280' : tier.color }}
          aria-label={`${tier.label} — ${tier.points} points`}
        >
          {tier.emoji} {tier.label}
        </span>
      </div>

      {/* Image */}
      <div className="relative aspect-square w-full overflow-hidden">
        <img
          src={post.image_url}
          alt={post.caption ?? `${user?.username}'s smile post`}
          className="h-full w-full object-cover"
          loading="lazy"
        />
        {/* Points badge */}
        {tier.points > 0 && (
          <div
            className="absolute bottom-3 left-3 px-3 py-1 rounded-full text-sm font-black"
            style={{ background: tier.color, color: tier.color === '#FFD93D' ? '#1F2937' : 'white' }}
            aria-label={`Earned ${tier.points} smile points`}
          >
            +{tier.points} pts
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-3">
        {post.caption && (
          <p className="text-sm mb-3 italic leading-relaxed" style={{ color: '#4B5563' }}>
            &ldquo;{post.caption}&rdquo;
          </p>
        )}

        <div className="flex items-center justify-between">
          <span className="text-sm" style={{ color: '#9CA3AF' }}>
            {giftCount} {giftCount === 1 ? 'gift' : 'gifts'}
          </span>

          <div className="relative">
            <AnimatePresence>
              {showFloating && (
                <motion.span
                  initial={{ opacity: 1, y: 0 }}
                  animate={{ opacity: 0, y: -32 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1 }}
                  className="absolute -top-8 left-1/2 -translate-x-1/2 text-sm font-bold pointer-events-none"
                  style={{ color: '#FF6B35' }}
                  aria-hidden="true"
                >
                  +1 😊
                </motion.span>
              )}
            </AnimatePresence>

            <motion.button
              onClick={handleGift}
              disabled={!canGift || giftLoading}
              whileHover={canGift ? { scale: 1.1 } : {}}
              whileTap={canGift ? { scale: 0.9 } : {}}
              className="flex items-center gap-2 px-4 py-2 rounded-full font-semibold text-sm transition-all duration-200 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
              style={{
                background: gifted ? '#DCFCE7' : canGift ? '#FFD93D' : '#F3F4F6',
                color: gifted ? '#16A34A' : '#1F2937',
                minHeight: '44px',
              }}
              aria-label={gifted ? 'Already gifted' : isOwn ? 'Cannot gift own post' : `Gift a smile (costs 1 point)`}
            >
              <Gift size={16} aria-hidden="true" />
              {gifted ? 'Gifted!' : giftLoading ? '…' : 'Gift Smile'}
            </motion.button>
          </div>
        </div>
      </div>
    </motion.article>
  );
}
