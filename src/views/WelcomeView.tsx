import { useState, useEffect, useRef } from 'react';
import {
  Menu, X, ArrowRight, ScanLine, Satellite, Cpu,
  ShoppingBag, ChevronRight, Microscope, RadioTower, Globe2,
} from 'lucide-react';
import { useLang } from '../lib/i18n';
import type { ViewId } from '../lib/nav';
import leafImg from '../assets/leaf.png';

const KEYFRAMES = `
@keyframes leafSway {
  0%   { transform: perspective(1000px) rotateY(-16deg) rotateX(5deg)  scale(1.00); }
  25%  { transform: perspective(1000px) rotateY(0deg)   rotateX(-2deg) scale(1.04); }
  50%  { transform: perspective(1000px) rotateY(16deg)  rotateX(5deg)  scale(1.00); }
  75%  { transform: perspective(1000px) rotateY(0deg)   rotateX(-2deg) scale(1.04); }
  100% { transform: perspective(1000px) rotateY(-16deg) rotateX(5deg)  scale(1.00); }
}
@keyframes leafFloat {
  0%, 100% { transform: translateY(0px); }
  50%       { transform: translateY(-18px); }
}
@keyframes hudPulse {
  0%, 100% { opacity: 0.55; }
  50%       { opacity: 1; }
}
@keyframes ringRotate {
  from { transform: translate(-50%,-50%) rotate(0deg); }
  to   { transform: translate(-50%,-50%) rotate(360deg); }
}
@keyframes blink {
  0%,88%,100% { opacity:1; }
  94%         { opacity:0.2; }
}
@keyframes gridBreath {
  0%,100% { opacity:0.14; }
  50%     { opacity:0.28; }
}
@keyframes fadeUp {
  from { opacity:0; transform:translateY(18px); }
  to   { opacity:1; transform:translateY(0); }
}
`;

const STATS = [
  { value: '...',  label: 'Diseases diagnosed' },
  { value: '4',    label: 'Intelligence modules' },
  { value: '6',    label: 'Rwandan market hubs' },
  { value: '24/7', label: 'Satellite + Quantum' },
];

const FEATURES = [
  {
    icon: Microscope,
    title: 'Multispectral Leaf Analysis',
    desc: 'Instant plant pathogen & nutrient deficiency diagnostic with AI confidence scoring.',
    accent: '#059669', border: 'rgba(5,150,105,0.22)', bg: 'rgba(5,150,105,0.06)',
  },
  {
    icon: RadioTower,
    title: 'IoT Soil Telemetry',
    desc: 'Live NPK, pH, moisture, and temperature sensor monitoring across all your fields.',
    accent: '#0369a1', border: 'rgba(3,105,161,0.22)', bg: 'rgba(3,105,161,0.06)',
  },
  {
    icon: Globe2,
    title: 'Direct Buyer Marketplace',
    desc: 'Verified supply chain network connecting growers directly with premium buyers.',
    accent: '#b45309', border: 'rgba(180,83,9,0.22)', bg: 'rgba(180,83,9,0.06)',
  },
];

const MODULES = [
  { icon: ScanLine,    label: 'AI Center', id: 'aicenter'   as ViewId },
  { icon: Satellite,   label: 'Satellite', id: 'satellite'  as ViewId },
  { icon: Cpu,         label: 'Telemetry', id: 'telemetry'  as ViewId },
  { icon: ShoppingBag, label: 'Market',    id: 'agrimarket' as ViewId },
];

