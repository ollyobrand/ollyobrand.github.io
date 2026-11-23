/**
 * Editing tools that appear inside the product view when an admin is signed in.
 * Every save is one commit to the repo, exactly as before (lib/api.ts mutateDb).
 */
import { useRef, useState } from 'react';
import { AlertTriangle, ArrowLeft, ArrowRight, GripVertical, Loader2, Pencil, Plus, Trash2, Upload } from 'lucide-react';
import { closestCenter, DndContext, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, rectSortingStrategy, SortableContext, sortableKeyboardCoordinates, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { updateProduct, uploadFile } from '../lib/api';
import { extOf, normalHex, rgbString } from '../lib/brand';
import { SessionExpiredError } from '../lib/auth';
import { Color, Logo, Product } from '../types';
import { Frame, useSheetKeys } from './FileSheet';

export interface AdminApi {
  /** Reload the product list from GitHub after a save. */
  refresh: () => Promise<void>;
  onSessionExpired: () => void;
  toast: (m: string) => void;
  editDetails: (product: Product) => void;
  deleteProduct: (product: Product) => Promise<void>;
  addFavicon: (product: Product) => void;
  addGuidelines: (product: Product) => void;
}

export async function save(api: AdminApi, job: () => Promise<unknown>, done: string, failed: string): Promise<boolean> {
  try {
    await job();
    await api.refresh();
    api.toast(done);
    return true;
  } catch (error) {
    if (error instanceof SessionExpiredError) api.onSessionExpired();
    else api.toast(error instanceof Error ? `${failed}: ${error.message}` : failed);
    return false;
  }
}

/** A delete button that asks for a second tap instead of a browser dialog. */
export function ConfirmDelete({ label, onConfirm, compact }: { label: string; onConfirm: () => Promise<unknown>; compact?: boolean }) {
  const [armed, setArmed] = useState(false);
  const [busy, setBusy] = useState(false);
  const timer = useRef<number>(0);
  const click = async () => {
    if (!armed) {
      setArmed(true);
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => setArmed(false), 3000);
      return;
    }
    setBusy(true);
    await onConfirm();
    setBusy(false);
    setArmed(false);
  };
  return (
    <button
      className={`sb-btn ghost sb-danger${armed ? ' armed' : ''}${compact && !armed ? ' icon' : ''}`}
      onClick={click}
      disabled={busy}
      aria-label={armed ? `Tap again to delete ${label}` : `Delete ${label}`}
    >
      {busy ? <Loader2 size={16} className="sb-spin" /> : <Trash2 size={16} />}
      {armed ? 'Tap again to delete' : compact ? null : 'Delete'}
    </button>
  );
}

const nameFromFile = (f: File) =>
  f.name
    .replace(/\.[^.]+$/, '')
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/^./, (c) => c.toUpperCase());

