import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export function Unauthorized() {
    const { authUser } = useAuth();

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6 text-center">
                <div className="mb-4">
                    <svg
                        className="mx-auto h-12 w-12 text-red-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                        />
                    </svg>
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    Access Denied
                </h1>
                <p className="text-gray-600 mb-6">
                    You don't have permission to access this page.
                    {authUser && (
                        <span className="block mt-2 text-sm">
                            Current role:{" "}
                            <span className="font-semibold">
                                {authUser.role}
                            </span>
                        </span>
                    )}
                </p>
                <div className="space-y-3">
                    <Link
                        to="/home"
                        className="block w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
                    >
                        Go to Home
                    </Link>
                    <Link
                        to="/profile"
                        className="block w-full bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300 transition-colors"
                    >
                        View Profile
                    </Link>
                </div>
            </div>
        </div>
    );
}
