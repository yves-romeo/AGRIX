import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import {
  Activity,
  AlertTriangle,
  BatteryCharging,
  Camera,
  CameraOff,
  ChevronDown,
  Cloud,
  Droplets,
  Gauge,
  Lightbulb,
  Loader2,
  MapPin,
  PenTool,
  Radio,
  Satellite,
  Search,
  SlidersHorizontal,
  Sprout,
  Terminal,
  Thermometer,
  ToggleLeft,
  ToggleRight,
  Trash2,
  Wifi,
  WifiOff,
  Wind,
  Zap,
} from 'lucide-react';
import { useHardwareConnection } from '../lib/hardware';

type ControllerTab = 'camera' | 'satellite' | 'controls' | 'logs';

type LatLngTuple = [number, number];

type Sensor = {
  label: string;
  value: string;
  unit: string;
  icon: typeof Activity;
  accent: string;
  bar: string;
  fill: number;
};

const baseSensors: Sensor[] = [
  { label: 'Soil moisture', value: '42', unit: '%', icon: Droplets, accent: 'text-cyan-300', bar: 'bg-cyan-400', fill: 42 },
  { label: 'Ambient temperature', value: '24.8', unit: '°C', icon: Thermometer, accent: 'text-orange-300', bar: 'bg-orange-400', fill: 55 },
  { label: 'Relative humidity', value: '68', unit: '%', icon: Cloud, accent: 'text-sky-300', bar: 'bg-sky-400', fill: 68 },
  { label: 'pH level', value: '6.4', unit: 'pH', icon: Gauge, accent: 'text-lime-300', bar: 'bg-lime-400', fill: 64 },
  { label: 'Light intensity', value: '8,420', unit: 'lux', icon: Lightbulb, accent: 'text-yellow-300', bar: 'bg-yellow-400', fill: 84 },
  { label: 'Wind speed', value: '2.6', unit: 'm/s', icon: Wind, accent: 'text-violet-300', bar: 'bg-violet-400', fill: 26 },
  { label: 'Battery level', value: '87', unit: '%', icon: BatteryCharging, accent: 'text-emerald-300', bar: 'bg-emerald-400', fill: 87 },
];

const controllerTabs: { id: ControllerTab; label: string; icon: typeof Activity }[] = [
  { id: 'camera', label: 'Camera feed', icon: Camera },
  { id: 'satellite', label: 'Satellite plot', icon: Satellite },
  { id: 'controls', label: 'Hardware controls', icon: SlidersHorizontal },
  { id: 'logs', label: 'System diagnostics', icon: Terminal },
];

const intervalOptions = ['1s', '3s', '10s', '60s'];

type LogEntry = { time: string; tone: 'cyan' | 'green' | 'slate' | 'amber' | 'red'; text: string };

const initialLogs: LogEntry[] = [
  { time: '12:42:08', tone: 'cyan', text: 'LINK  A-01 handshake acknowledged' },
  { time: '12:42:08', tone: 'green', text: 'SYS   battery health 87% · nominal' },
  { time: '12:42:09', tone: 'slate', text: 'PKT   telemetry packet received · 128 bytes' },
  { time: '12:42:10', tone: 'cyan', text: 'GPS   location lock acquired · 8 satellites' },
  { time: '12:42:11', tone: 'slate', text: 'CAM   optical sensor standby' },
  { time: '12:42:12', tone: 'amber', text: 'INFO  waiting for remote command' },
];

const logStream: LogEntry[] = [
  { time: '12:42:14', tone: 'slate', text: 'PKT   soil moisture sample · 42%' },
  { time: '12:42:15', tone: 'green', text: 'SYS   temperature nominal · 24.8°C' },
  { time: '12:42:16', tone: 'slate', text: 'PKT   humidity sample · 68%' },
  { time: '12:42:18', tone: 'cyan', text: 'LORA  heartbeat · RSSI -58 dBm' },
  { time: '12:42:20', tone: 'amber', text: 'WARN  wind gust detected · 3.1 m/s' },
  { time: '12:42:22', tone: 'slate', text: 'PKT   battery telemetry · 87%' },
  { time: '12:42:24', tone: 'green', text: 'SYS   all sensors responding' },
  { time: '12:42:26', tone: 'slate', text: 'PKT   light intensity · 8420 lux' },
];

function calculateAreaHa(points: LatLngTuple[]): number {
  if (points.length < 3) return 0;
  const R = 6371000;
  let area = 0;
  for (let i = 0; i < points.length; i++) {
    const [lat1, lon1] = points[i];
    const [lat2, lon2] = points[(i + 1) % points.length];
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const lat1r = (lat1 * Math.PI) / 180;
    const lat2r = (lat2 * Math.PI) / 180;
    area += dLon * (2 + Math.sin(lat1r) + Math.sin(lat2r));
  }
  return (Math.abs(area) * R * R) / 2 / 10_000;
}

