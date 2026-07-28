import { ScanLine, Satellite, Cpu, ShoppingBag } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export type ViewId = 'aicenter' | 'satellite' | 'telemetry' | 'agrimarket';

export interface NavItem {
  id: ViewId;
  icon: LucideIcon;
}

export const NAV_ITEMS: NavItem[] = [
  { id: 'aicenter', icon: ScanLine },
  { id: 'satellite', icon: Satellite },
  { id: 'telemetry', icon: Cpu },
  { id: 'agrimarket', icon: ShoppingBag },
];
