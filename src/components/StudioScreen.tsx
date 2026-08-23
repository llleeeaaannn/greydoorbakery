import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { exportPng } from '../exportPng';
import type { StudioAspectRatio, StudioLayer, StudioOverlayKey } from '../types';
import { CANVAS_DIMENSIONS, PhotoCanvas } from './studio/PhotoCanvas';
import { simplifyPath, toPolylinePath, toSmoothPath, type Point } from './studio/smoothing';

const THICKNESS_OPTIONS: { label: string; value: number }[] = [
  { label: 'Thin', value: 6 },
  { label: 'Medium', value: 14 },
  { label: 'Thick', value: 28 },
];

const PALETTE: string[] = ['#B85C3E', '#3E4044', '#1E1F21', '#EFE9DD', '#FFFFFF'];

const OVERLAY_BUTTONS: { key: StudioOverlayKey; label: string; defaultSize: number }[] = [
  { key: 'logo', label: 'Door logo', defaultSize: 320 },
  { key: 'squiggle', label: 'Squiggle', defaultSize: 360 },
  { key: 'star', label: 'Star', defaultSize: 200 },
  { key: 'circle', label: 'Circle', defaultSize: 220 },
];

const ASPECT_OPTIONS: { value: StudioAspectRatio; label: string }[] = [
  { value: '1:1', label: 'Square' },
  { value: '3:4', label: 'Portrait' },
  { value: '9:16', label: 'Story' },
];

function newId(): string {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `layer-${Math.random().toString(36).slice(2)}-${Date.now()}`;
}

