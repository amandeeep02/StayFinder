import { useState, useEffect } from "react";
import { HeroSection } from "@/components/home/HeroSection";
import { SearchFilters } from "@/components/home/SearchFilters";
import { PropertyGrid } from "@/components/home/PropertyGrid";
import { Footer } from "@/components/shared/Footer";
import { useProperties } from "@/hooks/useProperties";
import { useSearch } from "@/hooks/useSearch";
import { motion } from "framer-motion";

export const Home = () => {
  const { filters, searchQuery, updateFilters, clearFilters, updateSearchQuery } = useSearch();
  const { properties, loading, error } = useProperties(filters);
  const [showFilters, setShowFilters] = useState(false);

  const handleSearch = (query: string) => {
    updateSearchQuery(query);
    setShowFilters(true);
  };

  // Show filters when user has searched or applied filters
  useEffect(() => {
    if (Object.keys(filters).length > 0) {
      setShowFilters(true);
    }
  }, [filters]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section */}
      <HeroSection onSearch={handleSearch} />

      {/* Search Filters */}
      {showFilters && (
        <SearchFilters
          filters={filters}
          onFiltersChange={updateFilters}
          onClearFilters={() => {
            clearFilters();
            setShowFilters(false);
          }}
        />
      )}

      {/* Properties Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Section Header */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {searchQuery ? `Results for "${searchQuery}"` : "Discover amazing places"}
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              {properties.length} {properties.length === 1 ? 'property' : 'properties'} found
            </p>
          </div>

          {/* Properties Grid */}
          <PropertyGrid
            properties={properties}
            loading={loading}
            error={error}
          />
        </motion.div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};