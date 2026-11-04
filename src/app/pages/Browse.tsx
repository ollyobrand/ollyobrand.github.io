import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { ChevronRight, Download, LogOut, Pencil, Plus, Search, Settings as SettingsIcon, X } from 'lucide-react';
import imgLogo from 'figma:asset/7efdf963b465ea840cf15b3e1ac80db6d73ce1bb.png';
import { assetUrl, Database, deleteProduct, downloadFile, loadAdminDb, loadPublicDb } from '../lib/api';
import { AdminSession, getSession, refreshIfNeeded, SessionExpiredError, signOut } from '../lib/auth';
import { AddColour, AdminApi, ConfirmDelete, LogoDrop, removeColour, removeLogo, removePart } from './AdminEdit';
import { CreateProductModal } from '../components/CreateProductModal';
import { EditProductModal } from '../components/EditProductModal';
import { AddFaviconModal } from '../components/AddFaviconModal';
import { AddGuidelinesModal } from '../components/AddGuidelinesModal';
import { Settings } from '../components/Settings';
import { Toaster } from '../components/ui/sonner';
import {
  accentOf, colourLabels, countLine, cssVariables, extOf, logoOriginal, Match, normalHex, rgbString,
  search, slugMap, slugOf, Tab, tabsFor, textOn,
} from '../lib/brand';
import { Product } from '../types';
import { buildAse, buildKit, fileBase, paletteJson, saveBlob } from '../lib/export';
import { ColourSheet, FileSheet, FileTarget } from './FileSheet';
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
  admin?: AdminApi;
}