export function StudioScreen() {
  const [photoDataUrl, setPhotoDataUrl] = useState<string | null>(null);
  const [aspectRatio, setAspectRatio] = useState<StudioAspectRatio>('1:1');
  const [layers, setLayers] = useState<StudioLayer[]>([]);
  const [selectedLayerId, setSelectedLayerId] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);

  const [drawMode, setDrawMode] = useState(false);
  const [drawColor, setDrawColor] = useState<string>('#B85C3E');
  const [drawThickness, setDrawThickness] = useState<number>(14);
  const [showAssets, setShowAssets] = useState(false);

  const canvasRef = useRef<HTMLDivElement>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);

  const draggingRef = useRef<{
    id: string;
    pointerId: number;
    isDraw: boolean;
    lastClientX: number;
    lastClientY: number;
  } | null>(null);
  const drawingRef = useRef<{ id: string; pointerId: number; points: Point[] } | null>(null);
  const layersRef = useRef<StudioLayer[]>(layers);
  layersRef.current = layers;

  const selectedLayer = useMemo(
    () => layers.find((l) => l.id === selectedLayerId) ?? null,
    [layers, selectedLayerId],
  );

  function updateLayer(id: string, patch: Partial<StudioLayer>) {
    setLayers((prev) => prev.map((l) => (l.id === id ? { ...l, ...patch } : l)));
  }

  function deleteLayer(id: string) {
    setLayers((prev) => prev.filter((l) => l.id !== id));
    setSelectedLayerId((s) => (s === id ? null : s));
  }

  function addTextLayer() {
    setDrawMode(false);
    const layer: StudioLayer = {
      id: newId(),
      type: 'text',
      content: 'fresh out',
      x: 50,
      y: 50,
      size: 96,
      color: '#FFFFFF',
      font: 'display',
      weight: 'bold',
    };
    setLayers((p) => [...p, layer]);
    setSelectedLayerId(layer.id);
  }

  function addOverlay(key: StudioOverlayKey, defaultSize: number) {
    setDrawMode(false);
    const layer: StudioLayer = {
      id: newId(),
      type: 'overlay',
      content: key,
      x: 50,
      y: 50,
      size: defaultSize,
      color: '#FFFFFF',
    };
    setLayers((p) => [...p, layer]);
    setSelectedLayerId(layer.id);
  }

  function handleLayerEditorChange(patch: Partial<StudioLayer>) {
    if (!selectedLayer) return;
    updateLayer(selectedLayer.id, patch);
    if (selectedLayer.type === 'draw') {
      if (patch.color !== undefined) setDrawColor(patch.color);
      if (patch.size !== undefined) setDrawThickness(patch.size);
    }
  }

  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10_000_000) {
      alert('Photo is too large — please pick an image under 10MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setPhotoDataUrl(String(reader.result));
    reader.readAsDataURL(file);
  }

  const handleLayerPointerDown = useCallback(
    (e: React.PointerEvent, layerId: string) => {
      e.stopPropagation();
      setSelectedLayerId(layerId);
      const layer = layersRef.current.find((l) => l.id === layerId);
      if (!layer) return;
      draggingRef.current = {
        id: layerId,
        pointerId: e.pointerId,
        isDraw: layer.type === 'draw',
        lastClientX: e.clientX,
        lastClientY: e.clientY,
      };
      (e.currentTarget as Element).setPointerCapture(e.pointerId);
    },
    [],
  );

  const handleCanvasPointerMove = useCallback(
    (e: React.PointerEvent) => {
      const drawing = drawingRef.current;
      if (drawing && e.pointerId === drawing.pointerId && canvasRef.current) {
        const rect = canvasRef.current.getBoundingClientRect();
        const { width: cw, height: ch } = CANVAS_DIMENSIONS[aspectRatio];
        const x = ((e.clientX - rect.left) / rect.width) * cw;
        const y = ((e.clientY - rect.top) / rect.height) * ch;
        drawing.points.push({ x, y });
        updateLayer(drawing.id, { content: toPolylinePath(drawing.points) });
        return;
      }

      const dragging = draggingRef.current;
      if (!dragging || !canvasRef.current) return;
      if (e.pointerId !== dragging.pointerId) return;
      const rect = canvasRef.current.getBoundingClientRect();
      if (dragging.isDraw) {
        const { width: cw, height: ch } = CANVAS_DIMENSIONS[aspectRatio];
        const dx = ((e.clientX - dragging.lastClientX) / rect.width) * cw;
        const dy = ((e.clientY - dragging.lastClientY) / rect.height) * ch;
        dragging.lastClientX = e.clientX;
        dragging.lastClientY = e.clientY;
        const layer = layersRef.current.find((l) => l.id === dragging.id);
        if (!layer) return;
        updateLayer(dragging.id, { x: layer.x + dx, y: layer.y + dy });
      } else {
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        updateLayer(dragging.id, {
          x: Math.max(0, Math.min(100, x)),
          y: Math.max(0, Math.min(100, y)),
        });
      }
    },
    [aspectRatio],
  );

  const handleCanvasPointerUp = useCallback((e: React.PointerEvent) => {
    const drawing = drawingRef.current;
    if (drawing && e.pointerId === drawing.pointerId) {
      const simplified = simplifyPath(drawing.points, 3);
      const smoothed = toSmoothPath(simplified);
      updateLayer(drawing.id, { content: smoothed || toPolylinePath(drawing.points) });
      setSelectedLayerId(drawing.id);
      drawingRef.current = null;
      return;
    }
    if (draggingRef.current && e.pointerId === draggingRef.current.pointerId) {
      draggingRef.current = null;
    }
  }, []);

  const handleCanvasPointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (!drawMode || !canvasRef.current || !photoDataUrl) {
        setSelectedLayerId(null);
        return;
      }
      const rect = canvasRef.current.getBoundingClientRect();
      const { width: cw, height: ch } = CANVAS_DIMENSIONS[aspectRatio];
      const x = ((e.clientX - rect.left) / rect.width) * cw;
      const y = ((e.clientY - rect.top) / rect.height) * ch;
      const id = newId();
      const first: Point = { x, y };
      const layer: StudioLayer = {
        id,
        type: 'draw',
        content: toPolylinePath([first]),
        x: 0,
        y: 0,
        size: drawThickness,
        color: drawColor,
      };
      drawingRef.current = { id, pointerId: e.pointerId, points: [first] };
      setLayers((prev) => [...prev, layer]);
      setSelectedLayerId(null);
      (e.currentTarget as Element).setPointerCapture(e.pointerId);
    },
    [drawMode, photoDataUrl, drawColor, drawThickness, aspectRatio],
  );

  async function handleDownload() {
    const node = canvasRef.current;
    if (!node) return;
    setDownloading(true);
    setSelectedLayerId(null);
    await new Promise((r) => requestAnimationFrame(() => r(null)));
    try {
      if (document.fonts && 'ready' in document.fonts) {
        await document.fonts.ready;
      }
      const { width, height } = CANVAS_DIMENSIONS[aspectRatio];
      const dataUrl = await exportPng(node, {
        width,
        height,
        pixelRatio: 2,
        cacheBust: true,
      });
      const link = document.createElement('a');
      const stamp = new Date().toISOString().slice(0, 10);
      link.download = `grey-door-bakery-${stamp}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error(err);
      alert('Sorry, something went wrong generating the image.');
    } finally {
      setDownloading(false);
    }
  }

  const { width: canvasW, height: canvasH } = CANVAS_DIMENSIONS[aspectRatio];

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8">
      <div className="mb-6">
        <div className="eyebrow mb-2">Studio</div>
        <h1 className="font-display font-semibold text-4xl tracking-tight lowercase">
          content studio<span className="text-terracotta">.</span>
        </h1>
        <p className="text-sm text-door-soft mt-3">
          Upload a photo, add text and doodles, and download a branded image.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8">
        <StudioCanvasArea
          canvasRef={canvasRef}
          canvasW={canvasW}
          canvasH={canvasH}
          photoDataUrl={photoDataUrl}
          aspectRatio={aspectRatio}
          layers={layers}
          selectedLayerId={selectedLayerId}
          onLayerPointerDown={drawMode ? undefined : handleLayerPointerDown}
          onCanvasPointerMove={handleCanvasPointerMove}
          onCanvasPointerUp={handleCanvasPointerUp}
          onCanvasPointerDown={handleCanvasPointerDown}
          downloading={downloading}
          drawMode={drawMode}
          onUploadClick={() => photoInputRef.current?.click()}
        />

        <div className="flex flex-col gap-5">
          <section className="bg-cream-hi rounded-xl2 border border-door/10 p-4">
            <div className="eyebrow mb-3">Photo</div>
            <input
              ref={photoInputRef}
              type="file"
              accept="image/*"
              onChange={handlePhotoUpload}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => photoInputRef.current?.click()}
              className="w-full px-3 py-2 rounded-lg bg-door text-cream font-medium text-sm hover:bg-door/90"
            >
              Add New Photo
            </button>
          </section>

          <section className="bg-cream-hi rounded-xl2 border border-door/10 p-4">
            <div className="eyebrow mb-3">Size</div>
            <div className="flex items-center gap-1">
              {ASPECT_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setAspectRatio(opt.value)}
                  className={[
                    'flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                    aspectRatio === opt.value
                      ? 'bg-door text-cream'
                      : 'text-door-soft border border-door/15 hover:bg-door/5',
                  ].join(' ')}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </section>

          <section className="bg-cream-hi rounded-xl2 border border-door/10 p-4">
            <div className="eyebrow mb-3">Tool</div>
            <div className="flex gap-2 mb-4">
              <button
                type="button"
                onClick={() => setDrawMode(false)}
                aria-pressed={!drawMode}
                className={[
                  'flex-1 px-3 py-2 rounded-lg font-medium text-sm transition-colors inline-flex items-center justify-center gap-2',
                  !drawMode
                    ? 'bg-door text-cream'
                    : 'border border-door/15 text-door-soft hover:bg-door/5',
                ].join(' ')}
              >
                <span aria-hidden>↖</span>
                Select
              </button>
              <button
                type="button"
                onClick={() => setDrawMode(true)}
                aria-pressed={drawMode}
                className={[
                  'flex-1 px-3 py-2 rounded-lg font-medium text-sm transition-colors',
                  drawMode
                    ? 'bg-door text-cream'
                    : 'border border-door/15 text-door-soft hover:bg-door/5',
                ].join(' ')}
              >
                Draw
              </button>
            </div>

            <div className="eyebrow mb-3">Add</div>
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={addTextLayer}
                className="px-3 py-2 rounded-lg bg-terracotta text-cream font-medium text-sm hover:bg-terracotta/90"
              >
                + Add text
              </button>
              <button
                type="button"
                onClick={() => setShowAssets((s) => !s)}
                aria-expanded={showAssets}
                className="px-3 py-2 rounded-lg bg-terracotta text-cream font-medium text-sm hover:bg-terracotta/90 inline-flex items-center justify-center gap-2"
              >
                + Add assets
                <span aria-hidden className="opacity-80">{showAssets ? '▴' : '▾'}</span>
              </button>
              {showAssets && (
                <div className="grid grid-cols-2 gap-2 pt-1">
                  {OVERLAY_BUTTONS.map((o) => (
                    <button
                      key={o.key}
                      type="button"
                      onClick={() => addOverlay(o.key, o.defaultSize)}
                      className="px-3 py-2 rounded-lg border border-door/15 text-door-soft font-medium text-sm hover:bg-door/5"
                    >
                      + {o.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </section>

          {drawMode ? (
            <section className="bg-cream-hi rounded-xl2 border border-door/10 p-4 flex flex-col gap-4">
              <div className="eyebrow">Drawing</div>
              <p className="text-xs text-door-soft -mt-2">
                Draw directly on the photo — strokes are smoothed on release.
              </p>

              <div>
                <div className="eyebrow mb-2">Thickness</div>
                <div className="flex items-center gap-1">
                  {THICKNESS_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setDrawThickness(opt.value)}
                      className={[
                        'flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                        drawThickness === opt.value
                          ? 'bg-door text-cream'
                          : 'text-door-soft border border-door/15 hover:bg-door/5',
                      ].join(' ')}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="eyebrow mb-2">Colour</div>
                <div className="flex gap-2 flex-wrap">
                  {PALETTE.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setDrawColor(c)}
                      aria-label={`Colour ${c}`}
                      style={{ backgroundColor: c }}
                      className={[
                        'w-8 h-8 rounded-full border transition-transform',
                        drawColor.toUpperCase() === c.toUpperCase()
                          ? 'border-door scale-110'
                          : 'border-door/20',
                      ].join(' ')}
                    />
                  ))}
                </div>
              </div>
            </section>
          ) : (
            selectedLayer && (
              <LayerEditor
                layer={selectedLayer}
                onChange={handleLayerEditorChange}
                onDelete={() => deleteLayer(selectedLayer.id)}
              />
            )
          )}

          <button
            type="button"
            onClick={handleDownload}
            disabled={!photoDataUrl || downloading}
            className="px-4 py-3 rounded-lg bg-terracotta text-cream font-semibold disabled:opacity-40 hover:bg-terracotta/90 transition-colors"
          >
            {downloading ? 'Generating…' : 'Download'}
          </button>
        </div>
      </div>
    </div>
  );
}

type CanvasAreaProps = {
  canvasRef: React.RefObject<HTMLDivElement>;
  canvasW: number;
  canvasH: number;
  photoDataUrl: string | null;
  aspectRatio: StudioAspectRatio;
  layers: StudioLayer[];
  selectedLayerId: string | null;
  onLayerPointerDown?: (e: React.PointerEvent, layerId: string) => void;
  onCanvasPointerMove: (e: React.PointerEvent) => void;
  onCanvasPointerUp: (e: React.PointerEvent) => void;
  onCanvasPointerDown: (e: React.PointerEvent) => void;
  downloading: boolean;
  drawMode: boolean;
  onUploadClick: () => void;
};

function StudioCanvasArea({
  canvasRef,
  canvasW,
  canvasH,
  photoDataUrl,
  aspectRatio,
  layers,
  selectedLayerId,
  onLayerPointerDown,
  onCanvasPointerMove,
  onCanvasPointerUp,
  onCanvasPointerDown,
  downloading,
  drawMode,
  onUploadClick,
}: CanvasAreaProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.3);

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const update = () => {
      const w = wrap.clientWidth;
      setScale(w / canvasW);
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(wrap);
    return () => ro.disconnect();
  }, [canvasW]);

  const displayHeight = canvasH * scale;

  if (!photoDataUrl) {
    return (
      <div
        ref={wrapRef}
        className="w-full bg-cream-hi rounded-xl2 border border-dashed border-door/20 flex flex-col items-center justify-center text-door-soft"
        style={{ height: displayHeight || 400 }}
      >
        <div className="font-display text-2xl mb-3 lowercase tracking-tight">upload a photo</div>
        <p className="text-sm text-center max-w-xs mb-4 px-4">
          Pick a photo of your bakes to get started — JPG or PNG.
        </p>
        <button
          type="button"
          onClick={onUploadClick}
          className="px-4 py-2 rounded-lg bg-door text-cream font-medium text-sm"
        >
          Upload photo
        </button>
      </div>
    );
  }

  return (
    <div
      ref={wrapRef}
      className="w-full bg-cream-hi rounded-xl2 border border-door/10 shadow-sm overflow-hidden"
      style={{
        height: displayHeight,
        touchAction: drawMode ? 'none' : 'auto',
        cursor: drawMode ? 'crosshair' : 'default',
      }}
      onPointerMove={onCanvasPointerMove}
      onPointerUp={onCanvasPointerUp}
      onPointerCancel={onCanvasPointerUp}
      onPointerDown={onCanvasPointerDown}
    >
      <div
        style={{
          width: canvasW,
          height: canvasH,
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
        }}
      >
        <PhotoCanvas
          ref={canvasRef}
          photoDataUrl={photoDataUrl}
          aspectRatio={aspectRatio}
          layers={layers}
          selectedLayerId={selectedLayerId}
          onLayerPointerDown={onLayerPointerDown}
          exporting={downloading}
        />
      </div>
    </div>
  );
}

function LayerEditor({
  layer,
  onChange,
  onDelete,
}: {
  layer: StudioLayer;
  onChange: (patch: Partial<StudioLayer>) => void;
  onDelete: () => void;
}) {
  return (
    <section className="bg-cream-hi rounded-xl2 border border-door/10 p-4 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="eyebrow">
          {layer.type === 'text'
            ? 'Text layer'
            : layer.type === 'draw'
              ? 'Drawing'
              : 'Overlay layer'}
        </div>
        <button
          type="button"
          onClick={onDelete}
          className="text-xs px-2 py-1 rounded-lg border border-door/15 text-door-soft hover:bg-door/5"
        >
          Delete
        </button>
      </div>

      {layer.type === 'text' && (
        <>
          <label className="block">
            <span className="eyebrow block mb-2">Text</span>
            <textarea
              value={layer.content}
              onChange={(e) => onChange({ content: e.target.value })}
              rows={2}
              className="w-full px-3 py-2 rounded-lg border border-door/15 bg-white text-sm resize-none"
            />
          </label>

          <label className="block">
            <span className="eyebrow block mb-2">Font</span>
            <div className="flex gap-2">
              <FontButton
                active={layer.font === 'display'}
                onClick={() => onChange({ font: 'display' })}
                label="Display"
                style={{ fontFamily: '"Clash Display", system-ui, sans-serif', fontWeight: 600 }}
              />
              <FontButton
                active={layer.font === 'sans'}
                onClick={() => onChange({ font: 'sans' })}
                label="Sans"
                style={{ fontFamily: '"General Sans", system-ui, sans-serif', fontWeight: 500 }}
              />
            </div>
          </label>

          <label className="block">
            <span className="eyebrow block mb-2">Weight</span>
            <div className="flex gap-2">
              <FontButton
                active={layer.weight !== 'thin'}
                onClick={() => onChange({ weight: 'bold' })}
                label="Bold"
                style={{ fontFamily: 'inherit', fontWeight: 700 }}
              />
              <FontButton
                active={layer.weight === 'thin'}
                onClick={() => onChange({ weight: 'thin' })}
                label="Thin"
                style={{ fontFamily: 'inherit', fontWeight: 400 }}
              />
            </div>
          </label>
        </>
      )}

      <label className="block">
        <span className="eyebrow block mb-2">
          {layer.type === 'draw' ? 'Thickness' : 'Size'}
        </span>
        <input
          type="range"
          min={layer.type === 'text' ? 40 : layer.type === 'draw' ? 2 : 80}
          max={layer.type === 'text' ? 240 : layer.type === 'draw' ? 60 : 600}
          value={layer.size}
          onChange={(e) => onChange({ size: Number(e.target.value) })}
          className="w-full"
        />
      </label>

      <div>
        <div className="eyebrow mb-2">Colour</div>
        <div className="flex gap-2 flex-wrap">
          {PALETTE.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => onChange({ color: c })}
              aria-label={`Colour ${c}`}
              style={{ backgroundColor: c }}
              className={[
                'w-8 h-8 rounded-full border transition-transform',
                layer.color.toUpperCase() === c.toUpperCase()
                  ? 'border-door scale-110'
                  : 'border-door/20',
              ].join(' ')}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function FontButton({
  active,
  onClick,
  label,
  style,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  style: React.CSSProperties;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={style}
      className={[
        'flex-1 px-3 py-2 rounded-lg text-sm transition-colors',
        active ? 'bg-door text-cream' : 'border border-door/15 text-door-soft hover:bg-door/5',
      ].join(' ')}
    >
      {label}
    </button>
  );
}
