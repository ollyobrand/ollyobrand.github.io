import { Plus } from 'lucide-react';
import { Button } from './ui/button';

interface UploadViewProps {
  onUploadClick: () => void;
}

export function UploadView({ onUploadClick }: UploadViewProps) {
  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-semibold mb-2">Upload Assets</h1>
        <p className="text-gray-600 mb-8">
          Add new products and their brand assets to your dashboard
        </p>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <div className="max-w-md mx-auto">
            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus className="w-8 h-8 text-blue-600" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Add New Product</h2>
            <p className="text-gray-600 mb-6">
              Upload product logos, favicons, color palettes, and brand guidelines
            </p>
            <Button onClick={onUploadClick} size="lg">
              <Plus className="w-5 h-5 mr-2" />
              Create New Product
            </Button>
          </div>
        </div>

        <div className="mt-8 bg-blue-50 rounded-lg p-6">
          <h3 className="font-semibold mb-3">What you can upload:</h3>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-0.5">•</span>
              <span><strong>Product Logo:</strong> Main logo displayed on the product card</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-0.5">•</span>
              <span><strong>Logo Variants:</strong> Multiple logo versions (horizontal, icon, dark, light) in SVG/PNG</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-0.5">•</span>
              <span><strong>Favicon:</strong> Icon files in SVG, PNG, or ICO format</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-0.5">•</span>
              <span><strong>Color Palette:</strong> Brand colors with names and hex values</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-0.5">•</span>
              <span><strong>Brand Guidelines:</strong> PDF document with brand usage guidelines</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
