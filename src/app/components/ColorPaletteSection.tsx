import { Copy, Download, Trash2, Plus } from 'lucide-react';
import { Color } from '../types';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { toast } from 'sonner';

interface ColorPaletteSectionProps {
  colors: Color[];
  isAdmin?: boolean;
  onAddColor?: () => void;
  onDeleteColor?: (colorIndex: number) => void;
}

export function ColorPaletteSection({ colors, isAdmin, onAddColor, onDeleteColor }: ColorPaletteSectionProps) {
  const copyToClipboard = async (text: string, label: string) => {
    try {
      // Try modern clipboard API first
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
        toast.success(`${label} copied to clipboard`);
      } else {
        // Fallback method for restricted environments
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        try {
          document.execCommand('copy');
          toast.success(`${label} copied to clipboard`);
        } catch (err) {
          toast.error('Failed to copy to clipboard');
        }
        textArea.remove();
      }
    } catch (err) {
      toast.error('Failed to copy to clipboard');
    }
  };

  const copyAllHex = async () => {
    const allHex = colors.map((c) => c.hex).join('\n');
    try {
      // Try modern clipboard API first
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(allHex);
        toast.success('All HEX values copied to clipboard');
      } else {
        // Fallback method for restricted environments
        const textArea = document.createElement('textarea');
        textArea.value = allHex;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        try {
          document.execCommand('copy');
          toast.success('All HEX values copied to clipboard');
        } catch (err) {
          toast.error('Failed to copy to clipboard');
        }
        textArea.remove();
      }
    } catch (err) {
      toast.error('Failed to copy to clipboard');
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Color Palette</CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="gap-2" onClick={copyAllHex}>
              <Copy className="w-4 h-4" />
              Copy All HEX
            </Button>
            <Button variant="outline" size="sm" className="gap-2">
              <Download className="w-4 h-4" />
              Download ASE
            </Button>
            {isAdmin && (
              <Button variant="outline" size="sm" className="gap-2" onClick={onAddColor}>
                <Plus className="w-4 h-4" />
                Add Color
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {colors.map((color, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4">
              <div
                className="w-full h-24 rounded-lg mb-3"
                style={{ backgroundColor: color.hex }}
              ></div>
              <p className="text-gray-700 mb-2">{color.name}</p>
              <div className="space-y-2">
                <button
                  onClick={() => copyToClipboard(color.hex, color.hex)}
                  className="w-full flex items-center justify-between px-2 py-1.5 bg-gray-50 hover:bg-gray-100 rounded text-gray-600 transition-colors"
                >
                  <span className="text-xs">{color.hex}</span>
                  <Copy className="w-3 h-3" />
                </button>
                <button
                  onClick={() => copyToClipboard(color.rgb, color.rgb)}
                  className="w-full flex items-center justify-between px-2 py-1.5 bg-gray-50 hover:bg-gray-100 rounded text-gray-600 transition-colors"
                >
                  <span className="text-xs">{color.rgb}</span>
                  <Copy className="w-3 h-3" />
                </button>
                {isAdmin && (
                  <button
                    onClick={() => onDeleteColor?.(index)}
                    className="w-full flex items-center justify-between px-2 py-1.5 bg-gray-50 hover:bg-gray-100 rounded text-gray-600 transition-colors"
                  >
                    <span className="text-xs">Delete</span>
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}