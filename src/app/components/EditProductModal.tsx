import { useState } from 'react';
import { X, Upload as UploadIcon, Loader2 } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { toast } from 'sonner';
import { updateProduct, uploadFile } from '../lib/api';
import { SessionExpiredError } from '../lib/auth';
import { Product } from '../types';

interface EditProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (product: Product) => void;
  product: Product;
  onSessionExpired?: () => void;
}

export function EditProductModal({ isOpen, onClose, onSuccess, product, onSessionExpired }: EditProductModalProps) {
  const [loading, setLoading] = useState(false);
  const [productName, setProductName] = useState(product.name);
  const [description, setDescription] = useState(product.tagline);
  const [thumbnail, setThumbnail] = useState<File | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!productName.trim()) {
      toast.error('Please enter a product name');
      return;
    }

    setLoading(true);

    try {
      const logoUrl = thumbnail ? await uploadFile(thumbnail, 'product-thumbnails') : product.logoUrl;
      const updated = await updateProduct(product.id, (current) => ({
        ...current,
        name: productName.trim(),
        tagline: description || '',
        logoUrl,
      }), `Edit product: ${productName.trim()}`);

      toast.success('Product updated successfully!');
      onSuccess(updated);
      onClose();
    } catch (error) {
      console.error(error);
      if (error instanceof SessionExpiredError) onSessionExpired?.();
      toast.error(error instanceof Error ? error.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl p-6 my-8 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
          disabled={loading}
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-2xl font-semibold mb-2">Edit Product</h2>
        <p className="text-gray-600 mb-6">Update product details or add new assets</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="productName">Product Name *</Label>
              <Input
                id="productName"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                required
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add a description"
              />
            </div>

            <div>
              <Label htmlFor="thumbnail">
                Thumbnail {product.logoUrl ? '(replace current)' : '(add new)'}
              </Label>
              <Input
                id="thumbnail"
                type="file"
                accept="image/*"
                onChange={(e) => setThumbnail(e.target.files?.[0] || null)}
              />
              {thumbnail && (
                <p className="text-sm text-gray-600 mt-1">{thumbnail.name}</p>
              )}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Updating Product...
                </>
              ) : (
                'Update Product'
              )}
            </Button>
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}