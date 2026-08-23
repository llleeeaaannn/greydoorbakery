import { useState } from 'react';
import { useItems } from '../storage';
import type { Item } from '../types';
import { CURRENCY } from '../types';

export function ItemsScreen() {
  const { items, addItem, updateItem, deleteItem } = useItems();
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

  const canSubmit = name.trim().length > 0 && !isNaN(parseFloat(price)) && parseFloat(price) >= 0;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    const p = parseFloat(parseFloat(price).toFixed(2));
    if (editingId) {
      updateItem(editingId, { name: name.trim(), price: p });
      setEditingId(null);
    } else {
      addItem(name, p);
    }
    setName('');
    setPrice('');
  }

  function startEdit(item: Item) {
    setEditingId(item.id);
    setName(item.name);
    setPrice(String(item.price));
  }

  function cancelEdit() {
    setEditingId(null);
    setName('');
    setPrice('');
  }

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-8">
      <div className="mb-6">
        <div className="eyebrow mb-2">Library</div>
        <h1 className="font-display font-semibold text-4xl tracking-tight lowercase">
          menu items<span className="text-terracotta">.</span>
        </h1>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-cream-hi rounded-xl2 p-4 mb-6 flex flex-col sm:flex-row gap-3 border border-door/10"
      >
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Item name (e.g., Sourdough Loaf)"
          className="flex-1 px-3 py-2 rounded-lg border border-door/15 bg-cream focus:outline-none focus:ring-2 focus:ring-terracotta/60"
        />
        <div className="flex gap-2">
          <div className="relative flex-1 sm:w-32">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-door-soft">
              {CURRENCY}
            </span>
            <input
              type="number"
              step="0.01"
              min="0"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="0.00"
              className="w-full pl-8 pr-3 py-2 rounded-lg border border-door/15 bg-cream focus:outline-none focus:ring-2 focus:ring-terracotta/60"
            />
          </div>
          <button
            type="submit"
            disabled={!canSubmit}
            className="px-4 py-2 rounded-lg bg-door text-cream font-medium disabled:opacity-40 hover:bg-door-soft transition-colors"
          >
            {editingId ? 'Save' : 'Add'}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={cancelEdit}
              className="px-3 py-2 rounded-lg border border-door/15 text-door-soft"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      {items.length === 0 ? (
        <p className="text-door-soft italic text-center py-8">No items yet. Add one above.</p>
      ) : (
        <ul className="bg-cream-hi rounded-xl2 border border-door/10 divide-y divide-door/10 overflow-hidden">
          {items.map((item) => (
            <li key={item.id} className="flex items-center gap-3 px-4 py-3">
              <div className="flex-1 min-w-0">
                <div className="font-display font-medium text-lg lowercase tracking-tight truncate">
                  {item.name}
                </div>
                <div className="text-sm text-terracotta font-semibold">
                  {CURRENCY}
                  {item.price.toFixed(2)}
                </div>
              </div>
              <button
                onClick={() => startEdit(item)}
                className="text-sm px-3 py-1 rounded-lg border border-door/15 text-door-soft hover:bg-door/5"
              >
                Edit
              </button>
              <button
                onClick={() => {
                  if (confirm(`Delete "${item.name}"?`)) deleteItem(item.id);
                }}
                className="text-sm px-3 py-1 rounded-lg border border-terracotta/40 text-terracotta hover:bg-terracotta/10"
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
