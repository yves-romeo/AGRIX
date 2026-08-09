import { useState, useEffect } from 'react';
import { Cpu, Droplets, Thermometer, Wind, Bluetooth, Plus, Activity, Clock } from 'lucide-react';
import { SectionCard, Gauge } from '../components/ui';
import { useLang } from '../lib/i18n';
import { INITIAL_TELEMETRY } from '../lib/mockData';

export function TelemetryView() {
  const { t } = useLang();
  const [paired, setPaired] = useState(true);
  const [readings, setReadings] = useState(INITIAL_TELEMETRY);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  useEffect(() => {
    if (!paired) return;
    const id = setInterval(() => {
      setReadings((r) => ({
        soilMoisture: clamp(r.soilMoisture + jitter(2), 20, 80),
        temperature: clamp(r.temperature + jitter(0.8), 15, 35),
        humidity: clamp(r.humidity + jitter(2), 30, 90),
        ph: r.ph,
        lightIntensity: r.lightIntensity,
        windSpeed: clamp(r.windSpeed + jitter(1), 0, 25),
      }));
      setLastUpdate(new Date());
    }, 3000);
    return () => clearInterval(id);
  }, [paired]);

  const cards = [
    {
      key: 'soil',
      icon: Droplets,
      label: t.telSoil,
      value: readings.soilMoisture,
      unit: '%',
      color: '#2f8d62',
      max: 100,
    },
    {
      key: 'temp',
      icon: Thermometer,
      label: t.telTemp,
      value: readings.temperature,
      unit: '°C',
      color: '#f59e0b',
      max: 40,
    },
    {
      key: 'humidity',
      icon: Wind,
      label: t.telHumidity,
      value: readings.humidity,
      unit: '%',
      color: '#0ea5e9',
      max: 100,
    },
  ];

  return (
    <div className="space-y-5">
      {/* Status bar */}
      <div className="card p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className={`grid place-items-center h-11 w-11 rounded-xl ${paired ? 'bg-forest-50 text-forest-600' : 'bg-slate2-100 text-slate2-400'}`}>
            <Cpu className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span
                className={`h-2 w-2 rounded-full ${paired ? 'bg-forest-500 animate-pulse-dot' : 'bg-slate2-300'}`}
              />
              <p className="font-display font-bold text-slate2-900 text-sm">
                {paired ? t.telConnected : t.telDisconnected}
              </p>
            </div>
            <p className="text-[11px] text-slate2-500 mt-0.5 flex items-center gap-1">
              <Clock className="h-3 w-3" /> {t.telLastReading}: {lastUpdate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </p>
          </div>
        </div>
        <button
          onClick={() => {
            setPaired((p) => !p);
            setReadings(INITIAL_TELEMETRY);
          }}
          className={paired ? 'btn-ghost' : 'btn-primary'}
        >
          {paired ? (
            <>
              <Bluetooth className="h-4 w-4" /> {t.telPaired}
            </>
          ) : (
            <>
              <Plus className="h-4 w-4" /> {t.telPairDevice}
            </>
          )}
        </button>
      </div>

      {/* Telemetry cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <SectionCard
              key={c.key}
              title={c.label}
              action={<Icon className="h-4 w-4" style={{ color: c.color }} />}
            >
              <div className="flex flex-col items-center py-2">
                <Gauge value={c.value} max={c.max} label={c.label} unit={c.unit} color={c.color} />
                <div className="mt-3 flex items-center gap-1.5 text-[11px] text-slate2-500">
                  <Activity className="h-3 w-3" />
                  <span>{paired ? 'Streaming · 3s interval' : 'Paused'}</span>
                </div>
              </div>
            </SectionCard>
          );
        })}
      </div>

      {/* Secondary metrics */}
      <SectionCard title={t.telStatus} subtitle="AgroNode-v1 sensor array">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <MiniMetric icon={Activity} label="pH" value={readings.ph.toFixed(1)} />
          <MiniMetric icon={Droplets} label="Light (lux)" value={readings.lightIntensity.toLocaleString()} />
          <MiniMetric icon={Wind} label="Wind (m/s)" value={readings.windSpeed.toFixed(1)} />
          <MiniMetric icon={Cpu} label="Battery" value="87%" />
        </div>
      </SectionCard>
    </div>
  );
}

function MiniMetric({ icon: Icon, label, value }: { icon: typeof Activity; label: string; value: string }) {
  return (
    <div className="p-3 rounded-xl border border-slate2-200 bg-slate2-50/50">
      <div className="flex items-center gap-1.5 text-[11px] text-slate2-500 mb-1">
        <Icon className="h-3 w-3" /> {label}
      </div>
      <p className="font-display font-bold text-slate2-900 text-lg">{value}</p>
    </div>
  );
}

function jitter(amp: number) {
  return (Math.random() - 0.5) * 2 * amp;
}
function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}
