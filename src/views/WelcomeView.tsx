import { useState, useRef, useEffect } from 'react';
import {
  ScanLine,
  Satellite,
  Cpu,
  ShoppingBag,
  ArrowRight,
  Microscope,
  RadioTower,
  Globe2,
  Menu,
  X,
  ChevronRight,
} from 'lucide-react';
import { useLang } from '../lib/i18n';
import type { ViewId } from '../lib/nav';

const STATS = [
  { value: '38+', label: 'Diseases diagnosed' },
  { value: '4', label: 'Intelligence modules' },
  { value: '6', label: 'Rwandan market hubs' },
  { value: '24/7', label: 'Satellite + IoT uptime' },
];

const HERO_FEATURES = [
  {
    icon: Microscope,
    title: 'Multispectral Leaf Analysis',
    desc: 'Instant plant pathogen & nutrient deficiency diagnostic with AI confidence scoring.',
    glow: 'rgba(52,211,153,0.18)',
    border: 'rgba(52,211,153,0.25)',
    iconBg: 'from-emerald-500 to-teal-600',
    badge: '🔬',
  },
  {
    icon: RadioTower,
    title: 'IoT Soil Telemetry',
    desc: 'Live NPK, pH, moisture, and temperature sensor monitoring across all your fields.',
    glow: 'rgba(99,102,241,0.18)',
    border: 'rgba(99,102,241,0.25)',
    iconBg: 'from-indigo-500 to-violet-600',
    badge: '📡',
  },
  {
    icon: Globe2,
    title: 'Direct Buyer Marketplace',
    desc: 'Verified supply chain network connecting growers directly with premium buyers.',
    glow: 'rgba(251,146,60,0.18)',
    border: 'rgba(251,146,60,0.25)',
    iconBg: 'from-orange-500 to-amber-600',
    badge: '🌐',
  },
];

const NAV_MODULES = [
  { icon: ScanLine, label: 'AI Center', id: 'aicenter' as ViewId },
  { icon: Satellite, label: 'Satellite', id: 'satellite' as ViewId },
  { icon: Cpu, label: 'Telemetry', id: 'telemetry' as ViewId },
  { icon: ShoppingBag, label: 'Market', id: 'agrimarket' as ViewId },
];

/** Lightweight canvas particle-mesh — no external deps */
function ParticleMesh() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let W = 0, H = 0;

    const COUNT = 80;
    type Pt = { x: number; y: number; vx: number; vy: number };
    let pts: Pt[] = [];

    function resize() {
      W = canvas!.width = canvas!.offsetWidth;
      H = canvas!.height = canvas!.offsetHeight;
    }

    function init() {
      pts = Array.from({ length: COUNT }, () => ({
        x: Math.random() * W,
        y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
      }));
    }

    function draw() {
      ctx!.clearRect(0, 0, W, H);
      // Draw edges
      for (let i = 0; i < pts.length; i++) {
        for (let j = i + 1; j < pts.length; j++) {
          const dx = pts[i].x - pts[j].x;
          const dy = pts[i].y - pts[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 140) {
            ctx!.beginPath();
            ctx!.moveTo(pts[i].x, pts[i].y);
            ctx!.lineTo(pts[j].x, pts[j].y);
            ctx!.strokeStyle = `rgba(52,211,153,${0.18 * (1 - dist / 140)})`;
            ctx!.lineWidth = 0.7;
            ctx!.stroke();
          }
        }
      }
      // Draw dots
      for (const p of pts) {
        ctx!.beginPath();
        ctx!.arc(p.x, p.y, 1.8, 0, Math.PI * 2);
        ctx!.fillStyle = 'rgba(52,211,153,0.45)';
        ctx!.fill();
      }
    }

    function tick() {
      for (const p of pts) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > W) p.vx *= -1;
        if (p.y < 0 || p.y > H) p.vy *= -1;
      }
      draw();
      animId = requestAnimationFrame(tick);
    }

    const ro = new ResizeObserver(() => { resize(); init(); });
    ro.observe(canvas);
    resize();
    init();
    tick();

    return () => {
      cancelAnimationFrame(animId);
      ro.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        opacity: 0.35,
        zIndex: 0,
      }}
    />
  );
}

