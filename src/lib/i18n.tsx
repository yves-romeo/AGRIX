import { createContext, useContext, useState, type ReactNode } from 'react';

export type Lang = 'en' | 'rw';

export interface Translation {
  // Brand / nav
  brand: string;
  tagline: string;
  // Tabs
  navAICenter: string;
  navAICenterDesc: string;
  navLand: string;
  navLandDesc: string;
  navTelemetry: string;
  navTelemetryDesc: string;
  navAgriMarket: string;
  navAgriMarketDesc: string;
  // Language switcher
  switchTo: string;
  // AI Center
  aiTitle: string;
  aiSubtitle: string;
  aiTakePhoto: string;
  aiUpload: string;
  aiAnalyzing: string;
  aiAnalyzingSub: string;
  aiRejected: string;
  aiRejectEn: string;
  aiRejectRw: string;
  aiTryAgain: string;
  aiResult: string;
  aiAnalyzedSample: string;
  aiBboxNote: string;
  aiReadoutTitle: string;
  aiVerifiedBadge: string;
  aiPlayTTS: string;
  aiSources: string;
  aiNewScan: string;
  aiDisclaimer: string;
  aiMicIdle: string;
  aiMicRecording: string;
  aiMicTranscribing: string;
  aiTabScanner: string;
  aiTabAssistant: string;
  aiChatPlaceholder: string;
  aiVoiceLang: string;
  aiListening: string;
  aiReadAloud: string;
  aiStopTTS: string;
  aiSpeechNotSupported: string;
  aiAssistantGreeting: string;
  aiApiKeyMissing: string;
  aiApiKeyBannerDismiss: string;
  aiNetworkError: string;
  aiGeminiRequired: string;
  aiSeverity: string;
  aiSymptoms: string;
  aiPrevention: string;
  aiTreatment: string;
  aiOrganic: string;
  aiChemical: string;
  // Telemetry
  telTitle: string;
  telSubtitle: string;
  telSoil: string;
  telTemp: string;
  telHumidity: string;
  telConnected: string;
  telDisconnected: string;
  telPairDevice: string;
  telPaired: string;
  telLastReading: string;
  telStatus: string;
  // AgriMarket
  amTitle: string;
  amSubtitle: string;
  amCrop: string;
  amQuantity: string;
  amUnit: string;
  amLocation: string;
  amSearch: string;
  amTangaBid: string;
  amLive: string;
  amAvgPrice: string;
  amHub: string;
  amHubLocation: string;
  amPricePerKg: string;
  amTotalEval: string;
  amBuyers: string;
  amVerified: string;
  amOrderCycle: string;
  amMinVolume: string;
  amPriceOffer: string;
  amResponseTime: string;
  amSubmitOffer: string;
  amOfferSent: string;
  amNoBuyers: string;
  amEmptyTitle: string;
  amEmptyBody: string;
  amSelectCrop: string;
  amEstimatedTotal: string;
  // Satellite
  satTitle: string;
  satSubtitle: string;
  satDrawBoundary: string;
  satEditVertex: string;
  satClear: string;
  satLocate: string;
  satLayers: string;
  satFinish: string;
  satCancel: string;
  satEmptyTitle: string;
  satEmptyBody: string;
  satVegetation: string;
  satNdvi: string;
  satTrend: string;
  satStatus: string;
  satMoisture: string;
  satArea: string;
  satHealthy: string;
  satStress: string;
  satLow: string;
  satCurrentMoisture: string;
  satSevenDayAvg: string;
  satStressLevel: string;
  // Satellite v2
  satEditPlot: string;
  satResetView: string;
  satLocateMe: string;
  satViewAnalytics: string;
  satFieldAnalytics: string;
  satTotalArea: string;
  satHectares: string;
  satAcres: string;
  satCropHealth: string;
  satHighChloro: string;
  satSoilMoistureEst: string;
  satFieldCapacity: string;
  satModerate: string;
  satOptimal: string;
  satDeficiency: string;
  satVegHeatmap: string;
  satHeatmapToggle: string;
  sat6MonthTrend: string;
  satCropVigor: string;
  satInputCalc: string;
  satFertilizerNeeded: string;
  satSeedVolume: string;
  satWeatherForecast: string;
  satRainfall: string;
  satTemperature: string;
  sat5Day: string;
  satClose: string;
  satDrawingHint: string;
  satResetDone: string;
  satLocating: string;
  satFieldA: string;
  satSentinel: string;
  welcomeHeroEyebrow: string;
  welcomeHeroTitle: string;
  welcomeHeroSubtitle: string;
  welcomeHeroCta1: string;
  welcomeHeroCta2: string;
  welcomeHeroCorner: string;
  welcomeHeroSubline: string;
  satSearchLocation: string;
  satSearchTitle: string;
  satSearchPlaceholder: string;
  satSearchPlot: string;
  satUseGps: string;
  satSearching: string;
  satCutBoundary: string;
  satFinishBoundary: string;
  satOpenAnalytics: string;
}

