import { ArrowLeft, Download, Edit, Trash2 } from 'lucide-react';
import { Product } from '../types';
import { Button } from './ui/button';
import { LogosSection } from './LogosSection';
import { FaviconSection } from './FaviconSection';
import { ColorPaletteSection } from './ColorPaletteSection';
import { GuidelinesSection } from './GuidelinesSection';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { useState } from 'react';
import { AddLogoModal } from './AddLogoModal';
import { AddColorModal } from './AddColorModal';
import { AddFaviconModal } from './AddFaviconModal';
import { AddGuidelinesModal } from './AddGuidelinesModal';
import { toast } from 'sonner@2.0.3';
import { assetUrl, downloadFile, fileExt, updateProduct } from '../lib/api';
import { SessionExpiredError } from '../lib/auth';

interface ProductDetailProps {
  product: Product;
  onBack: () => void;
  isAdmin?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  onAssetChange?: () => void;
  onSessionExpired?: () => void;
}

export function ProductDetail({ product, onBack, isAdmin, onEdit, onDelete, onAssetChange, onSessionExpired }: ProductDetailProps) {
  const handleDelete = () => {
    if (confirm(`Are you sure you want to delete "${product.name}"? This action cannot be undone.`)) {
      onDelete?.();
    }
  };

  const handleDownloadAll = async () => {
    const downloads: Array<{ url: string; name: string }> = [];
    const add = (path: string | undefined, base: string, fallbackExt: string) => {
      if (path && !downloads.some((d) => d.url === path)) {
        downloads.push({ url: path, name: `${base}.${fileExt(path, fallbackExt)}` });
      }
    };

    product.assets.logos?.forEach((logo) => {
      add(logo.svg, `${product.name}-${logo.variant}-logo`, 'svg');
      add(logo.png, `${product.name}-${logo.variant}-logo`, 'png');
    });
    const favicon = product.assets.favicon;
    if (favicon) {
      add(favicon.svg, `${product.name}-favicon`, 'svg');
      add(favicon.png, `${product.name}-favicon`, 'png');
      add(favicon.ico, `${product.name}-favicon`, 'ico');
    }
    add(product.assets.guidelines?.pdf, `${product.name}-brand-guidelines`, 'pdf');

    for (const file of downloads) {
      try {
        await downloadFile(file.url, file.name);
        await new Promise((resolve) => setTimeout(resolve, 300));
      } catch (error) {
        console.error('Download error for', file.name, ':', error);
        toast.error(`Failed to download ${file.name}`);
      }
    }
  };

  const [isAddLogoModalOpen, setAddLogoModalOpen] = useState(false);
  const [isAddColorModalOpen, setAddColorModalOpen] = useState(false);
  const [isAddFaviconModalOpen, setAddFaviconModalOpen] = useState(false);
  const [isAddGuidelinesModalOpen, setAddGuidelinesModalOpen] = useState(false);

  const removeAsset = async (
    label: string,
    update: (assets: Product['assets']) => Product['assets'],
  ) => {
    try {
      await updateProduct(product.id, (current) => ({ ...current, assets: update(current.assets) }), `Remove ${label} from ${product.name}`);
      toast.success(`${label[0].toUpperCase()}${label.slice(1)} removed`);
      onAssetChange?.();
    } catch (error) {
      console.error(`Delete ${label} error:`, error);
      if (error instanceof SessionExpiredError) onSessionExpired?.();
      toast.error(error instanceof Error ? error.message : `Failed to delete ${label}`);
    }
  };

  const handleDeleteLogo = (logoId: string) =>
    removeAsset('logo', (assets) => ({ ...assets, logos: (assets.logos || []).filter((logo) => logo.id !== logoId) }));

  const handleDeleteColor = (colorIndex: number) =>
    removeAsset('color', (assets) => ({ ...assets, colors: (assets.colors || []).filter((_, idx) => idx !== colorIndex) }));

  const handleDeleteFavicon = () =>
    removeAsset('favicon', ({ favicon: _removed, ...assets }) => ({ ...assets, colors: assets.colors || [] }));

  const handleDeleteGuidelines = () =>
    removeAsset('guidelines', ({ guidelines: _removed, ...assets }) => ({ ...assets, colors: assets.colors || [] }));

  return (
    <div className="p-4 md:p-8">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 md:mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="text-sm md:text-base">Back to All Products</span>
      </button>

      <div className="bg-white rounded-xl border border-gray-200 p-4 md:p-8 mb-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4 md:gap-6">
            <div className="w-16 h-16 md:w-20 md:h-20 bg-gray-50 rounded-xl flex items-center justify-center flex-shrink-0">
              {product.logoUrl ? (
                <ImageWithFallback
                  src={assetUrl(product.logoUrl)}
                  alt={product.name}
                  className="w-12 h-12 md:w-14 md:h-14 object-contain"
                />
              ) : (
                <div className="text-gray-300 text-xl md:text-2xl font-bold">
                  {product.name.charAt(0)}
                </div>
              )}
            </div>
            <div>
              <h1 className="text-gray-900 mb-1 text-xl md:text-3xl">{product.name}</h1>
              <p className="text-gray-500 text-sm md:text-base">{product.tagline || 'No tagline yet'}</p>
            </div>
          </div>
          <div className="flex gap-2 w-full md:w-auto flex-wrap">
            {isAdmin && onEdit && (
              <Button variant="outline" className="gap-2 flex-1 md:flex-initial" onClick={onEdit}>
                <Edit className="w-4 h-4" />
                <span className="hidden sm:inline">Edit Product</span>
                <span className="sm:hidden">Edit</span>
              </Button>
            )}
            {isAdmin && onDelete && (
              <Button variant="outline" className="gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 flex-1 md:flex-initial" onClick={handleDelete}>
                <Trash2 className="w-4 h-4" />
                <span className="hidden sm:inline">Delete</span>
                <span className="sm:hidden">Del</span>
              </Button>
            )}
            <Button className="gap-2 flex-1 md:flex-initial" onClick={handleDownloadAll}>
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Download All</span>
              <span className="sm:hidden">Download</span>
            </Button>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {product.assets.logos && product.assets.logos.length > 0 && (
          <LogosSection 
            logos={product.assets.logos} 
            productName={product.name} 
            isAdmin={isAdmin}
            onAddLogo={() => setAddLogoModalOpen(true)}
            onDeleteLogo={handleDeleteLogo} 
          />
        )}
        {product.assets.favicon && (
          <FaviconSection 
            favicon={product.assets.favicon} 
            productName={product.name} 
            isAdmin={isAdmin}
            onAddFavicon={() => setAddFaviconModalOpen(true)}
            onDeleteFavicon={handleDeleteFavicon} 
          />
        )}
        {product.assets.colors && product.assets.colors.length > 0 && (
          <ColorPaletteSection 
            colors={product.assets.colors} 
            isAdmin={isAdmin}
            onAddColor={() => setAddColorModalOpen(true)}
            onDeleteColor={handleDeleteColor} 
          />
        )}
        {product.assets.guidelines && (
          <GuidelinesSection 
            guidelines={product.assets.guidelines} 
            productName={product.name} 
            isAdmin={isAdmin}
            onAddGuidelines={() => setAddGuidelinesModalOpen(true)}
            onDeleteGuidelines={handleDeleteGuidelines} 
          />
        )}
        {!product.assets.logos && !product.assets.favicon && (!product.assets.colors || product.assets.colors.length === 0) && !product.assets.guidelines && (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <p className="text-gray-500">
              No assets uploaded yet. {isAdmin && 'Use the buttons below to add assets.'}
            </p>
          </div>
        )}
      </div>

      {isAdmin && (
        <div className="mt-8 grid grid-cols-2 md:flex gap-3">
          <Button variant="outline" className="gap-2" onClick={() => setAddLogoModalOpen(true)}>
            <Edit className="w-4 h-4" />
            <span className="hidden sm:inline">Add Logo</span>
            <span className="sm:hidden">Logo</span>
          </Button>
          <Button variant="outline" className="gap-2" onClick={() => setAddColorModalOpen(true)}>
            <Edit className="w-4 h-4" />
            <span className="hidden sm:inline">Add Color</span>
            <span className="sm:hidden">Color</span>
          </Button>
          <Button variant="outline" className="gap-2" onClick={() => setAddFaviconModalOpen(true)}>
            <Edit className="w-4 h-4" />
            <span className="hidden sm:inline">Add Favicon</span>
            <span className="sm:hidden">Favicon</span>
          </Button>
          <Button variant="outline" className="gap-2" onClick={() => setAddGuidelinesModalOpen(true)}>
            <Edit className="w-4 h-4" />
            <span className="hidden sm:inline">Add Guidelines</span>
            <span className="sm:hidden">Guide</span>
          </Button>
        </div>
      )}

      <AddLogoModal
        isOpen={isAddLogoModalOpen}
        onClose={() => setAddLogoModalOpen(false)}
        onSuccess={() => onAssetChange?.()}
        productId={product.id}
        onSessionExpired={onSessionExpired}
      />
      <AddColorModal
        isOpen={isAddColorModalOpen}
        onClose={() => setAddColorModalOpen(false)}
        onSuccess={() => onAssetChange?.()}
        productId={product.id}
        onSessionExpired={onSessionExpired}
      />
      <AddFaviconModal
        isOpen={isAddFaviconModalOpen}
        onClose={() => setAddFaviconModalOpen(false)}
        onSuccess={() => onAssetChange?.()}
        productId={product.id}
        onSessionExpired={onSessionExpired}
      />
      <AddGuidelinesModal
        isOpen={isAddGuidelinesModalOpen}
        onClose={() => setAddGuidelinesModalOpen(false)}
        onSuccess={() => onAssetChange?.()}
        productId={product.id}
        onSessionExpired={onSessionExpired}
      />
    </div>
  );
}