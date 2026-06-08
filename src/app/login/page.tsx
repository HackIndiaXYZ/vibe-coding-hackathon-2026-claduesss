'use client';

import { motion } from 'framer-motion';
import { LogIn } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function LoginPage() {
  async function handleGoogleSignIn() {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/api/auth/callback`,
      },
    });
  }

  return (
    <main
      className="relative flex min-h-screen items-center justify-center px-6 overflow-hidden"
      style={{ background: 'var(--background)' }}
    >
      {/* Animated Background Blobs */}
      <div className="hero-blob-1" aria-hidden="true"></div>
      <div className="hero-blob-2" aria-hidden="true"></div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 24 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.175, 0.885, 0.32, 1.275] }}
        className="relative z-10 w-full max-w-sm p-8 rounded-3xl text-center glass-panel hover-glow-orange"
      >
        <div
          className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl shadow-md"
          style={{ background: 'linear-gradient(135deg, #FFD93D, #FF6B35)' }}
          aria-hidden="true"
        >
          <span className="text-4xl">😊</span>
        </div>

        <h1
          className="text-3xl font-black mb-2"
          style={{ fontFamily: 'var(--font-nunito)', color: '#1F2937' }}
        >
          SmileChain
        </h1>
        <p className="text-sm mb-8" style={{ color: '#6B7280' }}>
          Where your smile is the currency
        </p>

        <button
          onClick={handleGoogleSignIn}
          className="flex w-full items-center justify-center gap-3 px-6 py-3.5 rounded-2xl font-semibold text-base transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer shadow-sm"
          style={{
            background: 'white',
            border: '2px solid #E5E7EB',
            color: '#1F2937',
            minHeight: '44px',
          }}
        >
          <LogIn size={18} aria-hidden="true" />
          Continue with Google
        </button>

        <p className="mt-6 text-xs" style={{ color: '#9CA3AF' }}>
          By signing in you agree to our terms. No credit card required.
        </p>
      </motion.div>
    </main>
  );
}
