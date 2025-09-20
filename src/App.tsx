import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import ProtectedRoute from "./guard/ProtectedRoute";
import ProductListPage from "./pages/product";
import LoginPage from "./pages/login";
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
      </Route>

        {/* Default redirect */}
        <Route path="*" element={<Navigate to={PATH.LOGIN} />} />
      </Routes>
    </Router>
  );
}
