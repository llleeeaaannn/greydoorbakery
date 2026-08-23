import { forwardRef } from 'react';
import type { BakeryInfo, Item } from '../types';
import { CURRENCY } from '../types';
import { GreyDoorLogo } from './brand/GreyDoorLogo';
import { Squiggle } from './brand/Squiggle';

export const MENU_WIDTH = 1240;
export const MENU_34_HEIGHT = Math.round((MENU_WIDTH * 4) / 3);

const CREAM = '#EFE9DD';
const DOOR_SOFT = '#3E4044';
const TERRACOTTA = '#B85C3E';

type Props = {
  items: Item[];
  date: string;
  bakery: BakeryInfo;
  height?: number;
};

function formatPrice(price: number): string {
  return `${CURRENCY}${price.toFixed(2)}`;
}

function compactItemSizing(count: number) {
  if (count <= 4) return { itemSize: 88, priceSize: 78, itemGap: 28, itemPaddingBottom: 24 };
  if (count === 5) return { itemSize: 82, priceSize: 72, itemGap: 24, itemPaddingBottom: 22 };
  if (count === 6) return { itemSize: 72, priceSize: 64, itemGap: 20, itemPaddingBottom: 18 };
  if (count === 7) return { itemSize: 66, priceSize: 58, itemGap: 18, itemPaddingBottom: 16 };
  if (count === 8) return { itemSize: 58, priceSize: 52, itemGap: 16, itemPaddingBottom: 14 };
  if (count <= 10) return { itemSize: 50, priceSize: 44, itemGap: 13, itemPaddingBottom: 11 };
  return { itemSize: 42, priceSize: 38, itemGap: 11, itemPaddingBottom: 9 };
}

function formatDate(iso: string): string {
  if (!iso) return '';
  const d = new Date(iso + 'T00:00:00');
  if (isNaN(d.getTime())) return iso;
  return d
    .toLocaleDateString('en-GB', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    })
    .toUpperCase();
}

