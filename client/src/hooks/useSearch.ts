import { useState, useCallback } from 'react';
import type { PropertyFilters } from '@/types/Property';

export const useSearch = () => {
  const [filters, setFilters] = useState<PropertyFilters>({});
  const [searchQuery, setSearchQuery] = useState('');

  const updateFilters = useCallback((newFilters: Partial<PropertyFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({});
    setSearchQuery('');
  }, []);

  const updateSearchQuery = useCallback((query: string) => {
    setSearchQuery(query);
    updateFilters({ city: query });
  }, [updateFilters]);

  return {
    filters,
    searchQuery,
    updateFilters,
    clearFilters,
    updateSearchQuery
  };
};