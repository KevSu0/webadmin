// Custom hook for pagination management
import { useState, useCallback } from 'react';
import { DocumentSnapshot } from 'firebase/firestore';

interface UsePaginationReturn<T> {
  data: T[];
  currentPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  isLoading: boolean;
  error: string | null;
  loadNextPage: () => Promise<void>;
  loadPreviousPage: () => Promise<void>;
  goToPage: (page: number) => Promise<void>;
  refresh: () => Promise<void>;
  reset: () => void;
}

interface UsePaginationOptions<T> {
  pageSize?: number;
  fetchFunction: (
    pageSize: number,
    lastDoc?: DocumentSnapshot
  ) => Promise<{ data: T[]; lastDoc: DocumentSnapshot | null }>;
}

export function usePagination<T>({
  pageSize = 20,
  fetchFunction
}: UsePaginationOptions<T>): UsePaginationReturn<T> {
  const [data, setData] = useState<T[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastDocs, setLastDocs] = useState<(DocumentSnapshot | null)[]>([null]);
  const [hasNextPage, setHasNextPage] = useState(true);

  const loadPage = useCallback(async (
    page: number,
    lastDoc?: DocumentSnapshot
  ) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const result = await fetchFunction(pageSize, lastDoc);
      
      setData(result.data);
      setCurrentPage(page);
      setHasNextPage(result.data.length === pageSize);
      
      // Update lastDocs array
      if (page > lastDocs.length - 1) {
        setLastDocs(prev => [...prev, result.lastDoc]);
      }
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load data';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [fetchFunction, pageSize, lastDocs.length]);

  const loadNextPage = useCallback(async () => {
    if (!hasNextPage || isLoading) return;
    
    const nextPage = currentPage + 1;
    const lastDoc = lastDocs[currentPage - 1];
    
    await loadPage(nextPage, lastDoc || undefined);
  }, [hasNextPage, isLoading, currentPage, lastDocs, loadPage]);

  const loadPreviousPage = useCallback(async () => {
    if (currentPage <= 1 || isLoading) return;
    
    const previousPage = currentPage - 1;
    const lastDoc = lastDocs[previousPage - 1];
    
    await loadPage(previousPage, lastDoc || undefined);
  }, [currentPage, isLoading, lastDocs, loadPage]);

  const goToPage = useCallback(async (page: number) => {
    if (page < 1 || page === currentPage || isLoading) return;
    
    if (page === 1) {
      await loadPage(1);
    } else if (page <= lastDocs.length) {
      const lastDoc = lastDocs[page - 1];
      await loadPage(page, lastDoc || undefined);
    } else {
      // For pages beyond what we've cached, we need to load sequentially
      // This is a limitation of Firestore pagination
      console.warn('Cannot jump to page beyond cached range');
    }
  }, [currentPage, isLoading, lastDocs, loadPage]);

  const refresh = useCallback(async () => {
    const lastDoc = currentPage > 1 ? lastDocs[currentPage - 1] : undefined;
    await loadPage(currentPage, lastDoc || undefined);
  }, [currentPage, lastDocs, loadPage]);

  const reset = useCallback(() => {
    setData([]);
    setCurrentPage(1);
    setLastDocs([null]);
    setHasNextPage(true);
    setError(null);
  }, []);

  // Load first page on mount
  const initialize = useCallback(async () => {
    if (data.length === 0 && !isLoading) {
      await loadPage(1);
    }
  }, [data.length, isLoading, loadPage]);

  return {
    data,
    currentPage,
    hasNextPage,
    hasPreviousPage: currentPage > 1,
    isLoading,
    error,
    loadNextPage,
    loadPreviousPage,
    goToPage,
    refresh,
    reset,
    // Expose initialize for manual triggering
    initialize
  } as UsePaginationReturn<T> & { initialize: () => Promise<void> };
}

// Simplified pagination hook for arrays (client-side pagination)
export function useArrayPagination<T>(data: T[], pageSize: number = 20) {
  const [currentPage, setCurrentPage] = useState(1);
  
  const totalPages = Math.ceil(data.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const currentData = data.slice(startIndex, endIndex);
  
  const goToPage = useCallback((page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  }, [totalPages]);
  
  const nextPage = useCallback(() => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
    }
  }, [currentPage, totalPages]);
  
  const previousPage = useCallback(() => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  }, [currentPage]);
  
  const reset = useCallback(() => {
    setCurrentPage(1);
  }, []);
  
  return {
    currentData,
    currentPage,
    totalPages,
    hasNextPage: currentPage < totalPages,
    hasPreviousPage: currentPage > 1,
    goToPage,
    nextPage,
    previousPage,
    reset
  };
}