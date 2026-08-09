// Mock data for the AI Assistant and AgriMarket Hub views.

export interface KnowledgeSource {
  id: string;
  title: string;
  source: string;
  type: 'Guide' | 'Policy' | 'Report' | 'Dataset';
  updated: string;
  relevant: boolean;
}

export const KNOWLEDGE_SOURCES: KnowledgeSource[] = [
  {
    id: 'k1',
    title: 'Ibirayi bya Kinigi — Imikoreshereze y\'imyaka (2025)',
    source: 'RAB',
    type: 'Guide',
    updated: '2026-06',
    relevant: true,
  },
  {
    id: 'k2',
    title: 'Amabwiriza ku kwirinda indwara z\'ibirayi',
    source: 'MINAGRI',
    type: 'Policy',
    updated: '2026-05',
    relevant: true,
  },
  {
    id: 'k3',
    title: 'Ibarwa ry\'imyaka mu Karere ka Musanze',
    source: 'RAB',
    type: 'Dataset',
    updated: '2026-04',
    relevant: true,
  },
  {
    id: 'k4',
    title: 'Politiki y\'ubuhinzi mu Rwanda 2025–2030',
    source: 'MINAGRI',
    type: 'Report',
    updated: '2026-01',
    relevant: false,
  },
  {
    id: 'k5',
    title: 'Imikoreshereze y\'ifumbire m\'ubuhinzi bw\'ibirayi',
    source: 'RAB',
    type: 'Guide',
    updated: '2026-03',
    relevant: false,
  },
];

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  card?: AssistantCard;
}

export interface AssistantCard {
  title: string;
  sections: { heading: string; body: string }[];
  sources: string[];
}

// Sample Kinyarwanda voice query + structured response
export const SAMPLE_VOICE_QUERY = 'Ubwoko bw\'ibirayi bya Kinigi birwara iki?';

export const SAMPLE_VOICE_RESPONSE: AssistantCard = {
  title: 'Indwara z\'ibirayi bya Kinigi n\'uburyo zirwanywa',
  sections: [
    {
      heading: 'Indwara z\'ibimenyetszo (Symptoms)',
      body:
        'Amababi y\'ibirayi bya Kinigi ahindura umuhondo, hanyuma ajya yera cyangwa ajya asa n\'amabuye y\'umweru. Imiti y\'urutoke ikuze ku mababi, n\'imiko y\'amoko ya Kinigi ikunda guhura n\'indwara yitwa "Late Blight" (Indwara y\'amababi).',
    },
    {
      heading: 'Impamvu (Causes)',
      body:
        'Indwara ya Late Blight iterwa n\'agahumyi gititwa Phytophthora infestans. Ikunda mu gihe cy\'imvura nyinshi n\'ubukonje buke, mu temperature yo hasi ya 18°C hamwe n\'ubuhehere bwinshi.',
    },
    {
      heading: 'Uburyo bwo kwirinda (Prevention)',
      body:
        '1. Himba amoko y\'ibirayi bihangana n\'indwara nka Kinigi, Musanze, na Gikungu. 2. Fata imyaka igihe cyiza mu gihe cy\'izuba. 3. Ikoresha ifumbire y\'imitsi mu rugo kugira ngo ibyari byongere ubudahangarwa. 4. Sukura no gukuraho ibyatsi byangiza imyaka buri cyumweru.',
    },
    {
      heading: 'Uburyo bwo kuvura (Treatment)',
      body:
        'Ikoresha imiti yongera kwirinda indwara nka Ridomil Gold cyangwa Mancozeb mu gihe cy\'imvura. Shyira mu mazi mu rugo (drench) cyangwa fata ku mababi (spray) buri minsi 7. Menya ko ikoreshwa ry\'imiti rikwiye gukorwa mu gitondo cyo kare cyangwa nimugoroba.',
    },
  ],
  sources: ['RAB — Ibirayi bya Kinigi Guide (2025)', 'MINAGRI — Amabwiriza ku kwirinda indwara (2026)'],
};

// AgriMarket Hub data
export interface RwandanCrop {
  id: string;
  name: string; // Kinyarwanda name
  english: string;
  emoji: string;
}

export const RWANDAN_CROPS: RwandanCrop[] = [
  { id: 'ibirayi', name: 'Ibirayi (Kinigi)', english: 'Irish Potato — Kinigi variety', emoji: '🥔' },
  { id: 'ibigori', name: 'Ibigori', english: 'Maize', emoji: '🌽' },
  { id: 'ubushyimbo', name: 'Ubushyimbo', english: 'Beans', emoji: '🫘' },
  { id: 'amasaka', name: 'Amasaka', english: 'Sorghum', emoji: '🌾' },
  { id: 'imiteja', name: 'Imiteja', english: 'Cassava', emoji: '🍠' },
];

export interface MarketHub {
  name: string;
  location: string;
  pricePerKg: number; // RWF
}

export interface CropMarketData {
  cropId: string;
  averagePrice: number; // RWF/kg
  hubs: MarketHub[];
  trend: number[];
  unit: string;
}

