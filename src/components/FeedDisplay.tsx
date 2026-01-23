import { useState, useCallback, memo } from "react";
import { useTranslation } from "react-i18next";
import type { FeedItem, ValidatedFeedItem, FilterBy } from "../types";
import { useBookmarks } from "../hooks/useBookmarks";
import { useAdvancedSearch } from "../hooks/useAdvancedSearch";
import { usePagination } from "../hooks/usePagination";
import { useAnalytics } from "../hooks/useAnalytics";
import { formatDate } from "../i18n";
import AdvancedSearch from "./AdvancedSearch";
import Pagination from "./Pagination";
import SocialShare from "./SocialShare";
import CommentsSection from "./CommentsSection";
import "../App.css";

interface FeedItemProps {
    item: FeedItem;
    index: number;
    expandedIndex: number | null;
    onReadMore: (index: number) => void;
    highlightText?: (text: string, query: string) => string;
    searchTerm?: string;
}

interface FeedDisplayProps {
    feedItems: FeedItem[];
}

// Memoized feed item component for better performance
const FeedItemComponent = memo(({ item, index, expandedIndex, onReadMore, highlightText, searchTerm }: FeedItemProps) => {
    const { t, i18n } = useTranslation();
    const { toggleBookmark, isBookmarked } = useBookmarks();
    const { trackArticleInteraction, trackBookmark } = useAnalytics();
    const validateFeedItem = useCallback((item: FeedItem, index: number): ValidatedFeedItem | null => {
        if (!item || typeof item !== 'object') {
            console.warn(`Invalid feed item at index ${index}:`, item);
            return null;
        }

        return {
            title: item.Title || item.title || `Untitled Item ${index + 1}`,
            description: item.Description || item.description || "No description available.",
            link: item.Link || item.link || "#",
            pubDate: item.PubDate || item.pubDate || undefined,
            author: item.Author || item.author || undefined
        };
    }, []);

    const truncateText = useCallback((text: string, limit: number): string => {
        if (!text) return t('feedItem.noDescription');
        if (text.length > limit) {
            return `${text.slice(0, limit)}...`;
        }
        return text;
    }, [t]);

    const formatDateLocalized = useCallback((dateString: string | undefined): string => {
        if (!dateString) return t('feedItem.unknown');
        
        try {
            return formatDate(dateString, i18n.language);
        } catch (error) {
            console.warn("Error formatting date:", dateString, error);
            return dateString || t('feedItem.unknown');
        }
    }, [t, i18n.language]);

    const sanitizeHtml = useCallback((html: string): string => {
        if (!html) return "";
        
        return html
            .replace(/<script[^>]*>.*?<\/script>/gi, "")
            .replace(/<iframe[^>]*>.*?<\/iframe>/gi, "")
            .replace(/<object[^>]*>.*?<\/object>/gi, "")
            .replace(/<embed[^>]*>.*?<\/embed>/gi, "");
    }, []);

    const validatedItem = validateFeedItem(item, index);
    
    if (!validatedItem) {
        return (
            <div className="feed-item" style={{
                backgroundColor: '#fff3cd',
                border: '1px solid #ffc107',
                borderRadius: '8px',
                padding: '1rem',
                margin: '0.5rem 0'
            }}>
                <h4>⚠️ {t('feedItem.invalidItem')}</h4>
                <p style={{ margin: '0.5rem 0', fontSize: '0.875rem' }}>
                    {t('feedItem.invalidItemDesc')}
                </p>
            </div>
        );
    }

    const { title, description, link, pubDate, author } = validatedItem;
    const sanitizedDescription = sanitizeHtml(description);
    const isExpanded = expandedIndex === index;
    const bookmarked = isBookmarked(validatedItem);
    
    // Apply text highlighting if search term exists
    const highlightedTitle = searchTerm && highlightText ? highlightText(title, searchTerm) : title;
    const highlightedDescription = searchTerm && highlightText ? highlightText(sanitizedDescription, searchTerm) : sanitizedDescription;

    const handleBookmarkToggle = useCallback(() => {
        toggleBookmark(validatedItem);
        const action = bookmarked ? 'remove' : 'add';
        trackBookmark(action, validatedItem.link, { title: validatedItem.title });
    }, [toggleBookmark, bookmarked, validatedItem, trackBookmark]);

    const handleArticleClick = useCallback(() => {
        trackArticleInteraction('click', validatedItem.link, { title: validatedItem.title });
    }, [trackArticleInteraction, validatedItem]);

    return (
        <div className="feed-item">
            <h3 dangerouslySetInnerHTML={{ __html: highlightedTitle }}></h3>
            <p className="feed-description">
                {isExpanded
                    ? <span dangerouslySetInnerHTML={{ __html: highlightedDescription }} />
                    : truncateText(highlightedDescription, 200)}
            </p>
            {isExpanded ? (
                <div className="feed-details">
                    <p><strong>{t('feedItem.publicationDate')}:</strong> {formatDateLocalized(pubDate)}</p>
                    <p><strong>{t('feedItem.author')}:</strong> {author || t('feedItem.unknown')}</p>
                    <a
                        href={link}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ 
                            display: "inline-block", 
                            marginTop: "0.5rem",
                            padding: "0.25rem 0.75rem",
                            backgroundColor: "#007bff",
                            color: "white",
                            textDecoration: "none",
                            borderRadius: "4px",
                            fontSize: "0.875rem"
                        }}
                        onClick={(e) => {
                            if (link === "#") {
                                e.preventDefault();
                                alert("No valid link available for this item.");
                            } else {
                                handleArticleClick();
                            }
                        }}
                    >
                        {t('feedItem.visitArticle')}
                    </a>
                    <button 
                        onClick={handleBookmarkToggle}
                        style={{
                            marginTop: "0.5rem",
                            marginLeft: "0.5rem",
                            padding: "0.25rem 0.75rem",
                            backgroundColor: bookmarked ? "#28a745" : "#6c757d",
                            color: "white",
                            border: "none",
                            borderRadius: "4px",
                            cursor: "pointer",
                            fontSize: "0.875rem"
                        }}
                        title={bookmarked ? t('bookmarks.removeBookmark') : t('feedItem.bookmark')}
                    >
                        {bookmarked ? t('feedItem.bookmarked') : t('feedItem.bookmark')}
                    </button>
                    <button 
                        onClick={() => onReadMore(index)}
                        style={{
                            marginTop: "0.5rem",
                            marginLeft: "0.5rem",
                            padding: "0.25rem 0.75rem",
                            backgroundColor: "#6c757d",
                            color: "white",
                            border: "none",
                            borderRadius: "4px",
                            cursor: "pointer",
                            fontSize: "0.875rem"
                        }}
                    >
                        {t('feedItem.showLess')}
                    </button>
                    <SocialShare 
                        url={link} 
                        title={title} 
                        description={sanitizedDescription}
                        className="feed-item-share"
                    />
                    <CommentsSection 
                        articleUrl={link} 
                        articleTitle={title}
                        className="feed-item-comments"
                    />
                </div>
            ) : (
                <>
                    <button 
                        onClick={handleBookmarkToggle}
                        style={{
                            padding: "0.25rem 0.75rem",
                            backgroundColor: bookmarked ? "#28a745" : "#6c757d",
                            color: "white",
                            border: "none",
                            borderRadius: "4px",
                            cursor: "pointer",
                            fontSize: "0.875rem",
                            marginRight: "0.5rem"
                        }}
                        title={bookmarked ? t('bookmarks.removeBookmark') : t('feedItem.bookmark')}
                    >
                        {bookmarked ? t('feedItem.bookmarked') : t('feedItem.bookmark')}
                    </button>
                    <button 
                        onClick={() => onReadMore(index)}
                        style={{
                            padding: "0.25rem 0.75rem",
                            backgroundColor: "#007bff",
                            color: "white",
                            border: "none",
                            borderRadius: "4px",
                            cursor: "pointer",
                            fontSize: "0.875rem"
                        }}
                    >
                        {t('feedItem.readMore')}
                    </button>
                    <SocialShare 
                        url={link} 
                        title={title} 
                        description={sanitizedDescription}
                        className="feed-item-share"
                    />
                    <CommentsSection 
                        articleUrl={link} 
                        articleTitle={title}
                        className="feed-item-comments"
                    />
                </>
            )}
        </div>
    );
});

