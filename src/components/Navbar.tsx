'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Compass, Search, Upload, Bell, User } from 'lucide-react';
import { useCurrentUser } from '@/hooks/useCurrentUser';

const NAV = [
  { href: '/feed',     icon: Home,    label: 'Feed' },
  { href: '/explore',  icon: Compass, label: 'Explore' },
  { href: '/upload',   icon: Upload,  label: 'Upload' },
  { href: '/search',   icon: Search,  label: 'Search' },
];

export default function Navbar() {
  const pathname = usePathname();
  const { user } = useCurrentUser();

  return (
    <>
      {/* ── Desktop top bar ── */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="hidden md:flex sticky top-0 z-50 items-center justify-between px-8 py-3 glass-panel"
        style={{ background: 'rgba(255,251,240,0.7)', borderBottom: '1px solid rgba(252, 211, 77, 0.4)' }}
      >
        <Link href="/feed" className="text-xl font-black transition-transform duration-200 hover:scale-105 active:scale-95" style={{ fontFamily: 'var(--font-nunito)', color: '#1F2937' }}>
          Smile<span style={{ color: '#FF6B35' }}>Chain</span>
        </Link>
 
        <nav className="flex items-center gap-1" aria-label="Main navigation">
          {NAV.map(({ href, icon: Icon, label }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                aria-label={label}
                aria-current={active ? 'page' : undefined}
                className="flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition-all duration-300 cursor-pointer hover:scale-105 active:scale-95"
                style={{
                  background: active ? 'linear-gradient(135deg, #FFD93D, #FF6B35)' : 'transparent',
                  color: active ? '#1F2937' : '#6B7280',
                  boxShadow: active ? '0 4px 12px rgba(255, 107, 53, 0.2)' : 'none',
                  minHeight: '44px',
                }}
              >
                <Icon size={18} aria-hidden="true" />
                {label}
              </Link>
            );
          })}
        </nav>
 
        <div className="flex items-center gap-3">
          <Link
            href="/notifications"
            aria-label="Notifications"
            className="flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-200 hover:bg-amber-100 hover:text-orange-500 cursor-pointer"
            style={{ color: '#6B7280', minHeight: '44px', minWidth: '44px' }}
          >
            <Bell size={20} aria-hidden="true" />
          </Link>
          <Link
            href={`/profile/${user?.username ?? ''}`}
            aria-label="Your profile"
            className="flex h-10 w-10 items-center justify-center rounded-xl overflow-hidden border-2 transition-all duration-200 hover:scale-110 pulse-glow-yellow cursor-pointer"
            style={{ borderColor: '#FFD93D', minHeight: '44px', minWidth: '44px' }}
          >
            {user?.avatar_url ? (
              <img src={user.avatar_url} alt={user.display_name ?? 'Profile'} className="h-full w-full object-cover" />
            ) : (
              <User size={18} aria-hidden="true" style={{ color: '#6B7280' }} />
            )}
          </Link>
        </div>
      </motion.header>
 
      {/* ── Mobile bottom tab bar ── */}
      <motion.nav
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around pb-safe border-t glass-panel"
        style={{
          background: 'rgba(255,251,240,0.8)',
          borderTop: '1px solid rgba(252, 211, 77, 0.4)',
          paddingTop: '8px',
          paddingBottom: 'max(8px, env(safe-area-inset-bottom))'
        }}
        aria-label="Mobile navigation"
      >
        {[...NAV, { href: `/profile/${user?.username ?? ''}`, icon: User, label: 'Profile' }].map(({ href, icon: Icon, label }) => {
          const active = pathname === href || (label === 'Profile' && pathname.startsWith('/profile'));
          return (
            <Link
              key={href}
              href={href}
              aria-label={label}
              aria-current={active ? 'page' : undefined}
              className="relative flex flex-col items-center gap-1 px-3 py-1 rounded-xl transition-all duration-200 cursor-pointer"
              style={{ color: active ? '#FF6B35' : '#9CA3AF', minHeight: '44px', minWidth: '44px' }}
            >
              <motion.div
                whileTap={{ scale: 0.8 }}
                className="flex flex-col items-center"
              >
                <Icon size={22} aria-hidden="true" style={{ transform: active ? 'scale(1.1)' : 'none', transition: 'transform 0.2s' }} />
                <span className="text-[10px] font-black mt-0.5">{label}</span>
              </motion.div>
              {active && (
                <span
                  className="absolute bottom-1 w-1 h-1 rounded-full"
                  style={{ background: '#FF6B35' }}
                />
              )}
            </Link>
          );
        })}
      </motion.nav>
    </>
  );
}
