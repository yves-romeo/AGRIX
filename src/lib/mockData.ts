// Mock data for all views. Centralized so the app feels alive.

export interface DiagnosticResult {
  condition: string;
  confidence: number;
  severity: 'low' | 'moderate' | 'high';
  pathogen: string;
  affectedCrop: string;
  actionPlan: { icon: string; text: string }[];
  organicSolutions: { name: string; type: string; notes: string }[];
  chemicalSolutions: { name: string; type: string; notes: string }[];
  bbox: { x: number; y: number; w: number; h: number };
}

export const SAMPLE_DIAGNOSIS: DiagnosticResult = {
  condition: 'Leaf Rust (Puccinia triticina)',
  confidence: 94,
  severity: 'high',
  pathogen: 'Fungal — Basidiomycota',
  affectedCrop: 'Winter Wheat',
  actionPlan: [
    { icon: 'scissors', text: 'Remove and destroy infected lower leaves within 48 hours' },
    { icon: 'wind', text: 'Increase row spacing to improve airflow and reduce humidity' },
    { icon: 'droplet', text: 'Switch to drip irrigation — avoid overhead watering' },
    { icon: 'calendar', text: 'Schedule a follow-up scan in 5–7 days' },
  ],
  organicSolutions: [
    { name: 'Neem Oil Spray', type: 'Bio-fungicide', notes: 'Apply 0.5% solution every 7 days' },
    { name: 'Bacillus subtilis', type: 'Biocontrol', notes: '1.5 g/L foliar spray at dusk' },
    { name: 'Sulfur Dust', type: 'Mineral', notes: '2–3 kg/acre on dry foliage' },
  ],
  chemicalSolutions: [
    { name: 'Azoxystrobin', type: 'Strobilurin', notes: '0.3 L/ha, max 2 applications' },
    { name: 'Propiconazole', type: 'Triazole', notes: '0.5 L/ha at first sign of pustules' },
    { name: 'Mancozeb', type: 'Contact', notes: '1.5 kg/ha protective spray' },
  ],
  bbox: { x: 22, y: 30, w: 38, h: 42 },
};

export interface CropPrice {
  crop: string;
  emoji: string;
  price: number;
  unit: string;
  change: number;
  trend: number[];
}

export const CROP_PRICES: CropPrice[] = [
  { crop: 'Maize', emoji: '🌽', price: 4.82, unit: '/bu', change: 2.1, trend: [4.5, 4.6, 4.55, 4.7, 4.75, 4.82] },
  { crop: 'Wheat', emoji: '🌾', price: 6.14, unit: '/bu', change: -0.8, trend: [6.3, 6.25, 6.2, 6.18, 6.15, 6.14] },
  { crop: 'Soybeans', emoji: '🫘', price: 13.45, unit: '/bu', change: 1.4, trend: [13.1, 13.2, 13.25, 13.3, 13.4, 13.45] },
  { crop: 'Rice', emoji: '🍚', price: 16.2, unit: '/cwt', change: 0.6, trend: [15.9, 16.0, 16.05, 16.1, 16.15, 16.2] },
  { crop: 'Cotton', emoji: '🌱', price: 0.78, unit: '/lb', change: -1.2, trend: [0.82, 0.81, 0.8, 0.79, 0.785, 0.78] },
];

export interface Buyer {
  id: string;
  name: string;
  verified: boolean;
  rating: number;
  location: string;
  desiredCrops: string[];
  volumeNeeded: string;
  priceRange: string;
  responseTime: string;
}

