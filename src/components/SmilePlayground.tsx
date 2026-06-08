'use client';

import { useState, useRef, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Camera, ZapOff, Play, Square, Sparkles, Loader2, RefreshCcw } from 'lucide-react';
import { loadModels, detectSmile } from '@/lib/face-api';
import { TIER_CONFIG } from '@/lib/smile-points';
import type { SmileTier } from '@/types';

/* ─── Neo-brutalism inline style helpers ─── */
const NB_BORDER  = '2.5px solid #1A1040';
const NB_SHADOW  = '5px 5px 0 #1A1040';
const NB_RADIUS  = '10px';

export default function SmilePlayground() {
  const [isActive, setIsActive]                 = useState(false);
  const [isLoading, setIsLoading]               = useState(false);
  const [cameraError, setCameraError]           = useState('');
  const [score, setScore]                       = useState(0);
  const [tier, setTier]                         = useState<SmileTier>('none');
  const [history, setHistory]                   = useState<number[]>(Array(20).fill(0));
  const [captured, setCaptured]                 = useState<string | null>(null);
  const [simulatedCaption, setSimulatedCaption] = useState('');
  const [isCaptioning, setIsCaptioning]         = useState(false);

  const videoRef        = useRef<HTMLVideoElement>(null);
  const streamRef       = useRef<MediaStream | null>(null);
  const loopRef         = useRef<number | null>(null);
  const lastConfettiRef = useRef<number>(0);

  const tierInfo = TIER_CONFIG[tier];

  /* Wire stream → video after React renders the (always-mounted) video element */
  useEffect(() => {
    if (!isActive || !streamRef.current) return;
    const video = videoRef.current;
    if (!video) return;
    video.srcObject = streamRef.current;
    video.play().catch((e) => {
      console.error('Video play failed:', e);
      setCameraError('Could not start video. Try refreshing the page.');
    });
    startDetectionLoop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive]);

  useEffect(() => () => { stopTest(); }, []);

  async function startTest() {
    setIsLoading(true);
    setCameraError('');
    setCaptured(null);
    setSimulatedCaption('');
    try {
      await loadModels();
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: 640, height: 480 },
        audio: false,
      });
      streamRef.current = stream;
      setIsActive(true);
      setIsLoading(false);
    } catch (err) {
      const name = (err as DOMException).name;
      setCameraError(
        name === 'NotAllowedError'
          ? 'Camera permission denied. Allow camera access in your browser settings.'
          : 'Camera unavailable. Make sure no other app is using it.'
      );
      setIsLoading(false);
    }
  }

  function stopTest() {
    if (loopRef.current) { cancelAnimationFrame(loopRef.current); loopRef.current = null; }
    if (streamRef.current) { streamRef.current.getTracks().forEach(t => t.stop()); streamRef.current = null; }
    if (videoRef.current)  { videoRef.current.srcObject = null; }
    setIsActive(false);
    setScore(0);
    setTier('none');
    setHistory(Array(20).fill(0));
  }

  function startDetectionLoop() {
    const checkFrame = async () => {
      const video = videoRef.current;
      if (!video || video.paused || video.ended || video.readyState < 2) {
        if (streamRef.current) loopRef.current = requestAnimationFrame(checkFrame);
        return;
      }
      try {
        const result = await detectSmile(video);
        setScore(result.score);
        setTier(result.tier);
        setHistory(prev => [...prev.slice(1), result.score]);
        if (result.tier === 'beam' && Date.now() - lastConfettiRef.current > 4000) {
          lastConfettiRef.current = Date.now();
          const confetti = (await import('canvas-confetti')).default;
          confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 }, colors: ['#FFD93D', '#FF6B35', '#FF3D00'] });
        }
      } catch { /* skip bad frames */ }
      if (streamRef.current) loopRef.current = requestAnimationFrame(checkFrame);
    };
    loopRef.current = requestAnimationFrame(checkFrame);
  }

  function captureSnapshot() {
    const video = videoRef.current;
    if (!video) return;
    const canvas = document.createElement('canvas');
    canvas.width  = video.videoWidth  || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(video, 0, 0);
      setCaptured(canvas.toDataURL('image/jpeg'));
      stopTest();
      setIsCaptioning(true);
      setTimeout(() => {
        const captions = [
          'Beaming with 100% pure sunshine! ☀️',
          'That smile could power a small country! ⚡',
          'Positivity looks absolutely brilliant on you! 😊',
          'Radiating high-tier joy today! 🌟',
          'A smile so bright it matches the gold standard. ✨',
        ];
        setSimulatedCaption(captions[Math.floor(Math.random() * captions.length)]);
        setIsCaptioning(false);
      }, 1500);
    }
  }

  /* Sparkline */
  const W = 200, H = 48;
  const svgPath = history
    .map((v, i) => `${i === 0 ? 'M' : 'L'} ${(i / (history.length - 1)) * W} ${H - v * H}`)
    .join(' ');

  /* Circular gauge */
  const R   = 38;
  const SW  = 8;
  const C   = 2 * Math.PI * R;
  const off = C - score * C;

  return (
    <div className="w-full max-w-4xl mx-auto">

      {/* Section header */}
      <div className="text-center mb-10">
        <span
          className="inline-flex items-center gap-2 px-4 py-1.5 font-black text-xs uppercase tracking-widest mb-5"
          style={{ background: '#FFD93D', color: '#1A1040', border: NB_BORDER, boxShadow: '3px 3px 0 #1A1040', borderRadius: '6px' }}
        >
          <Camera size={11} /> Interactive Demo
        </span>
        <h2
          className="font-black mt-4 mb-3"
          style={{ fontFamily: 'var(--font-nunito)', fontSize: 'clamp(28px, 4vw, 44px)', color: '#1A1040' }}
        >
          Test the Smile AI Live
        </h2>
        <p className="text-sm font-semibold max-w-md mx-auto" style={{ color: '#6B7280' }}>
          No signups. No downloads. Grant camera access — your browser measures your smile in real-time.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">

        {/* ── Left: Camera ── */}
        <div
          className="flex flex-col justify-between p-5 bg-white"
          style={{ border: NB_BORDER, boxShadow: NB_SHADOW, borderRadius: NB_RADIUS, minHeight: '400px' }}
        >
          {/* Video container */}
          <div
            className="relative w-full overflow-hidden bg-gray-950 flex items-center justify-center"
            style={{
              aspectRatio: '4/3',
              border: NB_BORDER,
              borderRadius: '8px',
            }}
          >
            {/* Always-mounted video — videoRef stays valid */}
            <video
              ref={videoRef}
              className="absolute inset-0 w-full h-full object-cover scale-x-[-1]"
              style={{ display: isActive && !captured ? 'block' : 'none' }}
              playsInline
              muted
            />

            {/* Captured photo */}
            {captured && (
              <img src={captured} alt="Captured smile" className="absolute inset-0 w-full h-full object-cover" />
            )}

            {/* Idle / loading */}
            {!isActive && !captured && (
              <div className="flex flex-col items-center gap-3 p-6 text-center">
                <Camera size={48} className="animate-float" style={{ color: '#FFD93D', opacity: 0.8 }} />
                {isLoading ? (
                  <>
                    <Loader2 className="animate-spin" size={22} style={{ color: '#FF6B35' }} />
                    <p className="text-xs font-bold" style={{ color: '#6B7280' }}>Loading Smile AI Models (~4 MB)…</p>
                  </>
                ) : (
                  <p className="text-xs font-bold" style={{ color: '#9CA3AF' }}>
                    Camera feed appears here.<br />Click below to start.
                  </p>
                )}
              </div>
            )}

            {/* Scanning bar when live */}
            {isActive && !captured && (
              <div
                className="absolute left-0 right-0 h-[3px] z-20 pointer-events-none"
                style={{
                  top: '40%',
                  background: 'linear-gradient(90deg, transparent, #FFD93D, #FF6B35, transparent)',
                  opacity: 0.9,
                  animation: 'nb-pulse 1.5s ease-in-out infinite',
                }}
              />
            )}

            {/* Error overlay */}
            <AnimatePresence>
              {cameraError && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6 text-center z-30"
                  style={{ background: 'rgba(255,251,240,0.97)', border: '2px solid #FF3D00' }}
                >
                  <ZapOff size={36} style={{ color: '#FF3D00' }} />
                  <p className="text-sm font-black" style={{ color: '#FF3D00' }}>{cameraError}</p>
                  <button
                    onClick={startTest}
                    className="nb-btn nb-btn-orange"
                    style={{ fontSize: '13px', padding: '8px 20px' }}
                  >
                    Try Again
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Controls */}
          <div className="flex gap-3 mt-5">
            {!isActive && !captured && (
              <button
                onClick={startTest}
                disabled={isLoading}
                className="nb-btn flex-1 disabled:opacity-50"
                style={{ fontSize: '14px' }}
              >
                <Play size={15} /> Start Live Test
              </button>
            )}

            {isActive && (
              <>
                <button
                  onClick={captureSnapshot}
                  className="nb-btn nb-btn-orange flex-1"
                  style={{ fontSize: '14px' }}
                >
                  <Sparkles size={15} /> Capture Smile
                </button>
                <button
                  onClick={stopTest}
                  className="nb-btn nb-btn-ghost"
                  style={{ padding: '13px 16px' }}
                  aria-label="Stop camera"
                >
                  <Square size={15} />
                </button>
              </>
            )}

            {captured && (
              <button
                onClick={startTest}
                className="nb-btn flex-1"
                style={{ fontSize: '14px' }}
              >
                <RefreshCcw size={15} /> Retake
              </button>
            )}
          </div>
        </div>

        {/* ── Right: Telemetry ── */}
        <div
          className="flex flex-col justify-between p-5 bg-white"
          style={{ border: NB_BORDER, boxShadow: NB_SHADOW, borderRadius: NB_RADIUS, minHeight: '400px' }}
        >
          {/* Header */}
          <div
            className="flex items-center gap-2 px-4 py-2.5 mb-5 font-black text-sm"
            style={{ background: '#1A1040', color: '#FFD93D', border: NB_BORDER, borderRadius: '8px' }}
          >
            <Sparkles size={15} /> Live Telemetry
          </div>

          {captured ? (
            /* ─ Capture results ─ */
            <div className="flex flex-col gap-4 flex-1">
              {/* Caption box */}
              <div
                className="p-4 flex-1"
                style={{ background: '#FFD93D', border: NB_BORDER, boxShadow: '3px 3px 0 #1A1040', borderRadius: '8px' }}
              >
                <div className="text-xs font-black uppercase tracking-widest mb-2" style={{ color: '#1A1040', opacity: 0.6 }}>
                  AI Caption
                </div>
                {isCaptioning ? (
                  <div className="flex items-center gap-2 text-sm font-bold" style={{ color: '#1A1040' }}>
                    <Loader2 className="animate-spin" size={15} /> Writing caption…
                  </div>
                ) : (
                  <p className="text-sm font-black italic leading-relaxed" style={{ color: '#1A1040' }}>
                    &ldquo;{simulatedCaption}&rdquo;
                  </p>
                )}
              </div>

              {/* Stats */}
              <div
                className="p-4"
                style={{ border: NB_BORDER, boxShadow: '3px 3px 0 #1A1040', borderRadius: '8px' }}
              >
                <div className="text-xs font-black uppercase tracking-widest mb-3" style={{ color: '#9CA3AF' }}>Your Results</div>
                {[
                  ['Smile Score',   `${Math.round(score * 100)}%`, '#FF6B35'],
                  ['Smile Tier',    tierInfo.label,                 tierInfo.color ?? '#1A1040'],
                  ['Points Earned', `+${tierInfo.points} pts`,      '#00C48C'],
                ].map(([label, value, color]) => (
                  <div key={String(label)} className="flex justify-between items-center mb-2">
                    <span className="text-sm font-semibold" style={{ color: '#6B7280' }}>{label}</span>
                    <span className="text-sm font-black" style={{ color: String(color) }}>{value}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* ─ Live stats ─ */
            <div className="flex items-center gap-5 mb-5">
              {/* Circular gauge */}
              <div className="relative flex-shrink-0 w-28 h-28">
                <svg className="w-full h-full -rotate-90">
                  <circle cx="56" cy="56" r={R} fill="transparent" stroke="#E5E7EB" strokeWidth={SW} />
                  <motion.circle
                    cx="56" cy="56" r={R}
                    fill="transparent"
                    stroke={score > 0.6 ? '#FF6B35' : score > 0.3 ? '#FFD93D' : '#E5E7EB'}
                    strokeWidth={SW}
                    strokeDasharray={C}
                    animate={{ strokeDashoffset: off }}
                    transition={{ duration: 0.12 }}
                    strokeLinecap="round"
                    style={{ filter: score > 0.5 ? 'drop-shadow(0 0 6px #FF6B3588)' : 'none' }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-black" style={{ color: '#1A1040' }}>{Math.round(score * 100)}%</span>
                  <span className="text-[9px] font-black uppercase tracking-wide" style={{ color: '#9CA3AF' }}>Smile</span>
                </div>
              </div>

              {/* Tier + pts */}
              <div className="flex flex-col gap-2.5 flex-1">
                {[
                  { label: 'Tier',   value: `${tierInfo.emoji} ${tierInfo.label}`, bg: '#FFD93D', fg: '#1A1040' },
                  { label: 'Points', value: `+${tierInfo.points} pts`,              bg: '#1A1040', fg: '#FFD93D' },
                ].map(({ label, value, bg, fg }) => (
                  <div
                    key={label}
                    className="px-3 py-2.5"
                    style={{ background: bg, border: NB_BORDER, boxShadow: '2px 2px 0 #1A1040', borderRadius: '8px' }}
                  >
                    <div className="text-[9px] font-black uppercase tracking-wide opacity-60" style={{ color: fg }}>{label}</div>
                    <div className="text-base font-black mt-0.5" style={{ color: fg }}>{value}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sparkline */}
          {!captured && (
            <div
              className="mt-3 p-4"
              style={{ border: NB_BORDER, boxShadow: '3px 3px 0 #1A1040', borderRadius: '8px', background: '#1A1040' }}
            >
              <div className="flex justify-between items-center mb-2">
                <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: '#FFD93D' }}>Positivity Wave</span>
                <span className="text-[10px] font-black" style={{ color: '#FF6B35' }}>● LIVE</span>
              </div>
              <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-10">
                <defs>
                  <linearGradient id="sg2" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%"   stopColor="#FFD93D" />
                    <stop offset="100%" stopColor="#FF6B35" />
                  </linearGradient>
                </defs>
                <path d={svgPath} fill="none" stroke="url(#sg2)" strokeWidth="2.5" strokeLinecap="round" />
              </svg>
            </div>
          )}

          {/* Sign-in nudge */}
          <div
            className="mt-4 pt-4 flex items-center justify-between text-xs"
            style={{ borderTop: '2px solid #E5E7EB' }}
          >
            <span className="font-semibold" style={{ color: '#9CA3AF' }}>Love your results?</span>
            <a
              href="/login"
              className="font-black hover:underline"
              style={{ color: '#FF6B35' }}
            >
              Save to a post →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
