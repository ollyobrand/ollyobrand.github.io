import { Product } from '../types';
import { ProductCard } from './ProductCard';
import { Package, Plus } from 'lucide-react';
import { Button } from './ui/button';

interface ProductGridProps {
  products: Product[];
  onSelectProduct: (product: Product) => void;
  isAdmin?: boolean;
  onAddProduct?: () => void;
}

export function ProductGrid({ products, onSelectProduct, isAdmin, onAddProduct }: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="p-4 md:p-8">
        <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-gray-900 mb-1">All Products</h1>
            <p className="text-gray-500 text-sm md:text-base">Access and download brand assets for each product</p>
          </div>
          {isAdmin && onAddProduct && (
            <Button onClick={onAddProduct} className="w-full sm:w-auto">
              <Plus className="w-4 h-4 mr-2" />
              Add Product
            </Button>
          )}
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 md:p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Package className="w-8 h-8 text-gray-400" />
          </div>
          <h2 className="text-xl font-semibold mb-2">No Products Yet</h2>
          <p className="text-gray-600 mb-4 text-sm md:text-base">
            {isAdmin ? 'Click "Add Product" to create your first product' : 'Sign in as admin to upload your first product'}
          </p>
          {isAdmin && onAddProduct && (
            <Button onClick={onAddProduct} size="lg" className="w-full sm:w-auto">
              <Plus className="w-4 h-4 mr-2" />
              Add Product
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8">
      <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-gray-900 mb-1">All Products</h1>
          <p className="text-gray-500 text-sm md:text-base">Access and download brand assets for each product</p>
        </div>
        {isAdmin && onAddProduct && (
          <Button onClick={onAddProduct} className="w-full sm:w-auto">
            <Plus className="w-4 h-4 mr-2" />
            Add Product
          </Button>
        )}
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onClick={() => onSelectProduct(product)}
          />
        ))}
      </div>
    </div>
  );
}