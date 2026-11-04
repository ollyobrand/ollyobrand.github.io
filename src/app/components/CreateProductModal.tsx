import { useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { toast } from 'sonner';
import { Product } from '../types';
import { createProduct, uploadFile } from '../lib/api';
import { SessionExpiredError } from '../lib/auth';

interface CreateProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (product: Product) => void;
  onSessionExpired?: () => void;
}

export function CreateProductModal({ isOpen, onClose, onSuccess, onSessionExpired }: CreateProductModalProps) {
  const [loading, setLoading] = useState(false);
  const [productName, setProductName] = useState('');
  const [description, setDescription] = useState('');
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
      const logoUrl = thumbnail ? await uploadFile(thumbnail, 'product-thumbnails') : '';
      const product = await createProduct({
        name: productName.trim(),
        tagline: description || '',
        logoUrl,
      });
      toast.success('Product created! Now add logos, colors, and other assets.');
      resetForm();
      onSuccess(product);
    } catch (error) {
      console.error(error);
      if (error instanceof SessionExpiredError) onSessionExpired?.();
      toast.error(error instanceof Error ? error.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setProductName('');
    setDescription('');
    setThumbnail(null);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          disabled={loading}
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-2xl font-semibold mb-2">Create New Product</h2>
        <p className="text-gray-600 mb-6">Start with basic details, add assets later</p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <Label htmlFor="productName">Product Name *</Label>
            <Input
              id="productName"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              placeholder="e.g., Brand X"
              required
              disabled={loading}
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description or tagline (optional)"
              rows={3}
              disabled={loading}
            />
          </div>

          <div>
            <Label htmlFor="thumbnail">Product Thumbnail</Label>
            <p className="text-sm text-gray-500 mb-2">
              This image appears on the product card
            </p>
            <Input
              id="thumbnail"
              type="file"
              accept="image/*"
              onChange={(e) => setThumbnail(e.target.files?.[0] || null)}
              disabled={loading}
            />
            {thumbnail && (
              <p className="text-sm text-gray-600 mt-2">📎 {thumbnail.name}</p>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Product'
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
