'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Smile, Zap, Gift, Users, Lock, Star } from 'lucide-react';

const TIERS = [
  { emoji: '😐', label: 'No Smile',   points: 0,  color: '#9CA3AF', bg: '#F3F4F6', desc: 'Neutral expression detected' },
  { emoji: '😊', label: 'Mild Smile', points: 10, color: '#FFD93D', bg: '#FFFBEB', desc: 'A gentle, warm smile' },
  { emoji: '😄', label: 'Big Smile',  points: 30, color: '#FF6B35', bg: '#FFF7ED', desc: 'A joyful, bright smile' },
  { emoji: '😁', label: 'Beam Smile', points: 50, color: '#FF3D00', bg: '#FFF1F2', desc: 'An ear-to-ear beam!' },
];

const STEPS = [
  { icon: <Smile size={28} />, title: 'Post a Photo', desc: 'Upload any photo and let our AI detect your smile intensity in real time.' },
  { icon: <Zap size={28} />, title: 'Earn Points',  desc: 'The bigger your smile, the more Smile Points you earn — up to 50 per post.' },
  { icon: <Gift size={28} />, title: 'Gift Smiles',  desc: 'Gift a Smile Point to posts you love and spread positivity.' },
  { icon: <Users size={28} />, title: 'Build Your Circle', desc: 'Follow friends and build a community of genuine, joyful moments.' },
];

const FEATURES = [
  { icon: <Zap size={22} />, title: 'Real-time AI Detection', desc: 'face-api.js runs entirely in your browser — no server, no privacy concerns.' },
  { icon: <Star size={22} />, title: 'Smile Economy',         desc: 'Points are earned by smiling, spent by gifting. Every smile has value.' },
  { icon: <Gift size={22} />, title: 'Gifting System',        desc: 'Spend 1 point to gift someone. They earn 1 point. Positivity is contagious.' },
  { icon: <Lock size={22} />, title: 'Private Accounts',      desc: 'Lock your profile so only approved followers can see your moments.' },
  { icon: <Users size={22} />, title: 'Follow Requests',      desc: 'For private accounts, send and accept follow requests — full control.' },
  { icon: <Smile size={22} />, title: 'AI Captions',          desc: 'GPT-3.5 writes the perfect caption based on your smile tier — automatically.' },
];

import type { Variants } from 'framer-motion';

const fadeUp: Variants = { hidden: { opacity: 0, y: 32 }, show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } } };
const stagger: Variants = { hidden: {}, show: { transition: { staggerChildren: 0.12 } } };

