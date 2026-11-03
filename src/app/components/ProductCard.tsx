import { Product } from '../types';
import { Button } from './ui/button';
import { Card, CardContent, CardFooter } from './ui/card';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Package } from 'lucide-react';
import { assetUrl } from '../lib/api';

interface ProductCardProps {
  product: Product;
  onClick: () => void;
}

export function ProductCard({ product, onClick }: ProductCardProps) {
  return (
    <Card className="hover:shadow-lg transition-shadow cursor-pointer group" onClick={onClick}>
      <CardContent className="pt-6">
        <div className="aspect-square bg-gray-50 rounded-lg mb-4 overflow-hidden flex items-center justify-center">
          {product.logoUrl ? (
            <ImageWithFallback
              src={assetUrl(product.logoUrl)}
              alt={product.name}
              className="w-20 h-20 object-contain"
            />
          ) : (
            <Package className="w-16 h-16 text-gray-300" />
          )}
        </div>
        <h3 className="text-gray-900 mb-1">{product.name}</h3>
        <p className="text-gray-500">{product.tagline || 'No tagline yet'}</p>
      </CardContent>
      <CardFooter>
        <Button className="w-full" variant="outline">
          View Assets
        </Button>
      </CardFooter>
    </Card>
  );
}