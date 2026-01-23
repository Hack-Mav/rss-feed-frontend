import { memo, useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import FeedSelector from "./components/FeedSelector";
import CustomFeedInput from "./components/CustomFeedInput";
import FeedDisplay from "./components/FeedDisplay";
import BookmarksDisplay from "./components/BookmarksDisplay";
import FeedManager from "./components/FeedManager";
import OfflineStatus from "./components/OfflineStatus";
import ErrorBoundary from "./components/ErrorBoundary";
import { LoadingSpinner, FeedItemSkeleton } from "./components/Skeleton";
import ThemeToggle from "./components/ThemeToggle";
import LanguageSelector from "./components/LanguageSelector";
import { useFeedState } from "./hooks/useFeedState";
import { useAnalytics } from "./hooks/useAnalytics";
import { getLanguageDirection } from "./i18n";
import "./App.css";

const App = memo(() => {
    const { t, i18n } = useTranslation();
    const { trackPageView, trackUserAction } = useAnalytics();
    const [activeSection, setActiveSection] = useState<'reader' | 'manager'>('reader');
    
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

    // Track page view and navigation changes
    useEffect(() => {
        trackPageView();
    }, [trackPageView]);

    useEffect(() => {
        trackUserAction('navigate', { section: activeSection });
    }, [activeSection, trackUserAction]);

    return (
        <ErrorBoundary>
            <div id="root" dir={getLanguageDirection(i18n.language)}>
                <a href="#main-content" className="skip-link">
                    {t('accessibility.skipToContent')}
                </a>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem' }}>
                    <ThemeToggle />
                    <LanguageSelector />
                </div>
                <header role="banner">
                    <h1>{t('app.title')}</h1>
                    <p>{t('app.subtitle')}</p>
                    
                    {/* Navigation */}
                    <nav style={{ 
                        display: 'flex', 
                        gap: '1rem', 
                        justifyContent: 'center',
                        marginTop: '1rem',
                        borderBottom: '1px solid #ddd',
                        paddingBottom: '1rem'
                    }}>
                        <button
                            onClick={() => setActiveSection('reader')}
                            style={{
                                padding: '0.5rem 1rem',
                                backgroundColor: activeSection === 'reader' ? '#007bff' : 'transparent',
                                color: activeSection === 'reader' ? 'white' : '#007bff',
                                border: activeSection === 'reader' ? 'none' : '1px solid #007bff',
                                borderRadius: '4px',
                                cursor: 'pointer'
                            }}
                        >
                            {t('navigation.reader')}
                        </button>
                        <button
                            onClick={() => setActiveSection('manager')}
                            style={{
                                padding: '0.5rem 1rem',
                                backgroundColor: activeSection === 'manager' ? '#007bff' : 'transparent',
                                color: activeSection === 'manager' ? 'white' : '#007bff',
                                border: activeSection === 'manager' ? 'none' : '1px solid #007bff',
                                borderRadius: '4px',
                                cursor: 'pointer'
                            }}
                        >
                            {t('navigation.manager')}
                        </button>
                    </nav>
                </header>

                <main id="main-content">
                    {activeSection === 'reader' ? (
                        <>
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
                                        ⚠️ {t('app.error')}: {error}
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
                                            {retryCount >= 3 ? t('app.maxRetries') : `${t('app.retry')} (${retryCount}/3)`}
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
                                            {t('app.dismiss')}
                                        </button>
                                        <span id="retry-help" className="sr-only">
                                            {retryCount >= 3 ? t('accessibility.maxRetries') : t('accessibility.retryFeed')}
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
                                                <LoadingSpinner text={t('accessibility.loadingFeed')} />
                                            ) : (
                                                <div>
                                                    <LoadingSpinner text={t('accessibility.loadingItems')} size="small" />
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
                        </>
                    ) : (
                        <section aria-labelledby="feed-manager-heading">
                            <ErrorBoundary>
                                <FeedManager />
                            </ErrorBoundary>
                        </section>
                    )}
                </main>
                <OfflineStatus />
            </div>
        </ErrorBoundary>
    );
});

export default App;
