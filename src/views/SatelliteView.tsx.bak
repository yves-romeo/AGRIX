import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Check,
  ChevronDown,
  Compass,
  HeartPulse,
  Locate,
  MapPin,
  Minus,
  PenTool,
  Plus,
  Ruler,
  Target,
  X,
} from 'lucide-react';
import { useLang } from '../lib/i18n';

/* ─────────────────────────────────────────────
   Global Leaflet type shim
───────────────────────────────────────────── */
declare global {
  interface Window {
    L: any;
  }
}

type LatLngTuple = [number, number];
type ViewMode = 'landing' | 'map';
type CropKey = 'maize' | 'potatoes' | 'beans';

/* ─────────────────────────────────────────────
   Crop configuration table
───────────────────────────────────────────── */
interface CropConfig {
  labelEn: string;
  labelRw: string;
  seedRate: number;
  npkRate: number;
  ureaRate: number;
}

const CROPS: Record<CropKey, CropConfig> = {
  maize: {
    labelEn: 'Maize (Ibigori)',
    labelRw: 'Ibigori (Maize)',
    seedRate: 25,
    npkRate: 100,
    ureaRate: 50,
  },
  potatoes: {
    labelEn: 'Potatoes (Ibirayi)',
    labelRw: 'Ibirayi (Potatoes)',
    seedRate: 2000,
    npkRate: 150,
    ureaRate: 0,
  },
  beans: {
    labelEn: 'Beans (Ubushyimbo)',
    labelRw: 'Ubushyimbo (Beans)',
    seedRate: 60,
    npkRate: 80,
    ureaRate: 0,
  },
};

/* ─────────────────────────────────────────────
   Area calculation (spherical shoelace)
───────────────────────────────────────────── */
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

/* ─────────────────────────────────────────────
   Inset polygon for dry-zone health overlay
───────────────────────────────────────────── */
function buildInsetPolygon(points: LatLngTuple[], ratio = 0.16): LatLngTuple[] {
  if (points.length < 3) return points;
  const cLat = points.reduce((s, [lat]) => s + lat, 0) / points.length;
  const cLng = points.reduce((s, [, lng]) => s + lng, 0) / points.length;
  return points.map(([lat, lng]) => [
    lat - (lat - cLat) * ratio,
    lng - (lng - cLng) * ratio,
  ] as LatLngTuple);
}

/* ─────────────────────────────────────────────
   Nominatim address label picker
───────────────────────────────────────────── */
function pickLabel(address: Record<string, string> | undefined, fallback: string): string {
  if (!address) return fallback;
  return (
    address.suburb ||
    address.neighbourhood ||
    address.county ||
    address.city ||
    address.town ||
    address.village ||
    address.hamlet ||
    fallback
  );
}

const BOUNDARY_STORAGE_KEY = 'agriX_saved_field_boundary';

function loadSavedBoundary() {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(BOUNDARY_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed.vertices) && parsed.vertices.length >= 3) {
      return parsed;
    }
  } catch {
    /* ignore */
  }
  return null;
}