export const BUYERS: Buyer[] = [
  {
    id: 'b1',
    name: 'Greenfield Agro Corp',
    verified: true,
    rating: 4.8,
    location: 'Ames, Iowa',
    desiredCrops: ['Maize', 'Soybeans'],
    volumeNeeded: '500+ tons',
    priceRange: 'Market +2%',
    responseTime: '~3 hours',
  },
  {
    id: 'b2',
    name: 'Prairie Grain Co.',
    verified: true,
    rating: 4.6,
    location: 'Fargo, ND',
    desiredCrops: ['Wheat', 'Rice'],
    volumeNeeded: '200–800 tons',
    priceRange: 'Market +1.5%',
    responseTime: '~6 hours',
  },
  {
    id: 'b3',
    name: 'Valley Foods Ltd.',
    verified: true,
    rating: 4.9,
    location: 'Sacramento, CA',
    desiredCrops: ['Soybeans', 'Cotton'],
    volumeNeeded: '1,000+ tons',
    priceRange: 'Market +3%',
    responseTime: '~1 hour',
  },
  {
    id: 'b4',
    name: 'Northern Mills',
    verified: false,
    rating: 4.2,
    location: 'Duluth, MN',
    desiredCrops: ['Wheat'],
    volumeNeeded: '100–400 tons',
    priceRange: 'Market rate',
    responseTime: '~24 hours',
  },
];

export interface MyCropListing {
  crop: string;
  variety: string;
  expectedVolume: string;
  yieldDate: string;
  fieldArea: string;
  status: 'open' | 'negotiating' | 'closed';
  interest: number;
}

export const MY_CROPS: MyCropListing[] = [
  {
    crop: 'Maize',
    variety: 'Pioneer P1197',
    expectedVolume: '320 tons',
    yieldDate: '2026-09-18',
    fieldArea: '48 ha',
    status: 'open',
    interest: 12,
  },
  {
    crop: 'Soybeans',
    variety: 'Asgrow AG32X1',
    expectedVolume: '180 tons',
    yieldDate: '2026-10-02',
    fieldArea: '32 ha',
    status: 'negotiating',
    interest: 7,
  },
];

export interface TelemetryReading {
  soilMoisture: number;
  temperature: number;
  humidity: number;
  ph: number;
  lightIntensity: number;
  windSpeed: number;
}

export const INITIAL_TELEMETRY: TelemetryReading = {
  soilMoisture: 42,
  temperature: 24.5,
  humidity: 61,
  ph: 6.4,
  lightIntensity: 18500,
  windSpeed: 8.2,
};

export interface NDVIPoint {
  date: string;
  ndvi: number;
  moisture: number;
}

export const NDVI_TREND: NDVIPoint[] = [
  { date: 'Jul 01', ndvi: 0.42, moisture: 38 },
  { date: 'Jul 04', ndvi: 0.48, moisture: 42 },
  { date: 'Jul 07', ndvi: 0.55, moisture: 48 },
  { date: 'Jul 10', ndvi: 0.61, moisture: 52 },
  { date: 'Jul 13', ndvi: 0.58, moisture: 49 },
  { date: 'Jul 16', ndvi: 0.66, moisture: 55 },
  { date: 'Jul 18', ndvi: 0.71, moisture: 58 },
];

export const FIELD_CAPTURE = {
  timestamp: '2026-07-18T06:42:00Z',
  aiStatus: 'Healthy',
  aiConfidence: 97,
  notes: 'No visible stress markers. Canopy density nominal.',
};

export interface MonthlyNDVI {
  month: string;
  ndvi: number;
}

export const SIX_MONTH_NDVI: MonthlyNDVI[] = [
  { month: 'Feb', ndvi: 0.42 },
  { month: 'Mar', ndvi: 0.51 },
  { month: 'Apr', ndvi: 0.63 },
  { month: 'May', ndvi: 0.71 },
  { month: 'Jun', ndvi: 0.78 },
  { month: 'Jul', ndvi: 0.82 },
];

export interface DailyForecast {
  day: string;
  icon: 'sun' | 'cloud' | 'rain' | 'partly';
  tempHigh: number;
  tempLow: number;
  rainfall: number;
}

export const FIVE_DAY_FORECAST: DailyForecast[] = [
  { day: 'Mon', icon: 'sun', tempHigh: 27, tempLow: 16, rainfall: 0 },
  { day: 'Tue', icon: 'partly', tempHigh: 25, tempLow: 15, rainfall: 2 },
  { day: 'Wed', icon: 'rain', tempHigh: 22, tempLow: 14, rainfall: 14 },
  { day: 'Thu', icon: 'rain', tempHigh: 21, tempLow: 13, rainfall: 8 },
  { day: 'Fri', icon: 'cloud', tempHigh: 24, tempLow: 15, rainfall: 1 },
];
