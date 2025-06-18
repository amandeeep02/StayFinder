import { Route, Routes } from "react-router-dom";
import { Landing } from "../pages/Landing";
import { Home } from "../pages/Home";
import { ListingDetails } from "../pages/ListingDetails";
import { Bookings } from "../pages/Bookings";
import { HostDashboard } from "../pages/HostDashboard";
import { PropertyFormPage } from "../pages/PropertyForm";
import { PrivateRoute } from "./PrivateRoute";
import { AuthProvider } from "../contexts/AuthContext";
import { UserDetails } from "../pages/auth/UserDetails";
import { Unauthorized } from "@/components/Unauthorized";

const AppRoutes = () => {
    return (
        <AuthProvider>
            <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/unauthorized" element={<Unauthorized />} />
                <Route
                    path="/home"
                    element={
                        <PrivateRoute>
                            <Home />
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/listings/:id"
                    element={
                        <PrivateRoute>
                            <ListingDetails />
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/bookings"
                    element={
                        <PrivateRoute>
                            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                                <Bookings />
                            </div>
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/host/dashboard"
                    element={
                        <PrivateRoute>
                            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                                <HostDashboard />
                            </div>
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/host/properties/new"
                    element={
                        <PrivateRoute>
                            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                                <PropertyFormPage />
                            </div>
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/host/properties/:id/edit"
                    element={
                        <PrivateRoute>
                            <PropertyFormPage />
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/user-details"
                    element={
                        <PrivateRoute>
                            <UserDetails />
                        </PrivateRoute>
                    }
                />
            </Routes>
        </AuthProvider>
    );
};

export default AppRoutes;
