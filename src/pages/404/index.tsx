import { Link } from "react-router-dom";
import { PATH } from "../../lib/route";

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8 text-center">
        <div className="mb-6">
          <h1 className="text-6xl font-bold text-gray-900 mb-2">404</h1>
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">
            Page Not Found
          </h2>
          <p className="text-gray-600 mb-8">
            Sorry, the page you are looking for does not exist.
          </p>
        </div>

        <div className="space-y-4">
          <Link
            to={PATH.PRODUCTS}
            className="block w-full bg-blue-400 py-3 px-4 rounded-lg hover:bg-blue-500 transition-colors duration-200 font-medium"
          >
            <span className="text-white">Go Back</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
