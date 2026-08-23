export type Item = {
  id: string;
  name: string;
  price: number;
};

export type BakeryInfo = {
  name: string;
  address: string;
  contact: string;
  footerNote: string;
  logoDataUrl: string | null;
};

export type CurrentMenu = {
  date: string;
  orderedItemIds: string[];
};

export const CURRENCY = '€';

export type StudioOverlayKey = 'logo' | 'squiggle' | 'star' | 'circle';

export type StudioLayer = {
  id: string;
  type: 'text' | 'overlay' | 'draw';
  content: string;
  x: number;
  y: number;
  size: number;
  color: string;
  font?: 'display' | 'sans';
  weight?: 'thin' | 'bold';
};

export type StudioAspectRatio = '1:1' | '3:4' | '9:16';