export function WelcomeView({ onEnter }: { onEnter: (v: ViewId) => void }) {
  const { t, lang, toggle } = useLang();
  const [menuOpen, setMenuOpen] = useState(false);
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);

  return (
    <div
      className="min-h-screen text-white overflow-x-hidden"
      style={{
        background: 'linear-gradient(135deg, #020817 0%, #061a0f 35%, #0a1628 65%, #0c0f14 100%)',
      }}
    >
      {/* 3D particle mesh canvas */}
      <ParticleMesh />

      {/* Ambient background orbs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden="true">
        <div
          className="absolute -top-40 -left-40 h-96 w-96 rounded-full opacity-30"
          style={{ background: 'radial-gradient(circle, rgba(16,185,129,0.4) 0%, transparent 70%)', filter: 'blur(60px)' }}
        />
        <div
          className="absolute top-1/2 -right-48 h-80 w-80 rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.5) 0%, transparent 70%)', filter: 'blur(70px)' }}
        />
        <div
          className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, rgba(52,211,153,0.3) 0%, transparent 70%)', filter: 'blur(80px)' }}
        />
      </div>

      {/* Header */}
      <header className="relative z-20 flex items-center justify-between px-5 py-5 sm:px-8 lg:px-12">
        <div className="flex items-center gap-3">
          <div
            className="grid h-10 w-10 place-items-center rounded-full"
            style={{ background: 'linear-gradient(135deg,#10b981,#059669)', boxShadow: '0 0 20px rgba(16,185,129,0.45)' }}
          >
            <span className="text-base">🌿</span>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-emerald-400">AGRI X BY MFIY</p>
            <p className="text-sm font-semibold text-white/60">{t.tagline}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={toggle}
            className="hidden rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white/70 backdrop-blur-sm transition hover:bg-white/10 sm:inline-flex"
          >
            {lang === 'en' ? 'English' : 'Kinyarwanda'}
          </button>
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="grid h-11 w-11 place-items-center rounded-full border border-white/10 bg-white/5 text-white backdrop-blur-sm transition hover:bg-white/10"
            aria-label="Open menu"
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </header>

      {/* Mobile menu */}
      {menuOpen && (
        <div
          className="relative z-20 mx-5 mb-4 rounded-2xl border border-white/10 p-4 backdrop-blur-xl sm:mx-8"
          style={{ background: 'rgba(255,255,255,0.05)' }}
        >
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-emerald-400">
            {lang === 'en' ? 'Quick Navigation' : 'Inzira Nziguzi'}
          </p>
          <div className="flex flex-wrap gap-2">
            {NAV_MODULES.map((m) => (
              <button
                key={m.id}
                onClick={() => onEnter(m.id)}
                className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white/80 transition hover:bg-white/10"
              >
                <m.icon className="h-4 w-4 text-emerald-400" />
                {m.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Main hero */}
      <main className="relative z-10 px-5 pb-16 sm:px-8 lg:px-12">
        <section className="mx-auto max-w-7xl">
          <div className="mb-8">
            <span
              className="inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.3em] text-emerald-400"
              style={{ borderColor: 'rgba(52,211,153,0.3)', background: 'rgba(52,211,153,0.08)' }}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              East Africa Precision AgriTech
            </span>
          </div>

          <div className="max-w-4xl">
            <h1
              className="text-5xl font-black leading-[1.05] tracking-[-0.03em] sm:text-6xl lg:text-7xl"
              style={{
                background: 'linear-gradient(135deg,#ffffff 0%,#a7f3d0 40%,#6ee7b7 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              The Next Generation of Precision Agriculture.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-white/55">
              Powered by real-time soil telemetry, multispectral plant intelligence, and regional AI advisors tailored for East African farmers.
            </p>
          </div>

          <div className="mt-10">
            <button
              id="enter-app-btn"
              onClick={() => onEnter('aicenter')}
              className="group inline-flex items-center gap-2.5 rounded-full px-8 py-4 text-sm font-bold text-white transition-all duration-300 hover:-translate-y-1"
              style={{
                background: 'linear-gradient(135deg,#10b981,#059669)',
                boxShadow: '0 8px 32px rgba(16,185,129,0.4), 0 0 0 1px rgba(16,185,129,0.2)',
              }}
            >
              {lang === 'en' ? 'Enter App' : 'Injira'}
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </button>
          </div>

          {/* Stats */}
          <div className="mt-12 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {STATS.map((stat) => (
              <div
                key={stat.label}
                className="rounded-2xl border border-white/8 p-4 backdrop-blur-sm"
                style={{ background: 'rgba(255,255,255,0.04)' }}
              >
                <p
                  className="text-2xl font-black"
                  style={{
                    background: 'linear-gradient(135deg,#ffffff,#6ee7b7)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                >
                  {stat.value}
                </p>
                <p className="mt-1 text-xs text-white/45">{stat.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Feature cards */}
        <section className="mx-auto mt-16 max-w-7xl">
          <div className="mb-8">
            <p className="text-[11px] font-bold uppercase tracking-[0.35em] text-emerald-400">
              {lang === 'en' ? 'Intelligence Modules' : "Ibyiciro by'Ubumenyi"}
            </p>
            <h2 className="mt-2 text-2xl font-bold text-white/90">
              {lang === 'en'
                ? 'Built for precision, clarity, and real farm outcomes.'
                : "Byubakiye ku kwerinda, gusobanukirwa, n'ibisubizo by'ubuhinzi."}
            </h2>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {HERO_FEATURES.map((feat, idx) => {
              const Icon = feat.icon;
              const isHovered = hoveredCard === idx;
              return (
                <div
                  key={feat.title}
                  onMouseEnter={() => setHoveredCard(idx)}
                  onMouseLeave={() => setHoveredCard(null)}
                  className="group relative overflow-hidden rounded-3xl border p-6 backdrop-blur-xl"
                  style={{
                    borderColor: isHovered ? feat.border : 'rgba(255,255,255,0.08)',
                    background: isHovered
                      ? `radial-gradient(circle at 30% 30%, ${feat.glow}, rgba(255,255,255,0.03))`
                      : 'rgba(255,255,255,0.04)',
                    transform: isHovered ? 'translateY(-6px) scale(1.015)' : 'translateY(0) scale(1)',
                    boxShadow: isHovered ? `0 20px 60px ${feat.glow}` : 'none',
                    transition: 'all 0.4s cubic-bezier(0.4,0,0.2,1)',
                  }}
                >
                  <div
                    className="pointer-events-none absolute -top-8 -right-8 h-32 w-32 rounded-full transition-opacity duration-500"
                    style={{
                      background: `radial-gradient(circle, ${feat.glow} 0%, transparent 70%)`,
                      filter: 'blur(20px)',
                      opacity: isHovered ? 1 : 0,
                    }}
                  />
                  <div className="relative">
                    <div className="mb-4 flex items-center gap-3">
                      <div className={`grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br ${feat.iconBg} shadow-lg`}>
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <span className="text-2xl">{feat.badge}</span>
                    </div>
                    <h3 className="text-lg font-bold text-white">{feat.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-white/50">{feat.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Nav tiles */}
        <section className="mx-auto mt-10 max-w-7xl">
          <div
            className="rounded-3xl border border-white/8 p-6 backdrop-blur-xl lg:p-8"
            style={{ background: 'rgba(255,255,255,0.03)' }}
          >
            <p className="mb-5 text-[11px] font-bold uppercase tracking-[0.35em] text-white/35">
              {lang === 'en' ? 'All Modules' : 'Ibyiciro Byose'}
            </p>
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              {NAV_MODULES.map((mod) => (
                <button
                  key={mod.id}
                  onClick={() => onEnter(mod.id)}
                  className="group flex items-center justify-between rounded-2xl border border-white/8 p-4 text-left backdrop-blur-sm transition-all duration-300 hover:border-emerald-500/30 hover:-translate-y-0.5"
                  style={{ background: 'rgba(255,255,255,0.04)' }}
                >
                  <div className="flex items-center gap-3">
                    <div className="grid h-9 w-9 place-items-center rounded-xl border border-white/10 bg-white/8">
                      <mod.icon className="h-4 w-4 text-emerald-400" />
                    </div>
                    <span className="text-sm font-semibold text-white/75">{mod.label}</span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-white/25 transition-all duration-300 group-hover:translate-x-0.5 group-hover:text-emerald-400" />
                </button>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer
        className="relative z-10 border-t border-white/8 px-5 py-10 sm:px-8 lg:px-12"
        style={{ background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(20px)' }}
      >
        <div className="mx-auto max-w-7xl space-y-6">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div
                className="grid h-10 w-10 place-items-center rounded-full"
                style={{ background: 'linear-gradient(135deg,#10b981,#059669)', boxShadow: '0 0 18px rgba(16,185,129,0.4)' }}
              >
                <span className="text-base">🌿</span>
              </div>
              <div>
                <p className="text-sm font-bold tracking-wider text-white">AGRI X by Mfiy</p>
                <p className="text-xs text-white/40">Empowering sustainable farming with intelligent field hardware and AI.</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {[
                { label: '🛡️ Mfiy Verified Network' },
                { label: '🛰️ Multispectral Insights' },
                { label: '⚡ Real-Time Telemetry' },
              ].map((badge) => (
                <span
                  key={badge.label}
                  className="inline-flex items-center gap-1.5 rounded-full border border-white/10 px-3 py-1.5 text-[11px] font-semibold text-white/55"
                  style={{ background: 'rgba(255,255,255,0.05)' }}
                >
                  {badge.label}
                </span>
              ))}
            </div>
          </div>
          <div className="h-px bg-white/8" />
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-white/30">Mfiy AgriTech Solutions © 2026. All rights reserved.</p>
            <div className="flex flex-wrap items-center gap-3 text-xs text-white/35">
              <button className="transition-colors hover:text-white/65">Privacy Policy</button>
              <span className="text-white/15">|</span>
              <button className="transition-colors hover:text-white/65">Terms of Service</button>
              <span className="text-white/15">|</span>
              <span className="text-emerald-400/60">Mfiy AgriTech Solutions</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
