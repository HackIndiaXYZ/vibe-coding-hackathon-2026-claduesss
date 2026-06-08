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
        className="hidden md:flex sticky top-0 z-50 items-center justify-between px-8 py-3 border-b"
        style={{ background: 'rgba(255,251,240,0.9)', backdropFilter: 'blur(12px)', borderColor: '#FCD34D' }}
      >
        <Link href="/feed" className="text-xl font-black" style={{ fontFamily: 'var(--font-nunito)', color: '#1F2937' }}>
          Smile<span style={{ color: '#FF6B35' }}>Chain</span>
        </Link>

        <nav className="flex items-center gap-1" aria-label="Main navigation">
          {NAV.map(({ href, icon: Icon, label }) => (
            <Link
              key={href}
              href={href}
              aria-label={label}
              aria-current={pathname === href ? 'page' : undefined}
              className="flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm transition-all duration-200 cursor-pointer"
              style={{
                background: pathname === href ? '#FFD93D' : 'transparent',
                color: pathname === href ? '#1F2937' : '#6B7280',
                minHeight: '44px',
              }}
            >
              <Icon size={18} aria-hidden="true" />
              {label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/notifications"
            aria-label="Notifications"
            className="flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-200 hover:bg-yellow-50 cursor-pointer"
            style={{ color: '#6B7280', minHeight: '44px', minWidth: '44px' }}
          >
            <Bell size={20} aria-hidden="true" />
          </Link>
          <Link
            href={`/profile/${user?.username ?? ''}`}
            aria-label="Your profile"
            className="flex h-10 w-10 items-center justify-center rounded-xl overflow-hidden border-2 transition-all duration-200 hover:scale-105 cursor-pointer"
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
        className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around pb-safe border-t"
        style={{ background: 'rgba(255,251,240,0.95)', backdropFilter: 'blur(12px)', borderColor: '#FCD34D', paddingTop: '8px', paddingBottom: 'max(8px, env(safe-area-inset-bottom))' }}
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
              className="flex flex-col items-center gap-1 px-3 py-1 rounded-xl transition-all duration-200 cursor-pointer"
              style={{ color: active ? '#FF6B35' : '#9CA3AF', minHeight: '44px', minWidth: '44px' }}
            >
              <Icon size={22} aria-hidden="true" />
              <span className="text-xs font-medium">{label}</span>
            </Link>
          );
        })}
      </motion.nav>
    </>
  );
}
