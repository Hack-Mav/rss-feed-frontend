import { useState, useCallback } from 'react';
import apiService from '../services/api';
import { FeedItem, FeedState } from '../types';

export const useFeedState = (): FeedState & {
    clearError: () => void;
    fetchFeed: (url: string) => Promise<void>;
    handleRetry: () => void;
    fetchFeedWithStorage: (url: string) => Promise<void>;
} => {
    const [feedItems, setFeedItems] = useState<FeedItem[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [retryCount, setRetryCount] = useState<number>(0);
    const [isInitialLoad, setIsInitialLoad] = useState<boolean>(true);

    const clearError = useCallback(() => {
        setError(null);
        setRetryCount(0);
    }, []);

    const fetchFeed = useCallback(async (url: string) => {
        setLoading(true);
        clearError();
        setIsInitialLoad(false);
        
        try {
            const result = await apiService.withRetry(
                () => apiService.fetchFeed(url),
                3
            );

            if (result.error) {
                throw new Error(result.error.message);
            }

            if (Array.isArray(result.data)) {
                setFeedItems(result.data);
                setRetryCount(0);
            } else {
                throw new Error("Invalid response format: Expected array of feed items");
            }
        } catch (error) {
            console.error("Error fetching feed:", error);
            setError((error as Error).message || "Failed to fetch RSS feed");
            setFeedItems([]);
        } finally {
            setLoading(false);
        }
    }, [clearError]);

    const handleRetry = useCallback(() => {
        if (retryCount < 3) {
            setRetryCount(prev => prev + 1);
            const lastUrl = localStorage.getItem('lastFeedUrl');
            if (lastUrl) {
                fetchFeed(lastUrl);
            }
        } else {
            setError("Maximum retry attempts reached. Please try a different feed or check back later.");
        }
    }, [retryCount, fetchFeed]);

    const fetchFeedWithStorage = useCallback(async (url: string) => {
        localStorage.setItem('lastFeedUrl', url);
        return fetchFeed(url);
    }, [fetchFeed]);

    return {
        feedItems,
        loading,
        error,
        retryCount,
        isInitialLoad,
        clearError,
        fetchFeed,
        handleRetry,
        fetchFeedWithStorage
    };
};
