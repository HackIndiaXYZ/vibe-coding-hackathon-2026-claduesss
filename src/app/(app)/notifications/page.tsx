'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { User } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import type { Notification } from '@/types';

function timeAgo(date: string) {
  const m = Math.floor((Date.now() - new Date(date).getTime()) / 60000);
  if (m < 1) return 'just now';
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

      await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', user!.id)
        .eq('is_read', false);

      setLoading(false);
    }

    load();
  }, [user]);

  async function handleFollowAction(notif: Notification, accept: boolean) {
    const supabase = createClient();

    if (accept) {
      await supabase
        .from('follows')
        .update({ status: 'accepted' })
        .eq('follower_id', notif.actor_id)
        .eq('following_id', user!.id);

      await supabase.from('notifications').insert({
        user_id: notif.actor_id,
        actor_id: user!.id,
        type: 'follow_accepted',
      });
    } else {
      await supabase
        .from('follows')
        .delete()
        .eq('follower_id', notif.actor_id)
        .eq('following_id', user!.id);
    }

    setNotifications(prev => prev.filter(n => n.id !== notif.id));
  }

  const actor = (n: Notification) => n.actor as { username: string; display_name: string | null; avatar_url: string | null } | undefined;

  function getMessage(n: Notification): string {
    const name = actor(n)?.display_name ?? actor(n)?.username ?? 'Someone';
    switch (n.type) {
      case 'follow_request':  return `${name} wants to follow you`;
      case 'follow_accepted': return `${name} accepted your follow request`;
      case 'gift_received':   return `${name} gifted you a smile 😊`;
      default: return '';
    }
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      <motion.h1
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-2xl font-black mb-6"
        style={{ fontFamily: 'var(--font-nunito)', color: '#1F2937' }}
      >
        Notifications
      </motion.h1>

      {loading && (
        <div className="space-y-3">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="flex items-center gap-3 p-4 rounded-2xl" style={{ background: 'white' }}>
              <div className="skeleton h-12 w-12 rounded-full flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="skeleton h-3 w-3/4 rounded" />
                <div className="skeleton h-2.5 w-1/3 rounded" />
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && notifications.length === 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center py-24 text-center"
        >
          <span className="text-5xl mb-4" role="img" aria-label="bell">🔔</span>
          <h2 className="text-xl font-bold mb-2" style={{ color: '#1F2937' }}>All caught up!</h2>
          <p className="text-sm" style={{ color: '#6B7280' }}>No notifications yet.</p>
        </motion.div>
      )}

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
              className="flex items-start gap-3 p-4 rounded-2xl transition-all duration-200 glass-panel hover-glow-smile border-2"
              style={{
                background: n.is_read ? 'rgba(255, 255, 255, 0.5)' : 'rgba(255, 243, 199, 0.4)',
                borderColor: n.is_read ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 217, 61, 0.3)',
                borderLeftWidth: n.is_read ? '2px' : '4px',
                borderLeftColor: n.is_read ? 'rgba(255, 255, 255, 0.2)' : '#FFD93D',
                boxShadow: n.is_read ? 'none' : '0 4px 16px rgba(255, 217, 61, 0.1)'
              }}
            >
              <Link
                href={`/profile/${actor(n)?.username ?? ''}`}
                className="flex-shrink-0 h-12 w-12 rounded-full overflow-hidden border-2 cursor-pointer"
                style={{ borderColor: '#FCD34D' }}
                aria-label={`View ${actor(n)?.display_name ?? actor(n)?.username}'s profile`}
              >
                {actor(n)?.avatar_url ? (
                  <img src={actor(n)!.avatar_url!} alt="" aria-hidden="true" className="h-full w-full object-cover" />
                ) : (
                  <div className="h-full w-full flex items-center justify-center" style={{ background: '#FEF3C7' }}>
                    <User size={20} aria-hidden="true" style={{ color: '#F59E0B' }} />
                  </div>
                )}
              </Link>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium leading-snug" style={{ color: '#1F2937' }}>
                  {getMessage(n)}
                </p>
                <p className="text-xs mt-0.5" style={{ color: '#9CA3AF' }}>{timeAgo(n.created_at)}</p>

                {n.type === 'follow_request' && (
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => handleFollowAction(n, true)}
                      className="px-4 py-1.5 rounded-xl font-semibold text-sm transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer"
                      style={{ background: '#FFD93D', color: '#1F2937', minHeight: '44px' }}
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => handleFollowAction(n, false)}
                      className="px-4 py-1.5 rounded-xl border-2 font-semibold text-sm transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer"
                      style={{ borderColor: '#E5E7EB', color: '#6B7280', minHeight: '44px' }}
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
