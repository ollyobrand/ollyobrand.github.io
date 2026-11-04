import { useEffect, useRef, useState } from 'react';
import { Check, Code, Copy, Download, X } from 'lucide-react';
import { assetUrl } from '../lib/api';
import { extOf, hslString, logoOriginal, normalHex, rgbString, slugify } from '../lib/brand';
import { blobBytes, faviconSet, fetchBytes, fetchText, fileBase, pngSizeAt, saveBlob, svgToPng } from '../lib/export';
import { Color, Logo, Product } from '../types';

export type FileTarget = { kind: 'logo'; logo: Logo } | { kind: 'favicon' } | { kind: 'colour'; index: number; label: string };

type Bg = 'light' | 'dark' | 'check';

interface SheetProps {
  product: Product;
  target: FileTarget;
  onClose: () => void;
  toast: (m: string) => void;
  copy: (text: string) => Promise<boolean>;
}

function useSheetKeys(onClose: () => void) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null;
    ref.current?.querySelector<HTMLElement>('[data-autofocus]')?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
      }
    };
    window.addEventListener('keydown', onKey, true);
    return () => {
      window.removeEventListener('keydown', onKey, true);
      prev?.focus?.();
    };
  }, [onClose]);
  return ref;
}

function Frame({ title, onClose, children, sheetRef }: { title: string; onClose: () => void; children: React.ReactNode; sheetRef: React.Ref<HTMLDivElement> }) {
  return (
    <>
      <div className="sb-file-scrim" onClick={onClose} aria-hidden="true" />
      <div className="sb-file" role="dialog" aria-modal="true" aria-label={title} ref={sheetRef}>
        <div className="sb-file-head">
          <h3>{title}</h3>
          <button className="sb-btn ghost icon" onClick={onClose} aria-label="Close" data-autofocus>
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </>
  );
}