export const TRANSLATIONS: Record<Lang, Translation> = {
  en: {
    brand: 'AGRI X',
    tagline: 'Farm Intelligence',
    navAICenter: 'AI Center',
    navAICenterDesc: 'Scanner + RAG chat',
    navLand: 'Land Analytics',
    navLandDesc: 'Satellite plots',
    navTelemetry: 'Telemetry IoT Hub',
    navTelemetryDesc: 'Hardware metrics',
    navAgriMarket: 'AgriMarket Hub',
    navAgriMarketDesc: 'Crop pricing & buyers',
    switchTo: 'Kinyarwanda',
    aiTitle: 'AI Center — Scan & Ask',
    aiSubtitle: 'Upload a crop photo for disease diagnostics, then get verified agronomy answers from RAB/MINAGRI.',
    aiTakePhoto: 'Take Photo',
    aiUpload: 'Upload Image',
    aiAnalyzing: 'Analyzing crop tissue…',
    aiAnalyzingSub: 'Computer vision model — feature extraction & classification',
    aiRejected: 'Invalid Image',
    aiRejectEn: 'The system only processes images of plants or crop leaves.',
    aiRejectRw: '',
    aiTryAgain: 'Try Another Photo',
    aiResult: 'Analysis complete',
    aiAnalyzedSample: 'Analyzed Sample',
    aiBboxNote: 'Bounding box highlights detected lesion region',
    aiReadoutTitle: 'Verified Diagnostic Readout',
    aiVerifiedBadge: 'Verified Data: RAB / MINAGRI Reference Library',
    aiPlayTTS: 'Play audio',
    aiSources: 'Sources',
    aiNewScan: 'New Scan',
    aiDisclaimer: 'Diagnostics are AI-generated. Confirm with a local agronomist before large-scale treatment.',
    aiMicIdle: 'Tap to speak',
    aiMicRecording: 'Listening…',
    aiMicTranscribing: 'Transcribing…',
    aiTabScanner: '📸 Crop Scanner',
    aiTabAssistant: '🤖 Agri AI Assistant',
    aiChatPlaceholder: 'Ask about soil health, pests, weather, or crops...',
    aiVoiceLang: 'Voice Input Language',
    aiListening: 'Listening... Speak now',
    aiReadAloud: 'Read Aloud',
    aiStopTTS: 'Stop Audio',
    aiSpeechNotSupported: 'Speech Recognition is not supported or permission denied.',
    aiAssistantGreeting: 'Hello! I am your Agri AI Assistant. How can I help you with your crops, soil, or pest control today?',
    aiApiKeyMissing: 'Gemini API key is not configured. Add VITE_GEMINI_API_KEY to your .env file to enable AI features.',
    aiApiKeyBannerDismiss: 'Dismiss',
    aiNetworkError: 'Network error — could not reach Gemini AI. Check your connection and try again.',
    aiGeminiRequired: 'Configure VITE_GEMINI_API_KEY to use live AI analysis and chat.',
    aiSeverity: 'Severity',
    aiSymptoms: 'Symptoms',
    aiPrevention: 'Prevention',
    aiTreatment: 'Treatment',
    aiOrganic: 'Organic Options',
    aiChemical: 'Chemical Options',
    telTitle: 'Telemetry IoT Hub',
    telSubtitle: 'Live sensor readings from AgroNode field devices',
    telSoil: 'Soil Moisture',
    telTemp: 'Ambient Temperature',
    telHumidity: 'Relative Humidity',
    telConnected: 'Device Connected: AgroNode-v1',
    telDisconnected: 'No device connected',
    telPairDevice: 'Pair Device',
    telPaired: 'Paired',
    telLastReading: 'Last reading',
    telStatus: 'Status',
    amTitle: 'AgriMarket Hub',
    amSubtitle: 'Enter crop, quantity, and location to find live prices and verified buyers.',
    amCrop: 'Crop',
    amQuantity: 'Quantity',
    amUnit: 'Unit',
    amLocation: 'Location',
    amSearch: 'Find Buyers or Price',
    amTangaBid: 'TangaBid Price Index',
    amLive: 'Live',
    amAvgPrice: 'Average Market Price',
    amHub: 'Market Hub',
    amHubLocation: 'Location',
    amPricePerKg: 'RWF/Kg',
    amTotalEval: 'Live Total Evaluation',
    amBuyers: 'eHaho Buyer Network',
    amVerified: 'Verified Buyer',
    amOrderCycle: 'Order cycle',
    amMinVolume: 'Min volume',
    amPriceOffer: 'Price offer',
    amResponseTime: 'Response time',
    amSubmitOffer: 'Submit Supply Offer',
    amOfferSent: 'Offer Sent',
    amNoBuyers: 'No verified buyers available for this crop right now.',
    amEmptyTitle: 'Enter crop details to begin',
    amEmptyBody: 'Click "Find Buyers or Price" to load TangaBid market rates and eHaho verified buyers.',
    amSelectCrop: 'Select a crop…',
    amEstimatedTotal: 'Estimated total value',
    satTitle: 'Land Analytics',
    satSubtitle: 'Satellite vegetation intelligence',
    satDrawBoundary: 'Draw Boundary',
    satEditVertex: 'Edit Vertex',
    satClear: 'Clear',
    satLocate: 'Locate Me',
    satLayers: 'Layers',
    satFinish: 'Finish',
    satCancel: 'Cancel',
    satEmptyTitle: 'Draw a land boundary to begin',
    satEmptyBody: 'Use the Draw Boundary tool to outline a field patch and unlock NDVI analytics.',
    satVegetation: 'Vegetation Health',
    satNdvi: 'NDVI',
    satTrend: 'NDVI Trend',
    satStatus: 'Status',
    satMoisture: 'Moisture',
    satArea: 'Area',
    satHealthy: 'Healthy',
    satStress: 'Stress level',
    satLow: 'Low',
    satCurrentMoisture: 'Current moisture',
    satSevenDayAvg: '7-day NDVI avg',
    satStressLevel: 'Stress level',
    satEditPlot: 'Edit Plot',
    satResetView: 'Reset View',
    satLocateMe: 'Locate Me',
    satViewAnalytics: 'View Field Analytics',
    satFieldAnalytics: 'Field Analytics',
    satTotalArea: 'Total Surface Area',
    satHectares: 'Ha',
    satAcres: 'Ac',
    satCropHealth: 'Crop Health Index',
    satHighChloro: 'High Chlorophyll / Healthy',
    satSoilMoistureEst: 'Soil Moisture Estimate',
    satFieldCapacity: 'Field Capacity',
    satModerate: 'Moderate',
    satOptimal: 'Optimal',
    satDeficiency: 'Deficiency / Disease Risk',
    satVegHeatmap: 'Vegetation Index Heatmap',
    satHeatmapToggle: 'Colorize NDVI Heatmap',
    sat6MonthTrend: '6-Month Crop Vigor Trend',
    satCropVigor: 'Crop Vigor (NDVI)',
    satInputCalc: 'Smart Input Calculator',
    satFertilizerNeeded: 'Estimated Fertilizer Needed',
    satSeedVolume: 'Recommended Seed Volume',
    satWeatherForecast: 'Weather & Micro-Climate Forecast',
    satRainfall: 'Rainfall',
    satTemperature: 'Temperature',
    sat5Day: '5-Day Hyper-Local Forecast',
    satClose: 'Close',
    satDrawingHint: 'Click to add boundary points',
    satResetDone: 'View reset',
    satLocating: 'Locating…',
    satFieldA: 'Field A',
    satSentinel: 'Sentinel-2 L2A',
    welcomeHeroEyebrow: 'Next-gen farm intelligence',
    welcomeHeroTitle: 'Beyond Farming.',
    welcomeHeroSubtitle: 'Next-generation agricultural analytics, satellite insights, and smart marketplace access.',
    welcomeHeroCta1: 'ENTER',
    welcomeHeroCta2: '®',
    welcomeHeroCorner: 'Beyond Farming.',
    welcomeHeroSubline: 'Luxury agritech',
    satSearchLocation: 'Location',
    satSearchTitle: 'Enter a location to begin',
    satSearchPlaceholder: 'Enter location or address',
    satSearchPlot: 'Search plot',
    satUseGps: 'Use my GPS',
    satSearching: 'Searching…',
    satCutBoundary: 'Cut boundary',
    satFinishBoundary: 'Finish Boundary',
    satOpenAnalytics: 'Open Field Analytics',
  },
  rw: {
    brand: 'AGRI X',
    tagline: 'Ubumenyi k\' ubuhinzi',
    navAICenter: 'igice cya AI',
    navAICenterDesc: 'Gusesengura + Kubaza AI',
    navLand: 'kugenzura ubutaka',
    navLandDesc: 'gukoresha satelite',
    navTelemetry: 'igikoresho Quantum ',
    navTelemetryDesc: 'Ibipimo by\'igikoresho',
    navAgriMarket: 'igice cy\'Ubucuruzi',
    navAgriMarketDesc: 'Ibiciro n\'abaguzi',
    switchTo: 'English',
    aiTitle: 'Igice cya AI — baza ku byubuhinzi',
    aiSubtitle: 'Shyiraho ifoto y\'ikimpera kugira ngo hapimwe indwara.',
    aiTakePhoto: 'Fata Ifoto',
    aiUpload: 'Shyiramo Ifoto',
    aiAnalyzing: 'Korera ipimo ry\'ifoto…',
    aiAnalyzingSub: 'Model ya Computer vision — gusesengura no gushyira mu byiciro',
    aiRejected: 'Ifoto Ntabwo Yemewe',
    aiRejectEn: '',
    aiRejectRw: 'Ifoto ntabwo igaragaza ikirimbwa. Koresha ifoto y\'ikirimbwa cyangwa ibabi ryacyo.',
    aiTryAgain: 'Gerageza Andi Mafoto',
    aiResult: 'gupimpa byarangiye',
    aiAnalyzedSample: 'Ifoto y\'ipimo',
    aiBboxNote: 'Ahari ibimenyetso by\'indwara',
    aiReadoutTitle: 'Igisubizo',
    aiVerifiedBadge: 'amakuru Yemejwe: Isomero ya RAB / MINAGRI',
    aiPlayTTS: 'Guhuza amagambo',
    aiSources: 'Inkomoko',
    aiNewScan: 'Ibipimo bishya',
    aiDisclaimer: 'Ibipimo byakozwe n\'AI. Emeranya n\'umuganga w\'imyaka w\'akarere mbere y\'ko ukoresha imiti.',
    aiMicIdle: 'Kanda uvuge',
    aiMicRecording: 'tega amatwi…',
    aiMicTranscribing: 'Guhindura mu nyandiko…',
    aiTabScanner: 'IFOTO',
    aiTabAssistant: ' AI',
    aiChatPlaceholder: 'Aho Babariza ...',
    aiVoiceLang: 'Ururimi rw\'amajwi',
    aiListening: 'tega amatwi... Vuga ubu',
    aiReadAloud: 'Soma mu majwi',
    aiStopTTS: 'Hagarika amajwi',
    aiSpeechNotSupported: 'Guhindura amajwi mu nyandiko ntibishyigikiwe cyangwa wabyanze.',
    aiAssistantGreeting: 'Muraho! Ndi Umufasha wawe w\'ubuhinzi wa AI. Ntagufasha iki uyu munsi ku bijyanye n\'ibihingwa, ubutaka cyangwa imiti?',
    aiApiKeyMissing: 'Urufunguzo rwa Gemini ntabwo rwashyizweho. Ongeramo VITE_GEMINI_API_KEY muri .env kugira ngo ukoreshe AI.',
    aiApiKeyBannerDismiss: 'Funga',
    aiNetworkError: 'Ikibazo cya network — ntitwashoboye kugera kuri Gemini AI. Reba connection yawe hanyuma ugerageze.',
    aiGeminiRequired: 'Shyiraho VITE_GEMINI_API_KEY kugira ngo ukoreshe isesengura na chat ya AI.',
    aiSeverity: 'Uburemere',
    aiSymptoms: 'Ibimenyetso',
    aiPrevention: 'Uburyo bwo kwirinda',
    aiTreatment: 'Uburyo bwo kuvura',
    aiOrganic: 'Imiti y\'Imborera',
    aiChemical: 'Imiti yo munganda',
    telTitle: 'Igikoresho Quantum',
    telSubtitle: 'Ibipimo bifatwa  n\' AgroQuantum',
    telSoil: 'Ubuhehere bw\'ubutaka',
    telTemp: 'Igereranya ry\'ubushyuhe',
    telHumidity: 'Ubuhehere bw\'ikirere',
    telConnected: 'Igikoresho kiriho: AgroQuantum',
    telDisconnected: 'Nta igikoresho kiboneka',
    telPairDevice: 'Shyiraho Igikoresho',
    telPaired: 'Cyashyizweho',
    telLastReading: 'Ibyo byasabwe',
    telStatus: 'Imiterere',
    amTitle: 'Igice cy\'Ubucuruzi',
    amSubtitle: 'Shyiramo igihingwa, Ingano, n\'aho biherereye kugira ngo ubone ibiciro n\'abaguzi.',
    amCrop: 'Igihingwa',
    amQuantity: 'ingano',
    amUnit: 'Igipimo',
    amLocation: 'Aho biherereye',
    amSearch: 'Shaka Abaguzi cyangwa Igiciro',
    amTangaBid: 'Igiciro ',
    amLive: 'Kuri Live',
    amAvgPrice: 'Igiciro cy\'isoko rusange',
    amHub: 'ISoko',
    amHubLocation: 'Aho biherereye',
    amPricePerKg: 'RWF/Kg',
    amTotalEval: 'agaciro',
    amBuyers: 'Urwego  rw\'abaguzi',
    amVerified: 'Wemewe n\'ikigo',
    amOrderCycle: 'Igihe cy\'iby\'amaganyi',
    amMinVolume: 'ingano n\'rengwa',
    amPriceOffer: 'Igiciro cyatanzwe',
    amResponseTime: 'Igihe cy\'igisubizo',
    amSubmitOffer: 'Tanga Ofe (Supply Offer)',
    amOfferSent: 'Ofe Yoherejwe',
    amNoBuyers: 'Nta baguzi bemewe bagaragara kuri iki gihe.',
    amEmptyTitle: 'Shyiramo amakuru y\'igihingwa',
    amEmptyBody: 'Kanda "Shaka Abaguzi cyangwa Igiciro" kugira ngo ubone ibiciro n\'abaguzi bemewe.',
    amSelectCrop: 'Hitamo igihingwa…',
    amEstimatedTotal: 'agaciro kose hamwe',
    welcomeHeroEyebrow: 'Ikoranabuhanga ry\'ubuhinzi bugezweho ',
    welcomeHeroTitle: 'Ubuhinzi.',
    welcomeHeroSubtitle: 'Gusesegura ubuhinzi, ubumenyi bw\'amakuru avuye kuri satelite ungenzura umurima wawe, n\'uburyo bwo kugera ku masoko kandi bitagusabye kuva aho uri.',
    welcomeHeroCta1: 'INJIRA',
    welcomeHeroCta2: '®',
    welcomeHeroCorner: 'Ubuhinzi.',
    welcomeHeroSubline: 'Ikoranabuhanga ry\'ubuhinzi ryo ku rwego rwo hejuru',
    satTitle: 'kugenzura ubutaka',
    satSubtitle: 'Ubumenyi bw\'satelite ku bimera',
    satDrawBoundary: 'Shiraho urubibi',
    satEditVertex: 'Hindura Ahantu',
    satClear: 'Siba',
    satLocate: 'locating',
    satLayers: 'Inzira',
    satFinish: 'Rangiza',
    satCancel: 'Hagarika',
    satEmptyTitle: 'Shiraho urububi rw\'ubutaka',
    satEmptyBody: 'Koresha igikoresho cyo gushiraho urububi kugira ngo ubone ibipimo bya satelite.',
    satVegetation: 'Ubwiza bw\'bimera',
    satNdvi: 'NDVI',
    satTrend: 'Imiterere ya NDVI',
    satStatus: 'Imiterere',
    satMoisture: 'Ubuhehere',
    satArea: 'Ubunini',
    satHealthy: 'Byiza',
    satStress: 'Urugero rw\'ibyago',
    satLow: 'Byorohejwe',
    satCurrentMoisture: 'Ubuhehere ubu',
    satSevenDayAvg: 'Impuzandengo y\'iminsi 7',
    satStressLevel: 'Urugero rw\'ibyago',
    satEditPlot: 'Hindura Umurima',
    satResetView: 'Ongera Uturebe',
    satLocateMe: 'Mbona Aho Ndi',
    satViewAnalytics: 'Reba Ibyerekeye Umurima',
    satFieldAnalytics: 'Ibyerekeye Umurima',
    satTotalArea: 'Ubunini bw\'ubutaka',
    satHectares: 'Ha',
    satAcres: 'Ac',
    satCropHealth: 'Ubuzima bw\'ibihingwa',
    satHighChloro: 'Chlorophyll ninini / Byiza',
    satSoilMoistureEst: 'Igereranya ry\'ubuhehere bw\'ubutaka',
    satFieldCapacity: 'Ubushobozi bw\'ubutaka',
    satModerate: 'Hagati',
    satOptimal: 'Byiza cyane',
    satDeficiency: 'Ibyago cyangwa Indwara',
    satVegHeatmap: 'Ikarita y\'ubwizima bw\'ibimera',
    satHeatmapToggle: 'Kora Heatmap ya NDVI',
    sat6MonthTrend: 'Imiterere y\'amezi 6',
    satCropVigor: 'Imbaraga z\'ibihingwa (NDVI)',
    satInputCalc: 'Kalkulateri y\'ibikoresho',
    satFertilizerNeeded: 'Ifumbire ikenewe',
    satSeedVolume: 'Inigimbi y\'amabanga',
    satWeatherForecast: 'Itegekere ry\'ibihe',
    satRainfall: 'Imvura',
    satTemperature: 'Ubushyuhe',
    sat5Day: 'Itegekere ry\'iminsi 5',
    satClose: 'Funga',
    satDrawingHint: 'Kanda ushize aho bigaragara',
    satResetDone: 'Byongerejwe',
    satLocating: 'Mbaraga…',
    satFieldA: 'Umurima A',
    satSentinel: 'Sentinel-2 L2A',
    satSearchLocation: 'Ahantu',
    satSearchTitle: 'Shyiramo aho uri gutangirira',
    satSearchPlaceholder: 'Shyiraho aho utuye cyangwa adresse',
    satSearchPlot: 'Shakisha umurima',
    satUseGps: 'Koresha GPS yange',
    satSearching: 'Gushaka…',
    satCutBoundary: 'Kora umupaka',
    satFinishBoundary: 'Rangiza Umupaka',
    satOpenAnalytics: 'Fungura Ibyerekeye Umurima',
  },
};

interface LangContextValue {
  lang: Lang;
  t: Translation;
  toggle: () => void;
  setLang: (l: Lang) => void;
}

const LangContext = createContext<LangContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>('en');
  const toggle = () => setLang((l) => (l === 'en' ? 'rw' : 'en'));
  return (
    <LangContext.Provider value={{ lang, t: TRANSLATIONS[lang], toggle, setLang }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLang() {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error('useLang must be used within LanguageProvider');
  return ctx;
}