export const MARKET_DATA: Record<string, CropMarketData> = {
  ibirayi: {
    cropId: 'ibirayi',
    averagePrice: 480,
    unit: 'RWF/Kg',
    hubs: [
      { name: 'Kimironko Market', location: 'Kigali', pricePerKg: 490 },
      { name: 'Nyabugogo Market', location: 'Kigali', pricePerKg: 475 },
      { name: 'Musanze Market', location: 'Northern', pricePerKg: 470 },
      { name: 'Huye Market', location: 'Southern', pricePerKg: 485 },
    ],
    trend: [430, 445, 460, 455, 470, 475, 480],
  },
  ibigori: {
    cropId: 'ibigori',
    averagePrice: 320,
    unit: 'RWF/Kg',
    hubs: [
      { name: 'Kimironko Market', location: 'Kigali', pricePerKg: 330 },
      { name: 'Nyabugogo Market', location: 'Kigali', pricePerKg: 315 },
      { name: 'Kibuye Market', location: 'Western', pricePerKg: 310 },
      { name: 'Huye Market', location: 'Southern', pricePerKg: 325 },
    ],
    trend: [290, 300, 305, 310, 315, 318, 320],
  },
  ubushyimbo: {
    cropId: 'ubushyimbo',
    averagePrice: 720,
    unit: 'RWF/Kg',
    hubs: [
      { name: 'Kimironko Market', location: 'Kigali', pricePerKg: 735 },
      { name: 'Nyabugogo Market', location: 'Kigali', pricePerKg: 710 },
      { name: 'Ruhango Market', location: 'Southern', pricePerKg: 705 },
      { name: 'Musanze Market', location: 'Northern', pricePerKg: 730 },
    ],
    trend: [680, 690, 700, 710, 715, 718, 720],
  },
  amasaka: {
    cropId: 'amasaka',
    averagePrice: 380,
    unit: 'RWF/Kg',
    hubs: [
      { name: 'Nyabugogo Market', location: 'Kigali', pricePerKg: 390 },
      { name: 'Huye Market', location: 'Southern', pricePerKg: 375 },
      { name: 'Bugesera Market', location: 'Eastern', pricePerKg: 370 },
      { name: 'Musanze Market', location: 'Northern', pricePerKg: 385 },
    ],
    trend: [340, 350, 360, 365, 370, 375, 380],
  },
  imiteja: {
    cropId: 'imiteja',
    averagePrice: 250,
    unit: 'RWF/Kg',
    hubs: [
      { name: 'Kimironko Market', location: 'Kigali', pricePerKg: 260 },
      { name: 'Nyabugogo Market', location: 'Kigali', pricePerKg: 245 },
      { name: 'Bugesera Market', location: 'Eastern', pricePerKg: 240 },
      { name: 'Kibuye Market', location: 'Western', pricePerKg: 255 },
    ],
    trend: [220, 230, 235, 240, 245, 248, 250],
  },
};

export interface EhahoBuyer {
  id: string;
  name: string;
  verified: boolean;
  rating: number;
  location: string;
  orderCycle: 'Weekly' | 'Bi-weekly' | 'Monthly';
  minVolumeKg: number;
  priceOffer: string;
  responseTime: string;
  crops: string[];
}

export const EHAHO_BUYERS: EhahoBuyer[] = [
  {
    id: 'e1',
    name: 'Ministry Stores Ltd.',
    verified: true,
    rating: 4.8,
    location: 'Kigali',
    orderCycle: 'Weekly',
    minVolumeKg: 1000,
    priceOffer: 'Market +3%',
    responseTime: '~2 hours',
    crops: ['ibirayi', 'ibigori'],
  },
  {
    id: 'e2',
    name: 'Kinigi Agro Processing',
    verified: true,
    rating: 4.9,
    location: 'Musanze',
    orderCycle: 'Bi-weekly',
    minVolumeKg: 500,
    priceOffer: 'Market +5%',
    responseTime: '~1 hour',
    crops: ['ibirayi'],
  },
  {
    id: 'e3',
    name: 'Huye Food Distributors',
    verified: true,
    rating: 4.6,
    location: 'Huye',
    orderCycle: 'Weekly',
    minVolumeKg: 800,
    priceOffer: 'Market +2%',
    responseTime: '~4 hours',
    crops: ['ubushyimbo', 'amasaka'],
  },
  {
    id: 'e4',
    name: 'Bugesera Grain Co-op',
    verified: true,
    rating: 4.5,
    location: 'Bugesera',
    orderCycle: 'Monthly',
    minVolumeKg: 2000,
    priceOffer: 'Market rate',
    responseTime: '~6 hours',
    crops: ['ibigori', 'amasaka', 'imiteja'],
  },
  {
    id: 'e5',
    name: 'Northern Roots Trading',
    verified: true,
    rating: 4.7,
    location: 'Musanze',
    orderCycle: 'Bi-weekly',
    minVolumeKg: 600,
    priceOffer: 'Market +4%',
    responseTime: '~3 hours',
    crops: ['ibirayi', 'imiteja'],
  },
  {
    id: 'e6',
    name: 'Kigali Wholesale Foods',
    verified: false,
    rating: 4.2,
    location: 'Kigali',
    orderCycle: 'Weekly',
    minVolumeKg: 1500,
    priceOffer: 'Market rate',
    responseTime: '~12 hours',
    crops: ['ibigori', 'ubushyimbo'],
  },
];
