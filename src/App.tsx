import { useState, useEffect } from 'react';
import { NAV_ITEMS, type ViewId } from './lib/nav';
import { LanguageProvider, useLang } from './lib/i18n';
import { WelcomeView } from './views/WelcomeView';
import { AICenterView } from './views/AICenterView';
import { SatelliteView } from './views/SatelliteView';
import { TelemetryView } from './views/TelemetryView';
import { AgriMarketView } from './views/AgriMarketView';
import { Leaf, Menu, X, Languages } from 'lucide-react';

type Screen = 'welcome' | ViewId;

const NAV_LABELS: Record<ViewId, (t: ReturnType<typeof useLang>['t']) => { label: string; desc: string }> = {
  aicenter: (t) => ({ label: t.navAICenter, desc: t.navAICenterDesc }),
  satellite: (t) => ({ label: t.navLand, desc: t.navLandDesc }),
  telemetry: (t) => ({ label: t.navTelemetry, desc: t.navTelemetryDesc }),
  agrimarket: (t) => ({ label: t.navAgriMarket, desc: t.navAgriMarketDesc }),
};

function Workspace() {
  const { t, lang, toggle } = useLang();
  const [screen, setScreen] = useState<Screen>('welcome');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    setMobileNavOpen(false);
  }, [screen]);

  if (screen === 'welcome') {
    return <WelcomeView onEnter={(v) => setScreen(v)} />;
  }

  const view = screen as ViewId;
  const setView = (v: ViewId) => setScreen(v);
  const goHome = () => {
    try {
      localStorage.removeItem('agriX_saved_field_boundary');
    } catch {
      /* ignore */
    }
    setScreen('welcome');
  };
  const active = NAV_LABELS[view](t);

  return (
    <div className="min-h-screen bg-white text-slate2-800">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex fixed inset-y-0 left-0 w-64 flex-col border-r border-slate2-200 bg-white">
        <div className="flex items-center gap-2.5 px-5 h-16 border-b border-slate2-200">
          <button onClick={goHome} className="flex items-center gap-2.5 group">
            <div className="grid place-items-center h-9 w-9 rounded-xl bg-gradient-to-br from-forest-500 to-forest-700 text-white shadow-soft">
              <Leaf className="h-5 w-5" />
            </div>
            <div className="text-left">
              <p className="font-display font-extrabold text-slate2-900 leading-tight tracking-tight">{t.brand}</p>
              <p className="text-[11px] text-slate2-500 font-medium">{t.tagline}</p>
            </div>
          </button>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {/* Home tab at the top */}
          <button
            onClick={goHome}
            className={`w-full group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
              false
                ? 'bg-forest-50 text-forest-800 shadow-soft'
                : 'text-slate2-600 hover:bg-slate2-50 hover:text-slate2-900'
            }`}
          >
            <span className="grid place-items-center h-9 w-9 rounded-lg bg-slate2-100 text-slate2-500 group-hover:bg-slate2-200">
              <Leaf className="h-4.5 w-4.5" strokeWidth={2} />
            </span>
            <span className="flex flex-col items-start">
              <span className="font-semibold leading-tight">{lang === 'en' ? 'Home' : 'Ahabanza'}</span>
              <span className="text-[11px] text-slate2-400 leading-tight">{lang === 'en' ? 'Welcome page' : 'Paji yo kwakirwa'}</span>
            </span>
          </button>

          <div className="my-2 border-t border-slate2-100" />

          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = item.id === view;
            const labels = NAV_LABELS[item.id](t);
            return (
              <button
                key={item.id}
                onClick={() => setView(item.id)}
                className={`w-full group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-forest-50 text-forest-800 shadow-soft'
                    : 'text-slate2-600 hover:bg-slate2-50 hover:text-slate2-900'
                }`}
              >
                <span
                  className={`grid place-items-center h-9 w-9 rounded-lg transition-colors ${
                    isActive ? 'bg-forest-600 text-white' : 'bg-slate2-100 text-slate2-500 group-hover:bg-slate2-200'
                  }`}
                >
                  <Icon className="h-4.5 w-4.5" strokeWidth={2} />
                </span>
                <span className="flex flex-col items-start">
                  <span className="font-semibold leading-tight">{labels.label}</span>
                  <span className="text-[11px] text-slate2-400 leading-tight">{labels.desc}</span>
                </span>
              </button>
            );
          })}
        </nav>
        <div className="px-4 py-4 border-t border-slate2-200">
          <button
            onClick={toggle}
            className="w-full flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-semibold text-slate2-700 border border-slate2-200 hover:bg-slate2-50 transition-colors"
          >
            <span className="flex items-center gap-2">
              <Languages className="h-4 w-4 text-forest-600" />
              {lang === 'en' ? 'English' : 'Kinyarwanda'}
            </span>
            <span className="chip bg-forest-50 text-forest-700 text-[10px]">{lang.toUpperCase()}</span>
          </button>
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className="lg:hidden sticky top-0 z-30 flex items-center justify-between px-4 h-14 bg-white/95 backdrop-blur-md border-b border-slate2-200">
        <button onClick={goHome} className="flex items-center gap-2">
          <div className="grid place-items-center h-8 w-8 rounded-lg bg-gradient-to-br from-forest-500 to-forest-700 text-white">
            <Leaf className="h-4 w-4" />
          </div>
          <span className="font-display font-extrabold text-slate2-900 tracking-tight">{t.brand}</span>
        </button>
        <div className="flex items-center gap-1">
          <button
            onClick={toggle}
            className="flex items-center gap-1.5 h-9 px-2.5 rounded-lg text-slate2-600 hover:bg-slate2-100 transition-colors"
            aria-label={t.switchTo}
          >
            <Languages className="h-4 w-4" />
            <span className="text-xs font-bold text-forest-600">{lang.toUpperCase()}</span>
          </button>
          <button
            onClick={() => setMobileNavOpen((o) => !o)}
            className="grid place-items-center h-9 w-9 rounded-lg text-slate2-600 hover:bg-slate2-100"
            aria-label="Menu"
          >
            {mobileNavOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </header>

      {/* Mobile drawer */}
      {mobileNavOpen && (
        <div className="lg:hidden fixed inset-0 z-40">
          <div className="absolute inset-0 bg-slate2-900/40 backdrop-blur-sm" onClick={() => setMobileNavOpen(false)} />
          <div className="absolute top-14 right-0 w-72 max-w-[80vw] bg-white shadow-card rounded-bl-2xl rounded-br-2xl p-3 animate-fade-in">
            <p className="px-3 pt-2 pb-1 text-[11px] uppercase tracking-wider font-semibold text-slate2-400">Navigation</p>
            <button
              onClick={goHome}
              className="w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors text-slate2-700 hover:bg-slate2-50"
            >
              <Leaf className="h-4.5 w-4.5" />
              <span className="font-semibold">{lang === 'en' ? 'Home' : 'Ahabanza'}</span>
            </button>
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = item.id === view;
              const labels = NAV_LABELS[item.id](t);
              return (
                <button
                  key={item.id}
                  onClick={() => setView(item.id)}
                  className={`w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                    isActive ? 'bg-forest-50 text-forest-800' : 'text-slate2-700 hover:bg-slate2-50'
                  }`}
                >
                  <Icon className="h-4.5 w-4.5" />
                  <span className="font-semibold">{labels.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Main content */}
      <main className="lg:pl-64">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8 pb-24 lg:pb-12">
          {/* Desktop header */}
          <div className="mb-6 hidden lg:flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 text-xs font-medium text-slate2-400 mb-1">
                <button onClick={goHome} className="hover:text-forest-600 transition-colors">{t.brand}</button>
                <span>/</span>
                <span className="text-slate2-600">{active.label}</span>
              </div>
              <h1 className="font-display text-2xl font-bold text-slate2-900">{active.label}</h1>
              <p className="text-sm text-slate2-500 mt-0.5">{active.desc}</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={goHome}
                className="flex items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-semibold text-slate2-700 border border-slate2-200 hover:bg-slate2-50 transition-colors"
              >
                <Leaf className="h-4 w-4 text-forest-600" /> {lang === 'en' ? 'Home' : 'Ahabanza'}
              </button>
              <button
                onClick={toggle}
                className="flex items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-semibold text-slate2-700 border border-slate2-200 hover:bg-slate2-50 transition-colors"
              >
                <Languages className="h-4 w-4 text-forest-600" />
                <span>{lang === 'en' ? 'English' : 'Kinyarwanda'}</span>
                <span className="chip bg-forest-50 text-forest-700 text-[10px]">{lang.toUpperCase()}</span>
              </button>
            </div>
          </div>

          {/* Mobile page title */}
          <div className="lg:hidden mb-4 flex items-center justify-between">
            <div>
              <h1 className="font-display text-xl font-bold text-slate2-900">{active.label}</h1>
              <p className="text-xs text-slate2-500 mt-0.5">{active.desc}</p>
            </div>
            <button onClick={goHome} className="btn-ghost !py-1.5 !px-3 text-xs">
              <Leaf className="h-3.5 w-3.5" /> {lang === 'en' ? 'Home' : 'Ahabanza'}
            </button>
          </div>

          {/* View router */}
          <div key={view} className="animate-fade-in">
            {view === 'aicenter' && <AICenterView />}
            {view === 'satellite' && <SatelliteView />}
            {view === 'telemetry' && <TelemetryView />}
            {view === 'agrimarket' && <AgriMarketView />}
          </div>
        </div>
      </main>

      {/* Mobile bottom tab bar */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-30 bg-white/95 backdrop-blur-md border-t border-slate2-200 pb-[env(safe-area-inset-bottom)]">
        <div className="grid grid-cols-5 gap-0.5 px-1.5 py-1.5">
          <TabButton icon={Leaf} label={lang === 'en' ? 'Home' : 'Ahabanza'} isActive={false} onClick={goHome} />
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = item.id === view;
            const labels = NAV_LABELS[item.id](t);
            return (
              <TabButton
                key={item.id}
                icon={Icon}
                label={labels.label}
                isActive={isActive}
                onClick={() => setView(item.id)}
              />
            );
          })}
        </div>
      </nav>
    </div>
  );
}

function TabButton({ icon: Icon, label, isActive, onClick }: { icon: typeof Leaf; label: string; isActive: boolean; onClick: () => void }) {
  const short = label.length > 12 ? label.slice(0, 10) + '…' : label;
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center justify-center gap-0.5 py-1.5 rounded-lg transition-colors ${
        isActive ? 'text-forest-700' : 'text-slate2-400'
      }`}
    >
      <span className={`grid place-items-center h-7 w-7 rounded-lg transition-all ${isActive ? 'bg-forest-100 scale-110' : 'scale-100'}`}>
        <Icon className="h-4.5 w-4.5" strokeWidth={isActive ? 2.4 : 2} />
      </span>
      <span className={`text-[10px] font-medium ${isActive ? 'font-semibold' : ''}`}>{short}</span>
    </button>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <Workspace />
    </LanguageProvider>
  );
}
