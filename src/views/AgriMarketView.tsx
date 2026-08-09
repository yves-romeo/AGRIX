import { useEffect, useMemo, useState } from 'react';
import {
  Search,
  TrendingUp,
  TrendingDown,
  Minus,
  Activity,
  Clock,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  ArrowLeft,
} from 'lucide-react';
import { RWANDAN_CROPS, CropId, CROP_CATEGORIES } from '../lib/rwandaData';
import { Sparkline } from '../components/ui';

interface LivePriceRow {
  date: string;
  market: string;
  location: string;
  cropId: CropId;
  price: number;
  previousPrice?: number;
}

interface MarketHub {
  market: string;
  location: string;
  price: number;
  trend: number;
}

interface CropMarketState {
  cropId: CropId;
  hubs: MarketHub[];
  averagePrice: number;
  highestPrice: number;
  lowestPrice: number;
  lastUpdated: string;
  series: number[];
}

const DATA_SOURCE_URL =
  'https://data.humdata.org/dataset/a4a84c1c-81d1-491b-9fbe-1955ae736508/resource/8c22eeb5-cc2e-46bc-8a0d-08b7486b2486/download/wfp_food_prices_rwa.csv';

const DISTRICT_MARKETS = [
  'Nyarugenge', 'Kicukiro', 'Gasabo', 'Huye', 'Nyamagabe', 'Nyanza', 'Ruhango', 'Kamonyi', 'Muhanga', 'Gisagara',
  'Nyaruguru', 'Rusizi', 'Nyamasheke', 'Rubavu', 'Rutsiro', 'Karongi', 'Ngororero', 'Nyabihu', 'Rulindo', 'Gicumbi',
  'Burera', 'Musanze', 'Gakenke', 'Kirehe', 'Ngoma', 'Kayonza', 'Gatsibo', 'Nyagatare', 'Bugesera', 'Rwamagana',
];

const FALLBACK_BASE_PRICES: Record<CropId, number> = {
  ibigori: 320, amasaka: 270, umuceri: 340, ingano: 380, ibishyimbo: 720,
  imiteja: 760, soya: 520, ubunyobwa: 650, amashaza: 540, ibirayi: 480,
  ibijumba: 280, imyumbati: 260, imyungu: 230, inyanya: 900, ibitunguru: 520,
  amashu: 280, karoti: 480, piripiri: 900, ibitoki: 360,
};

function createFallbackMarketRows(): LivePriceRow[] {
  return RWANDAN_CROPS.flatMap((crop) =>
    DISTRICT_MARKETS.flatMap((district, index) => {
      const basePrice = FALLBACK_BASE_PRICES[crop.id] ?? 420;
      const variance = ((index % 7) - 3) * 7 + (crop.name.length % 12);
      const price = Math.max(220, Math.round(basePrice + variance));
      const previousPrice = Math.max(190, price - (index % 12) - 3);
      return [
        { date: '2026-08-01', market: `${district} Market`, location: district, cropId: crop.id, price, previousPrice },
        { date: '2026-07-25', market: `${district} Market`, location: district, cropId: crop.id, price: previousPrice },
      ];
    }),
  );
}

function splitCsvLine(line: string): string[] {
  const values: string[] = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') { current += '"'; i += 1; continue; }
      inQuotes = !inQuotes;
      continue;
    }
    if (char === ',' && !inQuotes) { values.push(current); current = ''; continue; }
    current += char;
  }
  values.push(current);
  return values.map((v) => v.trim().replace(/^"(.*)"$/, '$1'));
}

