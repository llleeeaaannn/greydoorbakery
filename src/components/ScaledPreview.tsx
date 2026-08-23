import { useEffect, useRef, useState, type ReactNode } from 'react';
import { MENU_WIDTH } from './MenuPreview';

type Props = { children: ReactNode };

export function ScaledPreview({ children }: Props) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.3);
  const [innerHeight, setInnerHeight] = useState(0);

  useEffect(() => {
    const wrap = wrapperRef.current;
    const inner = innerRef.current;
    if (!wrap || !inner) return;
    const update = () => {
      const w = wrap.clientWidth;
      setScale(w / MENU_WIDTH);
      setInnerHeight(inner.offsetHeight);
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(wrap);
    ro.observe(inner);
    return () => ro.disconnect();
  }, []);

  return (
    <div
      ref={wrapperRef}
      className="w-full bg-cream-hi rounded-xl2 border border-door/10 shadow-sm overflow-hidden"
      style={{ height: innerHeight * scale }}
    >
      <div
        ref={innerRef}
        style={{
          width: MENU_WIDTH,
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
        }}
      >
        {children}
      </div>
    </div>
  );
}
