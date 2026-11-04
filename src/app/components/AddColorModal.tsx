import { useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { toast } from 'sonner';
import { updateProduct } from '../lib/api';
import { SessionExpiredError } from '../lib/auth';

interface AddColorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  productId: string;
  onSessionExpired?: () => void;
}

export function AddColorModal({ isOpen, onClose, onSuccess, productId, onSessionExpired }: AddColorModalProps) {
  const [loading, setLoading] = useState(false);
  const [colorName, setColorName] = useState('');
  const [colorHex, setColorHex] = useState('#3B82F6');

  if (!isOpen) return null;

  const hexToRgb = (hex: string): string => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) return 'rgb(0, 0, 0)';
    return `rgb(${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)})`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!colorName.trim()) {
      toast.error('Please enter a color name');
      return;
    }

    setLoading(true);

    try {
      const newColor = { name: colorName, hex: colorHex, rgb: hexToRgb(colorHex) };
      await updateProduct(productId, (product) => ({
        ...product,
        assets: { ...product.assets, colors: [...(product.assets.colors || []), newColor] },
      }), `Add color: ${colorName}`);

      toast.success('Color added successfully!');
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
    setColorName('');
    setColorHex('#3B82F6');
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

        <h2 className="text-2xl font-semibold mb-2">Add Color</h2>
        <p className="text-gray-600 mb-6">Add a new color to the palette</p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <Label htmlFor="colorName">Color Name *</Label>
            <Input
              id="colorName"
              value={colorName}
              onChange={(e) => setColorName(e.target.value)}
              placeholder="e.g., Primary, Secondary, Accent"
              required
              disabled={loading}
            />
          </div>

          <div>
            <Label htmlFor="colorHex">Color *</Label>
            <div className="flex gap-3 items-center">
              <Input
                id="colorHex"
                type="color"
                value={colorHex}
                onChange={(e) => setColorHex(e.target.value)}
                className="w-20 h-12 cursor-pointer"
                disabled={loading}
              />
              <Input
                value={colorHex}
                onChange={(e) => setColorHex(e.target.value)}
                placeholder="#000000"
                className="flex-1"
                disabled={loading}
              />
            </div>
            <div className="mt-2 p-3 rounded-lg border" style={{ backgroundColor: colorHex }}>
              <p className="text-sm font-medium" style={{ color: colorHex.toLowerCase() === '#ffffff' || parseInt(colorHex.slice(1), 16) > 0xffffff / 2 ? '#000' : '#fff' }}>
                Preview
              </p>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Adding...
                </>
              ) : (
                'Add Color'
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
