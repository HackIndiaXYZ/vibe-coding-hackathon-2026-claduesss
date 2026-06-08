'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Bell, User } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import type { Notification } from '@/types';

const INK = '#1A1040';

function timeAgo(date: string) {
  const m = Math.floor((Date.now() - new Date(date).getTime()) / 60000);
  if (m < 1)  return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default function NotificationsPage() {
  const { user } = useCurrentUser();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const supabase = createClient();
    async function load() {
      const { data } = await supabase
        .from('notifications')
        .select('*, actor:users!actor_id(username, display_name, avatar_url)')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false })
        .limit(50);
      setNotifications((data as Notification[]) ?? []);
      await supabase.from('notifications').update({ is_read: true }).eq('user_id', user!.id).eq('is_read', false);
      setLoading(false);
    }
    load();
  }, [user]);

  async function handleFollowAction(notif: Notification, accept: boolean) {
    const supabase = createClient();
    if (accept) {
      await supabase.from('follows').update({ status: 'accepted' }).eq('follower_id', notif.actor_id).eq('following_id', user!.id);
      await supabase.from('notifications').insert({ user_id: notif.actor_id, actor_id: user!.id, type: 'follow_accepted' });
    } else {
      await supabase.from('follows').delete().eq('follower_id', notif.actor_id).eq('following_id', user!.id);
    }
    setNotifications(prev => prev.filter(n => n.id !== notif.id));
  }

  const actor = (n: Notification) =>
    n.actor as { username: string; display_name: string | null; avatar_url: string | null } | undefined;

  function getMessage(n: Notification) {
    const name = actor(n)?.display_name ?? actor(n)?.username ?? 'Someone';
    switch (n.type) {
      case 'follow_request':  return `${name} wants to follow you`;
      case 'follow_accepted': return `${name} accepted your follow request`;
      case 'gift_received':   return `${name} gifted you a smile 😊`;
      case 'comment':         return `${name} commented on your post`;
      case 'like':            return `${name} liked your post ❤️`;
      default: return '';
    }
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 inline-flex items-center gap-3"
      >
        <div
          className="flex h-10 w-10 items-center justify-center"
          style={{ background: '#FF6B35', border: `2.5px solid ${INK}`, boxShadow: `3px 3px 0 ${INK}`, borderRadius: '8px' }}
          aria-hidden="true"
        >
          <Bell size={20} style={{ color: '#fff' }} />
        </div>
        <h1 className="text-3xl font-black" style={{ fontFamily: 'var(--font-nunito)', color: INK }}>
          Notifications
        </h1>
      </motion.div>

      {/* Skeletons */}
      {loading && (
        <div className="space-y-3">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="flex items-center gap-3 p-4 bg-white" style={{ border: `2.5px solid ${INK}`, boxShadow: `3px 3px 0 ${INK}`, borderRadius: '10px' }}>
              <div className="skeleton h-12 w-12 rounded-lg flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="skeleton h-3 w-3/4 rounded" />
                <div className="skeleton h-2.5 w-1/3 rounded" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty */}
      {!loading && notifications.length === 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center text-center bg-white"
          style={{ border: `2.5px solid ${INK}`, boxShadow: `5px 5px 0 ${INK}`, borderRadius: '12px', padding: '48px 32px' }}
        >
          <div
            className="flex h-20 w-20 items-center justify-center mx-auto mb-4"
            style={{ background: '#FFD93D', border: `2.5px solid ${INK}`, boxShadow: `4px 4px 0 ${INK}`, borderRadius: '12px' }}
            aria-hidden="true"
          >
            <Bell size={36} style={{ color: INK }} />
          </div>
          <h2 className="text-xl font-black mb-2" style={{ color: INK }}>All caught up!</h2>
          <p className="text-sm font-semibold" style={{ color: '#6B7280' }}>No notifications yet.</p>
        </motion.div>
      )}

      {/* List */}
      {!loading && notifications.length > 0 && (
        <motion.ul
          initial="hidden"
          animate="show"
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.07 } } }}
          className="space-y-3"
          aria-label="Notifications list"
        >
          {notifications.map(n => (
            <motion.li
              key={n.id}
              variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }}
              className="flex items-start gap-3 p-4 bg-white"
              style={{
                border:       `2.5px solid ${INK}`,
                boxShadow:    n.is_read ? `3px 3px 0 ${INK}` : `5px 5px 0 ${INK}`,
                borderRadius: '10px',
                borderLeft:   n.is_read ? `2.5px solid ${INK}` : `5px solid #FFD93D`,
              }}
            >
              {/* Avatar */}
              <Link
                href={`/profile/${actor(n)?.username ?? ''}`}
                className="flex-shrink-0 h-12 w-12 overflow-hidden cursor-pointer"
                style={{ border: `2.5px solid ${INK}`, borderRadius: '8px', background: '#FFD93D' }}
                aria-label={`View ${actor(n)?.display_name ?? actor(n)?.username}'s profile`}
              >
                {actor(n)?.avatar_url ? (
                  <img src={actor(n)!.avatar_url!} alt="" aria-hidden="true" className="h-full w-full object-cover" />
                ) : (
                  <div className="h-full w-full flex items-center justify-center">
                    <User size={20} aria-hidden="true" style={{ color: INK }} />
                  </div>
                )}
              </Link>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-black leading-snug" style={{ color: INK }}>
                  {getMessage(n)}
                </p>
                <p className="text-xs mt-0.5 font-medium" style={{ color: '#9CA3AF' }}>{timeAgo(n.created_at)}</p>

                {n.type === 'follow_request' && (
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => handleFollowAction(n, true)}
                      className="nb-btn"
                      style={{ fontSize: '12px', padding: '7px 16px', minHeight: '36px' }}
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => handleFollowAction(n, false)}
                      className="nb-btn nb-btn-ghost"
                      style={{ fontSize: '12px', padding: '7px 16px', minHeight: '36px' }}
                    >
                      Decline
                    </button>
                  </div>
                )}
              </div>
            </motion.li>
          ))}
        </motion.ul>
      )}
    </div>
  );
}
