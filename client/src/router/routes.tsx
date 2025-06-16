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
                            <Bookings />
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/host/dashboard"
                    element={
                        <PrivateRoute>
                            <HostDashboard />
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/host/properties/new"
                    element={
                        <PrivateRoute>
                            <PropertyFormPage />
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
