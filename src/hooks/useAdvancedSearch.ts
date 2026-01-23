import { useState, useCallback, useMemo, useEffect } from 'react';
import type { FeedItem, SearchHistory, SearchSuggestion, SearchOperators } from '../types';

export const useAdvancedSearch = (feedItems: FeedItem[]) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchHistory, setSearchHistory] = useState<SearchHistory[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Load search history from localStorage on mount
  useEffect(() => {
    const savedHistory = localStorage.getItem('searchHistory');
    if (savedHistory) {
      try {
        setSearchHistory(JSON.parse(savedHistory));
      } catch (error) {
        console.warn('Failed to parse search history:', error);
      }
    }
  }, []);

  // Save search history to localStorage whenever it changes
  useEffect(() => {
    if (searchHistory.length > 0) {
      localStorage.setItem('searchHistory', JSON.stringify(searchHistory));
    }
  }, [searchHistory]);

  // Parse search query for advanced operators
  const parseSearchQuery = useCallback((query: string) => {
    const operators: SearchOperators = {
      AND: query.includes(' AND '),
      OR: query.includes(' OR '),
      NOT: query.includes(' NOT ')
    };

    // Extract search terms
    let terms = query
      .replace(/ AND | OR | NOT /g, '|||')
      .split('|||')
      .map(term => term.trim())
      .filter(term => term.length > 0);

    // Handle NOT operator
    const notTerms: string[] = [];
    const positiveTerms: string[] = [];
    
    terms.forEach((term, index) => {
      if (query.includes(` NOT ${term}`) || (index > 0 && query.split('|||')[index - 1].trim() === 'NOT')) {
        notTerms.push(term.toLowerCase());
      } else {
        positiveTerms.push(term.toLowerCase());
      }
    });

    return { operators, positiveTerms, notTerms };
  }, []);

  // Advanced search function
  const advancedSearch = useCallback((items: FeedItem[], query: string) => {
    if (!query.trim()) return items;

    const { operators, positiveTerms, notTerms } = parseSearchQuery(query);

    return items.filter(item => {
      const title = (item.Title || item.title || '').toLowerCase();
      const description = (item.Description || item.description || '').toLowerCase();
      const fullText = `${title} ${description}`;

      // Handle NOT terms (exclude items containing these)
      if (notTerms.length > 0) {
        const hasNotTerm = notTerms.some(term => 
          fullText.includes(term)
        );
        if (hasNotTerm) return false;
      }

      // Handle positive terms
      if (positiveTerms.length === 0) return true;

      if (operators.AND) {
        // All positive terms must be present
        return positiveTerms.every(term => 
          fullText.includes(term)
        );
      } else if (operators.OR) {
        // At least one positive term must be present
        return positiveTerms.some(term => 
          fullText.includes(term)
        );
      } else {
        // Default: simple search (any term)
        return positiveTerms.some(term => 
          fullText.includes(term)
        );
      }
    });
  }, [parseSearchQuery]);

  // Get search suggestions
  const getSearchSuggestions = useCallback((query: string): SearchSuggestion[] => {
    const suggestions: SearchSuggestion[] = [];
    
    // Add history suggestions
    const historySuggestions = searchHistory
      .filter(item => item.query.toLowerCase().includes(query.toLowerCase()))
      .slice(0, 5)
      .map(item => ({
        text: item.query,
        type: 'history' as const
      }));
    
    suggestions.push(...historySuggestions);

    // Add dynamic suggestions based on feed content
    if (feedItems.length > 0) {
      const words = new Set<string>();
      feedItems.forEach(item => {
        const title = (item.Title || item.title || '').toLowerCase();
        const description = (item.Description || item.description || '').toLowerCase();
        
        // Extract common words (length > 3)
        [...title.split(' '), ...description.split(' ')]
          .filter(word => word.length > 3)
          .forEach(word => words.add(word));
      });

      const dynamicSuggestions = Array.from(words)
        .filter(word => word.includes(query.toLowerCase()))
        .slice(0, 5)
        .map(word => ({
          text: word,
          type: 'suggestion' as const
        }));

      suggestions.push(...dynamicSuggestions);
    }

    return suggestions.slice(0, 8);
  }, [searchHistory, feedItems]);

  // Add to search history
  const addToSearchHistory = useCallback((query: string) => {
    if (!query.trim()) return;

    const newEntry: SearchHistory = {
      id: Date.now().toString(),
      query: query.trim(),
      timestamp: Date.now()
    };

    setSearchHistory(prev => {
      // Remove duplicate entries
      const filtered = prev.filter(item => item.query !== query.trim());
      // Add new entry at the beginning
      return [newEntry, ...filtered].slice(0, 20); // Keep only last 20 searches
    });
  }, []);

  // Highlight text in content
  const highlightText = useCallback((text: string, query: string): string => {
    if (!query.trim()) return text;

    const { positiveTerms } = parseSearchQuery(query);
    let highlightedText = text;

    positiveTerms.forEach(term => {
      const regex = new RegExp(`(${term})`, 'gi');
      highlightedText = highlightedText.replace(regex, '<mark>$1</mark>');
    });

    return highlightedText;
  }, [parseSearchQuery]);

  // Handle search
  const handleSearch = useCallback((query: string) => {
    setSearchTerm(query);
    if (query.trim()) {
      addToSearchHistory(query);
      setShowSuggestions(false);
    }
  }, [addToSearchHistory]);

  // Clear search history
  const clearSearchHistory = useCallback(() => {
    setSearchHistory([]);
    localStorage.removeItem('searchHistory');
  }, []);

  // Memoized filtered items
  const filteredItems = useMemo(() => {
    return advancedSearch(feedItems, searchTerm);
  }, [advancedSearch, feedItems, searchTerm]);

  // Memoized suggestions
  const suggestions = useMemo(() => {
    return getSearchSuggestions(searchTerm);
  }, [getSearchSuggestions, searchTerm]);

  return {
    searchTerm,
    setSearchTerm: handleSearch,
    filteredItems,
    searchHistory,
    suggestions,
    showSuggestions,
    setShowSuggestions,
    highlightText,
    clearSearchHistory,
    parseSearchQuery
  };
};
