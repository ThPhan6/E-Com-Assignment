import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import ProtectedRoute from "./features/ProtectedRoute";
import ProductListPage from "./pages/product";
import LoginPage from "./pages/login";
import CheckoutPage from "./pages/checkout";
import OrderConfirmationPage from "./pages/order-confirmation";
import { PATH } from "./lib/route";
import Layout from "./features/Layout";
import ForbiddenPage from "./pages/403";
import NotFoundPage from "./pages/404";

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Public / unprotected routes */}
        <Route path={PATH.LOGIN} element={<LoginPage />} />
        <Route path={PATH.ERROR_403} element={<ForbiddenPage />} />
        <Route path={PATH.ERROR_404} element={<NotFoundPage />} />

        {/* Authenticated routes */}
        <Route
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route path={PATH.PRODUCTS} element={<ProductListPage />} />
          <Route path={PATH.CHECKOUT} element={<CheckoutPage />} />
          <Route
            path={PATH.ORDER_CONFIRMATION}
            element={<OrderConfirmationPage />}
          />

          {/* Catch-all inside authenticated routes */}
          <Route path="*" element={<NotFoundPage />} />
        </Route>

        {/* Catch-all for unauthenticated users */}
        <Route path="*" element={<Navigate to={PATH.LOGIN} />} />
      </Routes>
    </Router>
  );
}
