import { useState, useEffect, useMemo } from 'react';
import { Stock } from '../types';

export function useStocks() {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [selectedStock, setSelectedStock] = useState<Stock | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState<boolean>(false);
  const [loadingStocks, setLoadingStocks] = useState<boolean>(true);

  useEffect(() => {
    fetch('/api/stocks')
      .then((r) => r.json())
      .then((data) => setStocks(Array.isArray(data) ? data : []))
      .catch((e) => console.error('Failed to load stocks:', e))
      .finally(() => setLoadingStocks(false));
  }, []);

  const filteredStocks = useMemo(() => {
    if (!searchQuery.trim()) return stocks;
    const query = searchQuery.toLowerCase();
    return stocks.filter(
      (s) =>
        s.ticker.toLowerCase().includes(query) ||
        s.name.toLowerCase().includes(query)
    );
  }, [stocks, searchQuery]);

  return {
    stocks,
    selectedStock,
    setSelectedStock,
    searchQuery,
    setSearchQuery,
    isMobileSearchOpen,
    setIsMobileSearchOpen,
    filteredStocks,
    loadingStocks,
  };
}
