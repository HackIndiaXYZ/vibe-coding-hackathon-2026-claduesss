'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Smile, Zap, Gift, Users, Lock, Star, Camera, ArrowRight, TrendingUp, Shield } from 'lucide-react';
import SmilePlayground from '@/components/SmilePlayground';
import type { Variants } from 'framer-motion';

/* ── Data ── */
const TIERS = [
  { emoji: '😐', label: 'No Smile',   points: 0,  bg: '#F3F4F6', accent: '#6B7280', border: '#1A1040' },
  { emoji: '😊', label: 'Mild Smile', points: 10, bg: '#FFD93D', accent: '#1A1040', border: '#1A1040' },
  { emoji: '😄', label: 'Big Smile',  points: 30, bg: '#FF6B35', accent: '#ffffff', border: '#1A1040' },
  { emoji: '😁', label: 'Beam Smile', points: 50, bg: '#FF3D00', accent: '#ffffff', border: '#1A1040' },
];

const STEPS = [
  { icon: <Smile size={28} />, num: '01', title: 'Post a Photo',      desc: 'Upload any photo — our AI runs right in your browser, zero server.' },
  { icon: <Zap   size={28} />, num: '02', title: 'Earn Points',        desc: 'Bigger smile → more Smile Points. Up to 50 pts per post.' },
  { icon: <Gift  size={28} />, num: '03', title: 'Gift Smiles',         desc: 'Spend 1 point to gift someone. They earn 1. Joy spreads.' },
  { icon: <Users size={28} />, num: '04', title: 'Build Your Circle',  desc: 'Follow friends. Build a community of genuine joyful moments.' },
];

const FEATURES = [
  { icon: <Zap    size={22} />, title: 'Real-time AI',       desc: 'face-api.js runs 100% in-browser. No server, no privacy risk, instant results.',      bg: '#FFD93D', fg: '#1A1040', wide: true },
  { icon: <Star   size={22} />, title: 'Smile Economy',      desc: 'Points earned by smiling, spent by gifting. Every smile has real value.',              bg: '#fff',    fg: '#1A1040', wide: false },
  { icon: <Gift   size={22} />, title: 'Gifting System',     desc: 'Spend 1 pt to gift someone, they earn 1 pt. Positivity is literally contagious.',     bg: '#FF6B35', fg: '#fff',    wide: false },
  { icon: <Lock   size={22} />, title: 'Private Accounts',   desc: 'Lock your profile. Only approved followers see your moments.',                          bg: '#1A1040', fg: '#FFD93D', wide: false },
  { icon: <Users  size={22} />, title: 'Follow Requests',    desc: 'Send and accept follow requests — full control over your audience.',                   bg: '#fff',    fg: '#1A1040', wide: false },
  { icon: <Smile  size={22} />, title: 'AI Captions',        desc: 'GPT-3.5 writes the perfect caption for your smile tier, automatically every time.',    bg: '#FF3D00', fg: '#fff',    wide: true },
];

const PROOF = [
  { icon: <TrendingUp size={14} />, text: 'Real-time smile scoring' },
  { icon: <Shield     size={14} />, text: '100% browser-side AI' },
  { icon: <Gift       size={14} />, text: 'Peer-to-peer gifting' },
  { icon: <Star       size={14} />, text: 'Built for HackIndia 2025' },
  { icon: <Lock       size={14} />, text: 'Zero data sent to server' },
  { icon: <Zap        size={14} />, text: 'Up to 50 points per post' },
];

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};
const stagger: Variants = {
  hidden: {},
  show:   { transition: { staggerChildren: 0.1 } },
};

