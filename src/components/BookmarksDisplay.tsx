import { memo } from 'react';
import { useBookmarks, BookmarkItem } from '../hooks/useBookmarks';

const BookmarksDisplay = memo(() => {
    const { bookmarks, removeBookmark, clearAllBookmarks } = useBookmarks();

    const formatDate = (dateString: string): string => {
        if (!dateString) return "Unknown";
        
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) {
                return dateString;
            }
            return date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (error) {
            console.warn("Error formatting date:", dateString, error);
            return dateString || "Unknown";
        }
    };

    const truncateText = (text: string, limit: number): string => {
        if (!text) return "No description available.";
        if (text.length > limit) {
            return `${text.slice(0, limit)}...`;
        }
        return text;
    };

    if (bookmarks.length === 0) {
        return (
            <div className="bookmarks-container" style={{
                backgroundColor: 'var(--bg-tertiary)',
                padding: 'var(--spacing-lg)',
                borderRadius: 'var(--radius-md)',
                margin: 'var(--spacing-md) 0',
                border: `1px solid var(--border-primary)`
            }}>
                <h3 style={{ margin: '0 0 var(--spacing-md) 0', color: 'var(--text-secondary)' }}>
                    📚 No Bookmarks Yet
                </h3>
                <p style={{ margin: '0', color: 'var(--text-muted)' }}>
                    Start bookmarking articles you want to read later!
                </p>
            </div>
        );
    }

    return (
        <div className="bookmarks-container" style={{
            backgroundColor: 'var(--bg-tertiary)',
            padding: 'var(--spacing-lg)',
            borderRadius: 'var(--radius-md)',
            margin: 'var(--spacing-md) 0',
            border: `1px solid var(--border-primary)`
        }}>
            <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                marginBottom: 'var(--spacing-md)'
            }}>
                <h3 style={{ margin: '0', color: 'var(--text-primary)' }}>
                    📚 Your Bookmarks ({bookmarks.length})
                </h3>
                {bookmarks.length > 0 && (
                    <button
                        onClick={clearAllBookmarks}
                        style={{
                            padding: 'var(--spacing-xs) var(--spacing-sm)',
                            backgroundColor: 'var(--color-danger)',
                            color: 'var(--text-white)',
                            border: 'none',
                            borderRadius: 'var(--radius-sm)',
                            cursor: 'pointer',
                            fontSize: 'var(--font-size-sm)',
                            transition: 'var(--transition-fast)'
                        }}
                        title="Clear all bookmarks"
                    >
                        Clear All
                    </button>
                )}
            </div>
            
            <div className="bookmarks-grid" style={{
                display: 'grid',
                gap: 'var(--spacing-md)',
                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))'
            }}>
                {bookmarks.map((bookmark: BookmarkItem) => (
                    <div 
                        key={bookmark.id}
                        className="bookmark-item"
                        style={{
                            backgroundColor: 'var(--bg-primary)',
                            padding: 'var(--spacing-md)',
                            borderRadius: 'var(--radius-sm)',
                            border: `1px solid var(--border-secondary)`,
                            boxShadow: 'var(--shadow-sm)',
                            transition: 'var(--transition-fast)',
                            position: 'relative'
                        }}
                    >
                        <button
                            onClick={() => removeBookmark(bookmark.id)}
                            style={{
                                position: 'absolute',
                                top: 'var(--spacing-xs)',
                                right: 'var(--spacing-xs)',
                                backgroundColor: 'var(--color-danger)',
                                color: 'var(--text-white)',
                                border: 'none',
                                borderRadius: '50%',
                                width: '1.5rem',
                                height: '1.5rem',
                                cursor: 'pointer',
                                fontSize: '0.75rem',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'var(--transition-fast)'
                            }}
                            title="Remove bookmark"
                            aria-label="Remove bookmark"
                        >
                            ×
                        </button>
                        
                        <h4 style={{ 
                            margin: '0 0 var(--spacing-sm) 0', 
                            color: 'var(--text-primary)',
                            fontSize: 'var(--font-size-base)',
                            paddingRight: '2rem'
                        }}>
                            {bookmark.title}
                        </h4>
                        
                        <p style={{ 
                            margin: '0 0 var(--spacing-sm) 0', 
                            color: 'var(--text-secondary)',
                            fontSize: 'var(--font-size-sm)',
                            lineHeight: '1.4'
                        }}>
                            {truncateText(bookmark.description, 120)}
                        </p>
                        
                        <div style={{ 
                            fontSize: 'var(--font-size-xs)', 
                            color: 'var(--text-muted)',
                            marginBottom: 'var(--spacing-sm)'
                        }}>
                            Bookmarked: {formatDate(bookmark.bookmarkedAt)}
                        </div>
                        
                        <div style={{ display: 'flex', gap: 'var(--spacing-xs)' }}>
                            <a
                                href={bookmark.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                    display: 'inline-block',
                                    padding: 'var(--spacing-xs) var(--spacing-sm)',
                                    backgroundColor: 'var(--color-primary)',
                                    color: 'var(--text-white)',
                                    textDecoration: 'none',
                                    borderRadius: 'var(--radius-sm)',
                                    fontSize: 'var(--font-size-xs)',
                                    transition: 'var(--transition-fast)'
                                }}
                                onClick={(e) => {
                                    if (bookmark.link === '#') {
                                        e.preventDefault();
                                        alert("No valid link available for this bookmark.");
                                    }
                                }}
                            >
                                Read Article
                            </a>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
});

BookmarksDisplay.displayName = 'BookmarksDisplay';

export default BookmarksDisplay;
