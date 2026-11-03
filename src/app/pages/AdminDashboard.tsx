import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Sidebar } from '../components/Sidebar';
import { Header } from '../components/Header';
import { ProductGrid } from '../components/ProductGrid';
import { ProductDetail } from '../components/ProductDetail';
import { UploadView } from '../components/UploadView';
import { CreateProductModal } from '../components/CreateProductModal';
import { EditProductModal } from '../components/EditProductModal';
import { Settings } from '../components/Settings';
import { Product } from '../types';
import { Toaster } from '../components/ui/sonner';
import { toast } from 'sonner@2.0.3';
import { AppSettings, assetUrl, deleteProduct, loadAdminDb } from '../lib/api';
import { AdminSession, getSession, SessionExpiredError, signOut } from '../lib/auth';

export function AdminDashboard() {
  const navigate = useNavigate();
  const [currentView, setCurrentView] = useState<'dashboard' | 'products' | 'upload' | 'settings'>('dashboard');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<AppSettings>({
    organizationName: 'Brand Asset Manager',
    organizationLogo: '',
    adminEmail: '',
    accentColor: '#3B82F6',
  });
  
  const [session, setSession] = useState<AdminSession | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    const current = getSession();
    if (!current) {
      navigate('/admin');
      return;
    }
    setSession(current);
  }, []);

  useEffect(() => {
    if (session) loadData();
  }, [session]);

  const handleSessionExpired = () => {
    toast.error('Session expired. Please sign in again.');
    signOut();
    setSession(null);
    setTimeout(() => navigate('/admin'), 1500);
  };

  const handleError = (error: unknown, fallback: string) => {
    console.error(fallback, error);
    if (error instanceof SessionExpiredError) {
      handleSessionExpired();
      return;
    }
    toast.error(error instanceof Error ? error.message : fallback);
  };

  // Reads straight from GitHub so admins see changes before Pages redeploys.
  const loadData = async (): Promise<Product[]> => {
    try {
      const db = await loadAdminDb();
      setProducts(db.products);
      setSettings(db.settings);
      return db.products;
    } catch (error) {
      handleError(error, 'Failed to load products');
      return [];
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = () => {
    signOut();
    setSession(null);
    toast.success('Signed out successfully');
    navigate('/admin');
  };

  const handleUploadSuccess = (product: Product) => {
    setShowUploadModal(false);
    setProducts((current) => [...current, product]);
    setSelectedProduct(product);
  };

  const handleEditSuccess = (product: Product) => {
    setShowEditModal(false);
    setProducts((current) => current.map((p) => (p.id === product.id ? product : p)));
    setSelectedProduct(product);
  };

  const handleAssetChange = async () => {
    const latest = await loadData();
    if (selectedProduct) {
      const updated = latest.find((p) => p.id === selectedProduct.id);
      if (updated) setSelectedProduct(updated);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    try {
      await deleteProduct(productId);
      toast.success('Product deleted successfully');
      setSelectedProduct(null);
      setProducts((current) => current.filter((p) => p.id !== productId));
      setCurrentView('dashboard');
    } catch (error) {
      handleError(error, 'Failed to delete product');
    }
  };

  const handleNavigate = (view: 'dashboard' | 'products' | 'upload' | 'settings') => {
    setCurrentView(view);
    setSelectedProduct(null);
  };

  const filteredProducts = products.filter(
    (product) =>
      product && 
      product.name &&
      (product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (product.tagline || '').toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (!session) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50 flex-col md:flex-row">
      {/* Mobile header with menu toggle */}
      <div className="md:hidden bg-white border-b border-gray-200 p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {settings.organizationLogo ? (
            <div className="w-8 h-8 flex items-center justify-center">
              <img
                src={assetUrl(settings.organizationLogo)}
                alt={settings.organizationName}
                className="w-8 h-8 object-contain"
              />
            </div>
          ) : (
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg"></div>
          )}
          <span className="tracking-tight font-medium">{settings.organizationName}</span>
        </div>
        <button
          onClick={() => {
            const sidebar = document.getElementById('mobile-sidebar');
            if (sidebar) {
              sidebar.classList.toggle('hidden');
            }
          }}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      {/* Sidebar - hidden on mobile by default */}
      <div id="mobile-sidebar" className="hidden md:block md:relative absolute z-50 w-full md:w-auto">
        <Sidebar
          currentView={currentView}
          onNavigate={(view) => {
            handleNavigate(view);
            // Hide sidebar on mobile after navigation
            const sidebar = document.getElementById('mobile-sidebar');
            if (sidebar && window.innerWidth < 768) {
              sidebar.classList.add('hidden');
            }
          }}
          isAuthenticated={true}
          onAuthClick={() => {}}
          onSignOut={handleSignOut}
          userName={session.name}
          organizationName={settings.organizationName}
          organizationLogo={settings.organizationLogo}
        />
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header searchQuery={searchQuery} onSearchChange={setSearchQuery} />
        <main className="flex-1 overflow-y-auto">
          {selectedProduct ? (
            <ProductDetail
              product={selectedProduct}
              onBack={() => setSelectedProduct(null)}
              isAdmin={true}
              onEdit={() => setShowEditModal(true)}
              onDelete={() => handleDeleteProduct(selectedProduct.id)}
              onAssetChange={handleAssetChange}
              onSessionExpired={handleSessionExpired}
            />
          ) : currentView === 'upload' ? (
            <UploadView onUploadClick={() => setShowUploadModal(true)} />
          ) : currentView === 'settings' ? (
            <Settings
              session={session}
              onSettingsSaved={(saved) => setSettings(saved)}
              onSessionExpired={handleSessionExpired}
            />
          ) : loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600">Loading products...</p>
              </div>
            </div>
          ) : (
            <ProductGrid
              products={filteredProducts}
              onSelectProduct={setSelectedProduct}
              isAdmin={true}
              onAddProduct={() => setShowUploadModal(true)}
            />
          )}
        </main>
      </div>

      {session && (
        <CreateProductModal
          isOpen={showUploadModal}
          onClose={() => setShowUploadModal(false)}
          onSuccess={handleUploadSuccess}
          onSessionExpired={handleSessionExpired}
        />
      )}

      {session && selectedProduct && (
        <EditProductModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          onSuccess={handleEditSuccess}
          product={selectedProduct}
          onSessionExpired={handleSessionExpired}
        />
      )}

      <Toaster />
    </div>
  );
}