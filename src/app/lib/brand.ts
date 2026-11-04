import { Color, Logo, Product } from '../types';

/** URL-safe name for a product, used in links like #/tutor-lms/colours. */
export function slugify(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/** Slugs for every product; a clash gets a short id suffix so links stay unique. */
export function slugMap(products: Product[]): Map<string, Product> {
  const map = new Map<string, Product>();
  for (const p of products) {
    let slug = slugify(p.name) || p.id.slice(0, 8);
    if (map.has(slug)) slug = `${slug}-${p.id.slice(0, 4)}`;
    map.set(slug, p);
  }
  return map;
}

export function slugOf(map: Map<string, Product>, product: Product): string {
  for (const [slug, p] of map) if (p.id === product.id) return slug;
  return slugify(product.name);
}

// ---------- Colour ----------

function channels(hex: string): [number, number, number] {
  const h = hex.replace('#', '');
  const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h.padEnd(6, '0').slice(0, 6);
  const n = parseInt(full, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

export function luminance(hex: string): number {
  const [r, g, b] = channels(hex).map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** Ink or white, whichever reads better on the given colour. */
export function textOn(hex: string): string {
  const L = luminance(hex);
  const onWhite = 1.05 / (L + 0.05);
  const onInk = (L + 0.05) / 0.056;
  return onInk >= onWhite ? '#111110' : '#FFFFFF';
}

export function normalHex(hex: string): string {
  const [r, g, b] = channels(hex);
  return '#' + [r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('').toUpperCase();
}

export function rgbString(hex: string): string {
  return channels(hex).join(', ');
}

/** The product's primary colour, unless it is too pale to carry buttons and states. */
export function accentOf(product: Product | undefined): string {
  const hex = product?.assets.colors?.[0]?.hex;
  if (!hex) return '#111110';
  const L = luminance(hex);
  if (L > 0.6) {
    const darker = product!.assets.colors.find((c) => luminance(c.hex) < 0.35);
    return darker ? normalHex(darker.hex) : '#111110';
  }
  return normalHex(hex);
}

/** "Secondary 01", "Secondary 02"… when several colours share one name. */
export function colourLabels(colors: Color[]): string[] {
  const totals = new Map<string, number>();
  colors.forEach((c) => totals.set(c.name.trim(), (totals.get(c.name.trim()) || 0) + 1));
  const seen = new Map<string, number>();
  return colors.map((c) => {
    const name = c.name.trim() || 'Color';
    if ((totals.get(c.name.trim()) || 0) < 2) return name;
    const n = (seen.get(name) || 0) + 1;
    seen.set(name, n);
    return `${name} ${String(n).padStart(2, '0')}`;
  });
}

export function cssVariables(product: Product): string {
  const base = slugify(product.name);
  const labels = colourLabels(product.assets.colors || []);
  return [':root {', ...labels.map((l, i) => `  --${base}-${slugify(l)}: ${normalHex(product.assets.colors[i].hex)};`), '}'].join('\n');
}

// ---------- Files ----------

export function extOf(path: string | undefined, fallback = ''): string {
  if (!path) return fallback;
  const m = path.split('?')[0].match(/\.([a-z0-9]+)$/i);
  return m ? m[1].toLowerCase() : fallback;
}

/** The original file for a logo, and its true format. */
export function logoOriginal(logo: Logo): { path: string; ext: string } | null {
  const path = logo.svg || logo.png || logo.preview;
  if (!path) return null;
  return { path, ext: extOf(path, 'svg') };
}

export function countLine(product: Product): string {
  const logos = product.assets.logos?.length || 0;
  const colours = product.assets.colors?.length || 0;
  const parts = [`${logos} ${logos === 1 ? 'logo' : 'logos'}`, `${colours} ${colours === 1 ? 'color' : 'colors'}`];
  return parts.join(' · ');
}

// ---------- Search ----------

export interface Match {
  product: Product;
  /** What matched beyond the name, shown under it, e.g. "#2151ED" or "Dark logo". */
  hint?: string;
  /** Tab to open when this match is chosen. */
  tab?: Tab;
}

export type Tab = 'logos' | 'colours' | 'favicon' | 'guidelines';

export function search(products: Product[], query: string): Match[] {
  const q = query.trim().toLowerCase();
  if (!q) return products.map((product) => ({ product }));
  const hexQ = q.replace(/^#/, '');
  const out: Match[] = [];
  for (const product of products) {
    if (product.name.toLowerCase().includes(q) || (product.tagline || '').toLowerCase().includes(q)) {
      out.push({ product });
      continue;
    }
    const colour = /^[0-9a-f]{2,6}$/.test(hexQ)
      ? product.assets.colors?.find((c) => c.hex.replace('#', '').toLowerCase().startsWith(hexQ))
      : product.assets.colors?.find((c) => c.name.toLowerCase().includes(q));
    if (colour) {
      out.push({ product, hint: `${normalHex(colour.hex)} · ${colour.name}`, tab: 'colours' });
      continue;
    }
    const logo = product.assets.logos?.find((l) => l.name.toLowerCase().includes(q) || (l.variant || '').toLowerCase().includes(q));
    if (logo) {
      out.push({ product, hint: logo.name.trim(), tab: 'logos' });
      continue;
    }
    if ('favicon'.includes(q) && product.assets.favicon) out.push({ product, hint: 'Favicon', tab: 'favicon' });
  }
  return out;
}

export function tabsFor(product: Product): { id: Tab; label: string; count: number }[] {
  const tabs: { id: Tab; label: string; count: number }[] = [
    { id: 'logos', label: 'Logos', count: product.assets.logos?.length || 0 },
    { id: 'colours', label: 'Colors', count: product.assets.colors?.length || 0 },
  ];
  if (product.assets.favicon) tabs.push({ id: 'favicon', label: 'Favicon', count: 1 });
  if (product.assets.guidelines?.pdf || product.assets.guidelines?.preview) tabs.push({ id: 'guidelines', label: 'Guidelines', count: 1 });
  return tabs;
}

export function hslString(hex: string): string {
  const [r, g, b] = rgbString(hex).split(', ').map((v) => Number(v) / 255);
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  let h = 0;
  let s = 0;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h *= 60;
  }
  return `${Math.round(h)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}
