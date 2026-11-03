// Hash URLs (/#/admin) work on GitHub Pages, which cannot rewrite paths to index.html.
import { createHashRouter } from "react-router";
import { PublicPage } from './pages/PublicPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { AdminLogin } from './pages/AdminLogin';
import { AdminDashboard } from './pages/AdminDashboard';

export const router = createHashRouter([
  {
    path: "/",
    element: <PublicPage />,
  },
  {
    path: "/product/:id",
    element: <ProductDetailPage />,
  },
  {
    path: "/admin",
    element: <AdminLogin />,
  },
  {
    path: "/admin/dashboard",
    element: <AdminDashboard />,
  },
]);