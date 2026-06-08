'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { Gift, Heart, MessageCircle, User } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { TIER_CONFIG, GIFT_COST } from '@/lib/smile-points';
import { useLike } from '@/hooks/useLike';
import CommentSection from '@/components/CommentSection';
import type { Post } from '@/types';

const INK = '#1A1040';

function timeAgo(date: string) {
  const m = Math.floor((Date.now() - new Date(date).getTime()) / 60000);
  if (m < 1)  return 'just now';
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
  const [gifted,        setGifted]        = useState(hasGifted);
  const [giftCount,     setGiftCount]     = useState(post.gift_count);
  const [showGiftFloat, setShowGiftFloat] = useState(false);
  const [giftLoading,   setGiftLoading]   = useState(false);
  const [showComments,  setShowComments]  = useState(false);

  const { liked, likeCount, toggle: toggleLike } = useLike(
    post.id,
    post.user_id,
    post.has_liked ?? false,
    post.like_count ?? 0,
    currentUserId,
  );

  const tier   = TIER_CONFIG[post.smile_tier];
  const author = post.user as { username: string; display_name: string | null; avatar_url: string | null } | undefined;
  const isOwn  = currentUserId === post.user_id;
  const canGift = !isOwn && !gifted && currentUserPoints >= GIFT_COST;

  async function handleGift() {
    if (!canGift || giftLoading) return;
    setGiftLoading(true);
    const { error } = await createClient().from('smile_gifts').insert({
      giver_id:    currentUserId,
      receiver_id: post.user_id,
      post_id:     post.id,
    });
    if (!error) {
      setGifted(true);
      setGiftCount(c => c + 1);
      setShowGiftFloat(true);
      setTimeout(() => setShowGiftFloat(false), 1400);
      onGift?.();
    }
    setGiftLoading(false);
  }

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="bg-white overflow-hidden"
      style={{ border: `2.5px solid ${INK}`, boxShadow: `5px 5px 0 ${INK}`, borderRadius: '12px' }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-4 pb-3">
        <Link
          href={`/profile/${author?.username ?? ''}`}
          className="flex-shrink-0 h-10 w-10 overflow-hidden cursor-pointer"
          style={{ border: `2.5px solid ${INK}`, borderRadius: '8px', background: '#FFD93D' }}
          aria-label={`View ${author?.display_name ?? author?.username}'s profile`}
        >
          {author?.avatar_url ? (
            <img src={author.avatar_url} alt="" className="h-full w-full object-cover" aria-hidden="true" />
          ) : (
            <div className="h-full w-full flex items-center justify-center">
              <User size={18} aria-hidden="true" style={{ color: INK }} />
            </div>
          )}
        </Link>

        <div className="flex-1 min-w-0">
          <Link
            href={`/profile/${author?.username ?? ''}`}
            className="font-black text-sm truncate block hover:underline cursor-pointer"
            style={{ color: INK }}
          >
            {author?.display_name ?? author?.username ?? 'Unknown'}
          </Link>
          <span className="text-xs font-medium" style={{ color: '#9CA3AF' }}>{timeAgo(post.created_at)}</span>
        </div>

        {/* Tier badge */}
        <span
          className="px-2.5 py-1 text-xs font-black"
          style={{
            background:   tier.color,
            color:        tier.color === '#FFD93D' ? INK : (tier.color === '#9CA3AF' ? '#fff' : '#fff'),
            border:       `2px solid ${INK}`,
            boxShadow:    `2px 2px 0 ${INK}`,
            borderRadius: '6px',
          }}
          aria-label={`${tier.label} — ${tier.points} points`}
        >
          {tier.emoji} {tier.label}
        </span>
      </div>

      {/* Image */}
      <div className="relative aspect-square w-full overflow-hidden" style={{ borderTop: `2px solid ${INK}`, borderBottom: `2px solid ${INK}` }}>
        <img
          src={post.image_url}
          alt={post.caption ?? `${author?.username}'s smile post`}
          className="h-full w-full object-cover"
          loading="lazy"
        />
        {tier.points > 0 && (
          <div
            className="absolute bottom-3 left-3 px-3 py-1 text-sm font-black"
            style={{
              background:   tier.color,
              color:        tier.color === '#FFD93D' ? INK : '#fff',
              border:       `2px solid ${INK}`,
              boxShadow:    `3px 3px 0 ${INK}`,
              borderRadius: '6px',
            }}
            aria-label={`Earned ${tier.points} smile points`}
          >
            +{tier.points} pts
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-3">
        {post.caption && (
          <p className="text-sm mb-3 italic leading-relaxed font-medium" style={{ color: '#4B5563' }}>
            &ldquo;{post.caption}&rdquo;
          </p>
        )}

        <div className="flex items-center gap-2">
          {/* Like button */}
          <motion.button
            onClick={toggleLike}
            disabled={isOwn}
            whileTap={!isOwn ? { scale: 0.88 } : {}}
            className="flex items-center gap-1.5 px-3 py-2 font-black text-sm disabled:cursor-not-allowed disabled:opacity-60"
            style={{
              background:   liked ? '#FFF0EB' : '#F9FAFB',
              color:        liked ? '#FF6B35' : INK,
              border:       `2px solid ${INK}`,
              boxShadow:    `2px 2px 0 ${INK}`,
              borderRadius: '8px',
              minHeight:    '36px',
            }}
            aria-label={liked ? 'Unlike' : 'Like'}
          >
            <Heart size={15} fill={liked ? '#FF6B35' : 'none'} color={liked ? '#FF6B35' : INK} aria-hidden="true" />
            <span>{likeCount}</span>
          </motion.button>

          {/* Comment toggle */}
          <button
            onClick={() => setShowComments(v => !v)}
            className="flex items-center gap-1.5 px-3 py-2 font-black text-sm"
            style={{
              background:   showComments ? '#FFF9E6' : '#F9FAFB',
              color:        INK,
              border:       `2px solid ${INK}`,
              boxShadow:    `2px 2px 0 ${INK}`,
              borderRadius: '8px',
              minHeight:    '36px',
            }}
            aria-label={showComments ? 'Hide comments' : 'Show comments'}
          >
            <MessageCircle size={15} aria-hidden="true" />
            <span>{post.comment_count ?? 0}</span>
          </button>

          {/* Gift button */}
          <div className="relative ml-auto">
            <AnimatePresence>
              {showGiftFloat && (
                <motion.span
                  initial={{ opacity: 1, y: 0 }}
                  animate={{ opacity: 0, y: -32 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.9 }}
                  className="absolute -top-8 left-1/2 -translate-x-1/2 text-sm font-black pointer-events-none"
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
              whileTap={canGift ? { scale: 0.93 } : {}}
              className="flex items-center gap-2 px-4 py-2 font-black text-sm cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-100"
              style={{
                background:   gifted ? '#D1FAE5' : canGift ? '#FFD93D' : '#F3F4F6',
                color:        gifted ? '#059669' : INK,
                border:       `2px solid ${INK}`,
                boxShadow:    `3px 3px 0 ${INK}`,
                borderRadius: '8px',
                minHeight:    '36px',
              }}
              aria-label={gifted ? 'Already gifted' : isOwn ? 'Cannot gift own post' : 'Gift a smile (costs 1 point)'}
            >
              <Gift size={15} aria-hidden="true" />
              {gifted ? 'Gifted!' : giftLoading ? '…' : 'Gift Smile'}
            </motion.button>
          </div>
        </div>
      </div>

      {/* Comment section */}
      <AnimatePresence>
        {showComments && (
          <CommentSection
            postId={post.id}
            postOwnerId={post.user_id}
            currentUserId={currentUserId}
          />
        )}
      </AnimatePresence>
    </motion.article>
  );
}
