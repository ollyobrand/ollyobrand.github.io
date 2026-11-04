/**
 * Files made in the browser from the originals in the repo:
 * PNG at any scale from an SVG, ICO from PNGs, ASE and JSON palettes, and a zip kit.
 * Nothing here is uploaded; every file is built on the visitor's device.
 */
import { zipSync, strToU8 } from 'fflate';
import { assetUrl } from './api';
import { colourLabels, extOf, logoOriginal, normalHex, rgbString, slugify } from './brand';
import { Product } from '../types';

const textCache = new Map<string, Promise<string>>();

export function fetchText(path: string): Promise<string> {
  if (!textCache.has(path)) {
    textCache.set(
      path,
      fetch(assetUrl(path)).then((r) => {
        if (!r.ok) throw new Error(`Couldn't load ${path}`);
        return r.text();
      }),
    );
  }
  return textCache.get(path)!;
}

export async function fetchBytes(path: string): Promise<Uint8Array> {
  const r = await fetch(assetUrl(path));
  if (!r.ok) throw new Error(`Couldn't load ${path}`);
  return new Uint8Array(await r.arrayBuffer());
}

/** Natural size of an SVG from its width/height or viewBox. */
export function svgSize(svg: string): { w: number; h: number } {
  const tag = svg.match(/<svg\b[^>]*>/i)?.[0] || '';
  const num = (attr: string) => {
    const m = tag.match(new RegExp(`\\b${attr}\\s*=\\s*["']\\s*([\\d.]+)(px)?\\s*["']`, 'i'));
    return m ? parseFloat(m[1]) : NaN;
  };
  let w = num('width');
  let h = num('height');
  const vb = tag.match(/viewBox\s*=\s*["']\s*[-\d.]+[\s,]+[-\d.]+[\s,]+([\d.]+)[\s,]+([\d.]+)\s*["']/i);
  if ((!w || !h) && vb) {
    const vw = parseFloat(vb[1]);
    const vh = parseFloat(vb[2]);
    if (!w && !h) [w, h] = [vw, vh];
    else if (!w) w = (h * vw) / vh;
    else h = (w * vh) / vw;
  }
  if (!w || !h) return { w: 512, h: 512 };
  return { w, h };
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('The image could not be drawn'));
    img.src = src;
  });
}

function canvasBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('PNG export failed'))), 'image/png'),
  );
}

/**
 * Draws an SVG to a PNG. `width`/`height` set the canvas; the artwork is fitted
 * inside, centred, with transparent space around it when the aspect differs.
 */
export async function svgToPng(svg: string, width: number, height: number): Promise<Blob> {
  const { w, h } = svgSize(svg);
  // Give the SVG explicit pixel dimensions so every browser rasterises it at full size.
  const sized = svg.replace(/<svg\b([^>]*)>/i, (_m, attrs: string) => {
    const clean = attrs.replace(/\s(width|height)\s*=\s*["'][^"']*["']/gi, '');
    const vb = /viewBox/i.test(clean) ? '' : ` viewBox="0 0 ${w} ${h}"`;
    return `<svg${clean}${vb} width="${w}" height="${h}">`;
  });
  const url = URL.createObjectURL(new Blob([sized], { type: 'image/svg+xml' }));
  try {
    const img = await loadImage(url);
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(width);
    canvas.height = Math.round(height);
    const ctx = canvas.getContext('2d')!;
    const k = Math.min(width / w, height / h);
    const dw = w * k;
    const dh = h * k;
    ctx.drawImage(img, (width - dw) / 2, (height - dh) / 2, dw, dh);
    return await canvasBlob(canvas);
  } finally {
    URL.revokeObjectURL(url);
  }
}

/** PNG at a multiple of the SVG's natural size, never below 512px on the long side at 1×. */
export function pngSizeAt(svg: string, scale: number): { w: number; h: number } {
  const { w, h } = svgSize(svg);
  const base = Math.max(1, 512 / Math.max(w, h));
  const k = Math.max(1, base) * scale;
  return { w: Math.round(w * k), h: Math.round(h * k) };
}

export async function blobBytes(blob: Blob): Promise<Uint8Array> {
  return new Uint8Array(await blob.arrayBuffer());
}

/** ICO holding PNG images (supported by every current browser and OS). */
export function buildIco(images: { size: number; png: Uint8Array }[]): Uint8Array {
  const headerSize = 6 + images.length * 16;
  const total = headerSize + images.reduce((n, i) => n + i.png.length, 0);
  const out = new Uint8Array(total);
  const view = new DataView(out.buffer);
  view.setUint16(0, 0, true);
  view.setUint16(2, 1, true);
  view.setUint16(4, images.length, true);
  let offset = headerSize;
  images.forEach((img, i) => {
    const e = 6 + i * 16;
    out[e] = img.size >= 256 ? 0 : img.size;
    out[e + 1] = img.size >= 256 ? 0 : img.size;
    out[e + 2] = 0;
    out[e + 3] = 0;
    view.setUint16(e + 4, 1, true);
    view.setUint16(e + 6, 32, true);
    view.setUint32(e + 8, img.png.length, true);
    view.setUint32(e + 12, offset, true);
    out.set(img.png, offset);
    offset += img.png.length;
  });
  return out;
}