export default function Home() {
  return (
    <main className="flex flex-col min-h-screen overflow-x-hidden" style={{ background: 'var(--background)', fontFamily: 'var(--font-dm-sans)' }}>

      {/* ── Navbar ── */}
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="sticky top-0 z-50 flex items-center justify-between px-6 py-4"
        style={{ background: 'rgba(255,251,240,0.85)', backdropFilter: 'blur(12px)', borderBottom: '1px solid #FCD34D' }}
      >
        <span className="text-xl font-black" style={{ fontFamily: 'var(--font-nunito)', color: '#1F2937' }}>
          Smile<span style={{ color: '#FF6B35' }}>Chain</span>
        </span>
        <Link
          href="/login"
          className="px-5 py-2.5 rounded-full font-semibold text-sm transition-all duration-200 hover:scale-105 active:scale-95"
          style={{ background: '#FFD93D', color: '#1F2937' }}
        >
          Sign In
        </Link>
      </motion.nav>

      {/* ── Hero ── */}
      <section className="relative flex flex-col items-center justify-center text-center px-6 pt-20 pb-32 overflow-hidden">
        {/* Animated Background Blobs */}
        <div className="hero-blob-1" aria-hidden="true"></div>
        <div className="hero-blob-2" aria-hidden="true"></div>
        {/* floating decorations */}
        {['😄', '😁', '😊', '✨', '🌟', '💛'].map((e, i) => (
          <span
            key={i}
            className="absolute select-none pointer-events-none text-4xl"
            style={{
              top:  `${10 + (i * 15) % 60}%`,
              left: i % 2 === 0 ? `${5 + i * 8}%` : undefined,
              right: i % 2 !== 0 ? `${5 + i * 6}%` : undefined,
              animation: `float ${3 + i * 0.7}s ease-in-out infinite`,
              animationDelay: `${i * 0.5}s`,
              opacity: 0.7,
            }}
            aria-hidden="true"
          >
            {e}
          </span>
        ))}

        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.7, ease: [0.175, 0.885, 0.32, 1.275] }}
          className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl shadow-lg"
          style={{ background: 'linear-gradient(135deg, #FFD93D, #FF6B35)' }}
          aria-hidden="true"
        >
          <span className="text-4xl">😊</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.7 }}
          className="max-w-2xl text-5xl md:text-6xl font-black leading-tight"
          style={{ fontFamily: 'var(--font-nunito)', color: '#1F2937' }}
        >
          Where Your <span className="gradient-text">Smile</span> is the Currency
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="mt-6 max-w-lg text-lg leading-relaxed"
          style={{ color: '#6B7280' }}
        >
          Post a photo. Our AI detects your smile intensity. Earn points. Gift positivity.
          A social platform that rewards genuine joy.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="mt-10 flex flex-col sm:flex-row gap-4"
        >
          <Link
            href="/login"
            className="px-8 py-4 rounded-2xl text-lg font-bold transition-all duration-300 hover:scale-105 active:scale-95 shadow-lg cursor-pointer hover-glow-smile"
            style={{ background: 'linear-gradient(135deg, #FFD93D, #FF6B35)', color: '#1F2937', minHeight: '44px' }}
          >
            Start Smiling — It&apos;s Free
          </Link>
          <a
            href="#how-it-works"
            className="px-8 py-4 rounded-2xl text-lg font-semibold border-2 transition-all duration-200 hover:scale-105 cursor-pointer"
            style={{ borderColor: '#FFD93D', color: '#1F2937', minHeight: '44px' }}
          >
            How It Works
          </a>
        </motion.div>

        {/* Stats row */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9, duration: 0.6 }}
          className="mt-14 flex gap-10 text-center"
        >
          {[['50', 'Max Points/Post'], ['4', 'Smile Tiers'], ['∞', 'Positivity']].map(([val, lbl]) => (
            <div key={lbl}>
              <div className="text-3xl font-black" style={{ fontFamily: 'var(--font-nunito)', color: '#FF6B35' }}>{val}</div>
              <div className="text-sm mt-1" style={{ color: '#6B7280' }}>{lbl}</div>
            </div>
          ))}
        </motion.div>
      </section>

      {/* ── How It Works ── */}
      <section id="how-it-works" className="px-6 py-24" style={{ background: '#FFF7ED' }}>
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-80px' }}
          variants={stagger}
          className="max-w-5xl mx-auto"
        >
          <motion.h2
            variants={fadeUp}
            className="text-center text-4xl font-black mb-4"
            style={{ fontFamily: 'var(--font-nunito)', color: '#1F2937' }}
          >
            How SmileChain Works
          </motion.h2>
          <motion.p variants={fadeUp} className="text-center mb-16" style={{ color: '#6B7280' }}>
            Four simple steps to start earning smile rewards
          </motion.p>

          <motion.div variants={stagger} className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {STEPS.map((step, i) => (
              <motion.div
                key={step.title}
                variants={fadeUp}
                className="relative flex flex-col items-center text-center p-6 rounded-2xl card-hover step-line glass-panel hover-glow-orange"
              >
                <div
                  className="flex h-14 w-14 items-center justify-center rounded-2xl mb-4 font-black text-xl"
                  style={{ background: 'linear-gradient(135deg, #FFD93D, #FF6B35)', color: '#1F2937' }}
                  aria-hidden="true"
                >
                  {step.icon}
                </div>
                <div
                  className="absolute -top-3 -right-3 flex h-7 w-7 items-center justify-center rounded-full text-xs font-black"
                  style={{ background: '#FF6B35', color: 'white' }}
                  aria-hidden="true"
                >
                  {i + 1}
                </div>
                <h3 className="font-bold text-lg mb-2" style={{ color: '#1F2937' }}>{step.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: '#6B7280' }}>{step.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* ── Smile Tiers ── */}
      <section className="px-6 py-24">
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-80px' }}
          variants={stagger}
          className="max-w-4xl mx-auto"
        >
          <motion.h2
            variants={fadeUp}
            className="text-center text-4xl font-black mb-4"
            style={{ fontFamily: 'var(--font-nunito)', color: '#1F2937' }}
          >
            Four Smile Tiers
          </motion.h2>
          <motion.p variants={fadeUp} className="text-center mb-16" style={{ color: '#6B7280' }}>
            Our AI detects your smile intensity and rewards accordingly
          </motion.p>

          <motion.div variants={stagger} className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {TIERS.map(tier => (
              <motion.div
                key={tier.label}
                variants={fadeUp}
                className="flex flex-col items-center text-center p-6 rounded-2xl card-hover hover-glow-smile"
                style={{ background: `linear-gradient(145deg, ${tier.bg}, #ffffff)`, border: `2px solid ${tier.color}44`, boxShadow: `0 8px 24px ${tier.color}15` }}
              >
                <span className="text-5xl mb-3" role="img" aria-label={tier.label}>{tier.emoji}</span>
                <div className="font-bold text-base mb-1" style={{ color: '#1F2937' }}>{tier.label}</div>
                <div className="text-sm mb-3" style={{ color: '#6B7280' }}>{tier.desc}</div>
                <div
                  className="px-3 py-1 rounded-full text-sm font-black"
                  style={{ background: tier.color, color: tier.color === '#9CA3AF' ? '#fff' : '#1F2937' }}
                >
                  {tier.points > 0 ? `+${tier.points} pts` : '0 pts'}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* ── Features ── */}
      <section className="px-6 py-24 wave-divider" style={{ background: '#FFF7ED' }}>
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-80px' }}
          variants={stagger}
          className="max-w-5xl mx-auto"
        >
          <motion.h2
            variants={fadeUp}
            className="text-center text-4xl font-black mb-16"
            style={{ fontFamily: 'var(--font-nunito)', color: '#1F2937' }}
          >
            Everything You Need
          </motion.h2>

          <motion.div variants={stagger} className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {FEATURES.map(f => (
              <motion.div
                key={f.title}
                variants={fadeUp}
                className="p-6 rounded-2xl card-hover glass-panel hover-glow-orange"
              >
                <div
                  className="flex h-11 w-11 items-center justify-center rounded-xl mb-4"
                  style={{ background: 'linear-gradient(135deg, #FFD93D22, #FF6B3522)', color: '#FF6B35' }}
                  aria-hidden="true"
                >
                  {f.icon}
                </div>
                <h3 className="font-bold text-lg mb-2" style={{ color: '#1F2937' }}>{f.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: '#6B7280' }}>{f.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* ── Final CTA ── */}
      <section className="px-6 py-24 text-center">
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          variants={stagger}
          className="max-w-lg mx-auto"
        >
          <motion.div variants={fadeUp} className="text-6xl mb-6" aria-hidden="true">😊</motion.div>
          <motion.h2
            variants={fadeUp}
            className="text-4xl font-black mb-4"
            style={{ fontFamily: 'var(--font-nunito)', color: '#1F2937' }}
          >
            Ready to Share Your Smile?
          </motion.h2>
          <motion.p variants={fadeUp} className="mb-10" style={{ color: '#6B7280' }}>
            Join SmileChain today. Every smile counts.
          </motion.p>
          <motion.div variants={fadeUp}>
            <Link
              href="/login"
              className="inline-block px-10 py-4 rounded-2xl text-lg font-bold animate-pulse-ring transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer"
              style={{ background: 'linear-gradient(135deg, #FFD93D, #FF6B35)', color: '#1F2937', minHeight: '44px' }}
            >
              Get Started — Free
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* ── Footer ── */}
      <footer className="py-8 text-center border-t" style={{ borderColor: '#FCD34D', color: '#6B7280' }}>
        <p className="text-sm">
          Built for <span className="font-semibold" style={{ color: '#FF6B35' }}>HackIndia</span> ·{' '}
          SmileChain &copy; {new Date().getFullYear()}
        </p>
      </footer>
    </main>
  );
}
