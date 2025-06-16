import { useState, useEffect, useCallback } from "react";
import type {
    Property,
    PropertyFilters,
    PropertyFormData,
} from "@/types/Property";
import { propertiesAPI } from "@/utils/api";

export const useProperties = (initialFilters?: PropertyFilters) => {
    const [properties, setProperties] = useState<Property[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filters, setFilters] = useState<PropertyFilters | undefined>(
        initialFilters
    );
    const [searchQuery, setSearchQuery] = useState<string>("");

    const fetchProperties = useCallback(
        async (currentFilters?: PropertyFilters, query?: string) => {
            try {
                setLoading(true);
                setError(null);

                let response;
                if (query && query.trim()) {
                    // Use search endpoint if there's a search query
                    response = await propertiesAPI.search(
                        query,
                        currentFilters
                    );
                } else {
                    // Use regular getAll endpoint
                    response = await propertiesAPI.getAll(currentFilters);
                }

                const propertiesData =
                    response.data.properties || response.data || [];
                setProperties(propertiesData);
            } catch (err: any) {
                console.error("Error fetching properties:", err);
                setError(
                    err.response?.data?.error || "Failed to fetch properties"
                );
                setProperties([]); // Reset on error
            } finally {
                setLoading(false);
            }
        },
        []
    );

    // Initial fetch
    useEffect(() => {
        fetchProperties(filters, searchQuery);
    }, [fetchProperties, filters, searchQuery]);

    const createProperty = async (data: PropertyFormData) => {
        try {
            const response = await propertiesAPI.create(data);
            const newProperty = response.data.property || response.data;

            setProperties((prev) => [...prev, newProperty]);
            setError(null);
            return newProperty;
        } catch (err: any) {
            console.error("Error creating property:", err);
            const errorMsg =
                err.response?.data?.error || "Failed to create property";
            setError(errorMsg);
            throw new Error(errorMsg);
        }
    };

    const updateProperty = async (
        id: string,
        data: Partial<PropertyFormData>
    ) => {
        try {
            const response = await propertiesAPI.update(id, data);
            const updatedProperty = response.data.property || response.data;

            setProperties((prev) =>
                prev.map((property) =>
                    property._id === id
                        ? { ...property, ...updatedProperty }
                        : property
                )
            );

            setError(null);
            return updatedProperty;
        } catch (err: any) {
            console.error("Error updating property:", err);
            const errorMsg =
                err.response?.data?.error || "Failed to update property";
            setError(errorMsg);
            throw new Error(errorMsg);
        }
    };

    const deleteProperty = async (id: string) => {
        try {
            await propertiesAPI.delete(id);
            setProperties((prev) =>
                prev.filter((property) => property._id !== id)
            );
            setError(null);
        } catch (err: any) {
            console.error("Error deleting property:", err);
            const errorMsg =
                err.response?.data?.error || "Failed to delete property";
            setError(errorMsg);
            throw new Error(errorMsg);
        }
    };

    const togglePropertyStatus = async (id: string) => {
        try {
            const response = await propertiesAPI.toggleStatus(id);
            const updatedProperty = response.data.property || response.data;

            setProperties((prev) =>
                prev.map((property) =>
                    property._id === id
                        ? { ...property, ...updatedProperty }
                        : property
                )
            );

            setError(null);
            return updatedProperty;
        } catch (err: any) {
            console.error("Error toggling property status:", err);
            const errorMsg =
                err.response?.data?.error || "Failed to toggle property status";
            setError(errorMsg);
            throw new Error(errorMsg);
        }
    };

    const verifyProperty = async (id: string) => {
        try {
            const response = await propertiesAPI.verify(id);
            const updatedProperty = response.data.property || response.data;

            setProperties((prev) =>
                prev.map((property) =>
                    property._id === id
                        ? { ...property, ...updatedProperty }
                        : property
                )
            );

            setError(null);
            return updatedProperty;
        } catch (err: any) {
            console.error("Error verifying property:", err);
            const errorMsg =
                err.response?.data?.error || "Failed to verify property";
            setError(errorMsg);
            throw new Error(errorMsg);
        }
    };

    const searchProperties = async (
        query: string,
        searchFilters?: PropertyFilters
    ) => {
        setSearchQuery(query);
        setFilters(searchFilters);
        await fetchProperties(searchFilters, query);
    };

    const applyFilters = async (newFilters: PropertyFilters) => {
        setFilters(newFilters);
        await fetchProperties(newFilters, searchQuery);
    };

    const clearFilters = async () => {
        setFilters(undefined);
        setSearchQuery("");
        await fetchProperties();
    };

    const refreshProperties = async () => {
        await fetchProperties(filters, searchQuery);
    };

    return {
        properties,
        loading,
        error,
        filters,
        searchQuery,
        createProperty,
        updateProperty,
        deleteProperty,
        togglePropertyStatus,
        verifyProperty,
        searchProperties,
        applyFilters,
        clearFilters,
        refreshProperties,
    };
};

