import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { ArrowLeft, Download } from 'lucide-react';
import { Product } from '../types';
import { LogosSection } from '../components/LogosSection';
import { FaviconSection } from '../components/FaviconSection';
import { ColorPaletteSection } from '../components/ColorPaletteSection';
import { GuidelinesSection } from '../components/GuidelinesSection';
import { assetUrl, downloadFile, fileExt, loadPublicDb } from '../lib/api';

export function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadProduct(id);
    }
  }, [id]);

  const loadProduct = async (productId: string) => {
    setLoading(true);
    try {
      const db = await loadPublicDb();
      setProduct(db.products.find((p) => p.id === productId) || null);
    } catch (error) {
      console.error('Load product error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadAll = async () => {
    if (!product) return;
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
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#0049F8] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#6a7282]">Loading product...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-[#6a7282] text-lg mb-4">Product not found</p>
          <button
            onClick={() => navigate('/')}
            className="text-[#0049F8] hover:underline"
          >
            ← Back to products
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="p-8">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Products</span>
        </button>

        <div className="bg-white rounded-xl border border-gray-200 p-8 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 bg-gray-50 rounded-xl flex items-center justify-center">
                {product.logoUrl ? (
                  <img
                    src={assetUrl(product.logoUrl)}
                    alt={product.name}
                    className="w-14 h-14 object-contain"
                  />
                ) : (
                  <div className="text-gray-300 text-2xl font-bold">
                    {product.name.charAt(0)}
                  </div>
                )}
              </div>
              <div>
                <h1 className="text-3xl font-semibold text-gray-900 mb-1">{product.name}</h1>
                <p className="text-gray-500">{product.tagline || 'No tagline yet'}</p>
              </div>
            </div>
            <button 
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
              onClick={handleDownloadAll}
            >
              <Download className="w-4 h-4" />
              Download All
            </button>
          </div>
        </div>

        <div className="space-y-6">
          {product.assets.logos && product.assets.logos.length > 0 && (
            <LogosSection logos={product.assets.logos} productName={product.name} />
          )}
          {product.assets.favicon && (
            <FaviconSection favicon={product.assets.favicon} productName={product.name} />
          )}
          {product.assets.colors && product.assets.colors.length > 0 && (
            <ColorPaletteSection colors={product.assets.colors} />
          )}
          {product.assets.guidelines && (
            <GuidelinesSection guidelines={product.assets.guidelines} productName={product.name} />
          )}
          {!product.assets.logos && !product.assets.favicon && (!product.assets.colors || product.assets.colors.length === 0) && !product.assets.guidelines && (
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
              <p className="text-gray-500">
                No assets available yet for this product.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}