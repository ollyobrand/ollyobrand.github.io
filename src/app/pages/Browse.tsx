import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { ChevronRight, Download, Search, X } from 'lucide-react';
import imgLogo from 'figma:asset/7efdf963b465ea840cf15b3e1ac80db6d73ce1bb.png';
import { assetUrl, Database, downloadFile, loadPublicDb } from '../lib/api';
import {
  accentOf, colourLabels, countLine, cssVariables, extOf, logoOriginal, Match, normalHex, rgbString,
  search, slugMap, slugOf, Tab, tabsFor, textOn,
} from '../lib/brand';
import { Product } from '../types';
import './browse.css';

const TABS: Tab[] = ['logos', 'colours', 'favicon', 'guidelines'];

function useWide() {
  const query = '(min-width: 900px)';
  const [wide, setWide] = useState(() => typeof window !== 'undefined' && window.matchMedia(query).matches);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const on = () => setWide(mq.matches);
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);
  return wide;
}

function useToast() {
  const [msg, setMsg] = useState('');
  const [show, setShow] = useState(false);
  const timer = useRef<number | undefined>(undefined);
  const toast = useCallback((m: string) => {
    setMsg(m);
    setShow(true);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setShow(false), 1800);
  }, []);
  const node = (
    <div className={`sb-toast${show ? ' show' : ''}`} role="status" aria-live="polite">
      {msg}
    </div>
  );
  return { toast, node };
}

async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const area = document.createElement('textarea');
    area.value = text;
    area.style.position = 'fixed';
    area.style.opacity = '0';
    document.body.appendChild(area);
    area.select();
    const ok = document.execCommand('copy');
    area.remove();
    return ok;
  }
}

function ProductIcon({ product }: { product: Product }) {
  return (
    <span className="sb-icon" aria-hidden="true">
      {product.logoUrl ? <img src={assetUrl(product.logoUrl)} alt="" /> : <span>{product.name.charAt(0)}</span>}
    </span>
  );
}

// ---------- Product view ----------

interface ProductViewProps {
  product: Product;
  tab: Tab;
  onTab: (tab: Tab) => void;
  onClose?: () => void;
  toast: (m: string) => void;
  headingRef?: React.Ref<HTMLHeadingElement>;
}