/* ── Component ── */
export default function Home() {
  return (
    <main className="flex flex-col min-h-screen overflow-x-hidden" style={{ background: '#FFFBF0' }}>

      {/* ════════════════ NAVBAR ════════════════ */}
      <motion.nav
        initial={{ opacity: 0, y: -24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="sticky top-0 z-50 flex items-center justify-between px-6 py-4 bg-white"
        style={{ borderBottom: '2.5px solid #1A1040', boxShadow: '0 3px 0 #1A1040' }}
      >
        <span
          className="text-2xl font-black tracking-tight"
          style={{ fontFamily: 'var(--font-nunito)', color: '#1A1040' }}
        >
          Smile<span style={{ color: '#FF6B35' }}>Chain</span>
        </span>

        <Link href="/login" className="nb-btn" style={{ padding: '9px 22px', fontSize: '14px' }}>
          Sign In <ArrowRight size={14} />
        </Link>
      </motion.nav>

      {/* ════════════════ HERO ════════════════ */}
      <section className="relative px-6 pt-20 pb-24 overflow-hidden">
        {/* Floating emoji decorations */}
        {(['😄', '😁', '😊', '✨', '🌟', '💛'] as const).map((e, i) => (
          <span
            key={i}
            className="absolute select-none pointer-events-none text-3xl md:text-4xl animate-float"
            style={{
              top:   `${14 + (i * 13) % 55}%`,
              left:  i % 2 === 0 ? `${3 + i * 7}%` : undefined,
              right: i % 2 !== 0 ? `${3 + i * 5}%` : undefined,
              animationDelay: `${i * 0.4}s`,
              opacity: 0.5,
            }}
            aria-hidden="true"
          >
            {e}
          </span>
        ))}

        <div className="max-w-4xl mx-auto text-center">
          {/* Label */}
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex justify-center mb-8"
          >
            <span className="nb-label"><Zap size={11} /> AI runs 100% in your browser · Zero privacy risk</span>
          </motion.div>

          {/* H1 */}
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="font-black leading-[1.0] tracking-tighter"
            style={{ fontFamily: 'var(--font-nunito)', fontSize: 'clamp(52px, 8vw, 100px)', color: '#1A1040' }}
          >
            Your Smile<br />
            <span
              style={{
                background: '#FFD93D',
                color: '#1A1040',
                border: '3px solid #1A1040',
                boxShadow: '6px 6px 0 #1A1040',
                display: 'inline-block',
                padding: '0 16px',
                transform: 'rotate(-1.5deg)',
                marginTop: '8px',
              }}
            >
              IS THE CURRENCY
            </span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.38 }}
            className="mt-8 text-lg font-semibold max-w-lg mx-auto leading-relaxed"
            style={{ color: '#4B5563' }}
          >
            Post a photo. AI detects your smile. Earn points. Gift positivity.
            The social platform that rewards <em>genuine</em> joy.
          </motion.p>

          {/* CTA buttons */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.52 }}
            className="mt-10 flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link href="/login" className="nb-btn nb-pulse" style={{ fontSize: '16px', padding: '14px 36px' }}>
              Start Smiling — Free <ArrowRight size={17} />
            </Link>
            <a href="#playground" className="nb-btn nb-btn-ghost" style={{ fontSize: '16px', padding: '14px 32px' }}>
              <Camera size={17} /> Try Smile AI
            </a>
          </motion.div>

          {/* Stats row */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="mt-14 flex gap-4 sm:gap-6 justify-center flex-wrap"
          >
            {[
              { val: '50',   lbl: 'Max pts/post' },
              { val: '4',    lbl: 'Smile tiers' },
              { val: '0ms',  lbl: 'Server delay' },
              { val: '∞',    lbl: 'Good vibes' },
            ].map(({ val, lbl }) => (
              <div
                key={lbl}
                className="flex flex-col items-center px-6 py-4 bg-white"
                style={{ border: '2.5px solid #1A1040', boxShadow: '4px 4px 0 #1A1040', borderRadius: '10px', minWidth: '100px' }}
              >
                <span
                  className="text-3xl font-black"
                  style={{ fontFamily: 'var(--font-nunito)', color: '#FF6B35' }}
                >
                  {val}
                </span>
                <span className="text-xs font-bold mt-1 uppercase tracking-wide" style={{ color: '#9CA3AF' }}>
                  {lbl}
                </span>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ════════════════ MARQUEE STRIP ════════════════ */}
      <div
        className="overflow-hidden py-4 border-y-[2.5px]"
        style={{ borderColor: '#1A1040', background: '#1A1040' }}
        aria-hidden="true"
      >
        <div className="flex">
          <div className="nb-marquee-track">
            {[...PROOF, ...PROOF].map(({ icon, text }, i) => (
              <span key={i} className="flex items-center gap-2 text-sm font-black uppercase tracking-widest whitespace-nowrap" style={{ color: '#FFD93D' }}>
                {icon} {text} <span style={{ color: '#FF6B35', marginLeft: '4px' }}>✦</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ════════════════ SMILE AI PLAYGROUND ════════════════ */}
      <section id="playground" className="px-6 py-20" style={{ background: '#FFFBF0' }}>
        <SmilePlayground />
      </section>

      {/* ════════════════ HOW IT WORKS ════════════════ */}
      <section
        id="how-it-works"
        className="px-6 py-24"
        style={{ background: '#FFD93D', borderTop: '2.5px solid #1A1040', borderBottom: '2.5px solid #1A1040' }}
      >
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-60px' }}
          variants={stagger}
          className="max-w-5xl mx-auto"
        >
          <motion.div variants={fadeUp} className="flex justify-center mb-4">
            <span
              className="inline-flex items-center gap-2 px-4 py-1.5 font-black text-xs uppercase tracking-widest"
              style={{ background: '#1A1040', color: '#FFD93D', border: '2.5px solid #1A1040', borderRadius: '6px', boxShadow: '3px 3px 0 #fff' }}
            >
              <Zap size={11} /> How it works
            </span>
          </motion.div>

          <motion.h2
            variants={fadeUp}
            className="text-center font-black mb-16"
            style={{ fontFamily: 'var(--font-nunito)', fontSize: 'clamp(36px, 5vw, 60px)', color: '#1A1040' }}
          >
            Four Simple Steps
          </motion.h2>

          <motion.div variants={stagger} className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {STEPS.map((step, i) => (
              <motion.div
                key={step.title}
                variants={fadeUp}
                className="nb-card flex flex-col p-6 relative"
                style={{ background: i % 2 === 0 ? '#fff' : '#1A1040' }}
              >
                {/* Big number */}
                <div
                  className="text-6xl font-black leading-none mb-4 select-none"
                  style={{
                    fontFamily: 'var(--font-nunito)',
                    color: i % 2 === 0 ? 'rgba(255,217,61,0.35)' : 'rgba(255,107,53,0.4)',
                  }}
                  aria-hidden="true"
                >
                  {step.num}
                </div>

                {/* Icon */}
                <div
                  className="flex h-12 w-12 items-center justify-center mb-4"
                  style={{
                    background: '#FFD93D',
                    border: '2.5px solid #1A1040',
                    boxShadow: '3px 3px 0 #1A1040',
                    borderRadius: '8px',
                    color: '#1A1040',
                  }}
                  aria-hidden="true"
                >
                  {step.icon}
                </div>

                <h3
                  className="font-black text-lg mb-2"
                  style={{ color: i % 2 === 0 ? '#1A1040' : '#fff' }}
                >
                  {step.title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: i % 2 === 0 ? '#6B7280' : '#9CA3AF' }}>
                  {step.desc}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* ════════════════ SMILE TIERS ════════════════ */}
      <section className="px-6 py-24" style={{ background: '#fff', borderBottom: '2.5px solid #1A1040' }}>
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-60px' }}
          variants={stagger}
          className="max-w-4xl mx-auto"
        >
          <motion.div variants={fadeUp} className="flex justify-center mb-4">
            <span className="nb-label"><Smile size={11} /> Smile Tiers</span>
          </motion.div>
          <motion.h2
            variants={fadeUp}
            className="text-center font-black mb-4"
            style={{ fontFamily: 'var(--font-nunito)', fontSize: 'clamp(32px, 5vw, 56px)', color: '#1A1040' }}
          >
            Four Smile Tiers
          </motion.h2>
          <motion.p variants={fadeUp} className="text-center mb-14 font-semibold" style={{ color: '#6B7280' }}>
            The bigger the smile, the bigger the reward
          </motion.p>

          <motion.div variants={stagger} className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {TIERS.map((tier, i) => (
              <motion.div
                key={tier.label}
                variants={fadeUp}
                className="flex flex-col items-center text-center p-6 nb-card group"
                style={{ background: tier.bg, border: '2.5px solid #1A1040', boxShadow: '5px 5px 0 #1A1040' }}
              >
                <span
                  className="text-6xl mb-4 inline-block transition-transform duration-300 group-hover:scale-125 group-hover:rotate-12"
                  role="img"
                  aria-label={tier.label}
                >
                  {tier.emoji}
                </span>
                <div className="font-black text-base mb-1" style={{ color: tier.accent }}>{tier.label}</div>
                <div
                  className="mt-3 px-4 py-1.5 font-black text-sm"
                  style={{
                    background: tier.accent === '#1A1040' ? '#1A1040' : tier.accent === '#ffffff' ? '#fff' : '#1A1040',
                    color: tier.accent === '#ffffff' ? '#1A1040' : '#fff',
                    border: '2px solid #1A1040',
                    boxShadow: '2px 2px 0 #1A1040',
                    borderRadius: '6px',
                  }}
                >
                  {tier.points > 0 ? `+${tier.points} pts` : '0 pts'}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* ════════════════ FEATURES BENTO ════════════════ */}
      <section className="px-6 py-24" style={{ background: '#FFFBF0', borderBottom: '2.5px solid #1A1040' }}>
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-60px' }}
          variants={stagger}
          className="max-w-5xl mx-auto"
        >
          <motion.div variants={fadeUp} className="flex justify-center mb-4">
            <span className="nb-label"><Star size={11} /> Features</span>
          </motion.div>
          <motion.h2
            variants={fadeUp}
            className="text-center font-black mb-14"
            style={{ fontFamily: 'var(--font-nunito)', fontSize: 'clamp(32px, 5vw, 56px)', color: '#1A1040' }}
          >
            Everything You Need
          </motion.h2>

          {/* Bento grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Wide card — AI Detection */}
            <motion.div
              variants={fadeUp}
              className="md:col-span-2 p-8 nb-card flex flex-col justify-between"
              style={{ background: FEATURES[0].bg, minHeight: '200px' }}
            >
              <div
                className="flex h-12 w-12 items-center justify-center mb-5"
                style={{ background: '#1A1040', color: '#FFD93D', border: '2.5px solid #1A1040', boxShadow: '3px 3px 0 #fff3', borderRadius: '8px' }}
              >
                {FEATURES[0].icon}
              </div>
              <div>
                <h3 className="font-black text-2xl mb-2" style={{ color: FEATURES[0].fg }}>{FEATURES[0].title}</h3>
                <p className="text-sm leading-relaxed max-w-sm font-semibold" style={{ color: '#4B5563' }}>{FEATURES[0].desc}</p>
              </div>
            </motion.div>

            {/* Smile Economy */}
            <motion.div
              variants={fadeUp}
              className="p-6 nb-card flex flex-col justify-between"
              style={{ background: FEATURES[1].bg, minHeight: '200px' }}
            >
              <div
                className="flex h-11 w-11 items-center justify-center mb-4"
                style={{ background: '#FFD93D', color: '#1A1040', border: '2.5px solid #1A1040', boxShadow: '3px 3px 0 #1A1040', borderRadius: '8px' }}
              >
                {FEATURES[1].icon}
              </div>
              <div>
                <h3 className="font-black text-lg mb-1" style={{ color: FEATURES[1].fg }}>{FEATURES[1].title}</h3>
                <p className="text-sm leading-relaxed font-medium" style={{ color: '#6B7280' }}>{FEATURES[1].desc}</p>
              </div>
            </motion.div>

            {/* Middle row: 3 equal cards */}
            {FEATURES.slice(2, 5).map((f) => (
              <motion.div
                key={f.title}
                variants={fadeUp}
                className="p-6 nb-card flex flex-col justify-between"
                style={{ background: f.bg, minHeight: '170px' }}
              >
                <div
                  className="flex h-11 w-11 items-center justify-center mb-4"
                  style={{
                    background: f.bg === '#1A1040' ? '#FFD93D' : f.bg === '#FF6B35' ? '#fff' : '#FF6B35',
                    color: '#1A1040',
                    border: '2.5px solid #1A1040',
                    boxShadow: '3px 3px 0 #1A1040',
                    borderRadius: '8px',
                  }}
                >
                  {f.icon}
                </div>
                <div>
                  <h3 className="font-black text-base mb-1" style={{ color: f.fg }}>{f.title}</h3>
                  <p className="text-sm leading-relaxed font-medium" style={{ color: f.fg === '#fff' ? 'rgba(255,255,255,0.75)' : '#6B7280' }}>
                    {f.desc}
                  </p>
                </div>
              </motion.div>
            ))}

            {/* Full-width bottom — AI Captions */}
            <motion.div
              variants={fadeUp}
              className="md:col-span-3 p-8 nb-card flex flex-col md:flex-row md:items-center gap-6"
              style={{ background: FEATURES[5].bg }}
            >
              <div
                className="flex h-14 w-14 items-center justify-center flex-shrink-0"
                style={{ background: '#FFD93D', color: '#1A1040', border: '2.5px solid #1A1040', boxShadow: '4px 4px 0 #1A1040', borderRadius: '10px' }}
              >
                {FEATURES[5].icon}
              </div>
              <div className="flex-1">
                <h3 className="font-black text-2xl mb-1" style={{ color: '#fff' }}>{FEATURES[5].title}</h3>
                <p className="text-sm leading-relaxed font-semibold" style={{ color: 'rgba(255,255,255,0.75)' }}>{FEATURES[5].desc}</p>
              </div>
              <div
                className="flex-shrink-0 px-5 py-2.5 font-black text-sm inline-flex items-center gap-2"
                style={{ background: '#FFD93D', color: '#1A1040', border: '2.5px solid #1A1040', boxShadow: '3px 3px 0 #1A1040', borderRadius: '8px' }}
              >
                <Star size={13} /> Powered by GPT-3.5
              </div>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* ════════════════ FINAL CTA ════════════════ */}
      <section
        className="px-6 py-28 text-center"
        style={{ background: '#1A1040', borderBottom: '2.5px solid #1A1040' }}
      >
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          variants={stagger}
          className="max-w-xl mx-auto"
        >
          <motion.div variants={fadeUp} className="text-7xl mb-6" aria-hidden="true">😊</motion.div>
          <motion.h2
            variants={fadeUp}
            className="font-black mb-5"
            style={{ fontFamily: 'var(--font-nunito)', fontSize: 'clamp(32px, 5vw, 56px)', color: '#fff' }}
          >
            Ready to Share Your Smile?
          </motion.h2>
          <motion.p variants={fadeUp} className="mb-10 font-semibold text-base leading-relaxed" style={{ color: '#9CA3AF' }}>
            Join SmileChain today. Post, detect, earn, gift.
            Every genuine smile counts.
          </motion.p>
          <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/login" className="nb-btn nb-pulse" style={{ fontSize: '16px', padding: '15px 40px' }}>
              Get Started — Free <ArrowRight size={17} />
            </Link>
            <a href="#playground" className="nb-btn nb-btn-white" style={{ fontSize: '16px', padding: '15px 32px' }}>
              <Camera size={17} /> Try Smile AI
            </a>
          </motion.div>
        </motion.div>
      </section>

      {/* ════════════════ FOOTER ════════════════ */}
      <footer
        className="py-7 text-center bg-white"
        style={{ borderTop: '2.5px solid #1A1040' }}
      >
        <p className="text-sm font-bold" style={{ color: '#1A1040' }}>
          Built with ❤️ for{' '}
          <span style={{ color: '#FF6B35' }}>HackIndia 2025</span>
          {' · '}
          SmileChain © {new Date().getFullYear()}
        </p>
      </footer>
    </main>
  );
}
