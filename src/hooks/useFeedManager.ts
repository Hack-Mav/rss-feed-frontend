import { useState, useCallback, useEffect } from 'react';
import type { FeedCategory, ManagedFeed, FeedExportData } from '../types';

const STORAGE_KEYS = {
  FEEDS: 'rss_feeds',
  CATEGORIES: 'rss_categories',
  SCHEDULES: 'rss_schedules'
};

const DEFAULT_CATEGORIES: FeedCategory[] = [
  { id: '1', name: 'News', color: '#2196f3', createdAt: Date.now() },
  { id: '2', name: 'Technology', color: '#4caf50', createdAt: Date.now() },
  { id: '3', name: 'Entertainment', color: '#ff9800', createdAt: Date.now() },
  { id: '4', name: 'Sports', color: '#f44336', createdAt: Date.now() },
  { id: '5', name: 'Business', color: '#9c27b0', createdAt: Date.now() }
];

export const useFeedManager = () => {
  const [feeds, setFeeds] = useState<ManagedFeed[]>([]);
  const [categories, setCategories] = useState<FeedCategory[]>([]);
  const [loading, setLoading] = useState(true);

  // Load data from localStorage on mount
  useEffect(() => {
    try {
      const savedFeeds = localStorage.getItem(STORAGE_KEYS.FEEDS);
      const savedCategories = localStorage.getItem(STORAGE_KEYS.CATEGORIES);

      if (savedFeeds) {
        setFeeds(JSON.parse(savedFeeds));
      }

      if (savedCategories) {
        setCategories(JSON.parse(savedCategories));
      } else {
        // Initialize with default categories
        setCategories(DEFAULT_CATEGORIES);
        localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(DEFAULT_CATEGORIES));
      }
    } catch (error) {
      console.error('Error loading feed manager data:', error);
      setCategories(DEFAULT_CATEGORIES);
    } finally {
      setLoading(false);
    }
  }, []);

  // Save feeds to localStorage whenever they change
  useEffect(() => {
    if (!loading && feeds.length > 0) {
      localStorage.setItem(STORAGE_KEYS.FEEDS, JSON.stringify(feeds));
    }
  }, [feeds, loading]);

  // Save categories to localStorage whenever they change
  useEffect(() => {
    if (!loading && categories.length > 0) {
      localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
    }
  }, [categories, loading]);

  // Feed management functions
  const addFeed = useCallback((feedData: Omit<ManagedFeed, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newFeed: ManagedFeed = {
      ...feedData,
      id: Date.now().toString(),
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    setFeeds(prev => [...prev, newFeed]);
    return newFeed;
  }, []);

  const updateFeed = useCallback((id: string, updates: Partial<ManagedFeed>) => {
    setFeeds(prev => prev.map(feed => 
      feed.id === id 
        ? { ...feed, ...updates, updatedAt: Date.now() }
        : feed
    ));
  }, []);

  const deleteFeed = useCallback((id: string) => {
    setFeeds(prev => prev.filter(feed => feed.id !== id));
  }, []);

  const toggleFeedActive = useCallback((id: string) => {
    setFeeds(prev => prev.map(feed => 
      feed.id === id 
        ? { ...feed, isActive: !feed.isActive, updatedAt: Date.now() }
        : feed
    ));
  }, []);

  // Category management functions
  const addCategory = useCallback((categoryData: Omit<FeedCategory, 'id' | 'createdAt'>) => {
    const newCategory: FeedCategory = {
      ...categoryData,
      id: Date.now().toString(),
      createdAt: Date.now()
    };

    setCategories(prev => [...prev, newCategory]);
    return newCategory;
  }, []);

  const updateCategory = useCallback((id: string, updates: Partial<FeedCategory>) => {
    setCategories(prev => prev.map(category => 
      category.id === id ? { ...category, ...updates } : category
    ));
  }, []);

  const deleteCategory = useCallback((id: string) => {
    setCategories(prev => prev.filter(category => category.id !== id));
    // Remove category from feeds that use it
    setFeeds(prev => prev.map(feed => 
      feed.categoryId === id ? { ...feed, categoryId: undefined, updatedAt: Date.now() } : feed
    ));
  }, []);

  // Import/Export functions
  const exportFeeds = useCallback(() => {
    const exportData: FeedExportData = {
      feeds,
      categories,
      exportDate: Date.now(),
      version: '1.0'
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `rss-feeds-export-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [feeds, categories]);

  const importFeeds = useCallback((file: File) => {
    return new Promise<void>((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          const importData: FeedExportData = JSON.parse(content);
          
          // Validate import data
          if (!importData.feeds || !importData.categories) {
            throw new Error('Invalid import file format');
          }

          // Merge with existing data (avoiding duplicates)
          setFeeds(prev => {
            const existingIds = new Set(prev.map(f => f.id));
            const newFeeds = importData.feeds.filter(f => !existingIds.has(f.id));
            return [...prev, ...newFeeds];
          });

          setCategories(prev => {
            const existingIds = new Set(prev.map(c => c.id));
            const newCategories = importData.categories.filter(c => !existingIds.has(c.id));
            return [...prev, ...newCategories];
          });

          resolve();
        } catch (error) {
          reject(new Error('Failed to import feeds: ' + (error as Error).message));
        }
      };

      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  }, []);

  // Get feeds by category
  const getFeedsByCategory = useCallback((categoryId?: string) => {
    if (!categoryId) return feeds;
    return feeds.filter(feed => feed.categoryId === categoryId);
  }, [feeds]);

  // Get active feeds
  const getActiveFeeds = useCallback(() => {
    return feeds.filter(feed => feed.isActive);
  }, [feeds]);

  // Get feeds that need refresh
  const getFeedsNeedingRefresh = useCallback(() => {
    const now = Date.now();
    return feeds.filter(feed => {
      if (!feed.isActive) return false;
      if (!feed.lastRefreshed) return true;
      
      const timeSinceRefresh = now - feed.lastRefreshed;
      const refreshInterval = feed.refreshInterval * 60 * 1000; // Convert minutes to milliseconds
      
      return timeSinceRefresh >= refreshInterval;
    });
  }, [feeds]);

  // Update feed last refreshed time
  const updateFeedLastRefreshed = useCallback((id: string) => {
    setFeeds(prev => prev.map(feed => 
      feed.id === id 
        ? { ...feed, lastRefreshed: Date.now(), updatedAt: Date.now() }
        : feed
    ));
  }, []);

  // Clear all data
  const clearAllData = useCallback(() => {
    setFeeds([]);
    setCategories(DEFAULT_CATEGORIES);
    localStorage.removeItem(STORAGE_KEYS.FEEDS);
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(DEFAULT_CATEGORIES));
  }, []);

  return {
    feeds,
    categories,
    loading,
    // Feed operations
    addFeed,
    updateFeed,
    deleteFeed,
    toggleFeedActive,
    // Category operations
    addCategory,
    updateCategory,
    deleteCategory,
    // Import/Export
    exportFeeds,
    importFeeds,
    // Utility functions
    getFeedsByCategory,
    getActiveFeeds,
    getFeedsNeedingRefresh,
    updateFeedLastRefreshed,
    clearAllData
  };
};
