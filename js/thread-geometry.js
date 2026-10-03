function clean(n) {
  const rounded = Math.round(n * 100) / 100;
  return Number.isInteger(rounded) ? String(rounded) : String(rounded);
}

export function anchorPoint(rect, toward) {
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;
  const dx = toward.x - cx;
  const dy = toward.y - cy;
  if (dx === 0 && dy === 0) return { x: cx, y: cy };
  const halfW = rect.width / 2;
  const halfH = rect.height / 2;
  const tx = dx === 0 ? Infinity : halfW / Math.abs(dx);
  const ty = dy === 0 ? Infinity : halfH / Math.abs(dy);
  const t = Math.min(tx, ty);
  return { x: Math.round((cx + dx * t) * 100) / 100, y: Math.round((cy + dy * t) * 100) / 100 };
}

export function buildThreadPath(from, to, bend = 0) {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const distance = Math.hypot(dx, dy);
  if (!distance) return `M ${clean(from.x)} ${clean(from.y)} L ${clean(to.x)} ${clean(to.y)}`;
  const midX = (from.x + to.x) / 2;
  const midY = (from.y + to.y) / 2;
  const nx = -dy / distance;
  const ny = dx / distance;
  const controlX = midX + nx * bend;
  const controlY = midY + ny * bend;
  return `M ${clean(from.x)} ${clean(from.y)} Q ${clean(controlX)} ${clean(controlY)} ${clean(to.x)} ${clean(to.y)}`;
}