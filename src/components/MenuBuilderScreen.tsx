import { useMemo, useRef, useState } from 'react';
import {
  DndContext,
  PointerSensor,
  TouchSensor,
  KeyboardSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { exportPng } from '../exportPng';
import { useBakeryInfo, useCurrentMenu, useItems } from '../storage';
import { MENU_34_HEIGHT, MENU_WIDTH, MenuPreview } from './MenuPreview';
import { ScaledPreview } from './ScaledPreview';
import { SortableItem } from './SortableItem';
import { CURRENCY } from '../types';

export function MenuBuilderScreen() {
  const { items } = useItems();
  const [menu, setMenu] = useCurrentMenu();
  const [bakery] = useBakeryInfo();
  const [downloading, setDownloading] = useState(false);
  const [downloading34, setDownloading34] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const menu34Ref = useRef<HTMLDivElement>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const selectedItems = useMemo(() => {
    const byId = new Map(items.map((it) => [it.id, it]));
    return menu.orderedItemIds
      .map((id) => byId.get(id))
      .filter((it): it is NonNullable<typeof it> => !!it);
  }, [items, menu.orderedItemIds]);

  const unselectedItems = useMemo(
    () => items.filter((it) => !menu.orderedItemIds.includes(it.id)),
    [items, menu.orderedItemIds],
  );

  function toggleSelect(id: string) {
    setMenu((m) => {
      if (m.orderedItemIds.includes(id)) {
        return { ...m, orderedItemIds: m.orderedItemIds.filter((x) => x !== id) };
      }
      return { ...m, orderedItemIds: [...m.orderedItemIds, id] };
    });
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setMenu((m) => {
      const oldIndex = m.orderedItemIds.indexOf(String(active.id));
      const newIndex = m.orderedItemIds.indexOf(String(over.id));
      if (oldIndex < 0 || newIndex < 0) return m;
      return { ...m, orderedItemIds: arrayMove(m.orderedItemIds, oldIndex, newIndex) };
    });
  }

  async function handleDownload() {
    if (!menuRef.current || selectedItems.length === 0) return;
    setDownloading(true);
    try {
      if (document.fonts && 'ready' in document.fonts) {
        await document.fonts.ready;
      }
      const node = menuRef.current;
      const dataUrl = await exportPng(node, {
        width: node.offsetWidth,
        height: node.offsetHeight,
        pixelRatio: 1,
        cacheBust: true,
        backgroundColor: '#EFE9DD',
      });
      const link = document.createElement('a');
      link.download = `grey-door-bakery-${menu.date || 'menu'}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error(err);
      alert('Sorry, something went wrong generating the image.');
    } finally {
      setDownloading(false);
    }
  }

  async function handleDownload34() {
    if (!menu34Ref.current || selectedItems.length === 0) return;
    setDownloading34(true);
    try {
      if (document.fonts && 'ready' in document.fonts) {
        await document.fonts.ready;
      }
      const node = menu34Ref.current;
      const dataUrl = await exportPng(node, {
        width: MENU_WIDTH,
        height: MENU_34_HEIGHT,
        pixelRatio: 1,
        cacheBust: true,
        backgroundColor: '#EFE9DD',
      });
      const link = document.createElement('a');
      link.download = `grey-door-bakery-${menu.date || 'menu'}-3x4.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error(err);
      alert('Sorry, something went wrong generating the image.');
    } finally {
      setDownloading34(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_480px] gap-8">
        <div>
          <div className="mb-6">
            <div className="eyebrow mb-2">Menu Builder</div>
            <h1 className="font-display font-semibold text-4xl tracking-tight lowercase">
              this week<span className="text-terracotta">.</span>
            </h1>
          </div>

          <div className="bg-cream-hi rounded-xl2 border border-door/10 p-4 mb-6">
            <label className="eyebrow block mb-2">Menu date</label>
            <input
              type="date"
              value={menu.date}
              onChange={(e) => setMenu((m) => ({ ...m, date: e.target.value }))}
              className="px-3 py-2 rounded-lg border border-door/15 bg-cream focus:outline-none focus:ring-2 focus:ring-terracotta/60"
            />
          </div>

          <section className="mb-6">
            <h2 className="font-display font-semibold text-2xl lowercase tracking-tight mb-1">
              on the menu
              <span className="text-door-soft font-sans font-normal text-base ml-2">
                ({selectedItems.length})
              </span>
            </h2>
            <p className="text-sm text-door-soft mb-3">
              Drag to reorder — this is the order on the printed menu.
            </p>
            {selectedItems.length === 0 ? (
              <div className="p-6 bg-cream-hi border border-dashed border-door/15 rounded-xl2 text-center text-door-soft italic">
                Pick items below to add them to this week&rsquo;s menu.
              </div>
            ) : (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={selectedItems.map((it) => it.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <ul className="flex flex-col gap-2">
                    {selectedItems.map((item, idx) => (
                      <SortableItem
                        key={item.id}
                        item={item}
                        index={idx}
                        onRemove={() => toggleSelect(item.id)}
                      />
                    ))}
                  </ul>
                </SortableContext>
              </DndContext>
            )}
          </section>

          {unselectedItems.length > 0 && (
            <section>
              <h2 className="font-display font-semibold text-2xl lowercase tracking-tight mb-3">
                library
              </h2>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {unselectedItems.map((item) => (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => toggleSelect(item.id)}
                      className="w-full text-left p-3 bg-cream-hi border border-door/10 hover:border-terracotta/50 rounded-xl2 transition-colors"
                    >
                      <div className="font-display font-medium lowercase tracking-tight truncate">
                        {item.name}
                      </div>
                      <div className="text-sm text-door-soft">
                        {CURRENCY}
                        {item.price.toFixed(2)}
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>

        <div className="lg:self-start flex flex-col gap-8">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-display font-semibold text-2xl lowercase tracking-tight">
                preview
              </h2>
              <button
                onClick={handleDownload}
                disabled={selectedItems.length === 0 || downloading}
                className="px-4 py-2 rounded-lg bg-terracotta text-cream font-semibold disabled:opacity-40 hover:bg-terracotta/90 transition-colors"
              >
                {downloading ? 'Generating…' : 'Download Menu'}
              </button>
            </div>
            <ScaledPreview>
              <MenuPreview
                ref={menuRef}
                items={selectedItems}
                date={menu.date}
                bakery={bakery}
              />
            </ScaledPreview>
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-display font-semibold text-2xl lowercase tracking-tight">
                3:4 preview
              </h2>
              <button
                onClick={handleDownload34}
                disabled={selectedItems.length === 0 || downloading34}
                className="px-4 py-2 rounded-lg bg-terracotta text-cream font-semibold disabled:opacity-40 hover:bg-terracotta/90 transition-colors"
              >
                {downloading34 ? 'Generating…' : 'Download 3:4'}
              </button>
            </div>
            <ScaledPreview>
              <MenuPreview
                ref={menu34Ref}
                items={selectedItems}
                date={menu.date}
                bakery={bakery}
                height={MENU_34_HEIGHT}
              />
            </ScaledPreview>
          </div>
        </div>
      </div>
    </div>
  );
}