/** Drop SVG or PNG files on the Logos tab; name them, then add in one commit. */
export function LogoDrop({ product, api }: { product: Product; api: AdminApi }) {
  const input = useRef<HTMLInputElement>(null);
  const [over, setOver] = useState(false);
  const [pending, setPending] = useState<{ file: File; name: string }[]>([]);
  const [busy, setBusy] = useState(false);

  const take = (files: FileList | null) => {
    const ok = [...(files || [])].filter((f) => /\.(svg|png|jpe?g|webp)$/i.test(f.name));
    if (files && ok.length < files.length) api.toast('Only SVG, PNG, JPG and WebP files can be added as logos');
    if (ok.length) setPending((p) => [...p, ...ok.map((file) => ({ file, name: nameFromFile(file) }))]);
  };

  const add = async () => {
    if (pending.some((p) => !p.name.trim())) return api.toast('Give every logo a name');
    setBusy(true);
    const ok = await save(
      api,
      async () => {
        const logos: Logo[] = [];
        for (const { file, name } of pending) {
          const path = await uploadFile(file, `logos/${product.id}`);
          const ext = extOf(path);
          logos.push({
            id: `logo-${Date.now()}-${logos.length}`,
            name: name.trim(),
            variant: /\b(dark|white|reverse|inverse)\b/i.test(name) ? 'dark' : /\b(icon|symbol|glyph|logomark|favicon)\b/i.test(name) ? 'icon' : 'horizontal',
            preview: path,
            ...(ext === 'svg' ? { svg: path } : { png: path }),
          });
        }
        await updateProduct(
          product.id,
          (p) => ({ ...p, assets: { ...p.assets, logos: [...(p.assets.logos || []), ...logos] } }),
          `Add ${logos.length === 1 ? `logo: ${logos[0].name}` : `${logos.length} logos`} to ${product.name}`,
        );
      },
      pending.length === 1 ? 'Logo added' : `${pending.length} logos added`,
      "Couldn't add the logos",
    );
    setBusy(false);
    if (ok) setPending([]);
  };

  return (
    <div className="sb-asset">
      <div
        className={`sb-drop${over ? ' over' : ''}`}
        onDragOver={(e) => {
          e.preventDefault();
          setOver(true);
        }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setOver(false);
          take(e.dataTransfer.files);
        }}
      >
        {pending.length === 0 ? (
          <>
            <Upload size={20} aria-hidden="true" />
            <span>Drop logo files here</span>
            <span className="sb-mono">SVG preferred; PNG sizes are made from it</span>
            <button className="sb-btn ghost" onClick={() => input.current?.click()}>
              Choose files
            </button>
          </>
        ) : (
          <div className="sb-drop-list">
            {pending.map((p, i) => (
              <label key={i} className="sb-field">
                <span className="sb-mono">{p.file.name}</span>
                <input
                  value={p.name}
                  onChange={(e) => setPending((all) => all.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)))}
                  placeholder="Logo name, e.g. Horizontal logo"
                  aria-label={`Name for ${p.file.name}`}
                />
              </label>
            ))}
            <div className="sb-actions" style={{ marginTop: 4 }}>
              <button className="sb-btn" onClick={add} disabled={busy}>
                {busy ? <Loader2 size={16} className="sb-spin" /> : <Plus size={16} />}
                {busy ? 'Saving…' : `Add ${pending.length === 1 ? 'logo' : `${pending.length} logos`}`}
              </button>
              <button className="sb-btn ghost" onClick={() => setPending([])} disabled={busy}>
                Cancel
              </button>
            </div>
          </div>
        )}
        <input ref={input} type="file" accept=".svg,.png,.jpg,.jpeg,.webp" multiple hidden onChange={(e) => take(e.target.files)} />
      </div>
    </div>
  );
}

export function removeLogo(api: AdminApi, product: Product, logoId: string, name: string) {
  return save(
    api,
    () =>
      updateProduct(
        product.id,
        (p) => ({ ...p, assets: { ...p.assets, logos: (p.assets.logos || []).filter((l) => l.id !== logoId) } }),
        `Remove logo: ${name} from ${product.name}`,
      ),
    'Logo removed',
    "Couldn't remove the logo",
  );
}

export function removeColour(api: AdminApi, product: Product, index: number) {
  const c = product.assets.colors[index];
  return save(
    api,
    () =>
      updateProduct(
        product.id,
        (p) => ({ ...p, assets: { ...p.assets, colors: (p.assets.colors || []).filter((_, i) => i !== index) } }),
        `Remove color: ${c.name} (${normalHex(c.hex)}) from ${product.name}`,
      ),
    'Color removed',
    "Couldn't remove the color",
  );
}

export function removePart(api: AdminApi, product: Product, part: 'favicon' | 'guidelines') {
  return save(
    api,
    () =>
      updateProduct(
        product.id,
        (p) => {
          const assets = { ...p.assets };
          delete assets[part];
          return { ...p, assets };
        },
        `Remove ${part} from ${product.name}`,
      ),
    part === 'favicon' ? 'Favicon removed' : 'Guidelines removed',
    `Couldn't remove the ${part}`,
  );
}

