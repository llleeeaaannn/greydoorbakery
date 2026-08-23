import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Item } from '../types';
import { CURRENCY } from '../types';

type Props = {
  item: Item;
  index: number;
  onRemove: () => void;
};

export function SortableItem({ item, index, onRemove }: Props) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: item.id });

  return (
    <li
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.6 : 1,
      }}
      className="flex items-center gap-3 px-3 py-3 bg-cream-hi border border-door/10 rounded-xl2 touch-none"
    >
      <button
        type="button"
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing text-door-soft px-1"
        aria-label="Drag to reorder"
      >
        ⋮⋮
      </button>
      <span className="w-6 text-door-soft font-sans text-sm tabular-nums">
        {index + 1}.
      </span>
      <div className="flex-1 min-w-0">
        <div className="font-display font-medium lowercase tracking-tight text-base truncate">
          {item.name}
        </div>
        <div className="text-sm text-terracotta font-semibold">
          {CURRENCY}
          {item.price.toFixed(2)}
        </div>
      </div>
      <button
        type="button"
        onClick={onRemove}
        className="text-sm px-2 py-1 text-door-soft hover:text-terracotta"
        aria-label="Remove from menu"
      >
        ✕
      </button>
    </li>
  );
}
