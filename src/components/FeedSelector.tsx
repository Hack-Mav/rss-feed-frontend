import { useState, useEffect, useCallback, memo } from "react";
import { FeedSelectorSkeleton } from "./Skeleton";
import apiService from "../services/api";
import "../App.css";

interface Feed {
    id: string;
    name: string;
    url: string;
    description?: string;
}

interface FeedSelectorProps {
    onFeedSelect: (url: string) => Promise<void>;
}

const FeedSelector = memo(({ onFeedSelect }: FeedSelectorProps) => {
    const [feeds, setFeeds] = useState<Feed[]>([]);
    const [selectedFeed, setSelectedFeed] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const fetchFeeds = useCallback(async () => {
        setLoading(true);
        setError(null);
        
        try {
            const result = await apiService.getFeeds();

            if (result.error) {
                throw new Error(result.error.message);
            }

            if (Array.isArray(result.data)) {
                setFeeds(result.data);
            } else {
                throw new Error("Invalid response format: Expected array of feeds");
            }
        } catch (error: any) {
            console.error("Error fetching feeds:", error);
            setError(error.message || "Failed to load predefined feeds");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchFeeds();
    }, [fetchFeeds]);

    const handleFeedSelection = useCallback(() => {
        if (selectedFeed) {
            setError(null);
            onFeedSelect(selectedFeed);
        } else {
            setError("Please select a feed from the dropdown.");
        }
    }, [selectedFeed, onFeedSelect]);

    const handleRetry = useCallback(() => {
        fetchFeeds();
    }, [fetchFeeds]);

    const handleFeedChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedFeed(e.target.value);
        if (error) {
            setError(null);
        }
    }, [error]);

    return (
        <div className="feed-selector-container">
            <h2 className="feed-selector-title">
                📰 Select RSS Feed
            </h2>
            
            {loading ? (
                <FeedSelectorSkeleton />
            ) : error ? (
                <div className="error-message" style={{
                    color: 'var(--color-danger)',
                    fontSize: 'var(--font-size-sm)',
                    textAlign: 'center',
                    padding: 'var(--spacing-md)'
                }}>
                    <p>{error}</p>
                    <button 
                        onClick={handleRetry}
                        style={{
                            padding: 'var(--spacing-xs) var(--spacing-sm)',
                            backgroundColor: 'var(--color-primary)',
                            color: 'var(--text-white)',
                            border: 'none',
                            borderRadius: 'var(--radius-sm)',
                            cursor: 'pointer',
                            fontSize: 'var(--font-size-xs)',
                            marginTop: 'var(--spacing-sm)'
                        }}
                    >
                        Retry
                    </button>
                </div>
            ) : feeds.length === 0 ? (
                <div style={{
                    textAlign: 'center',
                    padding: 'var(--spacing-lg)',
                    color: 'var(--text-muted)'
                }}>
                    <p>No predefined feeds available.</p>
                    <p style={{ fontSize: 'var(--font-size-sm)' }}>
                        Try adding a custom RSS feed URL below.
                    </p>
                </div>
            ) : (
                <div className="feed-selector-controls">
                    <select
                        value={selectedFeed}
                        onChange={handleFeedChange}
                        className="feed-selector-dropdown"
                        aria-label="Select RSS feed"
                    >
                        <option value="">Choose a feed...</option>
                        {feeds.map((feed: Feed) => (
                            <option key={feed.id} value={feed.url}>
                                {feed.name}
                            </option>
                        ))}
                    </select>
                    <button
                        onClick={handleFeedSelection}
                        disabled={!selectedFeed}
                        className="feed-selector-button"
                        aria-label="Load selected RSS feed"
                    >
                        Load Feed
                    </button>
                </div>
            )}
        </div>
    );
});

FeedSelector.displayName = 'FeedSelector';

export default FeedSelector;