/** Add a colour; a name already used in this palette is flagged before saving. */
export function AddColour({ product, api }: { product: Product; api: AdminApi }) {
  const [name, setName] = useState('');
  const [hex, setHex] = useState('#');
  const [busy, setBusy] = useState(false);
  const [confirmDupe, setConfirmDupe] = useState(false);
  const valid = /^#?[0-9a-f]{6}$/i.test(hex.trim()) || /^#?[0-9a-f]{3}$/i.test(hex.trim());
  const clean = valid ? normalHex(hex.trim()) : '';
  const dupeName = product.assets.colors?.some((c) => c.name.trim().toLowerCase() === name.trim().toLowerCase());
  const dupeHex = valid && product.assets.colors?.some((c) => normalHex(c.hex) === clean);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return api.toast('Give the color a name, for example Primary or Accent');
    if (!valid) return api.toast('Enter a hex code like #2151ED');
    if (dupeName && !confirmDupe) {
      setConfirmDupe(true);
      return;
    }
    setBusy(true);
    const ok = await save(
      api,
      () =>
        updateProduct(
          product.id,
          (p) => ({ ...p, assets: { ...p.assets, colors: [...(p.assets.colors || []), { name: name.trim(), hex: clean, rgb: `rgb(${rgbString(clean)})` }] } }),
          `Add color: ${name.trim()} (${clean}) to ${product.name}`,
        ),
      `Added ${name.trim()}`,
      "Couldn't add the color",
    );
    setBusy(false);
    if (ok) {
      setName('');
      setHex('#');
      setConfirmDupe(false);
    }
  };

  return (
    <form className="sb-addcolour" onSubmit={submit}>
      <span className="sb-addcolour-swatch" style={{ background: clean || 'transparent' }} aria-hidden="true">
        <input type="color" value={clean || '#ffffff'} onChange={(e) => setHex(e.target.value.toUpperCase())} aria-label="Pick a color" />
      </span>
      <label className="sb-field">
        <span className="sb-mono">Name</span>
        <input
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            setConfirmDupe(false);
          }}
          placeholder="Accent"
        />
      </label>
      <label className="sb-field sb-field-hex">
        <span className="sb-mono">Hex</span>
        <input value={hex} onChange={(e) => setHex(e.target.value)} placeholder="#2151ED" spellCheck={false} />
      </label>
      <button className="sb-btn" type="submit" disabled={busy}>
        {busy ? <Loader2 size={16} className="sb-spin" /> : <Plus size={16} />}
        {confirmDupe ? 'Add anyway' : 'Add color'}
      </button>
      {(dupeName || dupeHex) && (
        <p className="sb-warn" role="status">
          <AlertTriangle size={14} aria-hidden="true" />
          {dupeName
            ? `"${name.trim()}" is already used in this palette. Visitors will see numbered names like "${name.trim()} 02". A distinct name such as "${name.trim()} light" is clearer.`
            : `${clean} is already in this palette.`}
        </p>
      )}
    </form>
  );
}

// ---------- Reorder ----------

/** Drag-and-drop (touch, mouse and keyboard) over a list of ids; reports the old and new position. */
export function SortList({ ids, onReorder, children }: { ids: string[]; onReorder: (from: number, to: number) => void; children: React.ReactNode }) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );
  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={({ active, over }) => {
        if (!over || active.id === over.id) return;
        onReorder(ids.indexOf(String(active.id)), ids.indexOf(String(over.id)));
      }}
    >
      <SortableContext items={ids} strategy={rectSortingStrategy}>
        {children}
      </SortableContext>
    </DndContext>
  );
}

/** One draggable item. `children` receives the grip button to place wherever it fits. */
export function SortItem({ id, className, children }: { id: string; className?: string; children: (grip: React.ReactNode) => React.ReactNode }) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({ id });
  const grip = (
    <button type="button" ref={setActivatorNodeRef} className="sb-btn ghost icon sb-grip" aria-label="Drag to reorder" {...attributes} {...listeners}>
      <GripVertical size={16} />
    </button>
  );
  return (
    <div ref={setNodeRef} className={`${className || ''}${isDragging ? ' dragging' : ''}`} style={{ transform: CSS.Transform.toString(transform), transition }}>
      {children(grip)}
    </div>
  );
}

