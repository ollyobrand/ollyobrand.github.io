import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import svgPaths from '../imports/OllyoBam/svg-4u1nkb66rw';
import imgLogo from 'figma:asset/7efdf963b465ea840cf15b3e1ac80db6d73ce1bb.png';
import { assetUrl, loadPublicDb } from '../lib/api';
import { Product } from '../types';

export function PublicPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState({
    organizationName: 'Ollyo Brand Assets',
    organizationLogo: '',
  });
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const db = await loadPublicDb();
      setProducts(db.products);
      setSettings({
        organizationName: db.settings.organizationName || 'Ollyo Brand Assets',
        organizationLogo: db.settings.organizationLogo || '',
      });
    } catch (error) {
      console.error('Load products error:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(
    (product) =>
      product &&
      product.name &&
      (product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (product.tagline || '').toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleProductClick = (productId: string) => {
    navigate(`/product/${productId}`);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-white h-[81px] rounded-[99px] mx-4 my-4">
        <div className="border-b border-[#e5e7eb] rounded-[99px] h-full flex gap-12 items-center px-6 mx-[494px] my-[0px]">
          {/* Logo */}
          <div className="flex gap-2 items-center shrink-0">
            <div className="relative rounded-full shrink-0 size-8">
              {settings.organizationLogo ? (
                <img
                  src={assetUrl(settings.organizationLogo)}
                  alt={settings.organizationName}
                  className="absolute inset-0 max-w-none object-contain size-full rounded-full"
                />
              ) : (
                <img
                  src={imgLogo}
                  alt={settings.organizationName}
                  className="absolute inset-0 max-w-none object-contain size-full"
                />
              )}
            </div>
            <p className="font-['Inter'] font-normal leading-6 text-[#0a0a0a] text-base tracking-[-0.7125px] whitespace-nowrap">
              {settings.organizationName}
            </p>
          </div>

          {/* Search Bar */}
          <div className="h-9 relative shrink-0 w-full max-w-[448px]">
            <div className="absolute bg-[#f3f3f5] h-9 left-0 rounded-[99px] top-0 w-full">
              <div className="flex items-center overflow-hidden pl-10 pr-3 py-1 relative rounded-[inherit] size-full">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search product or asset..."
                  className="font-['Inter'] font-normal leading-normal text-[#717182] text-sm tracking-[-0.1504px] whitespace-nowrap bg-transparent border-none outline-none w-full"
                />
              </div>
            </div>
            <div className="absolute left-3 size-4 top-[10px]">
              <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
                <g>
                  <path d={svgPaths.p107a080} stroke="#99A1AF" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
                  <path d="M14 14L11.1333 11.1333" stroke="#99A1AF" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
                </g>
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Product Grid */}
      <div className="px-8 py-6 mx-[120px] my-[0px]">
        {loading ? (
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-[#0049F8] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-[#6a7282]">Loading products...</p>
            </div>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="flex items-center justify-center h-96">
            <p className="text-[#6a7282] text-lg">No products found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="bg-white flex flex-col items-start p-px rounded-[14px] border border-[rgba(0,0,0,0.1)] cursor-pointer hover:shadow-lg transition-shadow h-[468px]"
                onClick={() => handleProductClick(product.id)}
              >
                {/* Card Content */}
                <div className="flex-1 min-h-px min-w-px relative w-full pt-6">
                  <div className="relative h-full">
                    {/* Product Image */}
                    <div className="bg-[#f9fafb] flex items-center justify-center mx-6 overflow-hidden rounded-[10px] h-[287px]">
                      {product.logoUrl ? (
                        <img
                          src={assetUrl(product.logoUrl)}
                          alt={product.name}
                          className="w-20 h-20 object-contain"
                        />
                      ) : (
                        <svg className="w-16 h-16" fill="none" preserveAspectRatio="none" viewBox="0 0 64 64">
                          <g>
                            <path d={svgPaths.p1890d180} stroke="#D1D5DC" strokeLinecap="round" strokeLinejoin="round" strokeWidth="5.33333" />
                            <path d="M32 58.6667V32" stroke="#D1D5DC" strokeLinecap="round" strokeLinejoin="round" strokeWidth="5.33333" />
                            <path d={svgPaths.p34d6e900} stroke="#D1D5DC" strokeLinecap="round" strokeLinejoin="round" strokeWidth="5.33333" />
                            <path d="M20 11.3867L44 25.12" stroke="#D1D5DC" strokeLinecap="round" strokeLinejoin="round" strokeWidth="5.33333" />
                          </g>
                        </svg>
                      )}
                    </div>

                    {/* Product Name */}
                    <div className="px-6 mt-4">
                      <p className="font-['Inter'] font-medium leading-[27px] text-[#101828] text-lg tracking-[-0.4395px] truncate">
                        {product.name}
                      </p>
                    </div>

                    {/* Product Tagline */}
                    <div className="px-6 mt-1">
                      <p className="font-['Inter'] font-normal leading-6 text-[#6a7282] text-base tracking-[-0.3125px] truncate">
                        {product.tagline || 'No tagline yet'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Card Footer */}
                <div className="h-[60px] shrink-0 w-full">
                  <div className="flex items-center px-6 size-full">
                    <button className="bg-white flex-1 h-9 rounded-lg border border-[rgba(0,0,0,0.1)] hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-center px-[17px] py-[9px] size-full">
                        <p className="font-['Inter'] font-medium leading-5 text-[#0a0a0a] text-sm text-center tracking-[-0.1504px] whitespace-nowrap">
                          View Assets
                        </p>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}