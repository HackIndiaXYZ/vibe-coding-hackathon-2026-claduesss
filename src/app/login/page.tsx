'use client';

import { motion } from 'framer-motion';
import { LogIn, Smile } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

const INK = '#1A1040';

export default function LoginPage() {
  async function handleGoogleSignIn() {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/api/auth/callback` },
    });
  }

  return (
    <main
      className="relative flex min-h-screen items-center justify-center px-6"
      style={{ background: '#FFFBF0' }}
    >
      {/* Decorative corner blocks */}
      <div
        className="absolute top-0 left-0 w-48 h-48 pointer-events-none"
        style={{ background: '#FFD93D', borderRight: `2.5px solid ${INK}`, borderBottom: `2.5px solid ${INK}`, borderBottomRightRadius: '24px', opacity: 0.5 }}
        aria-hidden="true"
      />
      <div
        className="absolute bottom-0 right-0 w-48 h-48 pointer-events-none"
        style={{ background: '#FF6B35', borderLeft: `2.5px solid ${INK}`, borderTop: `2.5px solid ${INK}`, borderTopLeftRadius: '24px', opacity: 0.4 }}
        aria-hidden="true"
      />

      <motion.div
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="relative z-10 w-full max-w-sm bg-white p-8 text-center"
        style={{ border: `2.5px solid ${INK}`, boxShadow: `8px 8px 0 ${INK}`, borderRadius: '16px' }}
      >
        {/* Logo block */}
        <div
          className="mx-auto mb-6 flex h-20 w-20 items-center justify-center"
          style={{ background: '#FFD93D', border: `2.5px solid ${INK}`, boxShadow: `4px 4px 0 ${INK}`, borderRadius: '16px' }}
          aria-hidden="true"
        >
          <Smile size={40} style={{ color: INK }} aria-hidden="true" />
        </div>

        <h1
          className="text-3xl font-black mb-1"
          style={{ fontFamily: 'var(--font-nunito)', color: INK }}
        >
          SmileChain
        </h1>
        <p className="text-sm font-semibold mb-8" style={{ color: '#6B7280' }}>
          Where your smile is the currency
        </p>

        <button
          onClick={handleGoogleSignIn}
          className="nb-btn nb-btn-black w-full text-base"
          style={{ justifyContent: 'center' }}
        >
          <LogIn size={18} aria-hidden="true" />
          Continue with Google
        </button>

        <p className="mt-6 text-xs font-medium" style={{ color: '#9CA3AF' }}>
          No credit card. No spam. Just smiles.
        </p>
      </motion.div>
    </main>
  );
}
