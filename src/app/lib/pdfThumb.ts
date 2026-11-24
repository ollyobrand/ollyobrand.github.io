/**
 * Makes a thumbnail from the first page of a PDF, on the admin's device.
 * pdf.js is loaded only when this runs, so visitors never download it.
 */
export async function pdfThumbnail(data: ArrayBuffer, width = 800): Promise<Blob> {
  const pdfjs = await import('pdfjs-dist');
  const worker = (await import('pdfjs-dist/build/pdf.worker.min.mjs?url')).default;
  pdfjs.GlobalWorkerOptions.workerSrc = worker;
  const doc = await pdfjs.getDocument({ data: new Uint8Array(data) }).promise;
  try {
    const page = await doc.getPage(1);
    const natural = page.getViewport({ scale: 1 });
    const viewport = page.getViewport({ scale: width / natural.width });
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(viewport.width);
    canvas.height = Math.round(viewport.height);
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    await page.render({ canvasContext: ctx, viewport }).promise;
    return await new Promise<Blob>((resolve, reject) =>
      canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('Could not make the thumbnail'))), 'image/jpeg', 0.88),
    );
  } finally {
    doc.destroy();
  }
}

export const isImagePath = (path?: string) => !!path && /\.(png|jpe?g|webp|gif|svg)(\?|$)/i.test(path);