export function FileSheet({ product, target, onClose, toast, copy }: SheetProps) {
  const sheetRef = useSheetKeys(onClose);
  const [bg, setBg] = useState<Bg>('light');
  const [scale, setScale] = useState(2);
  const [svg, setSvg] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const isFav = target.kind === 'favicon';
  const logo = target.kind === 'logo' ? target.logo : null;
  const fav = product.assets.favicon;
  const path = logo ? logoOriginal(logo)?.path : fav && (fav.svg || fav.png || fav.ico || fav.preview);
  const preview = logo ? logo.preview || path : fav?.preview || path;
  const ext = extOf(path, 'svg');
  const isSvg = ext === 'svg';
  const name = logo ? logo.name.trim() : 'Favicon';
  const base = fileBase(product, logo ? name : 'favicon');

  useEffect(() => {
    setSvg(null);
    if (path && isSvg) fetchText(path).then(setSvg, () => setSvg(null));
  }, [path, isSvg]);

  const run = async (label: string, job: () => Promise<void>) => {
    setBusy(label);
    try {
      await job();
    } catch {
      toast(`Couldn't make ${label}. Check your connection and try again.`);
    } finally {
      setBusy(null);
    }
  };

  const original = () =>
    run(ext.toUpperCase(), async () => {
      saveBlob(new Blob([(await fetchBytes(path!)) as BlobPart]), `${base}.${ext}`);
      toast(`Saved ${base}.${ext}`);
    });

  const png = () =>
    run('the PNG', async () => {
      const text = svg || (await fetchText(path!));
      const { w, h } = pngSizeAt(text, scale);
      saveBlob(await svgToPng(text, w, h), `${base}${scale > 1 ? `@${scale}x` : ''}.png`);
      toast(`Saved ${w} × ${h} PNG`);
    });

  const ico = () =>
    run('the ICO', async () => {
      const { ico } = await faviconSet(svg || (await fetchText(path!)));
      saveBlob(new Blob([ico as BlobPart], { type: 'image/x-icon' }), 'favicon.ico');
      toast('Saved favicon.ico (16, 32 and 48px)');
    });

  const favPng = (size: number) =>
    run(`the ${size}px PNG`, async () => {
      const text = svg || (await fetchText(path!));
      saveBlob(await svgToPng(text, size, size), size === 180 ? 'apple-touch-icon.png' : `favicon-${size}.png`);
      toast(`Saved ${size} × ${size} PNG`);
    });

  const copySvg = async () => {
    const text = svg || (path ? await fetchText(path) : '');
    toast((await copy(text)) ? 'Copied the SVG code' : 'Copy failed');
  };

  const size = svg ? pngSizeAt(svg, scale) : null;
  const plateClass = bg === 'dark' ? ' dark-bg' : bg === 'check' ? ' check-bg' : '';

  return (
    <Frame title={`${product.name} · ${name}`} onClose={onClose} sheetRef={sheetRef}>
      <div className="sb-file-body">
        <div className={`sb-plate${plateClass}`}>
          {preview && <img src={assetUrl(preview)} alt={name} />}
        </div>
        <div className="sb-file-row">
          <span className="sb-mono">Preview on</span>
          <span className="sb-bgs" role="group" aria-label="Preview background">
            {(['light', 'dark', 'check'] as Bg[]).map((b) => (
              <button key={b} className={`sb-bg sb-bg-${b}`} aria-pressed={bg === b} aria-label={b === 'check' ? 'Checkerboard' : b === 'dark' ? 'Dark' : 'Light'} onClick={() => setBg(b)} />
            ))}
          </span>
        </div>

        <div className="sb-opts">
          {isFav && isSvg ? (
            <>
              <button className="sb-opt" onClick={ico} disabled={!!busy}>
                <b>ICO</b><span className="sb-mono">16 · 32 · 48 px</span><Download size={16} />
              </button>
              <div className="sb-opt">
                <b>PNG</b>
                <span className="sb-scale" role="group" aria-label="PNG size">
                  {[32, 180, 512].map((s) => (
                    <button key={s} onClick={() => favPng(s)} disabled={!!busy} aria-label={`Save ${s} pixel PNG`}>{s}</button>
                  ))}
                </span>
              </div>
            </>
          ) : null}

          {path && (
            <button className="sb-opt" onClick={original} disabled={!!busy}>
              <b>{ext.toUpperCase()}</b><span className="sb-mono">original</span><Download size={16} />
            </button>
          )}

          {!isFav && isSvg && (
            <div className="sb-opt">
              <b>PNG</b>
              <span className="sb-scale" role="group" aria-label="PNG scale">
                {[1, 2, 4].map((s) => (
                  <button key={s} aria-pressed={scale === s} onClick={() => setScale(s)}>{s}×</button>
                ))}
              </span>
              <button className="sb-btn icon" onClick={png} disabled={!!busy || !svg} aria-label={size ? `Save ${size.w} by ${size.h} PNG` : 'Save PNG'}>
                <Download size={16} />
              </button>
            </div>
          )}
          {!isFav && isSvg && size && <p className="sb-mono sb-file-note">PNG {size.w} × {size.h} px, transparent background, made on your device.</p>}

          {isSvg && (
            <button className="sb-opt" onClick={copySvg}>
              <b>Copy SVG code</b><span className="sb-mono">for developers</span><Code size={16} />
            </button>
          )}
          {!isSvg && <p className="sb-mono sb-file-note">This logo was uploaded as {ext.toUpperCase()}, so it's offered as-is.</p>}
        </div>
        {busy && <p className="sb-mono" role="status">Making {busy}…</p>}
      </div>
    </Frame>
  );
}

export function ColourSheet({ product, target, onClose, toast, copy }: SheetProps) {
  const sheetRef = useSheetKeys(onClose);
  const [done, setDone] = useState<string | null>(null);
  if (target.kind !== 'colour') return null;
  const c: Color = product.assets.colors[target.index];
  const hex = normalHex(c.hex);
  const rows = [
    ['HEX', hex],
    ['RGB', `rgb(${rgbString(hex)})`],
    ['HSL', `hsl(${hslString(hex)})`],
    ['CSS', `--${slugify(product.name)}-${slugify(target.label)}: ${hex};`],
  ];
  return (
    <Frame title={`${product.name} · ${target.label}`} onClose={onClose} sheetRef={sheetRef}>
      <div className="sb-file-body">
        <div className="sb-colour-band" style={{ background: hex }} />
        <div className="sb-opts">
          {rows.map(([k, v]) => (
            <button
              key={k}
              className="sb-opt"
              onClick={async () => {
                if (await copy(v)) {
                  setDone(k);
                  toast(`Copied ${v}`);
                } else toast('Copy failed');
              }}
            >
              <b>{k}</b>
              <span className="sb-mono sb-opt-value">{v}</span>
              {done === k ? <Check size={16} /> : <Copy size={16} />}
            </button>
          ))}
        </div>
      </div>
    </Frame>
  );
}
