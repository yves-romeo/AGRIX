import { useState } from 'react';
import {
  ShoppingBag,
  ChevronDown,
  Search,
  TrendingUp,
  Calculator,
  BadgeCheck,
  Star,
  MapPin,
  Clock,
  Send,
  Store,
  Scale,
  Layers,
  ArrowRight,
} from 'lucide-react';
import {
  RWANDAN_CROPS,
  MARKET_DATA,
  EHAHO_BUYERS,
  type EhahoBuyer,
} from '../lib/rwandaData';
import { SectionCard, Sparkline } from '../components/ui';
import { useLang } from '../lib/i18n';

type Unit = 'Kg' | 'Tons' | 'Sacks';

const UNIT_TO_KG: Record<Unit, number> = {
  Kg: 1,
  Tons: 1000,
  Sacks: 50,
};

const LOCATIONS = ['Kigali', 'Musanze', 'Huye', 'Bugesera', 'Rubavu', 'Nyabugogo'];

export function AgriMarketView() {
  const { t } = useLang();
  const [cropId, setCropId] = useState('');
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState<Unit>('Kg');
  const [location, setLocation] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cropId || !quantity || !location) return;
    setSubmitted(true);
  };

  const crop = RWANDAN_CROPS.find((c) => c.id === cropId);
  const market = cropId ? MARKET_DATA[cropId] : null;
  const qtyKg = quantity ? Number(quantity) * UNIT_TO_KG[unit] : 0;
  const totalValue = market ? qtyKg * market.averagePrice : 0;
  const matchedBuyers = cropId ? EHAHO_BUYERS.filter((b) => b.crops.includes(cropId)) : [];

  return (
    <div className="space-y-5">
      {/* Top: input form */}
      <SectionCard
        title={t.amTitle}
        subtitle={t.amSubtitle}
        action={<span className="chip bg-forest-50 text-forest-700"><Store className="h-3.5 w-3.5" /> eHaho · TangaBid</span>}
      >
        <form onSubmit={handleSubmit} className="grid sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_1fr_auto] gap-3 items-end">
          <Field label={t.amCrop} icon={Layers}>
            <Select value={cropId} onChange={(v) => { setCropId(v); setSubmitted(false); }} placeholder={t.amSelectCrop}>
              {RWANDAN_CROPS.map((c) => (
                <option key={c.id} value={c.id}>{c.emoji}  {c.name}</option>
              ))}
            </Select>
          </Field>

          <Field label={t.amQuantity} icon={Scale}>
            <input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => { setQuantity(e.target.value); setSubmitted(false); }}
              placeholder="e.g. 500"
              required
              className="w-full rounded-xl border border-slate2-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-forest-500 focus:border-forest-500 transition-all"
            />
          </Field>

          <Field label={t.amUnit}>
            <Select value={unit} onChange={(v) => setUnit(v as Unit)}>
              <option value="Kg">Kg</option>
              <option value="Tons">Tons</option>
              <option value="Sacks">Sacks</option>
            </Select>
          </Field>

          <Field label={t.amLocation} icon={MapPin}>
            <Select value={location} onChange={(v) => { setLocation(v); setSubmitted(false); }} placeholder={t.amSelectCrop}>
              {LOCATIONS.map((l) => (
                <option key={l} value={l}>{l}</option>
              ))}
            </Select>
          </Field>

          <button type="submit" className="btn-primary h-[46px] whitespace-nowrap">
            <Search className="h-4 w-4" /> {t.amSearch}
          </button>
        </form>
      </SectionCard>

      {submitted && crop && market ? (
        <div className="space-y-5 animate-fade-in">
          {/* Summary header */}
          <div className="card p-4 sm:p-5 bg-gradient-to-br from-forest-950 to-forest-800 text-white border-forest-950">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="grid place-items-center h-12 w-12 rounded-xl bg-white/10 text-2xl">{crop.emoji}</div>
                <div>
                  <p className="font-display font-bold text-lg leading-tight">{crop.name}</p>
                  <p className="text-xs text-forest-300">
                    {crop.english} · {Number(quantity).toLocaleString()} {unit} ({qtyKg.toLocaleString()} kg) · {location}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[11px] text-forest-300">{t.amEstimatedTotal}</p>
                <p className="font-display font-extrabold text-2xl text-accent-lime">
                  {totalValue.toLocaleString()} <span className="text-sm font-semibold">RWF</span>
                </p>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-5">
            {/* TangaBid Price Intelligence */}
            <SectionCard
              title={t.amTangaBid}
              subtitle="Verified market rates across local hubs"
              action={<span className="chip bg-sky-50 text-sky-700"><TrendingUp className="h-3.5 w-3.5" /> {t.amLive}</span>}
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-xl bg-forest-50/60 border border-forest-100">
                  <div>
                    <p className="text-[11px] uppercase tracking-wider text-slate2-500 font-semibold">{t.amAvgPrice}</p>
                    <p className="font-display font-bold text-2xl text-forest-700">
                      {market.averagePrice.toLocaleString()} <span className="text-sm font-semibold text-slate2-500">{market.unit}</span>
                    </p>
                  </div>
                  <Sparkline data={market.trend} color="#2f8d62" width={90} height={36} />
                </div>

                <div className="overflow-hidden rounded-xl border border-slate2-200">
                  <table className="w-full text-sm">
                    <thead className="bg-slate2-50 text-[11px] uppercase tracking-wider text-slate2-500">
                      <tr>
                        <th className="text-left font-semibold px-3 py-2">{t.amHub}</th>
                        <th className="text-left font-semibold px-3 py-2 hidden sm:table-cell">{t.amHubLocation}</th>
                        <th className="text-right font-semibold px-3 py-2">{t.amPricePerKg}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate2-100">
                      {market.hubs.map((h) => (
                        <tr key={h.name} className="hover:bg-slate2-50 transition-colors">
                          <td className="px-3 py-2.5 font-medium text-slate2-800">{h.name}</td>
                          <td className="px-3 py-2.5 text-slate2-500 hidden sm:table-cell">{h.location}</td>
                          <td className="px-3 py-2.5 text-right font-semibold text-slate2-900">{h.pricePerKg.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="p-4 rounded-xl border-2 border-forest-200 bg-forest-50/40">
                  <p className="flex items-center gap-1.5 text-xs font-bold text-forest-700 uppercase tracking-wider mb-3">
                    <Calculator className="h-4 w-4" /> {t.amTotalEval}
                  </p>
                  <div className="flex items-center gap-2 text-sm text-slate2-700 flex-wrap">
                    <span className="font-semibold">{qtyKg.toLocaleString()} kg</span>
                    <span className="text-slate2-400">×</span>
                    <span className="font-semibold">{market.averagePrice.toLocaleString()} RWF/kg</span>
                    <ArrowRight className="h-4 w-4 text-forest-600" />
                    <span className="font-display font-extrabold text-forest-700 text-lg">
                      {totalValue.toLocaleString()} RWF
                    </span>
                  </div>
                </div>
              </div>
            </SectionCard>

            {/* eHaho Buyer Network */}
            <SectionCard
              title={t.amBuyers}
              subtitle={`${matchedBuyers.length} ${t.amVerified.toLowerCase()} · ${crop.name}`}
              action={<span className="chip bg-forest-50 text-forest-700"><BadgeCheck className="h-3.5 w-3.5" /> {t.amVerified}</span>}
            >
              {matchedBuyers.length === 0 ? (
                <div className="text-center py-8 px-4 rounded-xl border border-dashed border-slate2-200">
                  <p className="text-sm text-slate2-500">{t.amNoBuyers}</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {matchedBuyers.map((b) => (
                    <BuyerCard key={b.id} buyer={b} qtyKg={qtyKg} t={t} />
                  ))}
                </div>
              )}
            </SectionCard>
          </div>
        </div>
      ) : (
        <div className="card p-10 text-center">
          <div className="grid place-items-center h-14 w-14 rounded-2xl bg-forest-50 text-forest-600 mx-auto mb-4">
            <ShoppingBag className="h-7 w-7" />
          </div>
          <p className="font-display font-semibold text-slate2-900">{t.amEmptyTitle}</p>
          <p className="text-sm text-slate2-500 mt-1 max-w-md mx-auto">{t.amEmptyBody}</p>
        </div>
      )}
    </div>
  );
}

function Field({ label, icon: Icon, children }: { label: string; icon?: typeof Layers; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-[11px] font-semibold text-slate2-600 mb-1 flex items-center gap-1">
        {Icon && <Icon className="h-3 w-3" />} {label}
      </label>
      {children}
    </div>
  );
}

function Select({ value, onChange, placeholder, children }: { value: string; onChange: (v: string) => void; placeholder?: string; children: React.ReactNode }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={!placeholder}
        className="w-full appearance-none rounded-xl border border-slate2-200 px-3 py-2.5 pr-9 text-sm font-medium text-slate2-800 focus:outline-none focus:ring-2 focus:ring-forest-500 focus:border-forest-500 transition-all bg-white"
      >
        {placeholder && (
          <option value="" disabled>{placeholder}</option>
        )}
        {children}
      </select>
      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate2-400 pointer-events-none" />
    </div>
  );
}

function BuyerCard({ buyer: b, qtyKg, t }: { buyer: EhahoBuyer; qtyKg: number; t: ReturnType<typeof useLang>['t'] }) {
  const [sent, setSent] = useState(false);
  const meetsMin = qtyKg >= b.minVolumeKg;
  return (
    <div className="p-4 rounded-xl border border-slate2-200 hover:border-forest-300 hover:shadow-soft transition-all">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="flex items-start gap-3">
          <div className="grid place-items-center h-11 w-11 rounded-xl bg-forest-600 text-white font-display font-bold text-lg shrink-0">
            {b.name.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <p className="font-display font-bold text-slate2-900">{b.name}</p>
              {b.verified && <BadgeCheck className="h-4 w-4 text-forest-600" />}
            </div>
            <div className="flex items-center gap-3 text-[11px] text-slate2-500 mt-0.5">
              <span className="flex items-center gap-0.5"><MapPin className="h-3 w-3" /> {b.location}</span>
              <span className="flex items-center gap-0.5"><Star className="h-3 w-3 text-amber-500 fill-amber-500" /> {b.rating}</span>
              <span className="flex items-center gap-0.5"><Clock className="h-3 w-3" /> {b.responseTime}</span>
            </div>
          </div>
        </div>
        <button
          onClick={() => setSent(true)}
          disabled={sent}
          className={`btn-primary !py-2 !px-3 text-xs whitespace-nowrap ${!meetsMin ? 'opacity-60' : ''}`}
        >
          {sent ? <>✓ {t.amOfferSent}</> : <><Send className="h-3.5 w-3.5" /> {t.amSubmitOffer}</>}
        </button>
      </div>
      <div className="mt-3 pt-3 border-t border-slate2-100 flex flex-wrap items-center gap-2">
        <span className="chip bg-slate2-100 text-slate2-700"><Clock className="h-3 w-3" /> {b.orderCycle}</span>
        <span className="chip bg-forest-50 text-forest-700">{b.priceOffer}</span>
        <span className={`chip ${meetsMin ? 'bg-forest-50 text-forest-700' : 'bg-amber-50 text-amber-700'}`}>
          {t.amMinVolume}: {b.minVolumeKg.toLocaleString()} kg
        </span>
      </div>
    </div>
  );
}