function useScanY() {
  const [pct, setPct] = useState(0);
  const raf = useRef(0);
  useEffect(() => {
    let start: number | null = null;
    const CYCLE = 3200;
    function tick(ts: number) {
      if (!start) start = ts;
      setPct(((ts - start) % CYCLE) / CYCLE);
      raf.current = requestAnimationFrame(tick);
    }
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, []);
  return `${5 + pct * 87}%`;
}

export function WelcomeView({ onEnter }: { onEnter: (v: ViewId) => void }) {
  const { lang, toggle } = useLang();
  const [menuOpen, setMenuOpen] = useState(false);
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  const scanY = useScanY();

  return (
    <>
      <style>{KEYFRAMES}</style>
      <div className="w-full text-gray-900 overflow-x-hidden">

        {/* ═══════════════ HERO ═══════════════ */}
        <div
          className="relative min-h-screen w-full overflow-hidden flex flex-col"
          style={{ background: 'linear-gradient(160deg,#c4dbe6 0%,#d6ecf2 22%,#e8f3ee 55%,#f4f9f5 100%)' }}
        >
          {/* Nav */}
          <nav className="relative z-30 flex items-center justify-between px-7 py-5 lg:px-14">
            {/* Logo */}
            <div className="flex items-center gap-2.5">
              <div
                className="flex h-8 w-8 items-center justify-center rounded-lg text-white text-xs font-black"
                style={{ background: 'linear-gradient(135deg,#10b981,#059669)' }}
              >
                AX
              </div>
              <div className="leading-none">
                <span className="text-[13px] font-black tracking-wider text-gray-900 uppercase">Agri X</span>
                <span className="ml-0.5 text-[9px] text-gray-400 align-super">®</span>
              </div>
            </div>

            {/* Centre links */}
            <div className="hidden md:flex items-center gap-8">
              {['Solutions', 'About Us', 'Contact'].map((l) => (
                <button key={l} className="text-[13px] font-medium text-gray-600 tracking-wide transition-colors hover:text-gray-900">
                  {l}
                </button>
              ))}
            </div>

            {/* Right */}
            <div className="flex items-center gap-3">
              <button
                onClick={toggle}
                className="hidden sm:inline-flex text-[11px] font-bold text-gray-500 tracking-widest uppercase transition-colors hover:text-gray-800"
              >
                {lang === 'en' ? 'EN' : 'RW'}
              </button>
              <button
                onClick={() => setMenuOpen((v) => !v)}
                className="flex h-9 w-9 items-center justify-center rounded-full text-white transition hover:opacity-80"
                style={{ background: '#111' }}
                aria-label="Menu"
              >
                {menuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
              </button>
            </div>
          </nav>

          {/* Mobile dropdown */}
          {menuOpen && (
            <div className="absolute top-16 right-7 z-40 rounded-2xl border border-black/10 bg-white/90 backdrop-blur-xl px-6 py-5 flex flex-col gap-3 shadow-xl">
              {['Solutions', 'About Us', 'Contact'].map((l) => (
                <button key={l} className="text-sm font-medium text-gray-700 hover:text-black text-left transition-colors">{l}</button>
              ))}
            </div>
          )}

          {/* ── Hero body: two-column layout ── */}
          <div className="flex flex-1 flex-col lg:flex-row items-center justify-center gap-8 px-7 lg:px-14 pb-12 pt-4 lg:pt-0">

            {/* LEFT: headline + CTA */}
            <div
              className="flex-1 flex flex-col justify-center max-w-lg"
              style={{ animation: 'fadeUp 0.8s ease both' }}
            >
              <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.35em] text-emerald-600">
                Precision AgriTech · Rwanda
              </p>
              <h1
                style={{
                  fontFamily: '"Arial Black","Helvetica Neue",sans-serif',
                  fontWeight: 900,
                  fontSize: 'clamp(38px,5.5vw,72px)',
                  lineHeight: 1.05,
                  letterSpacing: '-0.03em',
                  color: '#0a1a0e',
                }}
              >
                Beyond<br />Farming.
              </h1>
              <p className="mt-5 text-base leading-7 text-gray-500 max-w-sm">
                Multispectral leaf intelligence, IoT soil telemetry, and a verified buyer marketplace — built for East African farms.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <button
                  onClick={() => onEnter('aicenter')}
                  className="group flex items-center gap-2 rounded-full px-6 py-3 text-sm font-bold text-white transition-all duration-300 hover:scale-[1.03] active:scale-[0.97]"
                  style={{ background: '#0a1a0e', letterSpacing: '0.02em' }}
                >
                  Enter App
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                </button>
                <button
                  className="flex items-center gap-2 rounded-full border border-black/12 bg-white/60 px-6 py-3 text-sm font-bold text-gray-700 transition-all duration-300 hover:text-black hover:scale-[1.03] hover:bg-white active:scale-[0.97] backdrop-blur-sm"
                  style={{ letterSpacing: '0.02em' }}
                >
                  Explore Hardware
                </button>
              </div>

              {/* Inline mini stats */}
              <div className="mt-10 flex gap-6">
                {[['38+','diseases'], ['4','modules'], ['24/7','uptime']].map(([v, l]) => (
                  <div key={l}>
                    <p className="text-xl font-black text-gray-900">{v}</p>
                    <p className="text-[11px] text-gray-400 uppercase tracking-widest">{l}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* RIGHT: leaf scanner */}
            <div
              className="relative flex-shrink-0"
              style={{
                width: 'clamp(240px, 32vw, 420px)',
                height: 'clamp(310px, 42vw, 560px)',
                animation: 'fadeUp 0.9s 0.15s ease both',
              }}
            >
              {/* Float */}
              <div style={{ width: '100%', height: '100%', animation: 'leafFloat 4.5s ease-in-out infinite' }}>
                {/* 3-D sway */}
                <div style={{ width: '100%', height: '100%', animation: 'leafSway 6s ease-in-out infinite', transformStyle: 'preserve-3d' }}>
                  <img
                    src={leafImg}
                    alt="Leaf specimen"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'contain',
                      objectPosition: 'center',
                      filter: [
                        'drop-shadow(0 40px 70px rgba(0,0,0,0.22))',
                        'drop-shadow(0 10px 24px rgba(0,0,0,0.16))',
                        'drop-shadow(0 0 40px rgba(16,185,129,0.12))',
                      ].join(' '),
                      userSelect: 'none',
                      pointerEvents: 'none',
                    }}
                    draggable={false}
                  />
                </div>
              </div>

              {/* Scan laser */}
              <div
                aria-hidden
                style={{
                  position: 'absolute', left: '-8%', right: '-8%',
                  top: scanY, height: 2,
                  background: 'linear-gradient(90deg,transparent 0%,#10b981 18%,#34d399 50%,#10b981 82%,transparent 100%)',
                  boxShadow: '0 0 10px 3px rgba(52,211,153,0.7), 0 0 28px 8px rgba(16,185,129,0.3)',
                  borderRadius: 2, pointerEvents: 'none', zIndex: 30,
                }}
              />

              {/* HUD grid */}
              <svg
                aria-hidden
                viewBox="0 0 420 560"
                style={{
                  position: 'absolute', inset: 0, width: '100%', height: '100%',
                  pointerEvents: 'none', zIndex: 25,
                  animation: 'gridBreath 3s ease-in-out infinite',
                }}
              >
                {[18,26,34,42,50,58,66,74,82].map((p) => (
                  <line key={p} x1="3%" y1={`${p}%`} x2="97%" y2={`${p}%`} stroke="rgba(5,150,105,0.2)" strokeWidth="0.7" />
                ))}
                {[8,20,32,44,56,68,80,92].map((p) => (
                  <line key={p} x1={`${p}%`} y1="3%" x2={`${p}%`} y2="97%" stroke="rgba(5,150,105,0.2)" strokeWidth="0.7" />
                ))}
                <path d="M32,44 L32,20 L56,20" stroke="rgba(5,150,105,0.65)" strokeWidth="2" fill="none" />
                <path d="M388,44 L388,20 L364,20" stroke="rgba(5,150,105,0.65)" strokeWidth="2" fill="none" />
                <path d="M32,516 L32,540 L56,540" stroke="rgba(5,150,105,0.65)" strokeWidth="2" fill="none" />
                <path d="M388,516 L388,540 L364,540" stroke="rgba(5,150,105,0.65)" strokeWidth="2" fill="none" />
                <line x1="200" y1="270" x2="220" y2="270" stroke="rgba(5,150,105,0.7)" strokeWidth="1.5" />
                <line x1="210" y1="260" x2="210" y2="280" stroke="rgba(5,150,105,0.7)" strokeWidth="1.5" />
                <circle cx="210" cy="270" r="14" stroke="rgba(5,150,105,0.35)" strokeWidth="1" fill="none" />
                <circle cx="210" cy="270" r="3.5" fill="rgba(5,150,105,0.6)" />
              </svg>

              {/* Dashed orbit ring */}
              <div aria-hidden style={{
                position: 'absolute', top: '50%', left: '50%',
                width: '115%', paddingBottom: '115%', borderRadius: '50%',
                border: '1px dashed rgba(5,150,105,0.28)',
                animation: 'ringRotate 18s linear infinite',
                zIndex: 24, pointerEvents: 'none',
              }} />

              {/* HUD badges */}
              <HudBadge top="2%"  right="-42%" label="TELEMETRY"   value="ACTIVE"       pulse="hudPulse 2.4s ease-in-out infinite" />
              <HudBadge bottom="6%" left="-46%" label="SCANNING"   value="98.4% HEALTHY" pulse="blink 2.8s ease-in-out infinite" />
              <HudBadge top="20%" left="-44%" label="CHLOROPHYLL"  value="42.7 SPAD"    pulse="hudPulse 3.5s ease-in-out infinite" />
              <HudBadge bottom="22%" right="-40%" label="CONFIDENCE" value="99.1%"      pulse="hudPulse 2s ease-in-out infinite" />
            </div>
          </div>
        </div>

        {/* ═══════════════ STATS STRIP ═══════════════ */}
        <div className="w-full border-y border-gray-200 bg-white">
          <div className="mx-auto max-w-6xl grid grid-cols-2 md:grid-cols-4">
            {STATS.map((s, i) => (
              <div
                key={s.label}
                className={`flex flex-col items-center justify-center py-7 px-5 ${i < 3 ? 'md:border-r border-gray-200' : ''}`}
              >
                <span className="text-4xl font-black tracking-tight text-gray-900">{s.value}</span>
                <span className="mt-1 text-[11px] font-semibold uppercase tracking-widest text-gray-400">{s.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ═══════════════ FEATURE CARDS ═══════════════ */}
        <div className="bg-gray-50 py-20 px-5 sm:px-8 lg:px-14">
          <div className="mx-auto max-w-6xl">
            <div className="mb-10">
              <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-emerald-600">Intelligence Modules</p>
              <h2 className="mt-3 text-3xl font-black tracking-tight text-gray-900">
                Built for precision, clarity,<br className="hidden sm:block" /> and real farm outcomes.
              </h2>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {FEATURES.map((f, idx) => {
                const Icon = f.icon;
                const hov = hoveredCard === idx;
                return (
                  <div
                    key={f.title}
                    onMouseEnter={() => setHoveredCard(idx)}
                    onMouseLeave={() => setHoveredCard(null)}
                    className="rounded-3xl border p-7 cursor-default"
                    style={{
                      borderColor: hov ? f.border : 'rgba(0,0,0,0.07)',
                      background: hov ? f.bg : '#fff',
                      transform: hov ? 'translateY(-6px) scale(1.015)' : 'none',
                      boxShadow: hov ? `0 20px 50px ${f.border}` : '0 1px 3px rgba(0,0,0,0.05)',
                      transition: 'all 0.32s cubic-bezier(0.4,0,0.2,1)',
                    }}
                  >
                    <div
                      className="mb-5 inline-flex h-11 w-11 items-center justify-center rounded-xl"
                      style={{ background: f.bg, border: `1px solid ${f.border}` }}
                    >
                      <Icon style={{ color: f.accent }} className="h-5 w-5" />
                    </div>
                    <h3 className="text-base font-bold text-gray-900">{f.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-gray-500">{f.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ═══════════════ MODULE GRID ═══════════════ */}
        <div className="bg-white py-14 px-5 sm:px-8 lg:px-14 border-t border-gray-100">
          <div className="mx-auto max-w-6xl">
            <p className="mb-5 text-[10px] font-bold uppercase tracking-[0.35em] text-gray-400">All Modules</p>
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              {MODULES.map((m) => (
                <button
                  key={m.id}
                  onClick={() => onEnter(m.id)}
                  className="group flex items-center justify-between rounded-2xl border border-gray-200 bg-gray-50 p-4 text-left transition-all duration-300 hover:border-emerald-300 hover:bg-emerald-50 hover:-translate-y-0.5"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 bg-white">
                      <m.icon className="h-4 w-4 text-emerald-600" />
                    </div>
                    <span className="text-sm font-semibold text-gray-700 group-hover:text-gray-900">{m.label}</span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-gray-300 transition-all duration-300 group-hover:translate-x-0.5 group-hover:text-emerald-500" />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ═══════════════ FOOTER (slim) ═══════════════ */}
        <footer className="border-t border-gray-900 bg-gray-950 text-white">
          <div className="mx-auto max-w-6xl px-7 lg:px-14 py-8 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            {/* Brand */}
            <div className="flex items-center gap-3">
              <div
                className="flex h-7 w-7 items-center justify-center rounded-md text-white text-[10px] font-black"
                style={{ background: 'linear-gradient(135deg,#10b981,#059669)' }}
              >
                AX
              </div>
              <div className="leading-none">
                <p className="text-[13px] font-black tracking-wider uppercase text-white">Agri X<span className="ml-0.5 text-[9px] text-white/30 align-super font-normal">®</span></p>
                <p className="text-[10px] text-white/35 tracking-widest">by <span className="text-emerald-400 font-semibold">Mfiy</span></p>
              </div>
            </div>

            {/* Links row */}
            <div className="flex flex-wrap gap-5 text-[12px] text-white/40">
              {['Solutions', 'About Mfiy', 'Careers', 'Privacy', 'Terms'].map((l) => (
                <button key={l} className="hover:text-white/70 transition-colors">{l}</button>
              ))}
            </div>

            {/* Copyright */}
            <p className="text-[11px] text-white/25 whitespace-nowrap">
              © 2026 <span className="text-white/40 font-semibold">Mfiy AgriTech</span>
            </p>
          </div>
        </footer>

      </div>
    </>
  );
}

function HudBadge({
  top, bottom, left, right, label, value, pulse,
}: {
  top?: string; bottom?: string; left?: string; right?: string;
  label: string; value: string; pulse: string;
}) {
  return (
    <div
      style={{
        position: 'absolute', top, bottom, left, right,
        background: 'rgba(255,255,255,0.84)',
        border: '1px solid rgba(5,150,105,0.32)',
        borderRadius: 6, padding: '5px 10px',
        backdropFilter: 'blur(10px)',
        whiteSpace: 'nowrap',
        animation: pulse, zIndex: 35,
        boxShadow: '0 2px 10px rgba(0,0,0,0.07)',
      }}
    >
      <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.2em', color: 'rgba(5,150,105,0.85)', margin: 0 }}>{label}</p>
      <p style={{ fontSize: 10, fontWeight: 700, color: '#111', margin: 0 }}>{value}</p>
    </div>
  );
}
