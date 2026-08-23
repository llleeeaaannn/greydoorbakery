export type Point = { x: number; y: number };

export function simplifyPath(points: Point[], epsilon: number): Point[] {
  if (points.length < 3) return points.slice();

  const keep = new Array<boolean>(points.length).fill(false);
  keep[0] = true;
  keep[points.length - 1] = true;

  const stack: Array<[number, number]> = [[0, points.length - 1]];
  while (stack.length > 0) {
    const [first, last] = stack.pop()!;
    let dmax = 0;
    let index = -1;
    for (let i = first + 1; i < last; i++) {
      const d = perpendicularDistance(points[i], points[first], points[last]);
      if (d > dmax) {
        dmax = d;
        index = i;
      }
    }
    if (dmax > epsilon && index !== -1) {
      keep[index] = true;
      stack.push([first, index]);
      stack.push([index, last]);
    }
  }

  const out: Point[] = [];
  for (let i = 0; i < points.length; i++) {
    if (keep[i]) out.push(points[i]);
  }
  return out;
}

function perpendicularDistance(p: Point, a: Point, b: Point): number {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const magSq = dx * dx + dy * dy;
  if (magSq === 0) return Math.hypot(p.x - a.x, p.y - a.y);
  const u = ((p.x - a.x) * dx + (p.y - a.y) * dy) / magSq;
  const px = a.x + u * dx;
  const py = a.y + u * dy;
  return Math.hypot(p.x - px, p.y - py);
}

export function toSmoothPath(points: Point[]): string {
  if (points.length === 0) return '';
  if (points.length === 1) {
    const p = points[0];
    return `M ${r(p.x)} ${r(p.y)} L ${r(p.x)} ${r(p.y)}`;
  }
  if (points.length === 2) {
    return `M ${r(points[0].x)} ${r(points[0].y)} L ${r(points[1].x)} ${r(points[1].y)}`;
  }

  let d = `M ${r(points[0].x)} ${r(points[0].y)}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i === 0 ? 0 : i - 1];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] ?? p2;
    const c1x = p1.x + (p2.x - p0.x) / 6;
    const c1y = p1.y + (p2.y - p0.y) / 6;
    const c2x = p2.x - (p3.x - p1.x) / 6;
    const c2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${r(c1x)} ${r(c1y)}, ${r(c2x)} ${r(c2y)}, ${r(p2.x)} ${r(p2.y)}`;
  }
  return d;
}

export function toPolylinePath(points: Point[]): string {
  if (points.length === 0) return '';
  let d = `M ${r(points[0].x)} ${r(points[0].y)}`;
  for (let i = 1; i < points.length; i++) {
    d += ` L ${r(points[i].x)} ${r(points[i].y)}`;
  }
  return d;
}

function r(n: number): number {
  return Math.round(n * 100) / 100;
}