FeedItemComponent.displayName = 'FeedItem';

const FeedDisplay = memo(({ feedItems }: FeedDisplayProps) => {
    const { t } = useTranslation();
    const { trackSearch } = useAnalytics();
    const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
    const [filterBy, setFilterBy] = useState<FilterBy>('all');
    const [itemsPerPage, setItemsPerPage] = useState(10);
    
    const {
        searchTerm,
        setSearchTerm,
        filteredItems,
        searchHistory,
        suggestions,
        showSuggestions,
        setShowSuggestions,
        highlightText,
        clearSearchHistory
    } = useAdvancedSearch(feedItems);

    // Apply additional filtering based on FilterBy selection
    const finalFilteredItems = useCallback((items: FeedItem[]) => {
        if (!searchTerm.trim()) return items;
        
        const term = searchTerm.toLowerCase();
        return items.filter(item => {
            const title = (item.Title || item.title || '').toLowerCase();
            const description = (item.Description || item.description || '').toLowerCase();
            
            switch (filterBy) {
                case 'title':
                    return title.includes(term);
                case 'description':
                    return description.includes(term);
                default:
                    return items; // Already filtered by advanced search
            }
        });
    }, [searchTerm, filterBy]);

    const displayItems = finalFilteredItems(filteredItems);

    // Pagination
    const pagination = usePagination({
        items: displayItems,
        itemsPerPage,
        initialPage: 1
    });

    const handleReadMore = useCallback((index: number) => {
        setExpandedIndex(prev => prev === index ? null : index);
    }, []);

    // Reset pagination when search or filter changes
    const resetPagination = useCallback(() => {
        pagination.resetPagination();
    }, [pagination.resetPagination]);

    // Reset pagination when search term or filter changes
    const handleSearchChange = useCallback((term: string) => {
        setSearchTerm(term);
        resetPagination();
        if (term.trim()) {
            trackSearch(term, displayItems.length);
        }
    }, [setSearchTerm, resetPagination, trackSearch, displayItems.length]);

    const handleFilterChange = useCallback((newFilter: FilterBy) => {
        setFilterBy(newFilter);
        resetPagination();
    }, [resetPagination]);

    return (
        <div className="feed-container">
            <h2>{t('feedDisplay.title')}</h2>
            
            {/* Advanced Search and Filter Controls */}
            <div className="search-filter-container" style={{
                backgroundColor: '#f8f9fa',
                padding: '1rem',
                borderRadius: '8px',
                margin: '1rem 0',
                border: '1px solid #dee2e6'
            }}>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                    <AdvancedSearch
                        searchTerm={searchTerm}
                        onSearchChange={handleSearchChange}
                        suggestions={suggestions}
                        showSuggestions={showSuggestions}
                        setShowSuggestions={setShowSuggestions}
                        onClearHistory={clearSearchHistory}
                    />
                    <select
                        value={filterBy}
                        onChange={(e) => handleFilterChange(e.target.value as FilterBy)}
                        style={{
                            padding: '0.5rem',
                            border: '1px solid #ccc',
                            borderRadius: '4px',
                            fontSize: '1rem',
                            minWidth: '150px'
                        }}
                    >
                        <option value="all">{t('search.operators.all')}</option>
                        <option value="title">{t('search.operators.title')}</option>
                        <option value="description">{t('search.operators.description')}</option>
                    </select>
                    
                    {/* Items per page selector */}
                    <select
                        value={itemsPerPage}
                        onChange={(e) => {
                            setItemsPerPage(Number(e.target.value));
                            resetPagination();
                        }}
                        style={{
                            padding: '0.5rem',
                            border: '1px solid #ccc',
                            borderRadius: '4px',
                            fontSize: '1rem',
                            minWidth: '120px'
                        }}
                    >
                        <option value={5}>5 per page</option>
                        <option value={10}>10 per page</option>
                        <option value={20}>20 per page</option>
                        <option value={50}>50 per page</option>
                        <option value={100}>100 per page</option>
                    </select>
                </div>
                {searchTerm && (
                    <div style={{ 
                        fontSize: '0.875rem', 
                        color: '#666',
                        marginTop: '0.5rem'
                    }}>
                        {t('feedDisplay.found', { count: displayItems.length, total: feedItems.length })}
                        {displayItems.length > itemsPerPage && (
                            <span style={{ marginLeft: '1rem' }}>
                                📄 {t('feedDisplay.page', { current: pagination.currentPage, total: pagination.totalPages })}
                            </span>
                        )}
                        {searchHistory.length > 0 && (
                            <span style={{ marginLeft: '1rem' }}>
                                🕐 {t('feedDisplay.recentSearches', { count: searchHistory.length })}
                            </span>
                        )}
                    </div>
                )}
            </div>
            
            {!Array.isArray(feedItems) ? (
                <div style={{
                    backgroundColor: '#ffe0e0',
                    border: '1px solid #ff6b6b',
                    borderRadius: '8px',
                    padding: '1rem',
                    margin: '1rem 0',
                    color: '#d63031',
                    textAlign: 'center'
                }}>
                    <p style={{ margin: '0' }}>
                        ⚠️ {t('feedDisplay.invalidData')}
                    </p>
                </div>
            ) : feedItems.length === 0 ? (
                <div style={{
                    backgroundColor: '#e3f2fd',
                    border: '1px solid #2196f3',
                    borderRadius: '8px',
                    padding: '1rem',
                    margin: '1rem 0',
                    color: '#1976d2',
                    textAlign: 'center'
                }}>
                    <p style={{ margin: '0' }}>
                        📭 {t('feedDisplay.noItems')}
                    </p>
                </div>
            ) : displayItems.length === 0 && searchTerm ? (
                <div style={{
                    backgroundColor: '#fff3cd',
                    border: '1px solid #ffc107',
                    borderRadius: '8px',
                    padding: '1rem',
                    margin: '1rem 0',
                    color: '#856404',
                    textAlign: 'center'
                }}>
                    <p style={{ margin: '0' }}>
                        🔍 {t('feedDisplay.noResults', { query: searchTerm })}
                    </p>
                </div>
            ) : (
                <>
                    <div className="feed-grid">
                        {pagination.currentItems.map((item, index) => (
                            <FeedItemComponent
                                key={index}
                                item={item}
                                index={feedItems.indexOf(item)}
                                expandedIndex={expandedIndex}
                                onReadMore={handleReadMore}
                                highlightText={highlightText}
                                searchTerm={searchTerm}
                            />
                        ))}
                    </div>
                    
                    {/* Pagination component */}
                    {displayItems.length > itemsPerPage && (
                        <Pagination
                            currentPage={pagination.currentPage}
                            totalPages={pagination.totalPages}
                            totalItems={displayItems.length}
                            itemsPerPage={itemsPerPage}
                            onPageChange={pagination.goToPage}
                            goToPreviousPage={pagination.goToPreviousPage}
                            goToNextPage={pagination.goToNextPage}
                            goToFirstPage={pagination.goToFirstPage}
                            goToLastPage={pagination.goToLastPage}
                            hasNextPage={pagination.hasNextPage}
                            hasPreviousPage={pagination.hasPreviousPage}
                            getPageNumbers={pagination.getPageNumbers}
                        />
                    )}
                </>
            )}
        </div>
    );
});

FeedDisplay.displayName = 'FeedDisplay';


export default FeedDisplay;
