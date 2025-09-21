import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import ProtectedRoute from "./guard/ProtectedRoute";
import ProductListPage from "./pages/product";
import LoginPage from "./pages/login";
import CheckoutPage from "./pages/checkout";
import OrderConfirmationPage from "./pages/order-confirmation";
import { PATH } from "./lib/route";
import Layout from "./components/Layout";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path={PATH.LOGIN} element={<LoginPage />} />

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
        </Route>

        {/* Unprotected routes */}
        <Route
          path={PATH.ORDER_CONFIRMATION}
          element={<OrderConfirmationPage />}
        />

        {/* Default redirect */}
        <Route path="*" element={<Navigate to={PATH.LOGIN} />} />
      </Routes>
    </Router>
  );
}