export default function TelemetryView() {
  const [dataOpen, setDataOpen] = useState(true);
  const [controllerOpen, setControllerOpen] = useState(true);
  const hw = useHardwareConnection();
  const { status, isConnected, isConnecting, errorMessage, connect, disconnect } = hw;
  const [controllerTab, setControllerTab] = useState<ControllerTab>('camera');
  const [photos, setPhotos] = useState<string[]>([]);
  const [irrigation, setIrrigation] = useState(false);
  const [flash, setFlash] = useState(false);
  const [repeller, setRepeller] = useState(false);
  const [interval, setIntervalValue] = useState('10s');
  const [logs, setLogs] = useState<LogEntry[]>(initialLogs);
  const streamIndex = useRef(0);

  useEffect(() => {
    if (!controllerOpen || controllerTab !== 'logs' || !isConnected) return;
    const timer = window.setInterval(() => {
      const next = logStream[streamIndex.current % logStream.length];
      streamIndex.current += 1;
      const stamped = {
        ...next,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      };
      setLogs((current) => [...current.slice(-40), stamped]);
    }, 2200);
    return () => window.clearInterval(timer);
  }, [controllerOpen, controllerTab, isConnected]);

  const capturePhoto = () => {
    if (!isConnected) return;
    const timestamp = new Date().toLocaleString([], {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
    setPhotos((current) => [`Capture ${String(current.length + 1).padStart(2, '0')} · ${timestamp}`, ...current]);
  };

  return (
    <main className="min-h-screen bg-[#0b0f17] text-slate-100 pb-12">
      {/* ── HEADER ── */}
      <header className="sticky top-0 z-20 border-b border-[#1f293d] bg-[#0b0f17]/90 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-cyan-400 text-[#071018] shadow-sm shadow-cyan-400/30">
              <Sprout size={20} />
            </div>
            <div>
              <p className="text-sm font-semibold tracking-tight text-white">AgroQuantum</p>
              <p className="text-[11px] text-slate-500">Telemetry IoT Hub</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-2">
            {/* Error banner */}
            {status === 'error' && errorMessage && (
              <span className="hidden items-center gap-1.5 rounded-full border border-rose-500/30 bg-rose-500/10 px-3 py-1 text-[11px] font-medium text-rose-300 sm:flex">
                <AlertTriangle size={11} />
                {errorMessage}
              </span>
            )}

            {/* Status pill */}
            <span
              className={`hidden items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium sm:flex ${
                status === 'connected'
                  ? 'bg-cyan-400/10 text-cyan-300 border border-cyan-400/20'
                  : status === 'connecting'
                  ? 'bg-amber-400/10 text-amber-300 border border-amber-400/20'
                  : status === 'error'
                  ? 'bg-rose-500/10 text-rose-300 border border-rose-500/20'
                  : 'bg-white/5 text-slate-400 border border-white/10'
              }`}
            >
              <span
                className={`h-2 w-2 rounded-full ${
                  status === 'connected'
                    ? 'bg-cyan-300 shadow-[0_0_8px_#67e8f9]'
                    : status === 'connecting'
                    ? 'bg-amber-300 animate-pulse'
                    : status === 'error'
                    ? 'bg-rose-500'
                    : 'bg-slate-600'
                }`}
              />
              {status === 'connected'
                ? 'AgroQuantum Connected'
                : status === 'connecting'
                ? 'Connecting — pinging hardware…'
                : status === 'error'
                ? 'Hardware Offline'
                : 'Hardware Disconnected'}
            </span>

            {/* Action button */}
            {isConnected ? (
              <button
                onClick={disconnect}
                className="flex items-center gap-2 rounded-lg border border-[#1f293d] bg-white/5 px-3.5 py-2 text-xs font-semibold text-slate-300 transition hover:border-rose-400/40 hover:text-rose-300"
              >
                <WifiOff size={14} />
                Disconnect
              </button>
            ) : isConnecting ? (
              <button disabled className="flex items-center gap-2 rounded-lg border border-amber-400/30 bg-amber-400/10 px-3.5 py-2 text-xs font-semibold text-amber-300 cursor-not-allowed">
                <Loader2 size={14} className="animate-spin" />
                Connecting…
              </button>
            ) : (
              <button
                onClick={connect}
                className="flex items-center gap-2 rounded-lg border border-cyan-400/40 bg-cyan-400 px-3.5 py-2 text-xs font-semibold text-[#071018] transition hover:bg-cyan-300"
              >
                <Wifi size={14} />
                {status === 'error' ? 'Retry Connection' : 'Connect Hardware'}
              </button>
            )}
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-6xl space-y-5 px-4 py-6 sm:px-6 sm:py-8">
        {/* ── ACCORDION 1: AGROQUANTUM DATA (SENSORS) ── */}
        <Accordion
          id="data"
          isOpen={dataOpen}
          onToggle={() => setDataOpen((v) => !v)}
          icon={Radio}
          title="AgroQuantum Data"
          subtitle="Live environmental telemetry from your field unit"
          action={
            <button
              onClick={isConnected ? disconnect : connect}
              disabled={isConnecting}
              className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold transition disabled:opacity-60 disabled:cursor-not-allowed ${
                isConnected
                  ? 'bg-white/10 text-slate-300 hover:bg-white/15'
                  : 'bg-cyan-400 text-[#071018] hover:bg-cyan-300'
              }`}
            >
              {isConnecting ? <Loader2 size={13} className="animate-spin" /> : <Wifi size={13} />}
              {isConnected ? 'Connected' : isConnecting ? 'Connecting…' : '+ Connect Hardware'}
            </button>
          }
        >
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {baseSensors.map((sensor) => (
              <SensorCard key={sensor.label} sensor={sensor} isDeviceConnected={isConnected} isConnecting={isConnecting} />
            ))}
          </div>
        </Accordion>

        {/* ── ACCORDION 2: AGROQUANTUM CONTROLLER SUB-TABS ── */}
        <Accordion
          id="controller"
          isOpen={controllerOpen}
          onToggle={() => setControllerOpen((v) => !v)}
          icon={Zap}
          title="AgroQuantum Controller"
          subtitle="Remote camera, satellite plot, hardware controls, and system diagnostics"
        >
          <div className="mb-6 flex gap-1 overflow-x-auto rounded-2xl border border-[#1f293d] bg-[#101722]/80 p-1">
            {controllerTabs.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setControllerTab(id)}
                className={`flex shrink-0 items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium transition ${
                  controllerTab === id
                    ? 'bg-cyan-400/10 text-cyan-300 shadow-inner shadow-cyan-400/5 border border-cyan-400/20'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon size={16} />
                {label}
              </button>
            ))}
          </div>

          {/* TAB A: CAMERA FEED */}
          {controllerTab === 'camera' && (
            <CameraPanel photos={photos} onCapture={capturePhoto} isDeviceConnected={isConnected} isConnecting={isConnecting} />
          )}

          {/* TAB B: SATELLITE PLOT & CUT BOUNDARY */}
          {controllerTab === 'satellite' && <SatellitePanel isDeviceConnected={isConnected} />}

          {/* TAB C: HARDWARE CONTROLS */}
          {controllerTab === 'controls' && (
            <ControlsPanel
              isDeviceConnected={isConnected}
              isConnecting={isConnecting}
              irrigation={irrigation}
              setIrrigation={setIrrigation}
              flash={flash}
              setFlash={setFlash}
              repeller={repeller}
              setRepeller={setRepeller}
              interval={interval}
              setInterval={setIntervalValue}
              onConnect={connect}
            />
          )}

          {/* TAB D: SYSTEM DIAGNOSTICS */}
          {controllerTab === 'logs' && (
            <LogsPanel
              isDeviceConnected={isConnected}
              isConnecting={isConnecting}
              logs={logs}
              onConnect={connect}
            />
          )}
        </Accordion>
      </section>
    </main>
  );
}

/* ─────────────────────────────────────────────
   Accordion Wrapper
───────────────────────────────────────────── */
function Accordion({
  id,
  isOpen,
  onToggle,
  icon: Icon,
  title,
  subtitle,
  action,
  children,
}: {
  id: string;
  isOpen: boolean;
  onToggle: () => void;
  icon: typeof Activity;
  title: string;
  subtitle: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-[#1f293d] bg-[#101722]/75 shadow-2xl shadow-black/10 backdrop-blur-xl">
      <button
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-controls={`panel-${id}`}
        className="flex w-full items-center gap-4 px-5 py-5 text-left transition hover:bg-white/[0.02]"
      >
        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-cyan-400/10 text-cyan-300">
          <Icon size={20} />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="text-base font-semibold text-white">{title}</h2>
          <p className="mt-1 truncate text-xs text-slate-400">{subtitle}</p>
        </div>
        {action}
        <ChevronDown
          size={22}
          className={`shrink-0 text-slate-500 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>
      <div
        id={`panel-${id}`}
        className={`grid transition-all duration-300 ease-in-out ${
          isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
        }`}
      >
        <div className="overflow-hidden">
          <div className="border-t border-[#1f293d] p-5">{children}</div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   SensorCard Component
   (Fulfills Requirement 1 Hard Connection State)
───────────────────────────────────────────── */
function SensorCard({
  sensor,
  isDeviceConnected,
  isConnecting,
}: {
  sensor: Sensor;
  isDeviceConnected: boolean;
  isConnecting: boolean;
}) {
  const Icon = sensor.icon;
  return (
    <div className="rounded-2xl border border-[#1f293d] bg-[#0b0f17] p-5 shadow-md">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-medium text-slate-400">{sensor.label}</span>
        <Icon size={18} className={isDeviceConnected ? sensor.accent : 'text-slate-600'} />
      </div>

      <div className="mt-4 flex items-baseline justify-between gap-2">
        <div className="flex items-baseline gap-1">
          <span className={`text-3xl font-semibold tracking-tight ${
            isConnecting ? 'text-amber-300/60 animate-pulse' : 'text-white'
          }`}>
            {isDeviceConnected ? sensor.value : isConnecting ? '…' : '--'}
          </span>
          {isDeviceConnected && <span className="text-sm text-slate-400">{sensor.unit}</span>}
        </div>
        {!isDeviceConnected && !isConnecting && (
          <span className="inline-flex items-center rounded-md bg-rose-500/10 px-2 py-0.5 text-[10px] font-semibold text-rose-400 border border-rose-500/20">
            Hardware Disconnected
          </span>
        )}
        {isConnecting && (
          <span className="inline-flex items-center gap-1 rounded-md bg-amber-400/10 px-2 py-0.5 text-[10px] font-semibold text-amber-300 border border-amber-400/20">
            <Loader2 size={9} className="animate-spin" />
            Connecting…
          </span>
        )}
      </div>

      <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/5">
        <div
          className={`h-1.5 rounded-full transition-all duration-500 ${
            isDeviceConnected ? sensor.bar : isConnecting ? 'bg-amber-400/40 animate-pulse' : ''
          }`}
          style={{ width: isDeviceConnected ? `${sensor.fill}%` : isConnecting ? '40%' : '0%' }}
        />
      </div>
    </div>
  );
}

function GlassPanel({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl border border-[#1f293d] bg-[#0b0f17] shadow-xl shadow-black/20 ${className}`}>
      {children}
    </div>
  );
}

function PanelHeading({ icon: Icon, title, detail }: { icon: typeof Activity; title: string; detail?: string }) {
  return (
    <div className="flex items-center justify-between border-b border-[#1f293d] px-5 py-4">
      <div className="flex items-center gap-3">
        <Icon size={17} className="text-cyan-300" />
        <h3 className="text-sm font-semibold text-slate-100">{title}</h3>
      </div>
      {detail && <span className="text-xs text-slate-400">{detail}</span>}
    </div>
  );
}

/* ─────────────────────────────────────────────
   Tab A: Camera Feed Component
───────────────────────────────────────────── */
function CameraPanel({
  photos,
  onCapture,
  isDeviceConnected,
  isConnecting,
}: {
  photos: string[];
  onCapture: () => void;
  isDeviceConnected: boolean;
  isConnecting: boolean;
}) {
  return (
    <div className="grid gap-5 xl:grid-cols-[1.45fr_1fr]">
      <GlassPanel>
        <PanelHeading
          icon={Camera}
          title="Live optical stream"
          detail={isDeviceConnected ? 'A-01 / 1080p streaming' : isConnecting ? 'Connecting…' : 'Camera Offline'}
        />
        <div className="relative m-5 grid min-h-[370px] place-items-center overflow-hidden rounded-xl border border-[#1f293d] bg-[#080c13]">
          {isDeviceConnected ? (
            <>
              {/* Connected State - Feed overlay */}
              <div className="absolute inset-0 opacity-40">
                <div className="absolute bottom-0 left-0 h-2/3 w-1/2 -skew-x-12 bg-[#193b36]" />
                <div className="absolute bottom-0 right-0 h-3/4 w-1/2 skew-x-12 bg-[#244737]" />
                <div className="absolute inset-8 rounded-lg border border-cyan-300/30" />
                <div className="absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-200 shadow-[0_0_25px_8px_rgba(103,232,249,.5)]" />
              </div>
              <div className="absolute bottom-4 left-4 rounded-lg bg-black/80 px-3 py-1.5 text-[11px] font-medium text-cyan-300 border border-cyan-500/30">
                LIVE · 1080p Optical Feed
              </div>
            </>
          ) : isConnecting ? (
            <div className="p-8 text-center">
              <Loader2 size={32} className="mx-auto text-amber-300 animate-spin" />
              <p className="mt-4 text-base font-semibold text-amber-200">Establishing camera link…</p>
              <p className="mt-2 text-xs text-slate-500 mx-auto max-w-sm">Pinging AgroQuantum optical sensor unit.</p>
            </div>
          ) : (
            /* Disconnected / Error State */
            <div className="p-8 text-center">
              <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-2xl border border-slate-800 bg-slate-900/60 text-slate-500">
                <CameraOff size={32} />
              </div>
              <p className="text-base font-semibold text-slate-300">Camera Offline — Hardware Disconnected</p>
              <p className="mt-2 max-w-sm text-xs text-slate-500 mx-auto">
                Connect your AgroQuantum hardware unit to activate live foliage optical streaming and photo snapshots.
              </p>
            </div>
          )}
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#1f293d] px-5 py-4">
          <span className="flex items-center gap-2 text-xs text-slate-400">
            <span
              className={`h-2 w-2 rounded-full ${
                isDeviceConnected ? 'bg-cyan-300 shadow-[0_0_6px_#67e8f9]' : 'bg-rose-500'
              }`}
            />
            {isDeviceConnected ? 'Optical sensor ready' : 'Hardware Disconnected'}
          </span>
          <div className="flex items-center gap-2">
            <button
              disabled={!isDeviceConnected}
              className="flex items-center gap-2 rounded-lg border border-[#1f293d] bg-white/5 px-3 py-2 text-xs font-semibold text-slate-300 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Record Stream
            </button>
            <button
              onClick={onCapture}
              disabled={!isDeviceConnected}
              className="flex items-center gap-2 rounded-lg bg-cyan-400 px-4 py-2 text-xs font-semibold text-[#071018] transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:bg-slate-800 disabled:text-slate-500"
            >
              <Camera size={14} />
              Capture Photo
            </button>
          </div>
        </div>
      </GlassPanel>

      <GlassPanel>
        <PanelHeading icon={Activity} title="Photo snapshots" detail={`${photos.length} captured`} />
        <div className="min-h-[430px] p-5">
          {photos.length ? (
            <div className="space-y-3">
              {photos.map((photo) => (
                <div key={photo} className="flex items-center gap-3 rounded-xl border border-[#1f293d] bg-white/[0.03] p-3">
                  <div className="grid h-12 w-12 place-items-center rounded-lg bg-[#172536] text-cyan-300">
                    <Camera size={18} />
                  </div>
                  <div>
                    <p className="text-sm text-slate-200">{photo}</p>
                    <p className="mt-1 text-xs text-slate-500">Foliage snapshot · A-01</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid min-h-[380px] place-items-center text-center">
              <div>
                <CameraOff size={30} className="mx-auto text-slate-600" />
                <p className="mt-3 text-sm text-slate-300">No snapshots available</p>
                <p className="mt-1 text-xs text-slate-500">
                  Captured images will appear in this gallery when hardware is connected.
                </p>
              </div>
            </div>
          )}
        </div>
      </GlassPanel>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Tab B: Satellite Plot & Cut Boundary Flow
───────────────────────────────────────────── */
function SatellitePanel({ isDeviceConnected }: { isDeviceConnected: boolean }) {
  const [vertices, setVertices] = useState<LatLngTuple[]>([
    [-1.944, 30.061],
    [-1.942, 30.066],
    [-1.948, 30.068],
    [-1.949, 30.062],
  ]);
  const [drawingActive, setDrawingActive] = useState(false);
  const [searchLocation, setSearchLocation] = useState('Musanze, Northern Province');

  const areaHa = useMemo(() => calculateAreaHa(vertices), [vertices]);
  const areaSqM = Math.round(areaHa * 10000);

  const addPoint = () => {
    // Simulate drawing points around current center
    const last = vertices[vertices.length - 1] || [-1.944, 30.061];
    const newPoint: LatLngTuple = [
      last[0] + (Math.random() - 0.5) * 0.004,
      last[1] + (Math.random() - 0.5) * 0.004,
    ];
    setVertices((prev) => [...prev, newPoint]);
  };

  const clearPoints = () => {
    setVertices([]);
  };

  return (
    <div className="grid gap-5 xl:grid-cols-[1.5fr_1fr]">
      <GlassPanel>
        <PanelHeading
          icon={Satellite}
          title="Satellite plot & boundary cut tool"
          detail={isDeviceConnected ? 'GPS Live Overlay Active' : 'Manual Plotting Only'}
        />

        {/* Map Header Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#1f293d] bg-[#0c131f] px-5 py-3">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={searchLocation}
              onChange={(e) => setSearchLocation(e.target.value)}
              placeholder="Search location in Rwanda..."
              className="rounded-lg border border-[#1f293d] bg-[#080c13] px-3 py-1.5 text-xs text-slate-200 outline-none focus:border-cyan-400"
            />
            <button className="rounded-lg bg-white/10 p-1.5 text-slate-300 hover:bg-white/15">
              <Search size={14} />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setDrawingActive((v) => !v)}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                drawingActive
                  ? 'bg-emerald-500 text-white'
                  : 'border border-[#1f293d] bg-white/5 text-slate-300 hover:bg-white/10'
              }`}
            >
              <PenTool size={13} />
              {drawingActive ? 'Drawing Boundary...' : 'Draw Cut Boundary'}
            </button>
            {vertices.length > 0 && (
              <button
                onClick={addPoint}
                className="flex items-center gap-1.5 rounded-lg border border-[#1f293d] bg-white/5 px-2.5 py-1.5 text-xs font-medium text-slate-300 hover:bg-white/10"
              >
                + Add Point
              </button>
            )}
            {vertices.length > 0 && (
              <button
                onClick={clearPoints}
                className="flex items-center gap-1.5 rounded-lg border border-rose-500/20 bg-rose-500/10 px-2.5 py-1.5 text-xs font-medium text-rose-300 hover:bg-rose-500/20"
              >
                <Trash2 size={13} />
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Map Canvas */}
        <div className="relative m-5 h-[420px] overflow-hidden rounded-xl border border-[#1f293d] bg-[#101e1c] map-grid">
          <div className="absolute inset-0 opacity-70">
            <div className="absolute -left-20 top-16 h-64 w-[120%] rotate-12 bg-[#1d4939]/80" />
            <div className="absolute -right-20 top-52 h-40 w-[120%] -rotate-6 bg-[#2b5b3f]/70" />
            <div className="absolute left-1/3 top-0 h-full w-10 rotate-[25deg] bg-[#aac17c]/15" />
          </div>

          {/* Polygon Boundary Visual Overlay */}
          {vertices.length >= 3 && (
            <div className="absolute inset-16 rounded-2xl border-2 border-dashed border-emerald-400 bg-emerald-500/10 shadow-[0_0_30px_rgba(52,211,153,0.15)] flex items-center justify-center">
              <div className="rounded-xl border border-emerald-400/40 bg-stone-950/80 px-4 py-2 text-center backdrop-blur">
                <p className="text-[10px] uppercase tracking-widest text-emerald-400 font-bold">Cut Plot Area</p>
                <p className="mt-0.5 text-lg font-extrabold text-white">
                  {areaHa.toFixed(3)} Ha <span className="text-xs font-normal text-slate-400">({areaSqM.toLocaleString()} m²)</span>
                </p>
              </div>
            </div>
          )}

          {/* Live Hardware GPS Marker (ONLY rendered when isDeviceConnected === true) */}
          {isDeviceConnected ? (
            <div className="absolute left-[52%] top-[43%] grid h-12 w-12 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-cyan-200/80 bg-cyan-300/20 shadow-[0_0_0_12px_rgba(103,232,249,.08),0_0_30px_rgba(103,232,249,.6)]">
              <MapPin size={22} className="text-cyan-200 animate-bounce" />
            </div>
          ) : null}

          {/* Bottom Map Info */}
          <div className="absolute bottom-4 left-4 rounded-lg border border-[#1f293d] bg-[#0b0f17]/90 px-3.5 py-2 text-xs backdrop-blur">
            <p className="mb-0.5 text-[10px] uppercase tracking-widest text-slate-400 font-semibold">
              Hardware Location Marker
            </p>
            <span className={isDeviceConnected ? 'text-cyan-300 font-medium' : 'text-rose-400 font-medium'}>
              {isDeviceConnected ? 'A-01 · Live GPS telemetry locked' : 'Hardware Disconnected — Live marker hidden'}
            </span>
          </div>

          <div className="absolute right-4 top-4 rounded-lg border border-[#1f293d] bg-[#0b0f17]/90 px-3 py-1.5 text-xs text-slate-300 backdrop-blur">
            {drawingActive ? 'Click to place boundary vertices' : `${vertices.length} boundary vertices defined`}
          </div>
        </div>
      </GlassPanel>

      {/* Position Telemetry Panel */}
      <GlassPanel>
        <PanelHeading icon={MapPin} title="Position telemetry & boundary" detail="Plot Metrics" />
        <div className="space-y-4 p-5">
          <DetailRow
            label="Cut Plot Area"
            value={`${areaHa.toFixed(3)} Ha (${areaSqM.toLocaleString()} m²)`}
            highlight
          />
          <DetailRow
            label="GPS coordinates"
            value={isDeviceConnected ? '1.9441° S, 30.0619° E' : '--'}
            badge={!isDeviceConnected}
          />
          <DetailRow
            label="Elevation"
            value={isDeviceConnected ? '1,540 m AMSL' : '--'}
          />
          <DetailRow
            label="Signal quality"
            value={isDeviceConnected ? 'Excellent · -58 dBm' : 'No signal'}
          />
          <DetailRow
            label="LoRa gateway link"
            value={isDeviceConnected ? 'Connected' : 'Offline'}
          />

          <div className="mt-4 rounded-xl border border-cyan-400/20 bg-cyan-400/5 p-4">
            <p className="text-xs text-slate-400">Calculated Cut Plot Area</p>
            <p className="mt-1 text-lg font-bold text-cyan-300">
              {areaHa.toFixed(3)} Hectares ({areaSqM.toLocaleString()} m²)
            </p>
            <p className="mt-2 text-xs text-slate-400">
              Polygon boundaries update instantly as you add or edit vertices on the satellite view.
            </p>
          </div>
        </div>
      </GlassPanel>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Tab C: Hardware Controls Component
   (Fulfills Requirement 2 Tab C)
───────────────────────────────────────────── */
function ControlsPanel({
  isDeviceConnected,
  isConnecting,
  irrigation,
  setIrrigation,
  flash,
  setFlash,
  repeller,
  setRepeller,
  interval,
  setInterval,
  onConnect,
}: {
  isDeviceConnected: boolean;
  isConnecting: boolean;
  irrigation: boolean;
  setIrrigation: (value: boolean) => void;
  flash: boolean;
  setFlash: (value: boolean) => void;
  repeller: boolean;
  setRepeller: (value: boolean) => void;
  interval: string;
  setInterval: (value: string) => void;
  onConnect: () => void;
}) {
  if (!isDeviceConnected) {
    return (
      <GlassPanel className="p-10 text-center">
        <div className="mx-auto max-w-md">
          <div className="mx-auto mb-5 grid h-16 w-16 place-items-center rounded-2xl border border-slate-800 bg-slate-900/60 text-slate-500">
            {isConnecting ? <Loader2 size={28} className="text-amber-300 animate-spin" /> : <SlidersHorizontal size={28} />}
          </div>
          <h3 className="text-lg font-semibold text-white">
            {isConnecting ? 'Connecting to Hardware…' : 'No Hardware Detected'}
          </h3>
          <p className="mt-3 text-sm leading-6 text-slate-400">
            {isConnecting
              ? 'Pinging AgroQuantum device via wireless gateway. This takes up to 5 seconds.'
              : 'No Hardware Detected. Connect AgroQuantum device via serial or wireless gateway to run diagnostic ping.'}
          </p>
          {!isConnecting && (
            <button
              onClick={onConnect}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-cyan-400 px-5 py-3 text-sm font-semibold text-[#071018] transition hover:bg-cyan-300"
            >
              <Wifi size={16} />
              Connect AgroQuantum Device
            </button>
          )}
        </div>
      </GlassPanel>
    );
  }

  const controls = [
    { label: 'Automated irrigation solenoid valve', value: irrigation, setter: setIrrigation, icon: Droplets },
    { label: 'Camera flash LED', value: flash, setter: setFlash, icon: Lightbulb },
    { label: 'Ultrasonic pest repeller', value: repeller, setter: setRepeller, icon: Zap },
  ];

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <GlassPanel>
        <PanelHeading icon={SlidersHorizontal} title="Remote hardware" detail="A-01 controls" />
        <div className="divide-y divide-[#1f293d] px-5">
          {controls.map(({ label, value, setter, icon: Icon }) => (
            <div key={label} className="flex items-center gap-3 py-5">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white/5 text-cyan-300">
                <Icon size={18} />
              </div>
              <div className="flex-1">
                <p className="text-sm text-slate-200">{label}</p>
                <p className={`mt-1 text-xs ${value ? 'text-emerald-300' : 'text-slate-500'}`}>
                  {value ? 'Active' : 'Off'}
                </p>
              </div>
              <button onClick={() => setter(!value)} aria-label={`Toggle ${label}`} className="text-cyan-300">
                {value ? <ToggleRight size={34} /> : <ToggleLeft size={34} className="text-slate-600" />}
              </button>
            </div>
          ))}
        </div>
      </GlassPanel>

      <GlassPanel>
        <PanelHeading icon={Gauge} title="Sensor sampling" detail="Telemetry interval" />
        <div className="p-5">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-sm text-slate-300">Reading frequency</p>
              <p className="mt-2 text-3xl font-semibold text-cyan-200">{interval}</p>
            </div>
            <Activity size={24} className="text-cyan-300" />
          </div>
          <input
            type="range"
            min={0}
            max={3}
            defaultValue={intervalOptions.indexOf(interval)}
            onChange={(event) => setInterval(intervalOptions[Number(event.target.value)])}
            className="mt-8 w-full accent-cyan-300"
          />
          <div className="mt-3 flex justify-between text-[11px] text-slate-500">
            {intervalOptions.map((option) => (
              <span key={option}>{option}</span>
            ))}
          </div>
          <div className="mt-6 rounded-xl border border-amber-300/10 bg-amber-300/5 p-4 text-xs leading-5 text-slate-400">
            Shorter intervals provide more detail but may increase power consumption.
          </div>
        </div>
      </GlassPanel>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Tab D: System Diagnostics Component
   (Fulfills Requirement 2 Tab D)
───────────────────────────────────────────── */
function LogsPanel({
  isDeviceConnected,
  isConnecting,
  logs,
  onConnect,
}: {
  isDeviceConnected: boolean;
  isConnecting: boolean;
  logs: LogEntry[];
  onConnect: () => void;
}) {
  const logRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [logs]);

  if (!isDeviceConnected) {
    return (
      <GlassPanel className="p-10 text-center">
        <div className="mx-auto max-w-md">
          <div className="mx-auto mb-5 grid h-16 w-16 place-items-center rounded-2xl border border-slate-800 bg-slate-900/60 text-slate-500">
            {isConnecting ? <Loader2 size={28} className="text-amber-300 animate-spin" /> : <Terminal size={28} />}
          </div>
          <h3 className="text-lg font-semibold text-white">
            {isConnecting ? 'Running Diagnostic Ping…' : 'No Hardware Detected'}
          </h3>
          <p className="mt-3 text-sm leading-6 text-slate-400">
            {isConnecting
              ? 'Sending diagnostic ping to AgroQuantum device. Waiting for hardware ACK response (max 5s).'
              : 'No Hardware Detected. Connect AgroQuantum device via serial or wireless gateway to run diagnostic ping.'}
          </p>
          {!isConnecting && (
            <button
              onClick={onConnect}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-cyan-400 px-5 py-3 text-sm font-semibold text-[#071018] transition hover:bg-cyan-300"
            >
              <Wifi size={16} />
              Connect AgroQuantum Device
            </button>
          )}
        </div>
      </GlassPanel>
    );
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[1.5fr_1fr]">
      <GlassPanel>
        <PanelHeading icon={Terminal} title="Live system console" detail="Streaming diagnostics" />
        <div ref={logRef} className="h-[470px] space-y-2 overflow-y-auto bg-[#080c13] p-5 font-mono text-xs leading-6">
          {logs.map((entry, index) => (
            <LogLine key={`${entry.time}-${index}`} entry={entry} />
          ))}
          <span className="inline-flex h-4 w-2 animate-pulse bg-cyan-300" />
        </div>
      </GlassPanel>

      <GlassPanel>
        <PanelHeading icon={Wifi} title="System health" detail="Firmware" />
        <div className="space-y-4 p-5">
          <DetailRow label="Firmware version" value="AQ-OS 2.4.1" />
          <DetailRow label="Hardware revision" value="Rev C · A-01" />
          <DetailRow label="Battery health" value="Good · 87%" />
          <DetailRow label="Error state" value="No errors" />
          <div className="mt-4 flex items-center gap-2 rounded-xl border border-emerald-300/10 bg-emerald-300/5 p-4 text-xs text-emerald-300">
            <span className="h-2 w-2 rounded-full bg-emerald-300 shadow-[0_0_8px_#34d399]" />
            All hardware diagnostic systems nominal
          </div>
        </div>
      </GlassPanel>
    </div>
  );
}

function LogLine({ entry }: { entry: LogEntry }) {
  const toneClass =
    entry.tone === 'cyan'
      ? 'text-cyan-300'
      : entry.tone === 'green'
      ? 'text-emerald-300'
      : entry.tone === 'amber'
      ? 'text-amber-300'
      : entry.tone === 'red'
      ? 'text-red-300'
      : 'text-slate-400';
  return (
    <div>
      <span className="text-slate-600">[{entry.time}] </span>
      <span className={toneClass}>{entry.text}</span>
    </div>
  );
}

function DetailRow({
  label,
  value,
  highlight = false,
  badge = false,
}: {
  label: string;
  value: string;
  highlight?: boolean;
  badge?: boolean;
}) {
  return (
    <div className="flex items-center justify-between border-b border-[#1f293d] pb-3 text-sm">
      <span className="text-slate-400">{label}</span>
      <div className="flex items-center gap-2">
        {badge && (
          <span className="inline-flex items-center rounded-md bg-rose-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-rose-400 border border-rose-500/20">
            Hardware Disconnected
          </span>
        )}
        <span className={`text-right ${highlight ? 'font-bold text-cyan-300' : 'text-slate-200'}`}>{value}</span>
      </div>
    </div>
  );
}
