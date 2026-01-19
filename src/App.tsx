import { memo } from "react";
import FeedSelector from "./components/FeedSelector";
import CustomFeedInput from "./components/CustomFeedInput";
import FeedDisplay from "./components/FeedDisplay";
import BookmarksDisplay from "./components/BookmarksDisplay";
import OfflineStatus from "./components/OfflineStatus";
import ErrorBoundary from "./components/ErrorBoundary";
import { LoadingSpinner, FeedItemSkeleton } from "./components/Skeleton";
import ThemeToggle from "./components/ThemeToggle";
import { useFeedState } from "./hooks/useFeedState";
import "./App.css";

const App = memo(() => {
    const {
        feedItems,
        loading,
        error,
        retryCount,
        isInitialLoad,
        clearError,
        handleRetry,
        fetchFeedWithStorage
    } = useFeedState();    

    return (
        <ErrorBoundary>
            <div id="root">
                <a href="#main-content" className="skip-link">
                    Skip to main content
                </a>
                <ThemeToggle />
                <header role="banner">
                    <h1>RSS Feed Reader</h1>
                    <p>Stay updated with the latest articles from your favorite sources.</p>
                </header>

                <main id="main-content">
                    {error && (
                        <div 
                            className="error-message" 
                            role="alert" 
                            aria-live="polite"
                            style={{
                                backgroundColor: '#ffe0e0',
                                border: '1px solid #ff6b6b',
                                borderRadius: '8px',
                                padding: '1rem',
                                margin: '1rem 0',
                                color: '#d63031'
                            }}
                        >
                            <p style={{ margin: '0 0 0.5rem 0', fontWeight: 'bold' }}>
                                ⚠️ Error: {error}
                            </p>
                            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                <button 
                                    onClick={handleRetry}
                                    disabled={retryCount >= 3}
                                    aria-describedby="retry-help"
                                    style={{
                                        padding: '0.25rem 0.75rem',
                                        backgroundColor: retryCount >= 3 ? '#ccc' : '#d63031',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '4px',
                                        cursor: retryCount >= 3 ? 'not-allowed' : 'pointer',
                                        fontSize: '0.875rem'
                                    }}
                                >
                                    {retryCount >= 3 ? 'Max Retries Reached' : `Retry (${retryCount}/3)`}
                                </button>
                                <button 
                                    onClick={clearError}
                                    style={{
                                        padding: '0.25rem 0.75rem',
                                        backgroundColor: '#74b9ff',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                        fontSize: '0.875rem'
                                    }}
                                >
                                    Dismiss
                                </button>
                                <span id="retry-help" className="sr-only">
                                    {retryCount >= 3 ? 'Maximum retry attempts reached. Please refresh the page.' : 'Retry fetching the RSS feed.'}
                                </span>
                            </div>
                        </div>
                    )}

                    <section aria-labelledby="feed-controls-heading">
                        <h2 id="feed-controls-heading" className="sr-only">Feed Controls</h2>
                        <div className="card">
                            <ErrorBoundary>
                                <FeedSelector onFeedSelect={fetchFeedWithStorage} />
                            </ErrorBoundary>
                            <ErrorBoundary>
                                <CustomFeedInput onFeedSelect={fetchFeedWithStorage} />
                            </ErrorBoundary>
                        </div>
                    </section>

                    <section aria-labelledby="bookmarks-heading">
                        <ErrorBoundary>
                            <BookmarksDisplay />
                        </ErrorBoundary>
                    </section>

                    <section aria-labelledby="feed-items-heading">
                        <div className="feed-container">
                            <ErrorBoundary>
                                {loading ? (
                                    isInitialLoad ? (
                                        <LoadingSpinner text="Fetching RSS feed..." />
                                    ) : (
                                        <div>
                                            <LoadingSpinner text="Loading feed items..." size="small" />
                                            <div className="feed-grid">
                                                {Array.from({ length: 3 }, (_, i) => (
                                                    <FeedItemSkeleton key={i} />
                                                ))}
                                            </div>
                                        </div>
                                    )
                                ) : (
                                    <FeedDisplay feedItems={feedItems} />
                                )}
                            </ErrorBoundary>
                        </div>
                    </section>
                </main>
                <OfflineStatus />
            </div>
        </ErrorBoundary>
    );
});

export default App;
