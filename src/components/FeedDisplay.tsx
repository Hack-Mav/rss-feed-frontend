import { useState, useCallback, memo } from "react";
import type { FeedItem, ValidatedFeedItem, FilterBy } from "../types";
import { useBookmarks } from "../hooks/useBookmarks";
import "../App.css";

interface FeedItemProps {
    item: FeedItem;
    index: number;
    expandedIndex: number | null;
    onReadMore: (index: number) => void;
}

interface FeedDisplayProps {
    feedItems: FeedItem[];
}

// Memoized feed item component for better performance
const FeedItemComponent = memo(({ item, index, expandedIndex, onReadMore }: FeedItemProps) => {
    const { toggleBookmark, isBookmarked } = useBookmarks();
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
        if (!text) return "No description available.";
        if (text.length > limit) {
            return `${text.slice(0, limit)}...`;
        }
        return text;
    }, []);

    const formatDate = useCallback((dateString: string | undefined): string => {
        if (!dateString) return "Unknown";
        
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) {
                return dateString;
            }
            return date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        } catch (error) {
            console.warn("Error formatting date:", dateString, error);
            return dateString || "Unknown";
        }
    }, []);

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
                <h4>⚠️ Invalid Feed Item</h4>
                <p style={{ margin: '0.5rem 0', fontSize: '0.875rem' }}>
                    This feed item could not be processed due to invalid data format.
                </p>
            </div>
        );
    }

    const { title, description, link, pubDate, author } = validatedItem;
    const sanitizedDescription = sanitizeHtml(description);
    const isExpanded = expandedIndex === index;
    const bookmarked = isBookmarked(validatedItem);

    return (
        <div className="feed-item">
            <h3>{title}</h3>
            <p className="feed-description">
                {isExpanded
                    ? sanitizedDescription
                    : truncateText(sanitizedDescription, 200)}
            </p>
            {isExpanded ? (
                <div className="feed-details">
                    <p><strong>Publication Date:</strong> {formatDate(pubDate)}</p>
                    <p><strong>Author:</strong> {author || "Unknown"}</p>
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
                            }
                        }}
                    >
                        Visit Full Article
                    </a>
                    <button 
                        onClick={() => toggleBookmark(validatedItem)}
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
                        title={bookmarked ? "Remove bookmark" : "Bookmark this article"}
                    >
                        {bookmarked ? "📚 Bookmarked" : "🔖 Bookmark"}
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
                        Show Less
                    </button>
                </div>
            ) : (
                <>
                    <button 
                        onClick={() => toggleBookmark(validatedItem)}
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
                        title={bookmarked ? "Remove bookmark" : "Bookmark this article"}
                    >
                        {bookmarked ? "📚 Bookmarked" : "🔖 Bookmark"}
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
                        Read More
                    </button>
                </>
            )}
        </div>
    );
});

FeedItemComponent.displayName = 'FeedItem';

const FeedDisplay = memo(({ feedItems }: FeedDisplayProps) => {
    const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterBy, setFilterBy] = useState<FilterBy>('all');

    const handleReadMore = useCallback((index: number) => {
        setExpandedIndex(prev => prev === index ? null : index);
    }, []);

    const filterFeedItems = useCallback((items: FeedItem[]) => {
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
                    return title.includes(term) || description.includes(term);
            }
        });
    }, [searchTerm, filterBy]);

    const filteredItems = filterFeedItems(feedItems);

    return (
        <div className="feed-container">
            <h2>RSS Feed Items</h2>
            
            {/* Search and Filter Controls */}
            <div className="search-filter-container" style={{
                backgroundColor: '#f8f9fa',
                padding: '1rem',
                borderRadius: '8px',
                margin: '1rem 0',
                border: '1px solid #dee2e6'
            }}>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                    <input
                        type="text"
                        placeholder="Search feed items..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{
                            flex: 1,
                            minWidth: '200px',
                            padding: '0.5rem',
                            border: '1px solid #ccc',
                            borderRadius: '4px',
                            fontSize: '1rem'
                        }}
                    />
                    <select
                        value={filterBy}
                        onChange={(e) => setFilterBy(e.target.value as FilterBy)}
                        style={{
                            padding: '0.5rem',
                            border: '1px solid #ccc',
                            borderRadius: '4px',
                            fontSize: '1rem'
                        }}
                    >
                        <option value="all">All Fields</option>
                        <option value="title">Title Only</option>
                        <option value="description">Description Only</option>
                    </select>
                    {searchTerm && (
                        <div style={{ fontSize: '0.875rem', color: '#666' }}>
                            Found {filteredItems.length} of {feedItems.length} items
                        </div>
                    )}
                </div>
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
                        ⚠️ Error: Invalid data format received. Please try refreshing the feed.
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
                        📭 No feed items available. The feed might be empty or temporarily unavailable.
                    </p>
                </div>
            ) : filteredItems.length === 0 && searchTerm ? (
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
                        🔍 No items found matching "{searchTerm}". Try adjusting your search terms.
                    </p>
                </div>
            ) : (
                <div className="feed-grid">
                    {filteredItems.map((item, index) => (
                        <FeedItemComponent
                            key={index}
                            item={item}
                            index={feedItems.indexOf(item)}
                            expandedIndex={expandedIndex}
                            onReadMore={handleReadMore}
                        />
                    ))}
                </div>
            )}
        </div>
    );
});

FeedDisplay.displayName = 'FeedDisplay';


export default FeedDisplay;
