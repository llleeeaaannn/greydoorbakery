import { toPng } from 'html-to-image';
import type { Options } from 'html-to-image/lib/types';

// 1x1 transparent GIF.
const BLANK_PIXEL =
  'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';

// html-to-image rejects the whole export if a single <img> fails to load, so a
// missing file would take the menu down with it. Fall back to a blank pixel.
export function exportPng(node: HTMLElement, options: Options) {
  return toPng(node, {
    imagePlaceholder: BLANK_PIXEL,
    onImageErrorHandler: () => {},
    ...options,
  });
}
