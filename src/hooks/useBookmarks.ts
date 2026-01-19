import { useState, useEffect, useCallback } from 'react';

export interface BookmarkItem {
    id: string;
    title: string;
    description: string;
    link: string;
    pubDate: string | null;
    author: string | null;
    bookmarkedAt: string;
}

export interface FeedItem {
    title?: string;
    Title?: string;
    description?: string;
    Description?: string;
    link?: string;
    Link?: string;
    pubDate?: string;
    PubDate?: string;
    author?: string;
    Author?: string;
}

export const useBookmarks = () => {
    const [bookmarks, setBookmarks] = useState<BookmarkItem[]>(() => {
        try {
            const saved = localStorage.getItem('bookmarks');
            return saved ? JSON.parse(saved) : [];
        } catch (error) {
            console.error('Error loading bookmarks:', error);
            return [];
        }
    });

    useEffect(() => {
        try {
            localStorage.setItem('bookmarks', JSON.stringify(bookmarks));
        } catch (error) {
            console.error('Error saving bookmarks:', error);
        }
    }, [bookmarks]);

    const addBookmark = useCallback((item: FeedItem) => {
        const bookmarkItem: BookmarkItem = {
            id: `${item.link || item.title}-${Date.now()}`,
            title: item.title || item.Title || '',
            description: item.description || item.Description || '',
            link: item.link || item.Link || '',
            pubDate: item.pubDate || item.PubDate || null,
            author: item.author || item.Author || null,
            bookmarkedAt: new Date().toISOString()
        };

        setBookmarks(prev => {
            const exists = prev.some(b => b.link === bookmarkItem.link);
            if (exists) return prev;
            return [...prev, bookmarkItem];
        });
    }, []);

    const removeBookmark = useCallback((id: string) => {
        setBookmarks(prev => prev.filter(bookmark => bookmark.id !== id));
    }, []);

    const isBookmarked = useCallback((item: FeedItem): boolean => {
        return bookmarks.some(bookmark => bookmark.link === (item.link || item.Link));
    }, [bookmarks]);

    const toggleBookmark = useCallback((item: FeedItem) => {
        if (isBookmarked(item)) {
            const bookmark = bookmarks.find(b => b.link === (item.link || item.Link));
            if (bookmark) {
                removeBookmark(bookmark.id);
            }
        } else {
            addBookmark(item);
        }
    }, [isBookmarked, addBookmark, removeBookmark, bookmarks]);

    const getBookmarks = useCallback((): BookmarkItem[] => {
        return [...bookmarks].sort((a, b) => 
            new Date(b.bookmarkedAt).getTime() - new Date(a.bookmarkedAt).getTime()
        );
    }, [bookmarks]);

    const clearAllBookmarks = useCallback(() => {
        setBookmarks([]);
    }, []);

    return {
        bookmarks: getBookmarks(),
        addBookmark,
        removeBookmark,
        isBookmarked,
        toggleBookmark,
        clearAllBookmarks
    };
};
