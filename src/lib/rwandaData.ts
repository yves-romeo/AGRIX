export type CropId =
  | 'ibigori'
  | 'amasaka'
  | 'umuceri'
  | 'ingano'
  | 'ibishyimbo'
  | 'imiteja'
  | 'soya'
  | 'ubunyobwa'
  | 'amashaza'
  | 'ibirayi'
  | 'ibijumba'
  | 'imyumbati'
  | 'imyungu'
  | 'inyanya'
  | 'ibitunguru'
  | 'amashu'
  | 'karoti'
  | 'piripiri'
  | 'ibitoki';

export interface RwandanCrop {
  id: CropId;
  name: string;
  english: string;
  emoji: string;
  category: string;
}

export const RWANDAN_CROPS: RwandanCrop[] = [
  { id: 'ibigori', name: 'Ibigori', english: 'Maize', emoji: '🌽', category: 'Cereals' },
  { id: 'amasaka', name: 'Amasaka', english: 'Sorghum', emoji: '🌾', category: 'Cereals' },
  { id: 'umuceri', name: 'Umuceri', english: 'Rice', emoji: '🍚', category: 'Cereals' },
  { id: 'ingano', name: 'Ingano', english: 'Wheat', emoji: '🌾', category: 'Cereals' },
  { id: 'ibishyimbo', name: 'ibishyimbo', english: 'Beans', emoji: '🫘', category: 'Legumes' },
  { id: 'imiteja', name: 'Imiteja', english: 'French Beans', emoji: '🫛', category: 'Legumes' },
  { id: 'soya', name: 'Soya', english: 'Soybeans', emoji: '🫘', category: 'Legumes' },
  { id: 'ubunyobwa', name: 'Ubunyobwa', english: 'Groundnuts', emoji: '🥜', category: 'Legumes' },
  { id: 'amashaza', name: 'Amashaza', english: 'Peas', emoji: '🫛', category: 'Legumes' },
  { id: 'ibirayi', name: 'Ibirayi', english: 'Irish Potatoes', emoji: '🥔', category: 'Roots & Tubers' },
  { id: 'ibijumba', name: 'Ibijumba', english: 'Sweet Potatoes', emoji: '🍠', category: 'Roots & Tubers' },
  { id: 'imyumbati', name: 'Imyumbati', english: 'Cassava', emoji: '🥖', category: 'Roots & Tubers' },
  { id: 'imyungu', name: 'Imyungu', english: 'Yams', emoji: '🍠', category: 'Roots & Tubers' },
  { id: 'inyanya', name: 'Inyanya', english: 'Tomato', emoji: '🍅', category: 'Vegetables' },
  { id: 'ibitunguru', name: 'Ibitunguru', english: 'Onion', emoji: '🧅', category: 'Vegetables' },
  { id: 'amashu', name: 'Amashu', english: 'Cabbage', emoji: '🥬', category: 'Vegetables' },
  { id: 'karoti', name: 'Karoti', english: 'Carrot', emoji: '🥕', category: 'Vegetables' },
  { id: 'piripiri', name: 'Piripiri', english: 'Pepper', emoji: '🌶️', category: 'Vegetables' },
  { id: 'ibitoki', name: 'Ibitoki', english: 'Banana', emoji: '🍌', category: 'Fruits' },
];

export const CROP_CATEGORIES = ['Cereals', 'Legumes', 'Roots & Tubers', 'Vegetables', 'Fruits'];