const sameColour = (a: Color, b: Color) => a.name === b.name && normalHex(a.hex) === normalHex(b.hex);
const CHANGED = 'The palette changed while you were editing. Reload the page and try again.';

/** Move one colour to where another one sits. Both are found by name and hex, so a save by someone else can't misplace them. */
export function moveColour(api: AdminApi, product: Product, moving: Color, target: Color) {
  return save(
    api,
    () =>
      updateProduct(
        product.id,
        (p) => {
          const list = [...(p.assets.colors || [])];
          const from = list.findIndex((c) => sameColour(c, moving));
          const to = list.findIndex((c) => sameColour(c, target));
          if (from < 0 || to < 0) throw new Error(CHANGED);
          return { ...p, assets: { ...p.assets, colors: arrayMove(list, from, to) } };
        },
        `Reorder colors: move ${moving.name} (${normalHex(moving.hex)}) in ${product.name}`,
      ),
    'Order saved',
    "Couldn't save the order",
  );
}

export function moveLogo(api: AdminApi, product: Product, movingId: string, targetId: string, name: string) {
  return save(
    api,
    () =>
      updateProduct(
        product.id,
        (p) => {
          const list = [...(p.assets.logos || [])];
          const from = list.findIndex((l) => l.id === movingId);
          const to = list.findIndex((l) => l.id === targetId);
          if (from < 0 || to < 0) throw new Error('The logos changed while you were editing. Reload the page and try again.');
          return { ...p, assets: { ...p.assets, logos: arrayMove(list, from, to) } };
        },
        `Reorder logos: move ${name} in ${product.name}`,
      ),
    'Order saved',
    "Couldn't save the order",
  );
}

// ---------- Edit ----------

/** Pencil button used on every editable color and logo. */
export function EditButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button type="button" className="sb-btn ghost icon" onClick={onClick} aria-label={`Edit ${label}`}>
      <Pencil size={16} />
    </button>
  );
}

/** Edit a colour's name and hex, or step it earlier or later in the palette. */
export function EditColourDialog({ product, index, api, onClose }: { product: Product; index: number; api: AdminApi; onClose: () => void }) {
  const ref = useSheetKeys(onClose);
  const colours = product.assets.colors || [];
  const current = colours[index];
  const [name, setName] = useState(current?.name || '');
  const [hex, setHex] = useState(current ? normalHex(current.hex) : '#');
  const [busy, setBusy] = useState(false);
  if (!current) return null;
  const valid = /^#?([0-9a-f]{6}|[0-9a-f]{3})$/i.test(hex.trim());
  const clean = valid ? normalHex(hex.trim()) : '';
  const changed = name.trim() !== current.name.trim() || (valid && clean !== normalHex(current.hex));
  const dupeName = colours.some((c, i) => i !== index && c.name.trim().toLowerCase() === name.trim().toLowerCase());

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return api.toast('Give the color a name, for example Primary or Accent');
    if (!valid) return api.toast('Enter a hex code like #2151ED');
    if (!changed) return onClose();
    setBusy(true);
    const ok = await save(
      api,
      () =>
        updateProduct(
          product.id,
          (p) => {
            const list = [...(p.assets.colors || [])];
            const at = list.findIndex((c) => sameColour(c, current));
            if (at < 0) throw new Error(CHANGED);
            list[at] = { ...list[at], name: name.trim(), hex: clean, rgb: `rgb(${rgbString(clean)})` };
            return { ...p, assets: { ...p.assets, colors: list } };
          },
          `Edit color: ${current.name.trim()} (${normalHex(current.hex)}) to ${name.trim()} (${clean}) in ${product.name}`,
        ),
      `Saved ${name.trim()}`,
      "Couldn't save the color",
    );
    setBusy(false);
    if (ok) onClose();
  };

  const step = async (by: -1 | 1) => {
    const target = colours[index + by];
    if (!target) return;
    setBusy(true);
    const ok = await moveColour(api, product, current, target);
    setBusy(false);
    if (ok) onClose();
  };

  return (
    <Frame title={`Edit ${current.name.trim()}`} onClose={onClose} sheetRef={ref}>
      <form className="sb-file-body" onSubmit={submit}>
        <div className="sb-colour-band" style={{ background: clean || normalHex(current.hex) }}>
          <input type="color" value={clean || '#ffffff'} onChange={(e) => setHex(e.target.value.toUpperCase())} aria-label="Pick a color" />
        </div>
        <label className="sb-field">
          <span className="sb-mono">Name</span>
          <input value={name} onChange={(e) => setName(e.target.value)} />
        </label>
        <label className="sb-field sb-field-hex">
          <span className="sb-mono">Hex</span>
          <input value={hex} onChange={(e) => setHex(e.target.value)} spellCheck={false} aria-invalid={!valid} />
        </label>
        {dupeName && (
          <p className="sb-warn" role="status">
            <AlertTriangle size={14} aria-hidden="true" />
            "{name.trim()}" is already used in this palette. Visitors will see numbered names.
          </p>
        )}
        <div className="sb-actions">
          <button className="sb-btn" type="submit" disabled={busy || !valid || !name.trim()}>
            {busy ? <Loader2 size={16} className="sb-spin" /> : null}
            {busy ? 'Saving…' : 'Save'}
          </button>
          <button className="sb-btn ghost" type="button" onClick={() => step(-1)} disabled={busy || index === 0}>
            <ArrowLeft size={16} /> Earlier
          </button>
          <button className="sb-btn ghost" type="button" onClick={() => step(1)} disabled={busy || index === colours.length - 1}>
            Later <ArrowRight size={16} />
          </button>
        </div>
      </form>
    </Frame>
  );
}

