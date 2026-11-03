import { Download, Upload, Trash2, Plus } from 'lucide-react';
import { Favicon } from '../types';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { assetUrl, downloadFile, fileExt } from '../lib/api';

interface FaviconSectionProps {
  favicon: Favicon;
  productName: string;
  isAdmin?: boolean;
  onAddFavicon?: () => void;
  onDeleteFavicon?: () => void;
}

export function FaviconSection({ favicon, productName, isAdmin, onAddFavicon, onDeleteFavicon }: FaviconSectionProps) {
  const handleDownload = async (path: string, filename: string) => {
    try {
      await downloadFile(path, filename);
    } catch (error) {
      console.error('Download error:', error);
      window.open(assetUrl(path), '_blank');
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Favicon</CardTitle>
          {isAdmin && (
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="gap-1"
                onClick={onAddFavicon}
              >
                <Plus className="w-3 h-3" />
                Add
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="gap-1"
                onClick={onDeleteFavicon}
              >
                <Trash2 className="w-3 h-3" />
                Delete
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="border border-gray-200 rounded-lg p-4 inline-block">
          <div className="w-24 h-24 bg-gray-50 rounded-lg mb-3 flex items-center justify-center overflow-hidden">
            <ImageWithFallback
              src={assetUrl(favicon.preview)}
              alt="Favicon"
              className="w-16 h-16 object-contain"
            />
          </div>
          <p className="text-gray-700 mb-3">Favicon</p>
          <div className="flex gap-2">
            {favicon.svg && (
              <Button 
                variant="outline" 
                size="sm" 
                className="gap-1"
                onClick={() => handleDownload(favicon.svg!, `${productName}-favicon.${fileExt(favicon.svg!, 'svg')}`)}
              >
                <Download className="w-3 h-3" />
                SVG
              </Button>
            )}
            {favicon.png && (
              <Button 
                variant="outline" 
                size="sm" 
                className="gap-1"
                onClick={() => handleDownload(favicon.png!, `${productName}-favicon.${fileExt(favicon.png!, 'png')}`)}
              >
                <Download className="w-3 h-3" />
                PNG
              </Button>
            )}
            {favicon.ico && (
              <Button 
                variant="outline" 
                size="sm" 
                className="gap-1"
                onClick={() => handleDownload(favicon.ico!, `${productName}-favicon.${fileExt(favicon.ico!, 'ico')}`)}
              >
                <Download className="w-3 h-3" />
                ICO
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}