/* ══════════════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════════════ */
export function SatelliteView() {
  const { t, lang } = useLang();

  /* refs */
  const mapRef          = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef  = useRef<any>(null);
  const overlayGroupRef = useRef<any>(null);
  const polygonLayerRef = useRef<any>(null);
  const toolActiveRef   = useRef(false);
  /** Set to false on unmount — prevents async state updates on dead components */
  const isMountedRef    = useRef(true);

  /* load saved boundary state across tab switches */
  const savedBoundary = useMemo(() => loadSavedBoundary(), []);

  /* view state */
  const [viewMode, setViewMode]         = useState<ViewMode>(savedBoundary ? 'map' : 'landing');
  const [searchInput, setSearchInput]   = useState('');
  const [searching, setSearching]       = useState(false);
  const [error, setError]               = useState<string | null>(null);
  const [center, setCenter]             = useState<LatLngTuple | null>(savedBoundary?.center || null);
  const [zoom, setZoom]                 = useState<number | null>(savedBoundary?.zoom || (savedBoundary ? 18 : null));
  const [locationLabel, setLocationLabel] = useState<string>(savedBoundary?.locationLabel || 'Rwanda');

  /* drawing state */
  const [toolActive, setToolActive]             = useState(false);
  const [vertices, setVertices]                 = useState<LatLngTuple[]>(savedBoundary?.vertices || []);
  const [boundaryClosed, setBoundaryClosed]     = useState(Boolean(savedBoundary?.boundaryClosed && savedBoundary?.vertices?.length >= 3));
  const [interactionLocked, setInteractionLocked] = useState(Boolean(savedBoundary?.boundaryClosed && savedBoundary?.vertices?.length >= 3));

  /* analytics drawer */
  const [drawerOpen, setDrawerOpen]                   = useState(Boolean(savedBoundary?.boundaryClosed));
  const [healthOverlayEnabled, setHealthOverlayEnabled] = useState(false);
  const [selectedCrop, setSelectedCrop]               = useState<CropKey>('maize');
  const [cropDropOpen, setCropDropOpen]               = useState(false);

  /* live sensor simulation */
  const [ndvi, setNdvi]         = useState(0.76);
  const [moisture, setMoisture] = useState(24);

  /* ── derived values ── */
  const areaHa = useMemo(() => calculateAreaHa(vertices), [vertices]);
  const areaAc = areaHa * 2.471;

  const healthLabel   = ndvi >= 0.7 ? t.satHighChloro   : ndvi >= 0.5 ? t.satModerate : t.satDeficiency;
  const moistureLabel = moisture >= 35 ? t.satOptimal    : moisture >= 20 ? t.satModerate : t.satDeficiency;

  const healthyPercent = useMemo(
    () => Math.max(55, Math.round(Math.min(92, ndvi * 100 + (moisture > 28 ? 6 : 2)))),
    [ndvi, moisture],
  );
  const dryPercent = 100 - healthyPercent;

  const crop   = CROPS[selectedCrop];
  const seedKg = Number((areaHa * crop.seedRate).toFixed(1));
  const npkKg  = Number((areaHa * crop.npkRate).toFixed(1));
  const ureaKg = Number((areaHa * crop.ureaRate).toFixed(1));

  const diagnosticEn = useMemo(
    () =>
      `Your land is mostly healthy, but the ${dryPercent}% yellow area shows moisture deficiency. Consider targeted irrigation on the eastern edge.`,
    [dryPercent],
  );
  const diagnosticRw = useMemo(
    () =>
      `Umurima wawe urafite ubuzima bwiza ku kigero cya ${healthyPercent}%, ariko igice cya ${dryPercent}% cyagagaje icyuho cy'amazi. Gerageza kuvomerera igice cy'iburasirazuba.`,
    [dryPercent, healthyPercent],
  );

  /* ── body scroll lock ── */
  const lockBodyScroll = useCallback((locked: boolean) => {
    if (typeof document === 'undefined') return;
    document.body.style.overflow            = locked ? 'hidden' : '';
    document.body.style.touchAction         = locked ? 'none'   : '';
    document.documentElement.style.overflow = locked ? 'hidden' : '';
  }, []);

  /* ── vertex helpers ── */
  const addVertex = useCallback(
    (lat: number, lng: number) => {
      if (!toolActiveRef.current || interactionLocked) return;
      setVertices(curr => [...curr, [lat, lng]]);
    },
    [interactionLocked],
  );

  const updateVertex = (index: number, lat: number, lng: number) => {
    setVertices(curr => curr.map((pt, i) => (i === index ? [lat, lng] : pt)));
  };

  /* ── map initialisation (runs once on mount) ── */
  useEffect(() => {
    if (!mapRef.current) return;

    const initMap = (): (() => void) | undefined => {
      if (!window.L || !mapRef.current) return undefined;

      const defaultCenter: LatLngTuple = [-1.9441, 30.0619];
      const defaultZoom = 13;

      const map = window.L.map(mapRef.current, {
        zoomControl:      false,
        attributionControl: false,
        zoomSnap:         0.25,
        zoomDelta:        0.5,
        preferCanvas:     true,
        scrollWheelZoom:  true,
        doubleClickZoom:  true,
        touchZoom:        true,
        maxZoom:          21,
        minZoom:          2,
      });

      // Always initialize map with center and zoom to prevent "Set map center and zoom first" errors
      map.setView(center || defaultCenter, zoom !== null ? zoom : defaultZoom);

      window.L
        .tileLayer(
          'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
          {
            attribution: 'Tiles &copy; Esri',
            maxNativeZoom: 18,
            maxZoom: 21,
          },
        )
        .addTo(map);

      mapInstanceRef.current  = map;
      overlayGroupRef.current = window.L.layerGroup().addTo(map);

      const onMapClick = (e: { latlng: { lat: number; lng: number } }) => {
        if (!toolActiveRef.current || interactionLocked) return;
        addVertex(e.latlng.lat, e.latlng.lng);
      };

      map.on('click', onMapClick);
      map.on('movestart zoomstart', () => lockBodyScroll(true));
      map.on('moveend zoomend',     () => lockBodyScroll(false));

      requestAnimationFrame(() => {
        map.invalidateSize();
        if (center && zoom !== null) map.setView(center, zoom, { animate: false });
      });
      window.setTimeout(() => map.invalidateSize(), 220);

      return () => {
        map.off('click', onMapClick);
        map.off('movestart zoomstart');
        map.off('moveend zoomend');
        map.remove();
        mapInstanceRef.current  = null;
        overlayGroupRef.current = null;
        polygonLayerRef.current = null;
      };
    };

    if (window.L) return initMap();

    if (!document.querySelector('script[data-leaflet]')) {
      const css  = document.createElement('link');
      css.rel    = 'stylesheet';
      css.href   = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(css);

      const script          = document.createElement('script');
      script.dataset.leaflet = 'true';
      script.src             = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.onload          = () => { if (window.L && mapRef.current) initMap(); };
      document.head.appendChild(script);
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
      overlayGroupRef.current = null;
      polygonLayerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── keep toolActiveRef synced ── */
  useEffect(() => { toolActiveRef.current = toolActive; }, [toolActive]);

  /* ── fly to new center when set (LINE 291 FIX) ── */
  useEffect(() => {
    if (!mapInstanceRef.current || !center || zoom === null) return;
    const mapInstance = mapInstanceRef.current;
    try {
      mapInstance.invalidateSize();
      if (mapInstance && mapInstance._loaded) {
        mapInstance.flyTo(center, zoom, { animate: true, duration: 1.5 });
      } else if (mapInstance) {
        mapInstance.setView(center, zoom);
      }
    } catch {
      if (mapInstance) {
        mapInstance.setView(center, zoom);
      }
    }
  }, [center, zoom]);

  /* ── redraw overlay on vertex / health change ── */
  useEffect(() => {
    if (!mapInstanceRef.current || !overlayGroupRef.current) return;
    overlayGroupRef.current.clearLayers();
    polygonLayerRef.current = null;
    if (vertices.length === 0) return;

    window.L
      .polyline(vertices, { color: '#f8fafc', weight: 2.4, dashArray: '6 6' })
      .addTo(overlayGroupRef.current);

    if (vertices.length >= 3) {
      const ring = [...vertices, vertices[0]];

      const mainPoly = window.L.polygon(ring, {
        color:       '#f8fafc',
        weight:      2.4,
        fillColor:   boundaryClosed ? '#22c55e' : 'transparent',
        fillOpacity: boundaryClosed ? 0.12       : 0,
        interactive: false,
      }).addTo(overlayGroupRef.current);
      polygonLayerRef.current = mainPoly;

      if (boundaryClosed && healthOverlayEnabled) {
        window.L
          .polygon(ring, {
            color: 'transparent', weight: 0,
            fillColor: '#34d399', fillOpacity: 0.34, interactive: false,
          })
          .addTo(overlayGroupRef.current);
        window.L
          .polygon(buildInsetPolygon(vertices), {
            color: 'transparent', weight: 0,
            fillColor: '#f59e0b', fillOpacity: 0.28, interactive: false,
          })
          .addTo(overlayGroupRef.current);
      }
    }

    const icon = window.L.divIcon({
      html:       '<span style="display:block;width:12px;height:12px;border-radius:999px;background:#34d399;border:2px solid #fff;box-shadow:0 0 0 2px rgba(15,23,42,0.15)"></span>',
      className:  '',
      iconSize:   [12, 12],
      iconAnchor: [6,  6],
    });
    vertices.forEach((v, i) => {
      const m = window.L.marker(v, { icon, draggable: !interactionLocked }).addTo(overlayGroupRef.current);
      m.on('dragend', (e: any) => { const ll = e.target.getLatLng(); updateVertex(i, ll.lat, ll.lng); });
    });
  }, [boundaryClosed, healthOverlayEnabled, interactionLocked, vertices]);

  /* ── interaction lock ── */
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;
    if (interactionLocked) {
      map.dragging.disable(); map.touchZoom.disable(); map.doubleClickZoom.disable();
      map.scrollWheelZoom.disable(); map.boxZoom.disable(); map.keyboard.disable();
      map.getContainer().style.cursor = 'default';
    } else {
      map.dragging.enable(); map.touchZoom.enable(); map.doubleClickZoom.enable();
      map.scrollWheelZoom.enable(); map.boxZoom.enable(); map.keyboard.enable();
      map.getContainer().style.cursor = toolActive ? 'crosshair' : 'grab';
    }
  }, [interactionLocked, toolActive]);

  /* ── auto-fit bounds after polygon close (tight padding + close maxZoom) ── */
  useEffect(() => {
    if (!boundaryClosed || !mapInstanceRef.current || !polygonLayerRef.current || vertices.length < 3) return;
    requestAnimationFrame(() => {
      const map = mapInstanceRef.current;
      if (!map || !polygonLayerRef.current) return;
      try {
        map.invalidateSize();
        window.setTimeout(() => {
          if (!mapInstanceRef.current || !polygonLayerRef.current) return;
          const bounds = polygonLayerRef.current.getBounds();
          if (bounds && bounds.isValid()) {
            map.fitBounds(bounds, {
              padding: [15, 15],
              maxZoom: 20,
              animate: true,
              duration: 1.2,
            });
          }
        }, 80);
      } catch {
        /* ignore */
      }
    });
  }, [boundaryClosed, vertices]);

  /* ── Save boundary to localStorage when closed ── */
  useEffect(() => {
    if (boundaryClosed && vertices.length >= 3) {
      try {
        localStorage.setItem(
          BOUNDARY_STORAGE_KEY,
          JSON.stringify({
            vertices,
            boundaryClosed: true,
            locationLabel,
            center,
            zoom,
          }),
        );
      } catch {
        /* ignore */
      }
    }
  }, [boundaryClosed, vertices, locationLabel, center, zoom]);

  /* ── live sensor simulation ── */
  useEffect(() => {
    if (!boundaryClosed) return;
    const id = window.setInterval(() => {
      setNdvi(v     => Math.max(0.55, Math.min(0.92, v + (Math.random() - 0.5) * 0.028)));
      setMoisture(v => Math.max(16,   Math.min(42,   v + (Math.random() - 0.5) * 1.4)));
    }, 2800);
    return () => window.clearInterval(id);
  }, [boundaryClosed]);

  /* ── cleanup: scroll lock + mount flag ── */
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      lockBodyScroll(false);
    };
  }, [lockBodyScroll]);

  /* ── focus helper ── */
  const focusMap = useCallback((lat: number, lng: number, zoomLevel: number, label: string) => {
    if (!isMountedRef.current) return;
    setCenter([lat, lng]);
    setZoom(zoomLevel);
    setLocationLabel(label);
    setViewMode('map');
    requestAnimationFrame(() => {
      // Guard: component may have unmounted between the RAF queue and execution
      if (!isMountedRef.current) return;
      const mapInstance = mapInstanceRef.current;
      if (!mapInstance) return;
      try {
        mapInstance.invalidateSize();
        if (mapInstance && mapInstance._loaded) {
          mapInstance.flyTo([lat, lng], zoomLevel, { animate: true, duration: 1.5 });
        } else if (mapInstance) {
          mapInstance.setView([lat, lng], zoomLevel);
        }
      } catch {
        if (mapInstance) {
          mapInstance.setView([lat, lng], zoomLevel);
        }
      }
    });
  }, []);

  /* ── reverse geocode ── */
  const reverseGeocode = useCallback(async (lat: number, lng: number, fallback: string): Promise<string> => {
    try {
      const res  = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`);
      const data = await res.json();
      return pickLabel(data?.address, fallback);
    } catch {
      return fallback;
    }
  }, []);

  /* ── search ── */
  const handleSearch = async () => {
    const q = searchInput.trim();
    if (!q) {
      setError(
        lang === 'en'
          ? 'Enter a location to begin.'
          : 'Andika aho utuye cyangwa umurima.',
      );
      return;
    }
    setSearching(true);
    setError(null);
    try {
      // Use plain `json` — `jsonv2` is rejected by some Nominatim mirrors
      const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(q)}`;
      const res = await fetch(url, {
        headers: { Accept: 'application/json' },
        signal: AbortSignal.timeout(8000),
      });

      if (!res.ok) {
        throw new Error(
          lang === 'en'
            ? `Search service error (${res.status}). Please try again.`
            : `Serivisi ya gushaka yarananiranye (${res.status}). Gerageza.`,
        );
      }

      const results: any[] = await res.json();

      // Guard: component may have unmounted during the await
      if (!isMountedRef.current) return;

      if (!Array.isArray(results) || results.length === 0) {
        // Friendly not-found banner — does NOT throw
        setError(
          lang === 'en'
            ? "Location not found. Please try entering a different sector or district (e.g., 'Nyagatare', 'Musanze')."
            : "Ahantu ntahabonetse. Gerageza kwandika sector cyangwa akarere (nka 'Nyagatare', 'Musanze').",
        );
        return;
      }

      const place = results[0];
      const lat   = parseFloat(place.lat);
      const lon   = parseFloat(place.lon);

      if (Number.isNaN(lat) || Number.isNaN(lon)) {
        setError(
          lang === 'en'
            ? 'Could not read coordinates for that location.'
            : 'Ntabikomoka ku mwanya wabonetse.',
        );
        return;
      }

      const label = (place.display_name ?? '').split(',')[0].trim() || q;

      // Verify map container exists before flying
      if (mapRef.current && mapInstanceRef.current) {
        try { mapInstanceRef.current.invalidateSize(); } catch { /* ignore */ }
      }

      focusMap(lat, lon, 18, label);
    } catch (err: any) {
      if (!isMountedRef.current) return;
      // AbortError = timeout; TypeError = network failure
      if (err?.name === 'AbortError' || err?.name === 'TimeoutError') {
        setError(
          lang === 'en'
            ? 'Search timed out. Check your connection and try again.'
            : 'Gushaka byamaze igihe. Reba ukuzamura no kugerageza.',
        );
      } else {
        setError(
          err instanceof Error
            ? err.message
            : lang === 'en'
              ? 'Location lookup failed. Please try again.'
              : 'Gushaka ahantu byanze. Gerageza.',
        );
      }
    } finally {
      if (isMountedRef.current) setSearching(false);
    }
  };

  /* ── GPS ── */
  const handleGps = () => {
    if (!navigator.geolocation) {
      setError(
        lang === 'en'
          ? 'Geolocation is not supported by your browser.'
          : 'Uburubuga budashoboye kubona aho uri.',
      );
      return;
    }
    setSearching(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;

          // Invalidate size before the async await so Leaflet layout is fresh
          if (mapInstanceRef.current) {
            try { mapInstanceRef.current.invalidateSize(); } catch { /* ignore */ }
          }

          // reverseGeocode is already try/catch-safe and returns fallback on failure
          const label = await reverseGeocode(
            latitude,
            longitude,
            lang === 'en' ? 'Current location' : 'Aho uri ubu',
          );

          // Guard: component may have unmounted during the await
          if (!isMountedRef.current) return;

          focusMap(latitude, longitude, 18, label);
        } catch {
          // Should never reach here, but defend against unexpected throws
          if (isMountedRef.current) {
            setError(
              lang === 'en'
                ? 'An unexpected GPS error occurred.'
                : 'Habaye ikibazo kitazwi mu GPS.',
            );
          }
        } finally {
          if (isMountedRef.current) setSearching(false);
        }
      },
      (err) => {
        if (!isMountedRef.current) return;
        setSearching(false);
        if (err.code === err.PERMISSION_DENIED) {
          setError(
            lang === 'en'
              ? 'Please enable location permissions in your browser settings.'
              : "Witanze uburenganzira bw'aho uri muri parameta z'uburubuga.",
          );
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          setError(
            lang === 'en'
              ? 'Location is currently unavailable. Please try again.'
              : 'Aho uri ntabwo ashobora kubonwa. Gerageza kumagana.',
          );
        } else if (err.code === err.TIMEOUT) {
          setError(
            lang === 'en'
              ? 'GPS request timed out. Please try again.'
              : 'Umurongo wa GPS wamaze igihe. Gerageza kumagana.',
          );
        } else {
          setError(
            lang === 'en'
              ? 'GPS error occurred. Please try again.'
              : 'Habaye ikibazo mu mirongo ya GPS. Gerageza.',
          );
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
    );
  };

  /* ── boundary controls ── */
  const finishBoundary = () => {
    if (vertices.length < 3) return;
    setBoundaryClosed(true);
    setInteractionLocked(true);
    setToolActive(false);
    setDrawerOpen(true);
  };

  const handleFocusPlot = useCallback(() => {
    if (!polygonLayerRef.current || !mapInstanceRef.current || vertices.length < 3) return;
    const map = mapInstanceRef.current;
    try {
      map.invalidateSize();
      const bounds = polygonLayerRef.current.getBounds();
      if (bounds && bounds.isValid()) {
        map.fitBounds(bounds, {
          padding: [15, 15],
          maxZoom: 20,
          animate: true,
          duration: 1.2,
        });
      }
    } catch {
      /* ignore */
    }
  }, [vertices.length]);

  const editBoundary = () => {
    setBoundaryClosed(false);
    setInteractionLocked(false);
    setToolActive(true);
    setDrawerOpen(false);
    setHealthOverlayEnabled(false);
  };

  const resetView = () => {
    try {
      localStorage.removeItem(BOUNDARY_STORAGE_KEY);
    } catch {
      /* ignore */
    }
    setToolActive(false);
    setVertices([]);
    setBoundaryClosed(false);
    setInteractionLocked(false);
    setDrawerOpen(false);
    setHealthOverlayEnabled(false);
    setError(null);
    setViewMode('landing');
    setCenter(null);
    setZoom(null);
    setLocationLabel('Rwanda');
    lockBodyScroll(false);
  };

  /* ══════════════════════════════════════════
     RENDER
  ══════════════════════════════════════════ */
  return (
    <div className="space-y-4">

      {/* ═══ MAP CARD ═══ */}
      <div className="mx-auto flex w-full max-w-[1000px] justify-center">
        <div className="relative w-full overflow-hidden rounded-[1.5rem] border border-stone-200/70 bg-stone-950 shadow-[0_24px_80px_rgba(0,0,0,0.16)]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.14),_transparent_22%),radial-gradient(circle_at_bottom_right,_rgba(52,211,153,0.24),_transparent_35%)]" />

          <div className="relative h-[380px] w-full sm:h-[480px]">

            {/* Leaflet canvas — touch-action: none stops page scroll during pinch */}
            <div
              ref={mapRef}
              className="h-full w-full"
              style={{ touchAction: 'none', overflow: 'hidden', position: 'relative' }}
              onMouseEnter={() => lockBodyScroll(true)}
              onMouseLeave={() => lockBodyScroll(false)}
              onWheel={e => e.stopPropagation()}
              onTouchMove={e => e.stopPropagation()}
              onTouchStart={() => lockBodyScroll(true)}
              onTouchEnd={() => lockBodyScroll(false)}
              onTouchCancel={() => lockBodyScroll(false)}
            />

            {/* ── LANDING OVERLAY ── */}
            {viewMode === 'landing' && (
              <div className="absolute inset-0 z-[1000] flex items-center justify-center bg-stone-950/70 p-4 backdrop-blur-[2px]">
                <div className="w-full max-w-xl rounded-[2rem] border border-white/15 bg-white/95 p-6 shadow-[0_30px_90px_rgba(0,0,0,0.2)] sm:p-8">
                  <div className="flex items-center gap-3 text-emerald-700">
                    <div className="grid h-10 w-10 place-items-center rounded-full bg-emerald-50">
                      <MapPin className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold uppercase tracking-[0.3em]">{t.satSearchLocation}</p>
                      <p className="text-xl font-semibold text-stone-900">{t.satSearchTitle}</p>
                    </div>
                  </div>

                  <label className="mt-6 block text-sm font-semibold text-stone-600">
                    {t.satSearchPlaceholder}
                  </label>

                  <div className="mt-3 flex flex-col gap-2">
                    <button
                      id="btn-use-gps"
                      onClick={handleGps}
                      disabled={searching}
                      className="inline-flex items-center justify-center gap-2 rounded-full border border-stone-300 bg-white px-4 py-2.5 text-sm font-semibold text-stone-700 shadow-sm transition hover:bg-stone-50 disabled:opacity-60"
                    >
                      <Locate className="h-4 w-4" />
                      {searching
                        ? (lang === 'en' ? 'Locating\u2026' : 'Mbara aho uri\u2026')
                        : t.satUseGps}
                    </button>

                    <div className="flex flex-col gap-3 sm:flex-row">
                      <input
                        id="input-location-search"
                        value={searchInput}
                        onChange={e => setSearchInput(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleSearch()}
                        placeholder={t.satSearchPlaceholder}
                        className="flex-1 rounded-full border border-stone-300 bg-white px-4 py-3 text-sm text-stone-800 shadow-sm outline-none ring-0 focus:border-emerald-400"
                      />
                      <button
                        id="btn-search-plot"
                        onClick={handleSearch}
                        disabled={searching}
                        className="rounded-full bg-stone-900 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-stone-700 disabled:opacity-60"
                      >
                        {searching ? t.satSearching : t.satSearchPlot}
                      </button>
                    </div>
                  </div>

                  <p className="mt-3 text-sm text-stone-500">
                    {lang === 'en'
                      ? 'Search any address in Rwanda or use your current GPS position.'
                      : 'Shakisha aho uri hose muri Rwanda cyangwa ukoreshe aho uri ubu.'}
                  </p>

                  {error && (
                    <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                      {error}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ── TOP-LEFT FLOATING CONTROLS (ZOOM + FOCUS PLOT) ── */}
            <div className="absolute left-3 top-3 z-[1000] flex flex-col gap-1.5">
              <button
                id="btn-zoom-in"
                title={lang === 'en' ? 'Zoom In' : 'Iragura'}
                onClick={() => {
                  if (mapInstanceRef.current) {
                    try { mapInstanceRef.current.zoomIn(); } catch { /* ignore */ }
                  }
                }}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/20 bg-stone-950/80 text-white shadow-lg backdrop-blur transition hover:bg-stone-900 active:scale-95"
              >
                <Plus className="h-4 w-4" />
              </button>

              <button
                id="btn-zoom-out"
                title={lang === 'en' ? 'Zoom Out' : 'Iganura'}
                onClick={() => {
                  if (mapInstanceRef.current) {
                    try { mapInstanceRef.current.zoomOut(); } catch { /* ignore */ }
                  }
                }}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/20 bg-stone-950/80 text-white shadow-lg backdrop-blur transition hover:bg-stone-900 active:scale-95"
              >
                <Minus className="h-4 w-4" />
              </button>

              {boundaryClosed && (
                <button
                  id="btn-focus-plot-top"
                  title={lang === 'en' ? 'Focus Plot' : 'Reba Umurima'}
                  onClick={handleFocusPlot}
                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-emerald-400/40 bg-emerald-600 text-white shadow-lg backdrop-blur transition hover:bg-emerald-500 active:scale-95"
                >
                  <Target className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* ── TOP-RIGHT BADGE ── */}
            <div className="absolute right-3 top-3 z-[1000] flex flex-wrap items-center gap-2 rounded-full border border-white/15 bg-stone-950/80 px-3 py-2 text-sm text-white shadow-[0_10px_30px_rgba(0,0,0,0.18)] backdrop-blur">
              <Compass className="h-4 w-4 text-emerald-400" />
              <span className="max-w-[140px] truncate text-[13px]">{locationLabel}</span>

              {boundaryClosed && (
                <button
                  id="btn-open-analytics"
                  onClick={() => setDrawerOpen(true)}
                  className="rounded-full bg-white/90 px-3 py-1.5 text-[12px] font-semibold text-stone-900 transition hover:bg-white"
                >
                  {t.satOpenAnalytics}
                </button>
              )}

              {boundaryClosed && (
                <button
                  id="btn-toggle-health-overlay"
                  onClick={() => setHealthOverlayEnabled(v => !v)}
                  className={`rounded-full px-3 py-1.5 text-[12px] font-semibold transition ${
                    healthOverlayEnabled
                      ? 'bg-emerald-500 text-white'
                      : 'bg-white/90 text-stone-900 hover:bg-white'
                  }`}
                >
                  {lang === 'en' ? 'Toggle Health Overlay' : "Hindura Igice cy'ubuzima"}
                </button>
              )}
            </div>

            {/* ── RIGHT TOOLBAR ── */}
            <div className="absolute right-3 top-16 z-[1000] flex flex-col gap-2">
              <button
                id="btn-cut-boundary"
                onClick={() => setToolActive(v => !v)}
                className={`rounded-full border px-3.5 py-2.5 text-sm font-semibold shadow-[0_10px_30px_rgba(0,0,0,0.15)] backdrop-blur transition ${
                  toolActive
                    ? 'border-emerald-400 bg-emerald-600 text-white'
                    : 'border-white/20 bg-white/90 text-stone-800 hover:bg-white'
                }`}
              >
                <span className="flex items-center gap-2">
                  <PenTool className="h-4 w-4" />
                  {t.satCutBoundary}
                </span>
              </button>

              {vertices.length >= 3 && !boundaryClosed && (
                <button
                  id="btn-finish-boundary"
                  onClick={finishBoundary}
                  className="rounded-full border border-white/20 bg-stone-900/90 px-3.5 py-2.5 text-sm font-semibold text-white shadow-[0_10px_30px_rgba(0,0,0,0.15)] backdrop-blur transition hover:bg-stone-800"
                >
                  <span className="flex items-center gap-2">
                    <Check className="h-4 w-4" />
                    {t.satFinishBoundary}
                  </span>
                </button>
              )}

              {boundaryClosed && (
                <button
                  id="btn-focus-plot-right"
                  onClick={handleFocusPlot}
                  className="rounded-full border border-white/20 bg-emerald-600/90 px-3.5 py-2.5 text-sm font-semibold text-white shadow-[0_10px_30px_rgba(0,0,0,0.15)] backdrop-blur transition hover:bg-emerald-500"
                >
                  <span className="flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    {lang === 'en' ? 'Focus Plot' : 'Reba Umurima'}
                  </span>
                </button>
              )}

              {boundaryClosed && (
                <button
                  id="btn-edit-boundary"
                  onClick={editBoundary}
                  className="rounded-full border border-white/20 bg-white/90 px-3.5 py-2.5 text-sm font-semibold text-stone-800 shadow-[0_10px_30px_rgba(0,0,0,0.15)] backdrop-blur transition hover:bg-white"
                >
                  <span className="flex items-center gap-2">
                    <PenTool className="h-4 w-4" />
                    {lang === 'en' ? 'Edit Boundary' : 'Hindura Umupaka'}
                  </span>
                </button>
              )}

              <button
                id="btn-reset-view"
                onClick={resetView}
                className="rounded-full border border-white/20 bg-white/90 px-3.5 py-2.5 text-sm font-semibold text-stone-800 shadow-[0_10px_30px_rgba(0,0,0,0.15)] backdrop-blur transition hover:bg-white"
              >
                <span className="flex items-center gap-2">
                  <X className="h-4 w-4" />
                  {t.satResetView}
                </span>
              </button>
            </div>

            {/* ── Drawing hint ── */}
            {toolActive && !boundaryClosed && (
              <div className="absolute bottom-4 left-1/2 z-[1000] -translate-x-1/2 rounded-full border border-white/20 bg-stone-900/85 px-4 py-2 text-xs font-medium text-white backdrop-blur">
                {lang === 'en'
                  ? `Click to place points \u00b7 ${vertices.length} placed${vertices.length >= 3 ? ' \u00b7 Press \u201cFinish\u201d to close' : ''}`
                  : `Kanda ushize aho \u00b7 ${vertices.length} ahantu${vertices.length >= 3 ? ' \u00b7 Kanda \u201cRangiza\u201d gufunga' : ''}`}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════
           ANALYTICS DRAWER
      ═══════════════════════════════════════════ */}
      {drawerOpen && (
        <div className="mx-auto w-full max-w-[1000px] space-y-5 rounded-[1.75rem] border border-stone-200 bg-white p-6 shadow-[0_20px_50px_rgba(0,0,0,0.06)] sm:p-8">

          {/* ─ HEADER ─ */}
          <div className="flex items-start justify-between gap-4 border-b border-stone-100 pb-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.4em] text-emerald-600">{t.satFieldAnalytics}</p>
              <h2 className="mt-2 text-2xl font-bold text-stone-900 sm:text-3xl">
                {lang === 'en' ? 'Field Report' : "Riporo y'Umurima"}
              </h2>
              <p className="mt-1 text-sm text-stone-500">
                {lang === 'en'
                  ? 'Satellite-driven analysis for precision farming'
                  : "Isesengura rya satellite mu nzira y'ubukungu bwitegezo"}
              </p>
            </div>
            <button
              id="btn-close-drawer"
              onClick={() => setDrawerOpen(false)}
              className="flex-shrink-0 rounded-full border border-stone-200 p-2.5 text-stone-500 transition hover:bg-stone-50"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* ─ CROP SELECTOR ─ */}
          <div className="relative">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.25em] text-stone-500">
              {lang === 'en' ? 'Select Crop' : 'Hitamo Igihingwa'}
            </p>
            <button
              id="btn-crop-selector"
              onClick={() => setCropDropOpen(v => !v)}
              className="flex w-full items-center justify-between gap-3 rounded-2xl border border-stone-200 bg-stone-50 px-5 py-3.5 text-sm font-semibold text-stone-800 transition hover:border-emerald-300 hover:bg-emerald-50/40"
            >
              <span className="flex items-center gap-2">
                <span className="text-lg">🌱</span>
                {lang === 'en' ? crop.labelEn : crop.labelRw}
              </span>
              <ChevronDown className={`h-4 w-4 text-stone-500 transition-transform ${cropDropOpen ? 'rotate-180' : ''}`} />
            </button>

            {cropDropOpen && (
              <div className="absolute z-50 mt-2 w-full overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-[0_16px_40px_rgba(0,0,0,0.12)]">
                {(Object.keys(CROPS) as CropKey[]).map(key => (
                  <button
                    key={key}
                    id={`btn-crop-${key}`}
                    onClick={() => { setSelectedCrop(key); setCropDropOpen(false); }}
                    className={`flex w-full items-center gap-3 px-5 py-3.5 text-sm font-medium transition hover:bg-emerald-50 ${
                      selectedCrop === key ? 'bg-emerald-50/70 font-semibold text-emerald-700' : 'text-stone-700'
                    }`}
                  >
                    {selectedCrop === key ? <Check className="h-4 w-4 text-emerald-600" /> : <span className="w-4" />}
                    {lang === 'en' ? CROPS[key].labelEn : CROPS[key].labelRw}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ─ KEY METRICS ─ */}
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-[1rem] border border-stone-100 bg-gradient-to-br from-blue-50 to-blue-50/50 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-600">{t.satTotalArea}</p>
              <p className="mt-2 text-2xl font-bold text-stone-900">{areaHa.toFixed(3)}</p>
              <p className="mt-1 text-xs text-stone-500">{t.satHectares} &middot; {areaAc.toFixed(2)} {t.satAcres}</p>
            </div>
            <div className="rounded-[1rem] border border-stone-100 bg-gradient-to-br from-emerald-50 to-emerald-50/50 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-600">{t.satCropHealth}</p>
              <p className="mt-2 text-2xl font-bold text-stone-900">{ndvi.toFixed(2)}</p>
              <p className="mt-1 text-xs text-stone-500">{healthLabel}</p>
            </div>
            <div className="rounded-[1rem] border border-stone-100 bg-gradient-to-br from-amber-50 to-amber-50/50 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-600">{t.satSoilMoistureEst}</p>
              <p className="mt-2 text-2xl font-bold text-stone-900">{moisture.toFixed(0)}%</p>
              <p className="mt-1 text-xs text-stone-500">{moistureLabel}</p>
            </div>
          </div>

          {/* ─ GREEN vs DRY ZONE BREAKDOWN ─ */}
          <div className="rounded-[1.25rem] border border-stone-200 bg-stone-50/60 p-6">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-100">
                <HeartPulse className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-stone-900">
                  {lang === 'en' ? 'Crop Canopy Health' : "Ubwiza bw'Ibimera"}
                </h3>
                <p className="text-xs text-stone-500">
                  {lang === 'en'
                    ? 'Vegetation density & moisture status'
                    : "Ubusizi bw'ibimera & icyuho cy'amazi"}
                </p>
              </div>
            </div>

            <div className="space-y-5">
              {/* Healthy bar */}
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-xs font-semibold text-stone-600">
                    {lang === 'en' ? '\uD83D\uDFE9 Healthy Crop Canopy (Green)' : '\uD83D\uDFE9 Igihingwa Gikura Neza (Icyatsi)'}
                  </span>
                  <span className="text-sm font-bold text-emerald-600">{healthyPercent}%</span>
                </div>
                <div className="h-3.5 overflow-hidden rounded-full bg-stone-200">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-500 shadow-[0_0_12px_rgba(52,211,153,0.3)] transition-all duration-700"
                    style={{ width: `${healthyPercent}%` }}
                  />
                </div>
                <p className="mt-1.5 text-xs text-stone-500">
                  {lang === 'en'
                    ? `${healthyPercent}% Healthy Canopy`
                    : `${healthyPercent}% Igihingwa Gikora Neza`}
                </p>
              </div>

              {/* Dry bar */}
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-xs font-semibold text-stone-600">
                    {lang === 'en' ? '\uD83D\uDFE8 Dry / Stressed Area (Yellow)' : '\uD83D\uDFE8 Igice Cyumye / Gihangayika (Umuhondo)'}
                  </span>
                  <span className="text-sm font-bold text-amber-600">{dryPercent}%</span>
                </div>
                <div className="h-3.5 overflow-hidden rounded-full bg-stone-200">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-amber-400 to-amber-500 shadow-[0_0_12px_rgba(251,146,60,0.3)] transition-all duration-700"
                    style={{ width: `${dryPercent}%` }}
                  />
                </div>
                <p className="mt-1.5 text-xs text-stone-500">
                  {lang === 'en'
                    ? `${dryPercent}% Moisture Deficiency`
                    : `${dryPercent}% Ubukenerwa bw'Amazi`}
                </p>
              </div>
            </div>
          </div>

          {/* ─ KEY INSIGHT ─ */}
          <div className="rounded-[1.25rem] border-2 border-emerald-200 bg-gradient-to-r from-emerald-50/80 to-emerald-50/40 p-5">
            <div className="flex gap-3">
              <div className="mt-0.5 flex-shrink-0">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100">
                  <Check className="h-4 w-4 text-emerald-600" />
                </div>
              </div>
              <div className="flex-1">
                <h4 className="mb-1 text-sm font-bold text-stone-900">
                  {lang === 'en' ? 'Key Insight' : 'Igitekerezo Cyingenzi'}
                </h4>
                <p className="text-sm leading-relaxed text-stone-700">
                  {lang === 'en' ? diagnosticEn : diagnosticRw}
                </p>
              </div>
            </div>
          </div>

          {/* ─ INPUT REQUIREMENTS (crop-dynamic) ─ */}
          <div className="rounded-[1.25rem] border border-stone-200 bg-stone-50/60 p-6">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sky-100">
                <Ruler className="h-5 w-5 text-sky-600" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-stone-900">
                  {lang === 'en' ? 'Input Recommendations' : 'Inama mu Bikoresho'}
                </h3>
                <p className="text-xs text-stone-500">
                  {lang === 'en'
                    ? `Based on ${areaHa.toFixed(3)} Ha \u00b7 ${crop.labelEn}`
                    : `Bishingiye kuri ${areaHa.toFixed(3)} Ha \u00b7 ${crop.labelRw}`}
                </p>
              </div>
            </div>

            <div className={`grid gap-3 ${crop.ureaRate > 0 ? 'sm:grid-cols-3' : 'sm:grid-cols-2'}`}>
              {/* Seed */}
              <div className="rounded-[0.875rem] border border-stone-200 bg-white p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.15em] text-stone-600">
                  {lang === 'en' ? 'Seed' : 'Imbuto'}
                </p>
                <p className="mt-2 text-xl font-bold text-stone-900">
                  {seedKg} <span className="text-sm font-normal text-stone-400">kg</span>
                </p>
                <p className="mt-1 text-xs text-stone-500">
                  {crop.seedRate} kg/Ha &times; {areaHa.toFixed(3)} Ha
                </p>
              </div>

              {/* NPK */}
              <div className="rounded-[0.875rem] border border-stone-200 bg-white p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.15em] text-stone-600">
                  NPK {lang === 'en' ? 'Fertilizer' : 'Ifumbire'}
                </p>
                <p className="mt-2 text-xl font-bold text-stone-900">
                  {npkKg} <span className="text-sm font-normal text-stone-400">kg</span>
                </p>
                <p className="mt-1 text-xs text-stone-500">
                  {crop.npkRate} kg/Ha &times; {areaHa.toFixed(3)} Ha
                </p>
              </div>

              {/* Urea (maize only) */}
              {crop.ureaRate > 0 && (
                <div className="rounded-[0.875rem] border border-stone-200 bg-white p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.15em] text-stone-600">
                    {lang === 'en' ? 'Urea' : 'Uyurea'}
                  </p>
                  <p className="mt-2 text-xl font-bold text-stone-900">
                    {ureaKg} <span className="text-sm font-normal text-stone-400">kg</span>
                  </p>
                  <p className="mt-1 text-xs text-stone-500">
                    {crop.ureaRate} kg/Ha &times; {areaHa.toFixed(3)} Ha
                  </p>
                </div>
              )}
            </div>

            <p className="mt-4 text-xs text-stone-400">
              {lang === 'en'
                ? 'Formula: Area (Ha) \u00d7 Rate (kg/Ha) \u2014 values calculated from exact polygon surface area.'
                : 'Ifomula: Ubuso (Ha) \u00d7 Urugero (kg/Ha) \u2014 imibare ivuye ku buso nyabwo bw\u2019umurima.'}
            </p>
          </div>

          {/* ─ FOOTER ─ */}
          <div className="rounded-[1rem] border border-stone-100 bg-stone-50/40 p-4 text-center">
            <p className="text-xs text-stone-500">
              {lang === 'en'
                ? 'Edit boundary to recalculate \u2014 all figures update live as the polygon changes.'
                : "Hindura umupaka ngo uhitemo \u2014 imibare yose ivugurura ubwayo iyo polygon ihindutse."}
            </p>
          </div>

        </div>
      )}
    </div>
  );
}