/** Rename a logo, or step it earlier or later among the logos. */
export function EditLogoDialog({ product, logoId, api, onClose }: { product: Product; logoId: string; api: AdminApi; onClose: () => void }) {
  const ref = useSheetKeys(onClose);
  const logos = product.assets.logos || [];
  const index = logos.findIndex((l) => l.id === logoId);
  const current = logos[index];
  const [name, setName] = useState(current?.name.trim() || '');
  const [busy, setBusy] = useState(false);
  if (!current) return null;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return api.toast('Give the logo a name');
    if (name.trim() === current.name.trim()) return onClose();
    setBusy(true);
    const ok = await save(
      api,
      () =>
        updateProduct(
          product.id,
          (p) => ({ ...p, assets: { ...p.assets, logos: (p.assets.logos || []).map((l) => (l.id === logoId ? { ...l, name: name.trim() } : l)) } }),
          `Rename logo: ${current.name.trim()} to ${name.trim()} in ${product.name}`,
        ),
      'Logo renamed',
      "Couldn't rename the logo",
    );
    setBusy(false);
    if (ok) onClose();
  };

  const step = async (by: -1 | 1) => {
    const target = logos[index + by];
    if (!target) return;
    setBusy(true);
    const ok = await moveLogo(api, product, current.id, target.id, current.name.trim());
    setBusy(false);
    if (ok) onClose();
  };

  return (
    <Frame title={`Edit ${current.name.trim()}`} onClose={onClose} sheetRef={ref}>
      <form className="sb-file-body" onSubmit={submit}>
        <label className="sb-field">
          <span className="sb-mono">Name</span>
          <input value={name} onChange={(e) => setName(e.target.value)} />
        </label>
        <div className="sb-actions">
          <button className="sb-btn" type="submit" disabled={busy || !name.trim()}>
            {busy ? <Loader2 size={16} className="sb-spin" /> : null}
            {busy ? 'Saving…' : 'Save'}
          </button>
          <button className="sb-btn ghost" type="button" onClick={() => step(-1)} disabled={busy || index === 0}>
            <ArrowLeft size={16} /> Earlier
          </button>
          <button className="sb-btn ghost" type="button" onClick={() => step(1)} disabled={busy || index === logos.length - 1}>
            Later <ArrowRight size={16} />
          </button>
        </div>
      </form>
    </Frame>
  );
}
