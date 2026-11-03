import { useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { toast } from 'sonner@2.0.3';
import { updateProduct, uploadFile } from '../lib/api';
import { SessionExpiredError } from '../lib/auth';

interface AddFaviconModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  productId: string;
  onSessionExpired?: () => void;
}

export function AddFaviconModal({ isOpen, onClose, onSuccess, productId, onSessionExpired }: AddFaviconModalProps) {
  const [loading, setLoading] = useState(false);
  const [faviconFile, setFaviconFile] = useState<File | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!faviconFile) {
      toast.error('Please select a favicon file');
      return;
    }

    setLoading(true);

    try {
      const path = await uploadFile(faviconFile, `favicons/${productId}`);
      const newFavicon = { preview: path, svg: path, png: path, ico: path };
      await updateProduct(productId, (product) => ({
        ...product,
        assets: { ...product.assets, favicon: newFavicon },
      }), 'Update favicon');

      toast.success('Favicon added successfully!');
      resetForm();
      onSuccess();
      onClose();
    } catch (error) {
      console.error(error);
      if (error instanceof SessionExpiredError) onSessionExpired?.();
      toast.error(error instanceof Error ? error.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFaviconFile(null);
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

        <h2 className="text-2xl font-semibold mb-2">Add Favicon</h2>
        <p className="text-gray-600 mb-6">Upload a favicon file (replaces existing if any)</p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <Label htmlFor="faviconFile">Favicon File *</Label>
            <p className="text-sm text-gray-500 mb-2">
              Supported formats: ICO, PNG, SVG
            </p>
            <Input
              id="faviconFile"
              type="file"
              accept="image/*,.ico"
              onChange={(e) => setFaviconFile(e.target.files?.[0] || null)}
              required
              disabled={loading}
            />
            {faviconFile && (
              <p className="text-sm text-gray-600 mt-2">📎 {faviconFile.name}</p>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Adding...
                </>
              ) : (
                'Add Favicon'
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
