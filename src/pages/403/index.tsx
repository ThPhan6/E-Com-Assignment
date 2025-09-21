import { useNavigate } from "react-router-dom";
import { PATH } from "../../lib/route";
import { resetAllStores } from "../../store/util";

export default function ForbiddenPage() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8 text-center">
        <div className="mb-6">
          <h1 className="text-6xl font-bold text-gray-900 mb-2">403</h1>
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">
            Access Forbidden
          </h2>
          <p className="text-gray-600 mb-8">
            You don't have permission to access this resource.
          </p>
        </div>

        <div className="space-y-4">
          <button
            onClick={() => {
              resetAllStores();
              navigate(PATH.LOGIN);
            }}
            className="block w-full bg-blue-400 py-3 px-4 rounded-lg hover:bg-blue-500 transition-colors duration-200 font-medium"
          >
            <span className="text-black">Back to Login</span>
          </button>
        </div>
      </div>
    </div>
  );
}
