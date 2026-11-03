import { Download, Upload, Trash2, Plus } from 'lucide-react';
import { Guidelines } from '../types';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { assetUrl, downloadFile, fileExt } from '../lib/api';

interface GuidelinesSectionProps {
  guidelines: Guidelines;
  productName: string;
  isAdmin?: boolean;
  onAddGuidelines?: () => void;
  onDeleteGuidelines?: () => void;
}

export function GuidelinesSection({ guidelines, productName, isAdmin, onAddGuidelines, onDeleteGuidelines }: GuidelinesSectionProps) {
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
          <CardTitle>Brand Guidelines</CardTitle>
          {isAdmin && (
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                className="w-full gap-2"
                onClick={onAddGuidelines}
              >
                <Plus className="w-4 h-4" />
                Add Guidelines
              </Button>
              <Button 
                variant="outline" 
                className="w-full gap-2"
                onClick={onDeleteGuidelines}
              >
                <Trash2 className="w-4 h-4" />
                Delete Guidelines
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="border border-gray-200 rounded-lg p-4 inline-block">
          <div className="w-48 h-64 bg-gray-50 rounded-lg mb-3 overflow-hidden">
            <ImageWithFallback
              src={assetUrl(guidelines.preview)}
              alt="Brand Guidelines"
              className="w-full h-full object-cover"
            />
          </div>
          <p className="text-gray-700 mb-3">Brand Guidelines Document</p>
          {guidelines.pdf && (
            <Button 
              variant="outline" 
              className="w-full gap-2"
              onClick={() => handleDownload(guidelines.pdf!, `${productName}-brand-guidelines.${fileExt(guidelines.pdf!, 'pdf')}`)}
            >
              <Download className="w-4 h-4" />
              Download PDF
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}