function parseDate(value: string | undefined): Date | null {
  if (!value) return null;
  const parsed = new Date(value.trim());
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

function mapCommodityToCrop(commodity: string | undefined): CropId | undefined {
  const n = commodity?.toLowerCase() ?? '';
  if (/maize|corn|ibigori/.test(n)) return 'ibigori';
  if (/sorghum|amasaka/.test(n)) return 'amasaka';
  if (/rice|umuceri/.test(n)) return 'umuceri';
  if (/wheat|ingano/.test(n)) return 'ingano';
  if (/french bean|imiteja/.test(n)) return 'imiteja';
  if (/soy|soya|soybeans/.test(n)) return 'soya';
  if (/groundnut|peanut|ubunyobwa/.test(n)) return 'ubunyobwa';
  if (/pea|peas|amashaza/.test(n)) return 'amashaza';
  if (/potato|irish|ibirayi/.test(n)) return 'ibirayi';
  if (/sweet potato|ibijumba/.test(n)) return 'ibijumba';
  if (/cassava|imyumbati/.test(n)) return 'imyumbati';
  if (/yam|imyungu/.test(n)) return 'imyungu';
  if (/tomato|inyanya/.test(n)) return 'inyanya';
  if (/onion|ibitunguru/.test(n)) return 'ibitunguru';
  if (/cabbage|amashu/.test(n)) return 'amashu';
  if (/carrot|karoti/.test(n)) return 'karoti';
  if (/pepper|piripiri/.test(n)) return 'piripiri';
  if (/banana|ibitoki/.test(n)) return 'ibitoki';
  if (/beans?|ibishyimbo/.test(n)) return 'ibishyimbo';
  return undefined;
}

function buildMarketStates(rows: LivePriceRow[]): Record<CropId, CropMarketState> {
  const latestByKey = new Map<string, { latest: LivePriceRow; previous?: LivePriceRow }>();
  for (const row of rows) {
    const date = parseDate(row.date);
    if (!date) continue;
    const key = `${row.cropId}|${row.market}`;
    const entry = latestByKey.get(key);
    if (!entry) { latestByKey.set(key, { latest: row }); continue; }
    const existingDate = parseDate(entry.latest.date);
    if (!existingDate) continue;
    if (date.getTime() > existingDate.getTime()) { entry.previous = entry.latest; entry.latest = row; continue; }
    const prevDate = parseDate(entry.previous?.date);
    if (!entry.previous || (prevDate && date.getTime() > prevDate.getTime())) entry.previous = row;
  }

  const grouped = RWANDAN_CROPS.reduce((acc, c) => { acc[c.id] = []; return acc; }, {} as Record<CropId, LivePriceRow[]>);
  for (const { latest, previous } of latestByKey.values()) {
    grouped[latest.cropId].push(previous ? { ...latest, previousPrice: previous.price } : { ...latest });
  }

  const states = {} as Record<CropId, CropMarketState>;
  for (const crop of RWANDAN_CROPS) {
    const cropRows = grouped[crop.id];
    const hubs: MarketHub[] = cropRows
      .map((row) => ({
        market: row.market,
        location: row.location || row.market,
        price: row.price,
        trend: row.previousPrice ? ((row.price - row.previousPrice) / row.previousPrice) * 100 : 0,
      }))
      .sort((a, b) => b.price - a.price);

    const prices = hubs.map((h) => h.price);
    const averagePrice = prices.length ? Math.round(prices.reduce((s, p) => s + p, 0) / prices.length) : 0;
    const highestPrice = prices.length ? Math.max(...prices) : 0;
    const lowestPrice = prices.length ? Math.min(...prices) : 0;
    const latestDate = cropRows.map((r) => parseDate(r.date)).filter((d): d is Date => d !== null).sort((a, b) => b.getTime() - a.getTime())[0];
    const series = cropRows.map((r) => r.price).sort((a, b) => a - b).slice(0, 12);

    states[crop.id] = {
      cropId: crop.id,
      hubs,
      averagePrice,
      highestPrice,
      lowestPrice,
      lastUpdated: latestDate ? formatDate(latestDate) : '',
      series: series.length > 1 ? series : [averagePrice, averagePrice],
    };
  }
  return states;
}

// ── shared color tokens (soft white-blue) ──
const C = {
  ink: '#334155',        // main text
  inkDeep: '#1e293b',    // headings
  sub: '#64748b',        // secondary text
  faint: '#94a3b8',      // tertiary
  blue: '#3b82f6',       // primary accent
  blueDeep: '#2563eb',   // hover/active
  blueSoft: '#93c5fd',   // light accent
  blueTint: '#dbeafe',   // chip bg
  blueMist: '#eff6ff',   // lightest bg
  card: '#ffffff',
  border: '#e2e8f0',
  borderBlue: '#bfdbfe',
};

export function AgriMarketView() {
  const [selectedCrop, setSelectedCrop] = useState<CropId | null>(null);
  const [cropSearch, setCropSearch] = useState('');
  const [marketStates, setMarketStates] = useState<Record<CropId, CropMarketState> | null>(null);
  const [loading, setLoading] = useState(true);
  const [fallback, setFallback] = useState(false);
  const [updateTimestamp, setUpdateTimestamp] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('All');

  useEffect(() => {
    let canceled = false;
    const fetchPrices = async () => {
      setLoading(true);
      try {
        const response = await fetch(DATA_SOURCE_URL);
        if (!response.ok) throw new Error('fetch failed');
        const csv = await response.text();
        const lines = csv.split(/\r?\n/).filter((l) => l.trim().length > 0);
        if (lines.length < 2) throw new Error('empty');
        const header = splitCsvLine(lines[0]);
        const norm = header.map((h) => h.trim().toLowerCase().replace(/\s+/g, '_'));
        const parsed: LivePriceRow[] = [];
        for (const line of lines.slice(1)) {
          const vals = splitCsvLine(line);
          if (vals.length !== norm.length) continue;
          const rec = norm.reduce<Record<string, string>>((acc, k, i) => { acc[k] = vals[i] ?? ''; return acc; }, {});
          const commodity = rec.commodity || rec.commodity_name || rec.item || rec.item_name;
          const cropId = mapCommodityToCrop(commodity);
          if (!cropId) continue;
          const unit = (rec.unit || rec.unit_of_measure || '').toLowerCase();
          const currency = (rec.currency || rec.local_currency || '').toLowerCase();
          if (!currency.includes('rwf') || !unit.includes('kg')) continue;
          const priceValue = Number((rec.price || rec.value || '').replace(/[^0-9.\-]/g, ''));
          if (!priceValue || Number.isNaN(priceValue)) continue;
          const date = rec.date || rec.reference_date || '';
          const market = rec.market || rec.market_name || rec.location || '';
          const location = rec.location || rec.admin_area || market;
          if (!market) continue;
          parsed.push({ date, market, location, cropId, price: priceValue });
        }
        const remote = buildMarketStates(parsed);
        if (!canceled && Object.values(remote).some((e) => e.hubs.length > 0)) {
          setMarketStates(remote);
          setFallback(false);
        } else {
          throw new Error('no rows');
        }
      } catch {
        if (!canceled) {
          setMarketStates(buildMarketStates(createFallbackMarketRows()));
          setFallback(true);
        }
      } finally {
        if (!canceled) {
          setUpdateTimestamp(new Date().toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }));
          setLoading(false);
        }
      }
    };
    fetchPrices();
    return () => { canceled = true; };
  }, []);

  const selectedMeta = selectedCrop ? RWANDAN_CROPS.find((c) => c.id === selectedCrop) : null;
  const selectedState = selectedCrop ? marketStates?.[selectedCrop] : null;

  const filteredCrops = useMemo(() => {
    let list = RWANDAN_CROPS;
    if (activeCategory !== 'All') list = list.filter((c) => c.category === activeCategory);
    if (cropSearch.trim()) {
      const s = cropSearch.trim().toLowerCase();
      list = list.filter((c) => c.name.toLowerCase().includes(s) || c.english.toLowerCase().includes(s) || c.id.includes(s));
    }
    return list;
  }, [activeCategory, cropSearch]);

  const sortedCrops = useMemo(() => {
    return [...filteredCrops].sort((a, b) => {
      const pa = marketStates?.[a.id]?.averagePrice ?? 0;
      const pb = marketStates?.[b.id]?.averagePrice ?? 0;
      return pb - pa;
    });
  }, [filteredCrops, marketStates]);

  // ── DETAIL PAGE ──
  if (selectedCrop && selectedMeta && selectedState) {
    return (
      <div className="min-h-screen w-full" style={{ background: 'linear-gradient(160deg, #f0f7ff 0%, #f8fbff 50%, #ffffff 100%)' }}>
        {/* soft ambient */}
        <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
          <div className="absolute -top-32 right-1/4 h-[32rem] w-[32rem] rounded-full opacity-30" style={{ background: 'radial-gradient(circle, #bfdbfe, transparent 70%)' }} />
          <div className="absolute bottom-0 -left-20 h-[28rem] w-[28rem] rounded-full opacity-20" style={{ background: 'radial-gradient(circle, #93c5fd, transparent 70%)' }} />
        </div>

        {/* Header with back button */}
        <header className="sticky top-0 z-30 border-b" style={{ borderColor: C.borderBlue, background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(20px)' }}>
          <div className="mx-auto flex max-w-[900px] items-center gap-4 px-6 py-4">
            <button
              onClick={() => setSelectedCrop(null)}
              className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition"
              style={{ color: C.blueDeep, background: C.blueMist, border: `1px solid ${C.borderBlue}` }}
              onMouseEnter={(e) => { e.currentTarget.style.background = C.blueTint; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = C.blueMist; }}
            >
              <ArrowLeft className="h-4 w-4" /> Back
            </button>
            <div className="flex items-center gap-2">
              <span className="text-2xl">{selectedMeta.emoji}</span>
              <h1 className="text-lg font-black" style={{ color: C.inkDeep }}>{selectedMeta.name}</h1>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-[900px] px-6 py-8">
          {/* Hero card */}
          <div className="relative overflow-hidden rounded-3xl p-7"
            style={{
              background: 'linear-gradient(135deg, #eff6ff 0%, #ffffff 100%)',
              border: `1.5px solid ${C.borderBlue}`,
              boxShadow: '0 8px 32px rgba(59,130,246,0.10)',
            }}>
            <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full opacity-30"
              style={{ background: 'radial-gradient(circle, #bfdbfe, transparent 70%)' }} />

            <div className="relative flex items-start justify-between gap-6">
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.3em]" style={{ color: C.blue }}>
                  {selectedMeta.category}
                </p>
                <h2 className="mt-2 text-4xl font-black tracking-tight" style={{ color: C.inkDeep }}>{selectedMeta.name}</h2>
                <p className="mt-1 text-sm font-medium" style={{ color: C.sub }}>{selectedMeta.english}</p>
              </div>
              <div className="text-right">
                <p className="text-[11px] font-black uppercase tracking-widest" style={{ color: C.faint }}>Avg Price</p>
                <p className="mt-1 text-5xl font-black" style={{ color: C.blueDeep }}>
                  {selectedState.averagePrice.toLocaleString()}
                </p>
                <p className="text-xs font-semibold" style={{ color: C.faint }}>RWF / kg</p>
              </div>
            </div>

            {/* Stat tiles */}
            <div className="relative mt-6 grid grid-cols-3 gap-3">
              <DetailStatTile label="Highest" value={selectedState.highestPrice.toLocaleString()} icon={<ArrowUpRight className="h-4 w-4" />} accent="#10b981" />
              <DetailStatTile label="Lowest" value={selectedState.lowestPrice.toLocaleString()} icon={<ArrowDownRight className="h-4 w-4" />} accent="#f43f5e" />
              <DetailStatTile label="Markets" value={String(selectedState.hubs.length)} icon={<Layers className="h-4 w-4" />} accent={C.blue} />
            </div>

            <div className="relative mt-5 flex items-center gap-1.5 text-xs font-medium" style={{ color: C.faint }}>
              <Clock className="h-3.5 w-3.5" />
              Last updated {selectedState.lastUpdated || updateTimestamp}
            </div>
          </div>

          {/* Market breakdown */}
          <div className="mt-5 rounded-3xl p-6"
            style={{ background: C.card, border: `1.5px solid ${C.border}`, boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-base font-black" style={{ color: C.inkDeep }}>Market breakdown</h3>
              <span className="text-xs font-semibold" style={{ color: C.faint }}>Sorted highest to lowest</span>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              {selectedState.hubs.map((hub) => {
                const max = selectedState.highestPrice || 1;
                const pct = (hub.price / max) * 100;
                return (
                  <div key={hub.market} className="rounded-2xl p-3.5 transition"
                    style={{ background: C.blueMist, border: `1px solid ${C.border}` }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = C.blueSoft; e.currentTarget.style.background = C.blueTint; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.background = C.blueMist; }}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold" style={{ color: C.inkDeep }}>{hub.market}</p>
                        <p className="text-xs font-medium" style={{ color: C.faint }}>{hub.location}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-black" style={{ color: C.blueDeep }}>{hub.price.toLocaleString()}</span>
                        <span className="text-[11px] font-medium" style={{ color: C.faint }}>RWF/kg</span>
                        <TrendBadge trend={hub.trend} />
                      </div>
                    </div>
                    <div className="mt-2.5 h-1.5 overflow-hidden rounded-full" style={{ background: C.blueTint }}>
                      <div className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${C.blue}, ${C.blueSoft})` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </main>
      </div>
    );
  }

  // ── LIST PAGE (full screen) ──
  return (
    <div className="min-h-screen w-full" style={{ background: 'linear-gradient(160deg, #f0f7ff 0%, #f8fbff 50%, #ffffff 100%)' }}>
      {/* soft ambient */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 -left-32 h-[38rem] w-[38rem] rounded-full opacity-25" style={{ background: 'radial-gradient(circle, #bfdbfe, transparent 70%)' }} />
        <div className="absolute top-1/2 -right-32 h-[32rem] w-[32rem] rounded-full opacity-20" style={{ background: 'radial-gradient(circle, #93c5fd, transparent 70%)' }} />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-30 border-b" style={{ borderColor: C.borderBlue, background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(20px)' }}>
        <div className="mx-auto flex max-w-[1100px] items-center justify-between gap-4 px-6 py-4">
          <div>
            <h1 className="text-xl font-black tracking-tight" style={{ color: C.inkDeep }}>
              AgriMarket <span style={{ color: C.blue }}>Hub</span>
            </h1>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em]" style={{ color: C.faint }}>
              Rwanda Commodity Intelligence
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-2 rounded-full px-3 py-1.5 shadow-sm sm:flex"
              style={{ border: `1px solid ${C.borderBlue}`, background: C.blueMist }}>
              <span className={`h-2 w-2 rounded-full ${loading ? 'bg-amber-400 animate-pulse' : fallback ? 'bg-amber-400' : 'animate-pulse'}`}
                style={!loading && !fallback ? { background: C.blue } : undefined} />
              <span className="text-xs font-semibold" style={{ color: C.blueDeep }}>
                {loading ? 'Syncing…' : fallback ? 'Offline sample data' : 'Live MINAGRI / WFP'}
              </span>
            </div>
            <div className="flex items-center gap-1.5 rounded-full px-3 py-1.5 shadow-sm"
              style={{ border: `1px solid ${C.borderBlue}`, background: C.blueMist }}>
              <Clock className="h-3.5 w-3.5" style={{ color: C.blue }} />
              <span className="text-xs font-medium" style={{ color: C.sub }}>{updateTimestamp || 'Loading…'}</span>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1100px] px-6 py-8">
        {/* Title row */}
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-3xl font-black tracking-tight" style={{ color: C.inkDeep }}>Commodity Prices</h2>
            <p className="mt-1 text-sm font-medium" style={{ color: C.faint }}>Average price per kg · click any crop to see details</p>
          </div>
          <span className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold"
            style={{ background: C.blueTint, color: C.blueDeep, border: `1px solid ${C.blueSoft}` }}>
            <Activity className="h-3.5 w-3.5" /> {RWANDAN_CROPS.length} crops
          </span>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: C.blueSoft }} />
          <input
            value={cropSearch}
            onChange={(e) => setCropSearch(e.target.value)}
            placeholder="Search crops by name…"
            className="w-full rounded-2xl py-3 pl-10 pr-4 text-sm font-medium outline-none transition"
            style={{ border: `1.5px solid ${C.borderBlue}`, background: C.card, color: C.inkDeep, boxShadow: '0 2px 8px rgba(59,130,246,0.06)' }}
            onFocus={(e) => { e.currentTarget.style.borderColor = C.blue; e.currentTarget.style.boxShadow = `0 0 0 3px rgba(59,130,246,0.10)`; }}
            onBlur={(e) => { e.currentTarget.style.borderColor = C.borderBlue; e.currentTarget.style.boxShadow = '0 2px 8px rgba(59,130,246,0.06)'; }}
          />
        </div>

        {/* Category chips */}
        <div className="mb-6 flex flex-wrap gap-2">
          {['All', ...CROP_CATEGORIES].map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className="rounded-full px-3.5 py-1.5 text-xs font-bold transition-all"
              style={
                activeCategory === cat
                  ? { background: C.blue, color: '#ffffff', boxShadow: '0 3px 10px rgba(59,130,246,0.20)' }
                  : { background: C.card, color: C.blue, border: `1.5px solid ${C.borderBlue}` }
              }
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Crop grid — 2 columns on desktop */}
        <div className="grid gap-3 sm:grid-cols-2">
          {loading
            ? Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-20 animate-pulse rounded-2xl" style={{ background: `${C.blueTint}55`, border: `1px solid ${C.borderBlue}` }} />
              ))
            : sortedCrops.map((crop) => {
                const state = marketStates?.[crop.id];
                return (
                  <button
                    key={crop.id}
                    onClick={() => setSelectedCrop(crop.id)}
                    className="group flex w-full items-center gap-4 rounded-2xl p-4 text-left transition-all duration-200"
                    style={{ background: C.card, border: `1.5px solid ${C.border}`, boxShadow: '0 1px 4px rgba(0,0,0,0.03)' }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = C.blueSoft; e.currentTarget.style.boxShadow = '0 4px 16px rgba(59,130,246,0.10)'; e.currentTarget.style.background = C.blueMist; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.03)'; e.currentTarget.style.background = C.card; }}
                  >
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-2xl"
                      style={{ background: C.blueMist }}>
                      {crop.emoji}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="truncate text-sm font-bold" style={{ color: C.inkDeep }}>{crop.name}</p>
                        <span className="hidden text-xs sm:inline" style={{ color: C.faint }}>· {crop.english}</span>
                      </div>
                      <p className="mt-0.5 text-xs font-medium" style={{ color: C.faint }}>{crop.category}</p>
                    </div>

                    <div className="hidden w-20 sm:block" style={{ color: C.blue }}>
                      {state && <Sparkline data={state.series} className="h-8 w-full" />}
                    </div>

                    <div className="text-right">
                      <p className="text-base font-black" style={{ color: C.inkDeep }}>
                        {state ? state.averagePrice.toLocaleString() : '—'}
                      </p>
                      <p className="text-[11px] font-medium" style={{ color: C.faint }}>RWF / kg</p>
                    </div>
                  </button>
                );
              })}
        </div>
      </main>
    </div>
  );
}

function DetailStatTile({ label, value, icon, accent }: { label: string; value: string; icon: React.ReactNode; accent: string }) {
  return (
    <div className="rounded-2xl p-3.5" style={{ background: C.card, border: `1px solid ${C.border}` }}>
      <div className="flex items-center gap-1.5" style={{ color: accent }}>
        {icon}
        <span className="text-[11px] font-black uppercase tracking-wider" style={{ color: C.faint }}>{label}</span>
      </div>
      <p className="mt-1.5 text-2xl font-black" style={{ color: C.inkDeep }}>{value}</p>
    </div>
  );
}

function TrendBadge({ trend }: { trend: number }) {
  const rounded = Math.round(trend * 10) / 10;
  if (Math.abs(rounded) < 0.1) {
    return (
      <span className="flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-[11px] font-semibold"
        style={{ background: '#f1f5f9', color: '#94a3b8' }}>
        <Minus className="h-3 w-3" /> 0%
      </span>
    );
  }
  const up = rounded > 0;
  return (
    <span className="flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-[11px] font-bold"
      style={up
        ? { background: C.blueTint, color: C.blueDeep }
        : { background: '#fee2e2', color: '#dc2626' }}>
      {up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
      {up ? '+' : ''}{rounded}%
    </span>
  );
}
