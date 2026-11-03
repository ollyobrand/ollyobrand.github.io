import { useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { toast } from 'sonner@2.0.3';
import { updateProduct, uploadFile } from '../lib/api';
import { SessionExpiredError } from '../lib/auth';

interface AddLogoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  productId: string;
  onSessionExpired?: () => void;
}

export function AddLogoModal({ isOpen, onClose, onSuccess, productId, onSessionExpired }: AddLogoModalProps) {
  const [loading, setLoading] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [displayName, setDisplayName] = useState('');
  const [variantName, setVariantName] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!logoFile) {
      toast.error('Please select a logo file');
      return;
    }

    if (!displayName.trim() || !variantName.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    setLoading(true);

    try {
      const path = await uploadFile(logoFile, `logos/${productId}`);
      const newLogo = {
        id: `logo-${Date.now()}`,
        name: displayName,
        variant: variantName,
        preview: path,
        svg: path,
        png: path,
      };
      await updateProduct(productId, (product) => ({
        ...product,
        assets: { ...product.assets, logos: [...(product.assets.logos || []), newLogo] },
      }), `Add logo: ${displayName}`);

      toast.success('Logo added successfully!');
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
    setLogoFile(null);
    setDisplayName('');
    setVariantName('');
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

        <h2 className="text-2xl font-semibold mb-2">Add Logo Variant</h2>
        <p className="text-gray-600 mb-6">Upload a new logo variant</p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <Label htmlFor="logoFile">Logo File *</Label>
            <Input
              id="logoFile"
              type="file"
              accept="image/*"
              onChange={(e) => setLogoFile(e.target.files?.[0] || null)}
              required
              disabled={loading}
            />
            {logoFile && (
              <p className="text-sm text-gray-600 mt-2">📎 {logoFile.name}</p>
            )}
          </div>

          <div>
            <Label htmlFor="displayName">Display Name *</Label>
            <Input
              id="displayName"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="e.g., Horizontal Logo"
              required
              disabled={loading}
            />
          </div>

          <div>
            <Label htmlFor="variantName">Variant Name *</Label>
            <Input
              id="variantName"
              value={variantName}
              onChange={(e) => setVariantName(e.target.value)}
              placeholder="e.g., horizontal, icon, dark, light"
              required
              disabled={loading}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Adding...
                </>
              ) : (
                'Add Logo'
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