export const useProperty = (id: string) => {
    const [property, setProperty] = useState<Property | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchProperty = useCallback(async () => {
        if (!id) return;

        try {
            setLoading(true);
            setError(null);

            const response = await propertiesAPI.getById(id);
            const propertyData = response.data.property || response.data;

            setProperty(propertyData);
        } catch (err: any) {
            console.error("Error fetching property:", err);
            setError(err.response?.data?.error || "Failed to fetch property");
            setProperty(null);
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchProperty();
    }, [fetchProperty]);

    const updateProperty = async (data: Partial<PropertyFormData>) => {
        if (!property) return;

        try {
            const response = await propertiesAPI.update(property._id, data);
            const updatedProperty = response.data.property || response.data;

            setProperty((prev) =>
                prev ? { ...prev, ...updatedProperty } : updatedProperty
            );
            setError(null);
            return updatedProperty;
        } catch (err: any) {
            console.error("Error updating property:", err);
            const errorMsg =
                err.response?.data?.error || "Failed to update property";
            setError(errorMsg);
            throw new Error(errorMsg);
        }
    };

    const refreshProperty = async () => {
        await fetchProperty();
    };

    return {
        property,
        loading,
        error,
        updateProperty,
        refreshProperty,
    };
};

// Hook for host properties
export const useHostProperties = () => {
    const [properties, setProperties] = useState<Property[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchHostProperties = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await propertiesAPI.getByHost();
            const propertiesData =
                response.data.properties || response.data || [];

            setProperties(propertiesData);
        } catch (err: any) {
            console.error("Error fetching host properties:", err);
            setError(
                err.response?.data?.error || "Failed to fetch host properties"
            );
            setProperties([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchHostProperties();
    }, [fetchHostProperties]);

    const createProperty = async (data: PropertyFormData) => {
        try {
            const response = await propertiesAPI.create(data);
            const newProperty = response.data.property || response.data;

            setProperties((prev) => [...prev, newProperty]);
            setError(null);
            return newProperty;
        } catch (err: any) {
            console.error("Error creating property:", err);
            const errorMsg =
                err.response?.data?.error || "Failed to create property";
            setError(errorMsg);
            throw new Error(errorMsg);
        }
    };

    const updateProperty = async (
        id: string,
        data: Partial<PropertyFormData>
    ) => {
        try {
            const response = await propertiesAPI.update(id, data);
            const updatedProperty = response.data.property || response.data;

            setProperties((prev) =>
                prev.map((property) =>
                    property._id === id
                        ? { ...property, ...updatedProperty }
                        : property
                )
            );

            setError(null);
            return updatedProperty;
        } catch (err: any) {
            console.error("Error updating property:", err);
            const errorMsg =
                err.response?.data?.error || "Failed to update property";
            setError(errorMsg);
            throw new Error(errorMsg);
        }
    };

    const deleteProperty = async (id: string) => {
        try {
            await propertiesAPI.delete(id);
            setProperties((prev) =>
                prev.filter((property) => property._id !== id)
            );
            setError(null);
        } catch (err: any) {
            console.error("Error deleting property:", err);
            const errorMsg =
                err.response?.data?.error || "Failed to delete property";
            setError(errorMsg);
            throw new Error(errorMsg);
        }
    };

    const togglePropertyStatus = async (id: string) => {
        try {
            const response = await propertiesAPI.toggleStatus(id);
            const updatedProperty = response.data.property || response.data;

            setProperties((prev) =>
                prev.map((property) =>
                    property._id === id
                        ? { ...property, ...updatedProperty }
                        : property
                )
            );

            setError(null);
            return updatedProperty;
        } catch (err: any) {
            console.error("Error toggling property status:", err);
            const errorMsg =
                err.response?.data?.error || "Failed to toggle property status";
            setError(errorMsg);
            throw new Error(errorMsg);
        }
    };

    const refreshProperties = async () => {
        await fetchHostProperties();
    };

    return {
        properties,
        loading,
        error,
        createProperty,
        updateProperty,
        deleteProperty,
        togglePropertyStatus,
        refreshProperties,
    };
};
