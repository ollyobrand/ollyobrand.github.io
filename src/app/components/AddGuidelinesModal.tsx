import { useEffect, useRef, useState } from 'react';
import { Loader2, RefreshCw } from 'lucide-react';
import { assetUrl, updateProduct, uploadFile } from '../lib/api';
import { isImagePath, pdfThumbnail } from '../lib/pdfThumb';
import { Frame, useSheetKeys } from '../pages/FileSheet';
import { AdminApi, save } from '../pages/AdminEdit';
import { Product } from '../types';

/** Add or change the guidelines PDF and its thumbnail. The thumbnail is made from page 1 unless you upload your own. */
export function AddGuidelinesModal({ isOpen, product, api, onClose }: { isOpen: boolean; product: Product; api: AdminApi; onClose: () => void }) {
  if (!isOpen) return null;
  return <Dialog product={product} api={api} onClose={onClose} />;
}

function Dialog({ product, api, onClose }: { product: Product; api: AdminApi; onClose: () => void }) {
  const ref = useSheetKeys(onClose);
  const current = product.assets.guidelines;
  const [pdf, setPdf] = useState<File | null>(null);
  const [custom, setCustom] = useState<File | null>(null);
  const [auto, setAuto] = useState<Blob | null>(null);
  const [making, setMaking] = useState(false);
  const [failed, setFailed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [shown, setShown] = useState<string | null>(null);
  const keepsThumb = !pdf && !custom && isImagePath(current?.preview);

  // Make a thumbnail from the new PDF, or from the current one when it has no real thumbnail yet.
  useEffect(() => {
    setAuto(null);
    setFailed(false);
    if (custom || keepsThumb || (!pdf && !current?.pdf)) return;
    let live = true;
    setMaking(true);
    (async () => {
      const data = pdf ? await pdf.arrayBuffer() : await (await fetch(assetUrl(current!.pdf!))).arrayBuffer();
      return pdfThumbnail(data);
    })().then(
      (blob) => live && setAuto(blob),
      () => live && setFailed(true),
    ).finally(() => live && setMaking(false));
    return () => {
      live = false;
    };
  }, [pdf, custom, keepsThumb, current?.pdf]);

  useEffect(() => {
    const src = custom || auto;
    if (!src) return setShown(keepsThumb ? assetUrl(current!.preview) : null);
    const url = URL.createObjectURL(src);
    setShown(url);
    return () => URL.revokeObjectURL(url);
  }, [custom, auto, keepsThumb, current?.preview]);

  const pdfInput = useRef<HTMLInputElement>(null);
  const canSave = !busy && !making && (pdf || custom || auto || !!current) && (pdf || current?.pdf);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const ok = await save(
      api,
      async () => {
        const folder = `guidelines/${product.id}`;
        const pdfPath = pdf ? await uploadFile(pdf, folder) : current?.pdf;
        const thumbFile = custom || (auto ? new File([auto], 'thumbnail.jpg', { type: 'image/jpeg' }) : null);
        const preview = thumbFile ? await uploadFile(thumbFile, folder) : current?.preview || pdfPath!;
        await updateProduct(product.id, (p) => ({ ...p, assets: { ...p.assets, guidelines: { preview, pdf: pdfPath } } }), `Update brand guidelines for ${product.name}`);
      },
      'Guidelines saved',
      "Couldn't save the guidelines",
    );
    setBusy(false);
    if (ok) onClose();
  };

  return (
    <Frame title={current ? 'Edit guidelines' : 'Add guidelines'} onClose={onClose} sheetRef={ref}>
      <form className="sb-file-body" onSubmit={submit}>
        <div className="sb-plate sb-thumb" aria-live="polite">
          {making ? <Loader2 className="sb-spin" size={20} /> : shown ? <img src={shown} alt="Thumbnail preview" /> : <span className="sb-mono">{failed ? "Couldn't read the PDF. Upload an image instead." : 'Thumbnail appears here'}</span>}
        </div>
        <label className="sb-field">
          <span className="sb-mono">{current ? 'Replace PDF (optional)' : 'PDF'}</span>
          <input ref={pdfInput} type="file" accept="application/pdf,.pdf" onChange={(e) => { setPdf(e.target.files?.[0] || null); setCustom(null); }} disabled={busy} />
        </label>
        <label className="sb-field">
          <span className="sb-mono">Your own thumbnail (optional)</span>
          <input type="file" accept="image/png,image/jpeg,image/webp" onChange={(e) => setCustom(e.target.files?.[0] || null)} disabled={busy} />
        </label>
        {custom && (
          <button type="button" className="sb-btn ghost" onClick={() => setCustom(null)}>
            <RefreshCw size={16} /> Use the page-1 thumbnail instead
          </button>
        )}
        <p className="sb-mono sb-file-note">Without your own image, the thumbnail is the first page of the PDF, made on your device.</p>
        <div className="sb-actions">
          <button className="sb-btn" type="submit" disabled={!canSave}>
            {busy ? <Loader2 size={16} className="sb-spin" /> : null}
            {busy ? 'Saving…' : 'Save'}
          </button>
        </div>
      </form>
    </Frame>
  );
}
