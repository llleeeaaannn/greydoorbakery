import { useEffect, useRef, useState } from 'react';
import { exportPng } from '../exportPng';
import { GreyDoorLogo } from './brand/GreyDoorLogo';

const PALETTE: string[] = ['#B85C3E', '#3E4044', '#1E1F21', '#EFE9DD', '#FFFFFF'];
const CANVAS_SIZE = 2048;
const LOGO_HEIGHT = Math.round(CANVAS_SIZE * 0.6);

export function LogoScreen() {
  const [bgColor, setBgColor] = useState<string>('#EFE9DD');
  const [logoColor, setLogoColor] = useState<string>('#1E1F21');
  const [downloading, setDownloading] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);

  async function handleDownload() {
    const node = canvasRef.current;
    if (!node) return;
    setDownloading(true);
    try {
      if (document.fonts && 'ready' in document.fonts) {
        await document.fonts.ready;
      }
      const dataUrl = await exportPng(node, {
        width: CANVAS_SIZE,
        height: CANVAS_SIZE,
        pixelRatio: 2,
        cacheBust: true,
        backgroundColor: bgColor,
      });
      const link = document.createElement('a');
      link.download = 'grey-door-bakery-logo.png';
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error(err);
      alert('Sorry, something went wrong generating the image.');
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8">
      <div className="mb-6">
        <div className="eyebrow mb-2">Logo</div>
        <h1 className="font-display font-semibold text-4xl tracking-tight lowercase">
          logo generator<span className="text-terracotta">.</span>
        </h1>
        <p className="text-sm text-door-soft mt-3">
          Pick a background and a logo colour, then download a high-resolution PNG.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-8">
        <LogoCanvasArea canvasRef={canvasRef} bgColor={bgColor} logoColor={logoColor} />

        <div className="flex flex-col gap-5">
          <ColourSection
            label="Background"
            value={bgColor}
            onChange={setBgColor}
          />
          <ColourSection
            label="Logo colour"
            value={logoColor}
            onChange={setLogoColor}
          />

          <button
            type="button"
            onClick={handleDownload}
            disabled={downloading}
            className="px-4 py-3 rounded-lg bg-terracotta text-cream font-semibold disabled:opacity-40 hover:bg-terracotta/90 transition-colors"
          >
            {downloading ? 'Generating…' : 'Download'}
          </button>
        </div>
      </div>
    </div>
  );
}

function ColourSection({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (c: string) => void;
}) {
  return (
    <section className="bg-cream-hi rounded-xl2 border border-door/10 p-4">
      <div className="eyebrow mb-3">{label}</div>
      <div className="flex gap-2 flex-wrap">
        {PALETTE.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => onChange(c)}
            aria-label={`Colour ${c}`}
            style={{ backgroundColor: c }}
            className={[
              'w-10 h-10 rounded-full border transition-transform',
              value.toUpperCase() === c.toUpperCase()
                ? 'border-door scale-110'
                : 'border-door/20',
            ].join(' ')}
          />
        ))}
      </div>
    </section>
  );
}

function LogoCanvasArea({
  canvasRef,
  bgColor,
  logoColor,
}: {
  canvasRef: React.RefObject<HTMLDivElement>;
  bgColor: string;
  logoColor: string;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.3);

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const update = () => {
      const w = wrap.clientWidth;
      setScale(w / CANVAS_SIZE);
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(wrap);
    return () => ro.disconnect();
  }, []);

  const displayHeight = CANVAS_SIZE * scale;

  return (
    <div
      ref={wrapRef}
      className="w-full bg-cream-hi rounded-xl2 border border-door/10 shadow-sm overflow-hidden"
      style={{ height: displayHeight }}
    >
      <div
        style={{
          width: CANVAS_SIZE,
          height: CANVAS_SIZE,
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
        }}
      >
        <div
          ref={canvasRef}
          style={{
            width: CANVAS_SIZE,
            height: CANVAS_SIZE,
            backgroundColor: bgColor,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <GreyDoorLogo height={LOGO_HEIGHT} color={logoColor} />
        </div>
      </div>
    </div>
  );
}
