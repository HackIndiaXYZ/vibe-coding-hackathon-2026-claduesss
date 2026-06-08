'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Home, Compass, Search, Upload, Bell, User, Settings } from 'lucide-react';
import { useCurrentUser } from '@/hooks/useCurrentUser';

const NAV = [
  { href: '/feed',     icon: Home,    label: 'Feed'    },
  { href: '/explore',  icon: Compass, label: 'Explore' },
  { href: '/upload',   icon: Upload,  label: 'Upload'  },
  { href: '/search',   icon: Search,  label: 'Search'  },
];

const INK = '#1A1040';

export default function Navbar() {
  const pathname  = usePathname();
  const { user }  = useCurrentUser();

  return (
    <>
      {/* ── Desktop sidebar ── */}
      <motion.aside
        initial={{ opacity: 0, x: -24 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4 }}
        className="hidden md:flex flex-col sticky top-0 h-screen w-56 flex-shrink-0 py-6 px-4 bg-white"
        style={{ borderRight: `2.5px solid ${INK}`, boxShadow: `4px 0 0 ${INK}` }}
      >
        {/* Logo */}
        <Link href="/feed" className="block mb-10" aria-label="SmileChain home">
          <Image src="/logo.png" alt="SmileChain" width={44} height={44} className="rounded-xl" priority />
        </Link>

        {/* Nav links */}
        <nav className="flex flex-col gap-2 flex-1" aria-label="Main navigation">
          {NAV.map(({ href, icon: Icon, label }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? 'page' : undefined}
                className="flex items-center gap-3 px-4 py-3 font-black text-sm transition-all duration-150 cursor-pointer"
                style={{
                  background:    active ? '#FFD93D' : 'transparent',
                  color:         active ? INK      : '#6B7280',
                  border:        active ? `2px solid ${INK}` : '2px solid transparent',
                  boxShadow:     active ? `3px 3px 0 ${INK}` : 'none',
                  borderRadius:  '8px',
                  transform:     active ? 'translate(-1px,-1px)' : 'none',
                }}
              >
                <Icon size={18} aria-hidden="true" />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Bottom actions */}
        <div className="flex flex-col gap-2 mt-4 pt-4" style={{ borderTop: `2px solid #E5E7EB` }}>
          <Link
            href="/notifications"
            className="flex items-center gap-3 px-4 py-3 font-black text-sm cursor-pointer transition-all duration-150"
            style={{
              background:   pathname === '/notifications' ? '#FFD93D' : 'transparent',
              color:        pathname === '/notifications' ? INK       : '#6B7280',
              border:       pathname === '/notifications' ? `2px solid ${INK}` : '2px solid transparent',
              boxShadow:    pathname === '/notifications' ? `3px 3px 0 ${INK}` : 'none',
              borderRadius: '8px',
            }}
            aria-label="Notifications"
          >
            <Bell size={18} aria-hidden="true" /> Notifications
          </Link>

          <Link
            href="/settings"
            className="flex items-center gap-3 px-4 py-3 font-black text-sm cursor-pointer transition-all duration-150"
            style={{
              background:   pathname === '/settings' ? '#FFD93D' : 'transparent',
              color:        pathname === '/settings' ? INK       : '#6B7280',
              border:       pathname === '/settings' ? `2px solid ${INK}` : '2px solid transparent',
              boxShadow:    pathname === '/settings' ? `3px 3px 0 ${INK}` : 'none',
              borderRadius: '8px',
            }}
            aria-label="Settings"
          >
            <Settings size={18} aria-hidden="true" /> Settings
          </Link>

          {/* Profile avatar */}
          <Link
            href={`/profile/${user?.username ?? ''}`}
            className="flex items-center gap-3 px-3 py-2.5 mt-2 font-black text-sm cursor-pointer"
            style={{
              background:   '#1A1040',
              color:        '#FFD93D',
              border:       `2px solid ${INK}`,
              boxShadow:    `3px 3px 0 ${INK}`,
              borderRadius: '8px',
            }}
            aria-label="Your profile"
          >
            <div
              className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md overflow-hidden"
              style={{ border: `2px solid #FFD93D`, background: '#FFD93D' }}
            >
              {user?.avatar_url ? (
                <img src={user.avatar_url} alt="" className="h-full w-full object-cover" aria-hidden="true" />
              ) : (
                <User size={16} aria-hidden="true" style={{ color: INK }} />
              )}
            </div>
            <div className="min-w-0">
              <div className="text-xs truncate" style={{ color: '#FFD93D' }}>
                {user?.display_name ?? user?.username ?? 'Profile'}
              </div>
              <div className="text-[10px] font-bold" style={{ color: '#FF6B35' }}>
                {user?.smile_points ?? 0} pts
              </div>
            </div>
          </Link>
        </div>
      </motion.aside>

      {/* ── Mobile bottom tab bar ── */}
      <motion.nav
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around bg-white pb-safe"
        style={{
          borderTop:     `2.5px solid ${INK}`,
          boxShadow:     `0 -3px 0 ${INK}`,
          paddingTop:    '8px',
          paddingBottom: 'max(12px, env(safe-area-inset-bottom))',
        }}
        aria-label="Mobile navigation"
      >
        {[...NAV, { href: `/profile/${user?.username ?? ''}`, icon: User, label: 'Profile' }].map(({ href, icon: Icon, label }) => {
          const active = pathname === href || (label === 'Profile' && pathname.startsWith('/profile'));
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? 'page' : undefined}
              className="flex flex-col items-center gap-1 px-3 py-1 cursor-pointer"
              style={{ minHeight: '44px', minWidth: '44px' }}
            >
              <motion.div whileTap={{ scale: 0.8 }} className="flex flex-col items-center gap-1">
                <div
                  className="flex h-8 w-8 items-center justify-center"
                  style={{
                    background:   active ? '#FFD93D' : 'transparent',
                    border:       active ? `2px solid ${INK}` : '2px solid transparent',
                    boxShadow:    active ? `2px 2px 0 ${INK}` : 'none',
                    borderRadius: '6px',
                    transition:   'all 0.12s ease',
                  }}
                >
                  <Icon size={18} aria-hidden="true" style={{ color: active ? INK : '#9CA3AF' }} />
                </div>
                <span
                  className="text-[9px] font-black uppercase tracking-wide"
                  style={{ color: active ? INK : '#9CA3AF' }}
                >
                  {label}
                </span>
              </motion.div>
            </Link>
          );
        })}
      </motion.nav>
    </>
  );
}
