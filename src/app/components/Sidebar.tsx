import { LayoutDashboard, Package, Upload, Settings, LogOut, LogIn } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { assetUrl } from '../lib/api';

interface SidebarProps {
  currentView: 'dashboard' | 'products' | 'upload' | 'settings';
  onNavigate: (view: 'dashboard' | 'products' | 'upload' | 'settings') => void;
  isAuthenticated: boolean;
  onAuthClick: () => void;
  onSignOut: () => void;
  userName?: string;
  organizationName?: string;
  organizationLogo?: string;
}

export function Sidebar({ 
  currentView, 
  onNavigate, 
  isAuthenticated, 
  onAuthClick, 
  onSignOut, 
  userName,
  organizationName = 'Brand Asset Manager',
  organizationLogo
}: SidebarProps) {
  const navItems = [
    { id: 'dashboard' as const, icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'products' as const, icon: Package, label: 'All Products' },
    ...(isAuthenticated ? [{ id: 'upload' as const, icon: Upload, label: 'Upload Assets' }] : []),
    { id: 'settings' as const, icon: Settings, label: 'Settings' },
  ];

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-2">
          {organizationLogo ? (
            <div className="w-8 h-8 flex items-center justify-center">
              <ImageWithFallback
                src={assetUrl(organizationLogo)}
                alt={organizationName}
                className="w-8 h-8 object-contain"
              />
            </div>
          ) : (
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg"></div>
          )}
          <span className="tracking-tight">{organizationName}</span>
        </div>
      </div>
      
      <nav className="flex-1 p-4">
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => onNavigate(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                  currentView === item.id
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>

      <div className="p-4 border-t border-gray-200">
        {isAuthenticated ? (
          <div className="space-y-2">
            <div className="text-sm text-gray-600 px-3">
              <div className="font-medium text-gray-900">{userName || 'Admin'}</div>
              <div className="text-xs">Logged in</div>
            </div>
            <button
              onClick={onSignOut}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span>Sign Out</span>
            </button>
          </div>
        ) : (
          <button
            onClick={onAuthClick}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
          >
            <LogIn className="w-5 h-5" />
            <span>Admin Sign In</span>
          </button>
        )}
      </div>
    </aside>
  );
}