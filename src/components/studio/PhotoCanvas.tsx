import { forwardRef } from 'react';
import type { StudioAspectRatio, StudioLayer } from '../../types';
import { GreyDoorLogo } from '../brand/GreyDoorLogo';
import { Squiggle } from '../brand/Squiggle';
import { StarDoodle, CircleDoodle } from '../brand/Doodle';

export const CANVAS_DIMENSIONS: Record<StudioAspectRatio, { width: number; height: number }> = {
  '1:1': { width: 1080, height: 1080 },
  '3:4': { width: 1080, height: 1440 },
  '9:16': { width: 1080, height: 1920 },
};

type Props = {
  photoDataUrl: string | null;
  aspectRatio: StudioAspectRatio;
  layers: StudioLayer[];
  selectedLayerId?: string | null;
  onLayerPointerDown?: (e: React.PointerEvent, layerId: string) => void;
  exporting?: boolean;
};

function FontFamily(font: StudioLayer['font']) {
  if (font === 'sans') return '"General Sans", system-ui, sans-serif';
  return '"Clash Display", system-ui, sans-serif';
}

function OverlayGraphic({ layer }: { layer: StudioLayer }) {
  switch (layer.content) {
    case 'logo':
      return <GreyDoorLogo height={layer.size} color={layer.color} />;
    case 'squiggle':
      return <Squiggle width={layer.size} color={layer.color} strokeWidth={Math.max(3, layer.size / 50)} />;
    case 'star':
      return <StarDoodle height={layer.size} color={layer.color} strokeWidth={Math.max(3, layer.size / 30)} />;
    case 'circle':
      return <CircleDoodle height={layer.size} color={layer.color} strokeWidth={Math.max(3, layer.size / 30)} />;
    default:
      return null;
  }
}

export const PhotoCanvas = forwardRef<HTMLDivElement, Props>(function PhotoCanvas(
  { photoDataUrl, aspectRatio, layers, selectedLayerId, onLayerPointerDown, exporting },
  ref,
) {
  const { width, height } = CANVAS_DIMENSIONS[aspectRatio];
  return (
    <div
      ref={ref}
      style={{
        position: 'relative',
        width,
        height,
        backgroundColor: '#1E1F21',
        overflow: 'hidden',
      }}
    >
      {photoDataUrl && (
        <img
          src={photoDataUrl}
          alt=""
          crossOrigin="anonymous"
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            userSelect: 'none',
            pointerEvents: 'none',
          }}
          draggable={false}
        />
      )}

      {layers.map((layer) => {
        const isSelected = !exporting && layer.id === selectedLayerId;

        if (layer.type === 'draw') {
          return (
            <svg
              key={layer.id}
              width={width}
              height={height}
              viewBox={`0 0 ${width} ${height}`}
              style={{
                position: 'absolute',
                inset: 0,
                pointerEvents: 'none',
                overflow: 'visible',
              }}
            >
              <g transform={`translate(${layer.x} ${layer.y})`}>
                {isSelected && (
                  <path
                    d={layer.content}
                    stroke="#FFFFFF"
                    strokeWidth={layer.size + 18}
                    strokeOpacity={0.4}
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                )}
                <path
                  d={layer.content}
                  stroke={layer.color}
                  strokeWidth={layer.size}
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  onPointerDown={(e) => onLayerPointerDown?.(e, layer.id)}
                  style={{
                    pointerEvents: onLayerPointerDown ? 'stroke' : 'none',
                    cursor: onLayerPointerDown ? 'move' : 'default',
                    touchAction: 'none',
                  }}
                />
              </g>
            </svg>
          );
        }

        return (
          <div
            key={layer.id}
            onPointerDown={(e) => onLayerPointerDown?.(e, layer.id)}
            style={{
              position: 'absolute',
              left: `${layer.x}%`,
              top: `${layer.y}%`,
              transform: 'translate(-50%, -50%)',
              cursor: onLayerPointerDown ? 'move' : 'default',
              pointerEvents: onLayerPointerDown ? 'auto' : 'none',
              touchAction: 'none',
              outline: isSelected ? '3px dashed #FFFFFF' : 'none',
              outlineOffset: 8,
              userSelect: 'none',
            }}
          >
            {layer.type === 'text' ? (
              <div
                style={{
                  fontFamily: FontFamily(layer.font),
                  fontSize: layer.size,
                  color: layer.color,
                  fontWeight: layer.weight === 'thin' ? 400 : 700,
                  lineHeight: 1.1,
                  whiteSpace: 'pre-wrap',
                  textAlign: 'center',
                }}
              >
                {layer.content || ' '}
              </div>
            ) : (
              <OverlayGraphic layer={layer} />
            )}
          </div>
        );
      })}
    </div>
  );
});
