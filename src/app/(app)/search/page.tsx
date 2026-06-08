'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Search, User } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import type { User as UserType } from '@/types';

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const q = query.trim();
    if (!q) { setResults([]); return; }

    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      const supabase = createClient();
      const { data } = await supabase
        .from('users')
        .select('id, username, display_name, avatar_url, is_private, smile_points')
        .ilike('username', `%${q}%`)
        .limit(20);
      setResults((data as UserType[]) ?? []);
      setLoading(false);
    }, 300);

    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [query]);

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      <motion.h1
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-2xl font-black mb-6"
        style={{ fontFamily: 'var(--font-nunito)', color: '#1F2937' }}
      >
        Search
      </motion.h1>

      <div className="relative mb-6">
        <Search
          size={18}
          className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
          style={{ color: '#9CA3AF' }}
          aria-hidden="true"
        />
        <input
          type="search"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search by username…"
          autoFocus
          className="w-full pl-11 pr-4 py-3.5 rounded-2xl text-base glass-input"
          aria-label="Search users by username"
        />
        {loading && (
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs" style={{ color: '#9CA3AF' }} aria-live="polite">
            searching…
          </span>
        )}
      </div>

      {query && !loading && results.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-16"
          aria-live="polite"
        >
          <span className="text-4xl mb-3 block" role="img" aria-label="person shrugging">🤷</span>
          <p className="font-semibold" style={{ color: '#1F2937' }}>No users found</p>
          <p className="text-sm mt-1" style={{ color: '#6B7280' }}>Try a different username</p>
        </motion.div>
      )}

      {!query && (
        <div className="text-center py-16">
          <span className="text-4xl mb-3 block" role="img" aria-label="magnifying glass">🔍</span>
          <p className="font-semibold" style={{ color: '#1F2937' }}>Find people to follow</p>
          <p className="text-sm mt-1" style={{ color: '#6B7280' }}>Type a username above</p>
        </div>
      )}

      {results.length > 0 && (
        <motion.ul
          initial="hidden"
          animate="show"
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.06 } } }}
          className="space-y-2"
          aria-label="Search results"
        >
          {results.map(u => (
            <motion.li
              key={u.id}
              variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }}
            >
              <Link
                href={`/profile/${u.username}`}
                className="flex items-center gap-3 p-3 rounded-2xl transition-all duration-200 hover:scale-[1.01] cursor-pointer glass-panel hover-glow-orange border-2"
                style={{ background: 'rgba(255, 255, 255, 0.6)', borderColor: 'rgba(252, 211, 77, 0.1)' }}
              >
                <div
                  className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full overflow-hidden border-2"
                  style={{ borderColor: '#FFD93D' }}
                >
                  {u.avatar_url ? (
                    <img src={u.avatar_url} alt="" aria-hidden="true" className="h-full w-full object-cover" />
                  ) : (
                    <User size={20} aria-hidden="true" style={{ color: '#F59E0B' }} />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate" style={{ color: '#1F2937' }}>
                    {u.display_name ?? u.username}
                  </p>
                  <p className="text-xs" style={{ color: '#9CA3AF' }}>@{u.username}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-bold" style={{ color: '#FF6B35' }}>{u.smile_points ?? 0}</p>
                  <p className="text-xs" style={{ color: '#9CA3AF' }}>pts</p>
                </div>
              </Link>
            </motion.li>
          ))}
        </motion.ul>
      )}
    </div>
  );
}