export const MenuPreview = forwardRef<HTMLDivElement, Props>(function MenuPreview(
  { items, date, bakery, height },
  ref,
) {
  const compact = typeof height === 'number';
  const item = compact ? compactItemSizing(items.length) : {
    itemSize: 64,
    priceSize: 56,
    itemGap: 22,
    itemPaddingBottom: 18,
  };
  const s = {
    padding: compact ? '44px 76px 60px 76px' : '50px 94px 90px 94px',
    logoTop: compact ? 44 : 50,
    logoRight: compact ? 72 : 90,
    logoHeight: compact ? 264 : 324,
    logoImgSize: compact ? 168 : 180,
    nameSize: compact ? 44 : 52,
    dateSize: compact ? 17 : 20,
    headerGap: compact ? 6 : 8,
    headerMarginBottom: compact ? 56 : 136,
    titleSize: compact ? 152 : 180,
    titleMarginBottom: compact ? 20 : 32,
    squiggleWidth: compact ? 280 : 360,
    squiggleStroke: compact ? 4 : 5,
    squiggleMarginBottom: compact ? 28 : 48,
    ...item,
    footerContactSize: compact ? 28 : 34,
    footerNoteSize: compact ? 20 : 26,
    footerPaddingTop: compact ? 24 : 0,
  };

  return (
    <div
      ref={ref}
      style={{
        width: MENU_WIDTH,
        height: compact ? height : undefined,
        backgroundColor: CREAM,
        color: DOOR_SOFT,
        position: 'relative',
        overflow: 'hidden',
        fontFamily: '"General Sans", system-ui, sans-serif',
      }}
    >
      <div
        style={{
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          height: compact ? '100%' : undefined,
          padding: s.padding,
          boxSizing: 'border-box',
        }}
      >
        {bakery.logoDataUrl ? (
          <img
            src={bakery.logoDataUrl}
            alt=""
            style={{
              position: 'absolute',
              top: s.logoTop,
              right: s.logoRight,
              width: s.logoImgSize,
              height: s.logoImgSize,
              objectFit: 'contain',
            }}
            crossOrigin="anonymous"
          />
        ) : (
          <div style={{ position: 'absolute', top: s.logoTop, right: s.logoRight }}>
            <GreyDoorLogo height={s.logoHeight} color={DOOR_SOFT} />
          </div>
        )}

        <div style={{ marginBottom: s.headerMarginBottom }}>
          <div
            style={{
              fontFamily: '"Clash Display", system-ui, sans-serif',
              fontSize: s.nameSize,
              color: DOOR_SOFT,
              fontWeight: 600,
              lineHeight: 1.3,
            }}
          >
            {bakery.name}
          </div>
          <div
            style={{
              fontSize: s.dateSize,
              letterSpacing: '0.28em',
              textTransform: 'uppercase',
              color: DOOR_SOFT,
              fontWeight: 500,
              lineHeight: 1.3,
              marginTop: s.headerGap,
            }}
          >
            Menu — {formatDate(date) || '—'}
          </div>
        </div>

        <div style={{ marginBottom: s.titleMarginBottom }}>
          <div
            style={{
              fontFamily: '"Clash Display", system-ui, sans-serif',
              fontWeight: 700,
              fontSize: s.titleSize,
              lineHeight: 0.92,
              letterSpacing: '-0.02em',
              color: DOOR_SOFT,
            }}
          >
            this
            <br />
            week<span style={{ color: TERRACOTTA }}>.</span>
          </div>
        </div>

        <div style={{ marginBottom: s.squiggleMarginBottom }}>
          <Squiggle width={s.squiggleWidth} color={TERRACOTTA} strokeWidth={s.squiggleStroke} />
        </div>

        {items.length === 0 ? (
          <div
            style={{
              fontSize: 28,
              color: DOOR_SOFT,
              fontStyle: 'italic',
            }}
          >
            Add items to build this week's menu.
          </div>
        ) : (
          <ul
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: s.itemGap,
              listStyle: 'none',
              padding: 0,
              margin: 0,
            }}
          >
            {items.map((item, idx) => (
              <li
                key={item.id}
                style={{
                  display: 'flex',
                  alignItems: 'baseline',
                  justifyContent: 'space-between',
                  gap: 24,
                  paddingBottom: s.itemPaddingBottom,
                  borderBottom: idx === items.length - 1 ? 'none' : `1px solid ${DOOR_SOFT}22`,
                }}
              >
                <span
                  style={{
                    fontFamily: '"Clash Display", system-ui, sans-serif',
                    fontWeight: 600,
                    fontSize: s.itemSize,
                    lineHeight: 1.05,
                    letterSpacing: '-0.01em',
                    textTransform: 'lowercase',
                  }}
                >
                  {item.name}
                </span>
                <span
                  style={{
                    fontFamily: '"Clash Display", system-ui, sans-serif',
                    fontWeight: 600,
                    fontSize: s.priceSize,
                    color: TERRACOTTA,
                    whiteSpace: 'nowrap',
                    letterSpacing: '-0.01em',
                  }}
                >
                  {formatPrice(item.price)}
                </span>
              </li>
            ))}
          </ul>
        )}

        <div
          style={{
            marginTop: compact ? 'auto' : 80,
            paddingTop: s.footerPaddingTop,
          }}
        >
          <div>
            <div
              style={{
                fontFamily: '"Clash Display", system-ui, sans-serif',
                fontSize: s.footerContactSize,
                fontWeight: 600,
                color: DOOR_SOFT,
                marginBottom: 6,
                lineHeight: 1.25,
              }}
            >
              {bakery.contact}
            </div>
            {bakery.footerNote && (
              <div
                style={{
                  fontSize: s.footerNoteSize,
                  color: DOOR_SOFT,
                  fontWeight: 500,
                  marginTop: 8,
                  lineHeight: 1.35,
                }}
              >
                {bakery.footerNote}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});
