import { useCallback, useEffect, useState } from 'react';
import type { BakeryInfo, CurrentMenu, Item } from './types';
import { SEED_BAKERY_INFO, SEED_ITEMS } from './seed';

const KEYS = {
  items: 'gdb.items.v1',
  bakery: 'gdb.bakery.v1',
  currentMenu: 'gdb.currentMenu.v1',
} as const;

function readJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw == null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJSON(key: string, value: unknown) {
  localStorage.setItem(key, JSON.stringify(value));
}

function usePersistentState<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => readJSON<T>(key, initial));
  useEffect(() => {
    writeJSON(key, value);
  }, [key, value]);
  return [value, setValue] as const;
}

export function useItems() {
  const [items, setItems] = usePersistentState<Item[]>(KEYS.items, SEED_ITEMS);

  const addItem = useCallback((name: string, price: number) => {
    setItems((prev) => [
      ...prev,
      { id: crypto.randomUUID(), name: name.trim(), price },
    ]);
  }, [setItems]);

  const updateItem = useCallback((id: string, patch: Partial<Omit<Item, 'id'>>) => {
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, ...patch } : it)));
  }, [setItems]);

  const deleteItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((it) => it.id !== id));
  }, [setItems]);

  return { items, addItem, updateItem, deleteItem };
}

export function useBakeryInfo() {
  return usePersistentState<BakeryInfo>(KEYS.bakery, SEED_BAKERY_INFO);
}

function defaultMenu(): CurrentMenu {
  return { date: todayISO(), orderedItemIds: [] };
}

export function useCurrentMenu() {
  return usePersistentState<CurrentMenu>(KEYS.currentMenu, defaultMenu());
}

export function todayISO(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}
