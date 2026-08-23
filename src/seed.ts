import type { Item, BakeryInfo } from './types';

export const SEED_ITEMS: Item[] = [
  { id: 'seed-1', name: 'Brown Bread', price: 8.0 },
  { id: 'seed-2', name: 'Brown Bread Beag', price: 6.0 },
  { id: 'seed-3', name: 'Granola', price: 7.0 },
  { id: 'seed-4', name: 'Lemon Drizzle Cake', price: 6.0 },
  { id: 'seed-5', name: 'Carrot Cake', price: 6.0 },
  { id: 'seed-6', name: 'Chocolate Brownies', price: 6.0 },
  { id: 'seed-7', name: 'Scones', price: 1.0 },
];

export const SEED_BAKERY_INFO: BakeryInfo = {
  name: 'Grey Door Bakery',
  address: '123 Example Street, Your Town',
  contact: 'message @greydoorbakery or 086323040 to order',
  footerNote: 'Order by Thursday evening · Collection on Saturday morning',
  logoDataUrl: '/logo.png',
};
