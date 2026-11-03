import { useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { toast } from 'sonner@2.0.3';
import { updateProduct, uploadFile } from '../lib/api';
import { SessionExpiredError } from '../lib/auth';

interface AddGuidelinesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  productId: string;
  onSessionExpired?: () => void;
}

export function AddGuidelinesModal({ isOpen, onClose, onSuccess, productId, onSessionExpired }: AddGuidelinesModalProps) {
  const [loading, setLoading] = useState(false);
  const [guidelinesFile, setGuidelinesFile] = useState<File | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!guidelinesFile) {
      toast.error('Please select a PDF file');
      return;
    }

    setLoading(true);

    try {
      const path = await uploadFile(guidelinesFile, `guidelines/${productId}`);
      const newGuidelines = { preview: path, pdf: path };
      await updateProduct(productId, (product) => ({
        ...product,
        assets: { ...product.assets, guidelines: newGuidelines },
      }), 'Update brand guidelines');

      toast.success('Guidelines added successfully!');
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
    setGuidelinesFile(null);
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

        <h2 className="text-2xl font-semibold mb-2">Add Brand Guidelines</h2>
        <p className="text-gray-600 mb-6">Upload brand guidelines PDF (replaces existing if any)</p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <Label htmlFor="guidelinesFile">PDF File *</Label>
            <Input
              id="guidelinesFile"
              type="file"
              accept=".pdf"
              onChange={(e) => setGuidelinesFile(e.target.files?.[0] || null)}
              required
              disabled={loading}
            />
            {guidelinesFile && (
              <p className="text-sm text-gray-600 mt-2">📎 {guidelinesFile.name}</p>
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
                'Add Guidelines'
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