export async function faviconSet(svg: string) {
  const sizes = [16, 32, 48, 180, 512];
  const pngs = new Map<number, Uint8Array>();
  for (const s of sizes) pngs.set(s, await blobBytes(await svgToPng(svg, s, s)));
  const ico = buildIco([16, 32, 48].map((s) => ({ size: s, png: pngs.get(s)! })));
  return { pngs, ico };
}

/** Adobe Swatch Exchange (version 1.0), RGB global colours. */
export function buildAse(product: Product): Uint8Array {
  const colors = product.assets.colors || [];
  const labels = colourLabels(colors);
  const chunks: number[] = [];
  const u16 = (n: number) => chunks.push((n >> 8) & 255, n & 255);
  const u32 = (n: number) => chunks.push((n >>> 24) & 255, (n >>> 16) & 255, (n >>> 8) & 255, n & 255);
  const f32 = (n: number) => {
    const b = new DataView(new ArrayBuffer(4));
    b.setFloat32(0, n);
    for (let i = 0; i < 4; i++) chunks.push(b.getUint8(i));
  };
  chunks.push(0x41, 0x53, 0x45, 0x46); // "ASEF"
  u16(1);
  u16(0);
  u32(colors.length);
  colors.forEach((c, i) => {
    const name = labels[i];
    const [r, g, b] = rgbString(c.hex).split(', ').map((v) => Number(v) / 255);
    const nameLen = name.length + 1;
    const blockLen = 2 + nameLen * 2 + 4 + 12 + 2;
    u16(0x0001);
    u32(blockLen);
    u16(nameLen);
    for (const ch of name) u16(ch.charCodeAt(0));
    u16(0);
    chunks.push(0x52, 0x47, 0x42, 0x20); // "RGB "
    f32(r);
    f32(g);
    f32(b);
    u16(0); // global
  });
  return new Uint8Array(chunks);
}

export function paletteJson(product: Product): string {
  const labels = colourLabels(product.assets.colors || []);
  return JSON.stringify(
    {
      product: product.name,
      colors: (product.assets.colors || []).map((c, i) => ({
        name: labels[i],
        hex: normalHex(c.hex),
        rgb: `rgb(${rgbString(c.hex)})`,
      })),
    },
    null,
    2,
  );
}

export function saveBlob(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function fileBase(product: Product, part?: string): string {
  return [slugify(product.name), part && slugify(part)].filter(Boolean).join('-');
}

/** Everything for one product: originals, 2× PNGs of SVG logos, favicon set and palettes. */
export async function buildKit(product: Product): Promise<{ zip: Uint8Array; count: number }> {
  const root = fileBase(product);
  const files: Record<string, Uint8Array> = {};
  for (const logo of product.assets.logos || []) {
    const original = logoOriginal(logo);
    if (!original) continue;
    const name = fileBase(product, logo.name.trim());
    files[`logos/${name}.${original.ext}`] = await fetchBytes(original.path);
    if (original.ext === 'svg') {
      const svg = await fetchText(original.path);
      const { w, h } = pngSizeAt(svg, 2);
      files[`logos/${name}@2x.png`] = await blobBytes(await svgToPng(svg, w, h));
    }
  }
  const fav = product.assets.favicon;
  const favPath = fav && (fav.svg || fav.png || fav.ico || fav.preview);
  if (favPath) {
    if (extOf(favPath) === 'svg') {
      const svg = await fetchText(favPath);
      const { pngs, ico } = await faviconSet(svg);
      files['favicon/favicon.svg'] = strToU8(svg);
      files['favicon/favicon.ico'] = ico;
      for (const s of [32, 180, 512]) files[`favicon/favicon-${s}.png`] = pngs.get(s)!;
    } else {
      files[`favicon/favicon.${extOf(favPath, 'png')}`] = await fetchBytes(favPath);
    }
  }
  if (product.assets.guidelines?.pdf) {
    files[`${root}-brand-guidelines.pdf`] = await fetchBytes(product.assets.guidelines.pdf);
  }
  if (product.assets.colors?.length) {
    files[`colours/${root}-palette.json`] = strToU8(paletteJson(product));
    files[`colours/${root}-palette.ase`] = buildAse(product);
  }
  const prefixed: Record<string, Uint8Array> = {};
  for (const [k, v] of Object.entries(files)) prefixed[`${root}-brand-kit/${k}`] = v;
  return { zip: zipSync(prefixed, { level: 6 }), count: Object.keys(files).length };
}