function ProductView({ product, tab, onTab, onClose, toast, headingRef }: ProductViewProps) {
  const tabs = tabsFor(product);
  const active = tabs.some((t) => t.id === tab) ? tab : 'logos';
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState<number | null>(null);
  const labels = colourLabels(product.assets.colors || []);
  const base = product.name.replace(/[^\w-]+/g, '-');

  const save = async (path: string, name: string) => {
    try {
      await downloadFile(path, name);
    } catch {
      toast(`Couldn't download ${name}. Check your connection and try again.`);
    }
  };

  const downloadAll = async () => {
    setBusy(true);
    const files: { path: string; name: string }[] = [];
    const add = (path: string | undefined, name: string) => {
      if (path && !files.some((f) => f.path === path)) files.push({ path, name: `${name}.${extOf(path, 'svg')}` });
    };
    product.assets.logos?.forEach((l) => add(logoOriginal(l)?.path, `${base}-${l.name.trim().replace(/\s+/g, '-')}`));
    const fav = product.assets.favicon;
    if (fav) add(fav.svg || fav.png || fav.ico || fav.preview, `${base}-favicon`);
    add(product.assets.guidelines?.pdf, `${base}-brand-guidelines`);
    for (const f of files) {
      await save(f.path, f.name);
      await new Promise((r) => setTimeout(r, 300));
    }
    setBusy(false);
    toast(`Downloaded ${files.length} ${files.length === 1 ? 'file' : 'files'}`);
  };

  const copyHex = async (i: number) => {
    const hex = normalHex(product.assets.colors[i].hex);
    if (await copyText(hex)) {
      setCopied(i);
      window.setTimeout(() => setCopied((c) => (c === i ? null : c)), 1200);
      toast(`Copied ${hex}`);
    } else toast(`Select and copy ${hex} manually`);
  };

  return (
    <div className="sb-pv">
      <header className="sb-pv-head">
        <ProductIcon product={product} />
        <div style={{ minWidth: 0 }}>
          <h2 ref={headingRef} tabIndex={-1} style={{ outline: 'none' }}>{product.name}</h2>
          {product.tagline && <p>{product.tagline}</p>}
        </div>
        {onClose ? (
          <button className="sb-btn ghost icon" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        ) : (
          <button className="sb-btn" onClick={downloadAll} disabled={busy}>
            <Download size={16} /> {busy ? 'Downloading…' : 'Download all'}
          </button>
        )}
      </header>
      {onClose && (
        <div style={{ padding: '12px 16px 0' }}>
          <button className="sb-btn" style={{ width: '100%' }} onClick={downloadAll} disabled={busy}>
            <Download size={16} /> {busy ? 'Downloading…' : 'Download all'}
          </button>
        </div>
      )}

      <div className="sb-tabs" role="tablist" aria-label="Asset type">
        {tabs.map((t) => (
          <button key={t.id} role="tab" id={`tab-${t.id}`} aria-selected={active === t.id} aria-controls="sb-pane" onClick={() => onTab(t.id)}>
            {t.label}
            <span className="sb-mono">{t.count}</span>
          </button>
        ))}
      </div>

      <div className="sb-pane" id="sb-pane" role="tabpanel" aria-labelledby={`tab-${active}`}>
        {active === 'logos' &&
          (product.assets.logos?.length ? (
            <div className="sb-grid">
              {product.assets.logos.map((logo) => {
                const original = logoOriginal(logo);
                const dark = /dark|white|reverse/i.test(`${logo.name} ${logo.variant}`);
                return (
                  <div className="sb-asset" key={logo.id}>
                    <div className={`sb-plate${dark ? ' dark' : ''}`}>
                      <img src={assetUrl(logo.preview || original?.path)} alt={logo.name} loading="lazy" />
                    </div>
                    <div className="sb-asset-meta">
                      <b>{logo.name.trim()}</b>
                      <span className="sb-mono">{original?.ext.toUpperCase()}</span>
                    </div>
                    {original && (
                      <button className="sb-btn ghost" onClick={() => save(original.path, `${base}-${logo.name.trim().replace(/\s+/g, '-')}.${original.ext}`)}>
                        <Download size={16} /> Download {original.ext.toUpperCase()}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="sb-empty">No logos for {product.name} yet.</p>
          ))}

        {active === 'colours' &&
          (product.assets.colors?.length ? (
            <>
              <div className="sb-swatches">
                {product.assets.colors.map((c, i) => {
                  const hex = normalHex(c.hex);
                  return (
                    <button key={i} className={`sb-chip${copied === i ? ' copied' : ''}`} onClick={() => copyHex(i)} aria-label={`${labels[i]}, ${hex}. Copy hex`}>
                      <span className="sb-chip-colour" style={{ background: hex, color: textOn(hex) }}>
                        {hex}
                        <small>{rgbString(hex)}</small>
                      </span>
                      <span className="sb-chip-name">{labels[i]}</span>
                      <span className="sb-stamp">Copied</span>
                    </button>
                  );
                })}
              </div>
              <div className="sb-actions">
                <button className="sb-btn ghost" onClick={async () => toast((await copyText(product.assets.colors.map((c) => normalHex(c.hex)).join('\n'))) ? `Copied ${product.assets.colors.length} hex codes` : 'Copy failed')}>
                  Copy all hex
                </button>
                <button className="sb-btn ghost" onClick={async () => toast((await copyText(cssVariables(product))) ? 'Copied as CSS variables' : 'Copy failed')}>
                  Copy as CSS
                </button>
              </div>
            </>
          ) : (
            <p className="sb-empty">No colours for {product.name} yet.</p>
          ))}

        {active === 'favicon' && product.assets.favicon && (() => {
          const fav = product.assets.favicon!;
          const path = fav.svg || fav.png || fav.ico || fav.preview;
          const ext = extOf(path, 'svg');
          return (
            <div className="sb-grid">
              <div className="sb-asset">
                <div className="sb-plate"><img src={assetUrl(fav.preview || path)} alt={`${product.name} favicon`} /></div>
                <div className="sb-asset-meta"><b>Favicon</b><span className="sb-mono">{ext.toUpperCase()}</span></div>
                <button className="sb-btn ghost" onClick={() => save(path, `${base}-favicon.${ext}`)}>
                  <Download size={16} /> Download {ext.toUpperCase()}
                </button>
              </div>
            </div>
          );
        })()}

        {active === 'guidelines' && product.assets.guidelines && (() => {
          const g = product.assets.guidelines!;
          return (
            <div className="sb-grid">
              <div className="sb-asset">
                {g.preview && <div className="sb-plate"><img src={assetUrl(g.preview)} alt={`${product.name} brand guidelines`} /></div>}
                <div className="sb-asset-meta"><b>Brand guidelines</b><span className="sb-mono">PDF</span></div>
                {g.pdf && (
                  <button className="sb-btn ghost" onClick={() => save(g.pdf!, `${base}-brand-guidelines.pdf`)}>
                    <Download size={16} /> Download PDF
                  </button>
                )}
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
}

// ---------- Page ----------

export function Browse() {
  const location = useLocation();
  const navigate = useNavigate();
  const wide = useWide();
  const { toast, node: toastNode } = useToast();
  const [db, setDb] = useState<Database | null>(null);
  const [error, setError] = useState(false);
  const [query, setQuery] = useState('');
  const [drag, setDrag] = useState(0);
  const dragStart = useRef<number | null>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const lastRow = useRef<string | null>(null);

  const load = useCallback(() => {
    setError(false);
    loadPublicDb().then(setDb, () => setError(true));
  }, []);
  useEffect(load, [load]);

  const slugs = useMemo(() => slugMap(db?.products || []), [db]);

  // Routes: /  ·  /:slug  ·  /:slug/:tab  ·  legacy /product/:id
  const parts = location.pathname.split('/').filter(Boolean);
  let product: Product | undefined;
  let tab: Tab = 'logos';
  if (parts[0] === 'product' && parts[1] && db) {
    const p = db.products.find((x) => x.id === parts[1]);
    if (p) product = p;
  } else if (parts[0]) {
    product = slugs.get(parts[0]);
    if (parts[1] && (TABS as string[]).includes(parts[1])) tab = parts[1] as Tab;
  }

  useEffect(() => {
    if (parts[0] === 'product' && product) navigate(`/${slugOf(slugs, product)}`, { replace: true });
  }, [parts[0], product, slugs, navigate]);

  const shown = wide ? product || db?.products[0] : product;
  const accent = accentOf(shown);
  const settings = db?.settings;
  const orgName = settings?.organizationName || 'Ollyo Brand Assets';

  useEffect(() => {
    document.title = product ? `${product.name} · ${orgName}` : orgName;
  }, [product, orgName]);

  const open = (m: Match) => {
    lastRow.current = m.product.id;
    navigate(`/${slugOf(slugs, m.product)}${m.tab && m.tab !== 'logos' ? `/${m.tab}` : ''}`, { replace: wide && !!product });
  };
  const close = useCallback(() => {
    if (window.history.length > 1 && location.key !== 'default') navigate(-1);
    else navigate('/', { replace: true });
    window.setTimeout(() => {
      const id = lastRow.current;
      if (id) document.querySelector<HTMLElement>(`[data-row="${id}"]`)?.focus();
    }, 260);
  }, [navigate, location.key]);
  const setTab = (t: Tab) => shown && navigate(`/${slugOf(slugs, shown)}${t === 'logos' ? '' : `/${t}`}`, { replace: true });

  // Phone sheet: Escape and swipe down close it; focus moves into it on open.
  const sheetOpen = !wide && !!product;
  useEffect(() => {
    if (!sheetOpen) return;
    const t = window.setTimeout(() => headingRef.current?.focus(), 250);
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && close();
    window.addEventListener('keydown', onKey);
    return () => {
      window.clearTimeout(t);
      window.removeEventListener('keydown', onKey);
    };
  }, [sheetOpen, close]);

  const onDown = (e: React.PointerEvent) => {
    dragStart.current = e.clientY;
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  };
  const onMove = (e: React.PointerEvent) => {
    if (dragStart.current !== null) setDrag(Math.max(0, e.clientY - dragStart.current));
  };
  const onUp = () => {
    if (dragStart.current === null) return;
    dragStart.current = null;
    if (drag > 110) close();
    setDrag(0);
  };

  const matches = db ? search(db.products, query) : [];
  const logoSrc = settings?.organizationLogo ? assetUrl(settings.organizationLogo) : db ? imgLogo : '';

  const top = (
    <div className="sb-top">
      {logoSrc ? <img src={logoSrc} alt="" /> : <span style={{ width: 28, height: 28 }} />}
      <h1>{orgName}</h1>
    </div>
  );
  const searchBox = (
    <label className="sb-search">
      <Search size={18} aria-hidden="true" />
      <input
        id="sb-search"
        type="search"
        inputMode="search"
        enterKeyHint="search"
        placeholder="Search products or #hex"
        aria-label="Search products, files and hex codes"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && matches[0] && open(matches[0])}
      />
      {query && (
        <button onClick={() => setQuery('')} aria-label="Clear search">
          <X size={16} />
        </button>
      )}
    </label>
  );

  let listBody: React.ReactNode;
  if (error) {
    listBody = (
      <div className="sb-empty">
        The brand assets didn't load. Check your connection.
        <br />
        <button onClick={load}>Try again</button>
      </div>
    );
  } else if (!db) {
    listBody = <div className="sb-empty" aria-busy="true">Loading products…</div>;
  } else if (!matches.length) {
    listBody = (
      <div className="sb-empty">
        Nothing matches “{query}”.
        <br />
        Search covers product names, logo names and hex codes.
        <br />
        <button onClick={() => setQuery('')}>Clear search</button>
      </div>
    );
  } else {
    listBody = matches.map((m) => (
      <button
        key={m.product.id}
        data-row={m.product.id}
        className="sb-row"
        aria-current={shown?.id === m.product.id && (wide || !!product) ? 'page' : undefined}
        onClick={() => open(m)}
      >
        <ProductIcon product={m.product} />
        <span className="sb-row-text">
          <b>{m.product.name}</b>
          <span className="sb-mono">{m.hint || countLine(m.product)}</span>
        </span>
        <ChevronRight size={18} aria-hidden="true" />
      </button>
    ));
  }

  const style = { '--sb-accent': accent, '--sb-accent-fg': textOn(accent) } as React.CSSProperties;

  if (wide) {
    return (
      <div className="sb-public" style={style}>
        <div className="sb-shell">
          <aside className="sb-rail" aria-label="Products">
            {top}
            {searchBox}
            <nav className="sb-list">{listBody}</nav>
          </aside>
          <main className="sb-main">
            {shown && <ProductView product={shown} tab={tab} onTab={setTab} toast={toast} />}
          </main>
        </div>
        {toastNode}
      </div>
    );
  }

  return (
    <div className="sb-public" style={style}>
      <div className="sb-shell" aria-hidden={sheetOpen || undefined}>
        {top}
        <nav className="sb-list" aria-label="Products">{listBody}</nav>
        {searchBox}
      </div>
      <div className={`sb-scrim${sheetOpen ? ' open' : ''}`} onClick={close} aria-hidden="true" />
      <div
        className={`sb-sheet${sheetOpen ? ' open' : ''}${drag ? ' dragging' : ''}`}
        style={{ '--drag': `${drag}px` } as React.CSSProperties}
        role="dialog"
        aria-modal="true"
        aria-label={product?.name}
      >
        <div className="sb-handle" onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp} aria-hidden="true" />
        {product && (
          <div style={{ height: 'calc(100% - 15px)' }}>
            <ProductView product={product} tab={tab} onTab={setTab} onClose={close} toast={toast} headingRef={headingRef} />
          </div>
        )}
      </div>
      {toastNode}
    </div>
  );
}
