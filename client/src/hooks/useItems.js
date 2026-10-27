import { useState, useEffect, useCallback, useRef } from 'react';
import { getItems } from '../api/items.api';

export const useItems = (filters = {}) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    total: 0,
  });

  const [debouncedKeyword, setDebouncedKeyword] = useState(filters.keyword || '');
  const timerRef = useRef(null);

  // Debounce keyword by 300ms
  useEffect(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    timerRef.current = setTimeout(() => {
      setDebouncedKeyword(filters.keyword || '');
    }, 300);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [filters.keyword]);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const activeParams = {};
      Object.keys(filters).forEach((key) => {
        if (key !== 'keyword' && filters[key] !== '' && filters[key] !== undefined && filters[key] !== null) {
          activeParams[key] = filters[key];
        }
      });

      if (debouncedKeyword.trim()) {
        activeParams.keyword = debouncedKeyword.trim();
      }

      const res = await getItems(activeParams);

      const itemsData =
        res.data?.items ||
        res.items ||
        (Array.isArray(res.data) ? res.data : Array.isArray(res) ? res : []);
      const paginationData = res.data?.pagination || res.pagination || {};
      const page = paginationData.page ?? paginationData.currentPage ?? filters.page ?? 1;
      const totalPages =
        paginationData.totalPages ?? res.data?.totalPages ?? res.totalPages ?? 1;
      const total = paginationData.total ?? res.data?.total ?? res.total ?? itemsData.length;

      setItems(itemsData);
      setPagination({
        currentPage: Number(page),
        totalPages: Number(totalPages),
        total: Number(total),
      });
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to load items');
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [
    debouncedKeyword,
    filters.type,
    filters.category,
    filters.status,
    filters.location,
    filters.dateFrom,
    filters.dateTo,
    filters.page,
    filters.limit,
    filters.sort,
  ]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  return {
    items,
    loading,
    error,
    pagination,
    refetch: fetchItems,
  };
};

export default useItems;
