import { Download, Upload, Trash2, Plus } from 'lucide-react';
import { Logo } from '../types';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { assetUrl, downloadFile, fileExt } from '../lib/api';

interface LogosSectionProps {
  logos: Logo[];
  productName: string;
  isAdmin?: boolean;
  onAddLogo?: () => void;
  onDeleteLogo?: (logoId: string) => void;
}

export function LogosSection({ logos, productName, isAdmin, onAddLogo, onDeleteLogo }: LogosSectionProps) {
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
          <CardTitle>Logos</CardTitle>
          {isAdmin && onAddLogo && (
            <Button
              variant="outline"
              size="sm"
              className="gap-1"
              onClick={onAddLogo}
            >
              <Plus className="w-3 h-3" />
              Add Logo
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {logos.map((logo) => (
            <div key={logo.id} className="border border-gray-200 rounded-lg p-4">
              <div className="aspect-video bg-gray-50 rounded-lg mb-3 flex items-center justify-center overflow-hidden">
                <ImageWithFallback
                  src={assetUrl(logo.preview)}
                  alt={logo.name}
                  className="w-full h-full object-contain p-4"
                />
              </div>
              <p className="text-gray-700 mb-3">{logo.name}</p>
              <div className="flex gap-2">
                {logo.svg && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1 gap-1"
                    onClick={() => handleDownload(logo.svg!, `${productName}-${logo.variant}-logo.${fileExt(logo.svg!, 'svg')}`)}
                  >
                    <Download className="w-3 h-3" />
                    SVG
                  </Button>
                )}
                {logo.png && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1 gap-1"
                    onClick={() => handleDownload(logo.png!, `${productName}-${logo.variant}-logo.${fileExt(logo.png!, 'png')}`)}
                  >
                    <Download className="w-3 h-3" />
                    PNG
                  </Button>
                )}
                {isAdmin && onDeleteLogo && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 gap-1"
                    onClick={() => onDeleteLogo(logo.id)}
                  >
                    <Trash2 className="w-3 h-3" />
                    Delete
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}