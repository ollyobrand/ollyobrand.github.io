// Hash URLs (/#/admin) work on GitHub Pages, which cannot rewrite paths to index.html.
import { createHashRouter } from "react-router";
import { Browse } from './pages/Browse';
import { AdminLogin } from './pages/AdminLogin';
import { AdminDashboard } from './pages/AdminDashboard';

export const router = createHashRouter([
  {
    path: "/admin",
    element: <AdminLogin />,
  },
  {
    path: "/admin/dashboard",
    element: <AdminDashboard />,
  },
  {
    // Public site: /, /:product, /:product/:tab, and the old /product/:id links.
    path: "/*",
    element: <Browse />,
  },
]);