function ProductView({ product, tab, onTab, onClose, toast, headingRef, admin }: ProductViewProps) {
  const tabs = admin
    ? [
        { id: 'logos' as Tab, label: 'Logos', count: product.assets.logos?.length || 0 },
        { id: 'colours' as Tab, label: 'Colors', count: product.assets.colors?.length || 0 },
        { id: 'favicon' as Tab, label: 'Favicon', count: product.assets.favicon ? 1 : 0 },
        { id: 'guidelines' as Tab, label: 'Guidelines', count: product.assets.guidelines ? 1 : 0 },
      ]
    : tabsFor(product);
  const has = (id: Tab) => tabs.some((t) => t.id === id);
  const heading = (id: Tab) => {
    const t = tabs.find((x) => x.id === id)!;
    return (
      <h3 className="sb-section-title" id={`h-${id}`}>
        {t.label}
        <span className="sb-mono">{t.count}</span>
      </h3>
    );
  };
  // Links like #/kirki/colours scroll to that section; a new product starts at the top.
  const paneRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const pane = paneRef.current;
    if (!pane) return;
    const target = tab !== 'logos' ? pane.querySelector<HTMLElement>(`#sec-${tab}`) : null;
    const t = window.setTimeout(() => {
      if (target) pane.scrollTo({ top: target.offsetTop - pane.offsetTop - 8, behavior: 'smooth' });
      else pane.scrollTo({ top: 0 });
    }, 60);
    return () => window.clearTimeout(t);
  }, [tab, product.id]);
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
    try {
      const { zip, count } = await buildKit(product);
      saveBlob(new Blob([zip as BlobPart], { type: 'application/zip' }), `${fileBase(product)}-brand-kit.zip`);
      toast(`Saved ${count} files as ${fileBase(product)}-brand-kit.zip`);
    } catch {
      toast("Couldn't build the brand kit. Check your connection and try again.");
    } finally {
      setBusy(false);
    }
  };

  const [sheet, setSheet] = useState<FileTarget | null>(null);
  const closeSheet = useCallback(() => setSheet(null), []);
  const press = useRef<number>(0);
  const pressed = useRef(false);
  const holdStart = (i: number) => {
    pressed.current = false;
    window.clearTimeout(press.current);
    press.current = window.setTimeout(() => {
      pressed.current = true;
      setSheet({ kind: 'colour', index: i, label: labels[i] });
    }, 450);
  };
  const holdEnd = () => window.clearTimeout(press.current);

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
            <Download size={16} /> {busy ? 'Building zip…' : 'Download all'}
          </button>
        )}
      </header>
      {admin && (
        <div className="sb-adminbar">
          <span className="sb-mono">Editing · saves commit to GitHub</span>
          <button className="sb-btn ghost" onClick={() => admin.editDetails(product)}>
            <Pencil size={16} /> Edit details
          </button>
          <ConfirmDelete label={product.name} onConfirm={() => admin.deleteProduct(product)} />
        </div>
      )}
      {onClose && (
        <div style={{ padding: '12px 16px 0' }}>
          <button className="sb-btn" style={{ width: '100%' }} onClick={downloadAll} disabled={busy}>
            <Download size={16} /> {busy ? 'Building zip…' : 'Download all'}
          </button>
        </div>
      )}

      <div className="sb-pane" ref={paneRef}>
        {has('logos') && (
        <section className="sb-section" id="sec-logos" aria-labelledby="h-logos">
          {heading('logos')}
          {product.assets.logos?.length || admin ? (
            <div className="sb-grid">
              {(product.assets.logos || []).map((logo) => {
                const original = logoOriginal(logo);
                const dark = /dark|white|reverse/i.test(`${logo.name} ${logo.variant}`);
                return (
                  <div className="sb-asset" key={logo.id}>
                    <button className={`sb-plate${dark ? ' dark' : ''}`} onClick={() => setSheet({ kind: 'logo', logo })} aria-label={`${logo.name.trim()}: file options`}>
                      <img src={assetUrl(logo.preview || original?.path)} alt="" loading="lazy" />
                    </button>
                    <div className="sb-asset-meta">
                      <b>{logo.name.trim()}</b>
                      <span className="sb-mono">{original?.ext === 'svg' ? 'SVG · PNG' : original?.ext.toUpperCase()}</span>
                    </div>
                    <div className="sb-asset-btns">
                      {original && (
                        <button className="sb-btn ghost" onClick={() => setSheet({ kind: 'logo', logo })}>
                          <Download size={16} /> Download
                        </button>
                      )}
                      {admin && <ConfirmDelete compact label={logo.name.trim()} onConfirm={() => removeLogo(admin, product, logo.id, logo.name.trim())} />}
                    </div>
                  </div>
                );
              })}
              {admin && <LogoDrop product={product} api={admin} />}
            </div>
          ) : (
            <p className="sb-empty">No logos for {product.name} yet.</p>
          )}
        </section>
        )}

        {has('colours') && (
        <section className="sb-section" id="sec-colours" aria-labelledby="h-colours">
          {heading('colours')}
          {product.assets.colors?.length || admin ? (
            <>
              <div className="sb-swatches">
                {product.assets.colors.map((c, i) => {
                  const hex = normalHex(c.hex);
                  const chip = (
                    <button
                      key={i}
                      className={`sb-chip${copied === i ? ' copied' : ''}`}
                      onClick={() => (pressed.current ? (pressed.current = false) : copyHex(i))}
                      onPointerDown={() => holdStart(i)}
                      onPointerUp={holdEnd}
                      onPointerLeave={holdEnd}
                      onPointerCancel={holdEnd}
                      onContextMenu={(e) => {
                        e.preventDefault();
                        holdEnd();
                        setSheet({ kind: 'colour', index: i, label: labels[i] });
                      }}
                      aria-label={`${labels[i]}, ${hex}. Tap to copy hex; press and hold for RGB, HSL and CSS`}
                    >
                      <span className="sb-chip-colour" style={{ background: hex, color: textOn(hex) }}>
                        {hex}
                        <small>{rgbString(hex)}</small>
                      </span>
                      <span className="sb-chip-name">{labels[i]}</span>
                      <span className="sb-stamp">Copied</span>
                      {admin && labels[i] !== c.name.trim() && <span className="sb-dupe">Same name as another color</span>}
                    </button>
                  );
                  return admin ? (
                    <div key={i} className="sb-chip-wrap">
                      {chip}
                      <ConfirmDelete compact label={`${labels[i]} ${hex}`} onConfirm={() => removeColour(admin, product, i)} />
                    </div>
                  ) : (
                    chip
                  );
                })}
              </div>
              {admin && <AddColour product={product} api={admin} />}
              <p className="sb-mono sb-hint">Tap to copy hex. Press and hold, or right-click, for RGB, HSL and CSS.</p>
              <div className="sb-actions">
                <button className="sb-btn ghost" onClick={async () => toast((await copyText(product.assets.colors.map((c) => normalHex(c.hex)).join('\n'))) ? `Copied ${product.assets.colors.length} hex codes` : 'Copy failed')}>
                  Copy all hex
                </button>
                <button className="sb-btn ghost" onClick={async () => toast((await copyText(cssVariables(product))) ? 'Copied as CSS variables' : 'Copy failed')}>
                  Copy as CSS
                </button>
                <button className="sb-btn ghost" onClick={() => { saveBlob(new Blob([paletteJson(product)], { type: 'application/json' }), `${fileBase(product)}-palette.json`); toast('Saved palette as JSON'); }}>
                  JSON
                </button>
                <button className="sb-btn ghost" onClick={() => { saveBlob(new Blob([buildAse(product) as BlobPart], { type: 'application/octet-stream' }), `${fileBase(product)}-palette.ase`); toast('Saved palette for Adobe apps (.ase)'); }}>
                  ASE
                </button>
              </div>
            </>
          ) : (
            <p className="sb-empty">No colors for {product.name} yet.</p>
          )}
        </section>
        )}

        {has('favicon') && (
        <section className="sb-section" id="sec-favicon" aria-labelledby="h-favicon">
          {heading('favicon')}
        {admin && (
          <div className="sb-adminrow">
            <button className="sb-btn ghost" onClick={() => admin.addFavicon(product)}>
              <Plus size={16} /> {product.assets.favicon ? 'Replace favicon' : 'Add favicon'}
            </button>
            {product.assets.favicon && <ConfirmDelete label="the favicon" onConfirm={() => removePart(admin, product, 'favicon')} />}
          </div>
        )}
        {product.assets.favicon && (() => {
          const fav = product.assets.favicon!;
          const path = fav.svg || fav.png || fav.ico || fav.preview;
          const ext = extOf(path, 'svg');
          return (
            <div className="sb-grid">
              <div className="sb-asset">
                <button className="sb-plate" onClick={() => setSheet({ kind: 'favicon' })} aria-label="Favicon: file options"><img src={assetUrl(fav.preview || path)} alt="" /></button>
                <div className="sb-asset-meta"><b>Favicon</b><span className="sb-mono">{ext === 'svg' ? 'ICO · PNG · SVG' : ext.toUpperCase()}</span></div>
                <button className="sb-btn ghost" onClick={() => setSheet({ kind: 'favicon' })}>
                  <Download size={16} /> Download
                </button>
              </div>
            </div>
          );
        })()}
        </section>
        )}

        {has('guidelines') && (
        <section className="sb-section" id="sec-guidelines" aria-labelledby="h-guidelines">
          {heading('guidelines')}
        {admin && (
          <div className="sb-adminrow">
            <button className="sb-btn ghost" onClick={() => admin.addGuidelines(product)}>
              <Plus size={16} /> {product.assets.guidelines ? 'Replace guidelines PDF' : 'Add guidelines PDF'}
            </button>
            {product.assets.guidelines && <ConfirmDelete label="the guidelines" onConfirm={() => removePart(admin, product, 'guidelines')} />}
          </div>
        )}
        {product.assets.guidelines && (() => {
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
        </section>
        )}
      </div>
      {sheet && sheet.kind !== 'colour' && <FileSheet product={product} target={sheet} onClose={closeSheet} toast={toast} copy={copyText} />}
      {sheet && sheet.kind === 'colour' && <ColourSheet product={product} target={sheet} onClose={closeSheet} toast={toast} copy={copyText} />}
    </div>
  );
}

// ---------- Page ----------

export function Browse({ admin = false }: { admin?: boolean }) {
  const B = admin ? '/admin/dashboard' : '';
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

  const [session, setSession] = useState<AdminSession | null>(() => (admin ? getSession() : null));
  const [modal, setModal] = useState<null | { kind: 'create' } | { kind: 'edit' | 'favicon' | 'guidelines'; product: Product }>(null);

  const expire = useCallback(() => {
    toast('Your sign-in has expired. Sign in with GitHub again.');
    signOut();
    setSession(null);
    window.setTimeout(() => navigate('/admin'), 1200);
  }, [navigate, toast]);

  const load = useCallback(async () => {
    setError(false);
    try {
      // Admins read straight from GitHub, so they see saves before Pages redeploys.
      if (admin) await refreshIfNeeded();
      setDb(admin ? await loadAdminDb() : await loadPublicDb());
    } catch (e) {
      if (e instanceof SessionExpiredError) expire();
      else setError(true);
    }
  }, [admin, expire]);
  useEffect(() => {
    if (admin && !session) {
      navigate('/admin', { replace: true });
      return;
    }
    load();
    if (!admin) return;
    // Renew the 8-hour GitHub token in the background while the dashboard is open.
    const timer = window.setInterval(() => refreshIfNeeded().catch(expire), 5 * 60 * 1000);
    return () => window.clearInterval(timer);
  }, [load, admin, session, navigate, expire]);

  const slugs = useMemo(() => slugMap(db?.products || []), [db]);

  // Routes: /  ·  /:slug  ·  /:slug/:tab  ·  legacy /product/:id
  const parts = location.pathname.slice(B.length).split('/').filter(Boolean);
  const settingsOpen = admin && parts[0] === 'settings';
  let product: Product | undefined;
  let tab: Tab = 'logos';
  if (parts[0] === 'product' && parts[1] && db) {
    const p = db.products.find((x) => x.id === parts[1]);
    if (p) product = p;
  } else if (parts[0] && !settingsOpen) {
    product = slugs.get(parts[0]);
    const sec = parts[1] === 'colors' ? 'colours' : parts[1];
    if (sec && (TABS as string[]).includes(sec)) tab = sec as Tab;
  }

  useEffect(() => {
    if (parts[0] === 'product' && product) navigate(`${B}/${slugOf(slugs, product)}`, { replace: true });
  }, [parts[0], product, slugs, navigate]);

  const shown = settingsOpen ? undefined : wide ? product || db?.products[0] : product;
  const accent = accentOf(shown);
  const settings = db?.settings;
  const orgName = settings?.organizationName || 'Ollyo Brand Assets';

  useEffect(() => {
    document.title = `${admin ? 'Admin · ' : ''}${product ? `${product.name} · ` : ''}${orgName}`;
  }, [product, orgName, admin]);

  const open = (m: Match) => {
    lastRow.current = m.product.id;
    navigate(`${B}/${slugOf(slugs, m.product)}${m.tab && m.tab !== 'logos' ? `/${m.tab === 'colours' ? 'colors' : m.tab}` : ''}`, { replace: wide && !!product });
  };
  const close = useCallback(() => {
    if (window.history.length > 1 && location.key !== 'default') navigate(-1);
    else navigate(B || '/', { replace: true });
    window.setTimeout(() => {
      const id = lastRow.current;
      if (id) document.querySelector<HTMLElement>(`[data-row="${id}"]`)?.focus();
    }, 260);
  }, [navigate, location.key]);
  const setTab = (t: Tab) => shown && navigate(`${B}/${slugOf(slugs, shown)}${t === 'logos' ? '' : `/${t === 'colours' ? 'colors' : t}`}`, { replace: true });

  // Phone sheet: Escape and swipe down close it; focus moves into it on open.
  const sheetOpen = !wide && (!!product || settingsOpen);
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

  const api: AdminApi | undefined = admin
    ? {
        refresh: load,
        onSessionExpired: expire,
        toast,
        editDetails: (p) => setModal({ kind: 'edit', product: p }),
        addFavicon: (p) => setModal({ kind: 'favicon', product: p }),
        addGuidelines: (p) => setModal({ kind: 'guidelines', product: p }),
        deleteProduct: async (p) => {
          try {
            await deleteProduct(p.id);
            await load();
            toast(`Deleted ${p.name}`);
            navigate(B, { replace: true });
          } catch (e) {
            if (e instanceof SessionExpiredError) expire();
            else toast(e instanceof Error ? `Couldn't delete ${p.name}: ${e.message}` : `Couldn't delete ${p.name}`);
          }
        },
      }
    : undefined;

  const adminTools = admin && session && (
    <div className="sb-railtools">
      <button className="sb-btn" onClick={() => setModal({ kind: 'create' })}>
        <Plus size={16} /> New product
      </button>
      <button className="sb-btn ghost" aria-current={settingsOpen ? 'page' : undefined} onClick={() => navigate(`${B}/settings`)}>
        <SettingsIcon size={16} /> Settings
      </button>
    </div>
  );

  const adminModals = admin && session && (
    <>
      <CreateProductModal
        isOpen={modal?.kind === 'create'}
        onClose={() => setModal(null)}
        onSessionExpired={expire}
        onSuccess={async (p) => {
          setModal(null);
          await load();
          navigate(`${B}/${slugOf(slugMap([...(db?.products || []), p]), p)}`);
        }}
      />
      {modal && modal.kind !== 'create' && (
        <>
          <EditProductModal isOpen={modal.kind === 'edit'} product={modal.product} onClose={() => setModal(null)} onSessionExpired={expire} onSuccess={async () => { setModal(null); await load(); }} />
          <AddFaviconModal isOpen={modal.kind === 'favicon'} productId={modal.product.id} onClose={() => setModal(null)} onSessionExpired={expire} onSuccess={() => load()} />
          <AddGuidelinesModal isOpen={modal.kind === 'guidelines'} productId={modal.product.id} onClose={() => setModal(null)} onSessionExpired={expire} onSuccess={() => load()} />
        </>
      )}
      <Toaster />
    </>
  );

  const settingsView = admin && session && (
    <div className="sb-pv">
      <header className="sb-pv-head" style={{ gridTemplateColumns: '1fr auto' }}>
        <div>
          <h2 ref={headingRef} tabIndex={-1} style={{ outline: 'none' }}>Settings</h2>
          <p>Site name, logo and who can edit</p>
        </div>
        {!wide && (
          <button className="sb-btn ghost icon" onClick={close} aria-label="Close">
            <X size={18} />
          </button>
        )}
      </header>
      <div className="sb-pane sb-settings">
        <Settings session={session} onSettingsSaved={() => load()} onSessionExpired={expire} />
      </div>
    </div>
  );
  const logoSrc = settings?.organizationLogo ? assetUrl(settings.organizationLogo) : db ? imgLogo : '';

  const top = (
    <div className="sb-top">
      {logoSrc ? <img src={logoSrc} alt="" /> : <span style={{ width: 28, height: 28 }} />}
      <h1>{orgName}</h1>
      {admin && session && (
        <span className="sb-who">
          <span className="sb-mono">@{session.login}</span>
          <button
            className="sb-btn ghost icon"
            aria-label="Sign out"
            title="Sign out"
            onClick={() => {
              signOut();
              setSession(null);
              navigate('/admin');
            }}
          >
            <LogOut size={16} />
          </button>
        </span>
      )}
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
            {adminTools}
            {searchBox}
            <nav className="sb-list">{listBody}</nav>
          </aside>
          <main className="sb-main">
            {settingsOpen ? settingsView : shown && <ProductView product={shown} tab={tab} onTab={setTab} toast={toast} admin={api} />}
          </main>
        </div>
        {toastNode}
        {adminModals}
      </div>
    );
  }

  return (
    <div className="sb-public" style={style}>
      <div className="sb-shell" aria-hidden={sheetOpen || undefined}>
        {top}
        {adminTools}
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
        {settingsOpen && <div style={{ height: 'calc(100% - 15px)' }}>{settingsView}</div>}
        {product && (
          <div style={{ height: 'calc(100% - 15px)' }}>
            <ProductView product={product} tab={tab} onTab={setTab} onClose={close} toast={toast} headingRef={headingRef} admin={api} />
          </div>
        )}
      </div>
      {toastNode}
      {adminModals}
    </div>
  );
}
