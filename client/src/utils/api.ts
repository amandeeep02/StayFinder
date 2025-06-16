import axios from "axios";

const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

export const api = axios.create({
    baseURL: API_BASE_URL,
});

// Add auth token to requests
api.interceptors.request.use((config) => {
    const token = localStorage.getItem("authToken");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Handle token expiry
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem("authToken");
            localStorage.removeItem("firebaseToken");
            window.location.href = "/";
        }
        return Promise.reject(error);
    }
);

// Auth API functions (matches auth.routes.ts)
export const authAPI = {
    firebaseLogin: (data: any) => api.post("/auth/firebase-login", data),
    getCurrentUser: () => api.get("/auth/current-user"),
};

// Users API functions (matches user.routes.ts)
export const usersAPI = {
    createOrUpdate: (data: any) => api.post("/users/user", data),
    getAll: () => api.get("/users/users"),
    getById: (id: string) => api.get(`/users/user/${id}`),
    update: (id: string, data: any) => api.put(`/users/user/${id}`, data),
    delete: (id: string) => api.delete(`/users/user/${id}`),
};

// Host API functions (matches host.routes.ts)
export const hostAPI = {
    // Public routes
    getById: (id: string) => api.get(`/host/${id}`),
    
    // Protected routes
    createProfile: (data: any) => api.post("/host/profile", data),
    getProfile: () => api.get("/host/profile/me"),
    updateProfile: (data: any) => api.put("/host/profile", data),
    getDashboard: () => api.get("/host/dashboard/stats"),
    submitVerification: (data: any) => api.post("/host/verification", data),
    deleteProfile: () => api.delete("/host/profile"),
    
    // Admin routes
    getAll: () => api.get("/host/all"),
    verify: (id: string) => api.patch(`/host/${id}/verify`),
    updateSuperhostStatus: (id: string, data: any) => api.patch(`/host/${id}/superhost`, data),
};

// Properties API functions (matches property.routes.ts)
export const propertiesAPI = {
    // Public routes
    getAll: (filters?: any) => api.get("/properties", { params: filters }),
    search: (params?: any) => api.get("/properties/search", { params }),
    getById: (id: string) => api.get(`/properties/${id}`),
    
    // Protected routes (hosts and admins)
    create: (data: any) => api.post("/properties/create", data),
    getByHost: () => api.get("/properties/host/my-properties"),
    update: (id: string, data: any) => api.put(`/properties/${id}`, data),
    delete: (id: string) => api.delete(`/properties/${id}`),
    toggleStatus: (id: string) => api.patch(`/properties/${id}/toggle-status`),
    
    // Admin routes
    verify: (id: string) => api.patch(`/properties/${id}/verify`),
};

// Bookings API functions (matches booking.routes.ts)
export const bookingsAPI = {
    // Public routes
    checkAvailability: (params: any) => api.get("/bookings/availability", { params }),
    calculatePrice: (params: any) => api.get("/bookings/calculate-price", { params }),
    
    // Protected routes (authenticated users)
    create: (data: any) => api.post("/bookings/create", data),
    getUserBookings: () => api.get("/bookings/my-bookings"),
    getStats: () => api.get("/bookings/stats"),
    getById: (id: string) => api.get(`/bookings/${id}`),
    updateStatus: (id: string, data: any) => api.patch(`/bookings/${id}`, data),
    
    // Host routes
    getHostBookings: () => api.get("/bookings/host/bookings"),
    
    // Admin routes
    getAllBookings: (params?: any) => api.get("/bookings/admin/all", { params }),
};

// Upload API functions (matches upload.routes.ts)
export const uploadAPI = {
    // Protected routes
    uploadImage: (formData: FormData) =>
        api.post("/upload/image", formData, {
            headers: { "Content-Type": "multipart/form-data" },
        }),
    uploadMultiple: (formData: FormData) =>
        api.post("/upload/multiple", formData, {
            headers: { "Content-Type": "multipart/form-data" },
        }),
    deleteImage: (filename: string) => api.delete(`/upload/image/${filename}`),
    
    // Public routes
    getImageUrl: (filename: string) => api.get(`/upload/image/${filename}`),
};

// Legacy API object for backward compatibility
export { api as default };
