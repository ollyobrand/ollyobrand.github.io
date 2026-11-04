// Hash URLs (/#/admin) work on GitHub Pages, which cannot rewrite paths to index.html.
import { createHashRouter } from "react-router";
import { Browse } from './pages/Browse';
import { AdminLogin } from './pages/AdminLogin';

// Built on demand so it reads the address after a GitHub sign-in has rewritten it.
export const makeRouter = () => createHashRouter([
  {
    path: "/admin",
    element: <AdminLogin />,
  },
  {
    // Admin: the same shell in edit mode. /admin/dashboard, /:product, /:product/:tab, /settings
    path: "/admin/dashboard/*",
    element: <Browse admin />,
  },
  {
    // Public site: /, /:product, /:product/:tab, and the old /product/:id links.
    path: "/*",
    element: <Browse />,
  },
]);
