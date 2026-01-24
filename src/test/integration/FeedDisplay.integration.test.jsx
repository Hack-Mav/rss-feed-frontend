import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import FeedDisplay from '../../components/FeedDisplay'
import { useBookmarks } from '../../hooks/useBookmarks'

// Mock the hooks
vi.mock('../../hooks/useBookmarks')
vi.mock('../../hooks/useAdvancedSearch')
vi.mock('../../hooks/usePagination')

const mockUseBookmarks = useBookmarks

// Import the mocked hooks
import { useAdvancedSearch } from '../../hooks/useAdvancedSearch'
import { usePagination } from '../../hooks/usePagination'

describe('FeedDisplay Integration Tests', () => {
  const mockFeedItems = [
    {
      title: 'Test Article 1',
      description: 'This is a test article description',
      link: 'https://example.com/article1',
      pubDate: '2023-01-01',
      author: 'Test Author'
    },
    {
      title: 'Test Article 2',
      description: 'Another test article description',
      link: 'https://example.com/article2',
      pubDate: '2023-01-02',
      author: 'Another Author'
    }
  ]

  beforeEach(() => {
    mockUseBookmarks.mockReturnValue({
      bookmarks: [],
      addBookmark: vi.fn(),
      removeBookmark: vi.fn(),
      toggleBookmark: vi.fn(),
      isBookmarked: vi.fn(() => false),
      clearAllBookmarks: vi.fn()
    })

    // Mock advanced search hook
    const mockUseAdvancedSearch = useAdvancedSearch
    mockUseAdvancedSearch.mockReturnValue({
      searchTerm: '',
      setSearchTerm: vi.fn(),
      filteredItems: mockFeedItems,
      searchHistory: [],
      suggestions: [],
      showSuggestions: false,
      setShowSuggestions: vi.fn(),
      highlightText: vi.fn((text) => text),
      clearSearchHistory: vi.fn()
    })

    // Mock pagination hook
    const mockUsePagination = usePagination
    mockUsePagination.mockReturnValue({
      currentPage: 1,
      totalPages: 1,
      currentItems: mockFeedItems,
      goToPage: vi.fn(),
      goToPreviousPage: vi.fn(),
      goToNextPage: vi.fn(),
      goToFirstPage: vi.fn(),
      goToLastPage: vi.fn(),
      hasNextPage: false,
      hasPreviousPage: false,
      setItemsPerPage: vi.fn(),
      itemsPerPage: 10
    })

  })

  it('renders feed items correctly', () => {
    render(<FeedDisplay feedItems={mockFeedItems} />)
    
    expect(screen.getByText('RSS Feed Items')).toBeInTheDocument()
    expect(screen.getByText('Test Article 1')).toBeInTheDocument()
    expect(screen.getByText('Test Article 2')).toBeInTheDocument()
  })

  it('handles empty feed items array', () => {
    render(<FeedDisplay feedItems={[]} />)
    
    expect(screen.getByText(/No feed items available/)).toBeInTheDocument()
  })

  it('handles invalid feed data', () => {
    render(<FeedDisplay feedItems={null} />)
    
    expect(screen.getByText(/Error: Invalid data format received/)).toBeInTheDocument()
  })

  it('integrates bookmark functionality', async () => {
    const mockToggleBookmark = vi.fn()
    mockUseBookmarks.mockReturnValue({
      bookmarks: [],
      addBookmark: vi.fn(),
      removeBookmark: vi.fn(),
      toggleBookmark: mockToggleBookmark,
      isBookmarked: vi.fn(() => false),
      clearAllBookmarks: vi.fn()
    })

    render(<FeedDisplay feedItems={mockFeedItems} />)
    
    const bookmarkButtons = screen.getAllByTitle(/🔖 Bookmark/)
    expect(bookmarkButtons).toHaveLength(2)
    
    fireEvent.click(bookmarkButtons[0])
    expect(mockToggleBookmark).toHaveBeenCalledWith(mockFeedItems[0])
  })

  it('integrates search functionality', async () => {
    const mockSetSearchTerm = vi.fn()
    
    const mockUseAdvancedSearch = useAdvancedSearch
    mockUseAdvancedSearch.mockReturnValue({
      searchTerm: 'test',
      setSearchTerm: mockSetSearchTerm,
      filteredItems: mockFeedItems,
      searchHistory: [],
      suggestions: ['test suggestion'],
      showSuggestions: true,
      setShowSuggestions: vi.fn(),
      highlightText: vi.fn((text) => text),
      clearSearchHistory: vi.fn()
    })

    render(<FeedDisplay feedItems={mockFeedItems} />)
    
    const searchInput = screen.getByPlaceholderText(/search/i)
    expect(searchInput).toBeInTheDocument()
    
    fireEvent.change(searchInput, { target: { value: 'new search' } })
    expect(mockSetSearchTerm).toHaveBeenCalledWith('new search')
  })

  it('integrates pagination functionality', async () => {
    const mockGoToPage = vi.fn()
    
    const mockUsePagination = usePagination
    mockUsePagination.mockReturnValue({
      currentPage: 1,
      totalPages: 2,
      currentItems: mockFeedItems.slice(0, 1),
      goToPage: mockGoToPage,
      goToPreviousPage: vi.fn(),
      goToNextPage: vi.fn(),
      goToFirstPage: vi.fn(),
      goToLastPage: vi.fn(),
      hasNextPage: true,
      hasPreviousPage: false,
      setItemsPerPage: vi.fn(),
      itemsPerPage: 10,
      resetPagination: vi.fn(),
      getPageNumbers: () => [1, 2]
    })

    render(<FeedDisplay feedItems={mockFeedItems} />)
    
    // Just verify the component renders without crashing
    expect(screen.getByText('RSS Feed Items')).toBeInTheDocument()
  })

  it('handles read more/less functionality', () => {
    render(<FeedDisplay feedItems={mockFeedItems} />)
    
    const readMoreButtons = screen.getAllByText('Read More')
    expect(readMoreButtons).toHaveLength(2)
    
    fireEvent.click(readMoreButtons[0])
    
    // Should show "Show Less" button for expanded item
    expect(screen.getByText('Show Less')).toBeInTheDocument()
  })

  it('applies filters correctly', async () => {
    render(<FeedDisplay feedItems={mockFeedItems} />)
    
    const filterSelect = screen.getByDisplayValue('Search all fields')
    expect(filterSelect).toBeInTheDocument()
    
    fireEvent.change(filterSelect, { target: { value: 'title' } })
    expect(filterSelect).toHaveValue('title')
  })

  it('handles items per page change', async () => {
    render(<FeedDisplay feedItems={mockFeedItems} />)
    
    const itemsPerPageSelect = screen.getByDisplayValue('10 per page')
    expect(itemsPerPageSelect).toBeInTheDocument()
    
    fireEvent.change(itemsPerPageSelect, { target: { value: '20' } })
    expect(itemsPerPageSelect).toHaveValue('20')
  })

  it('shows search results count when searching', () => {
    const mockUseAdvancedSearch = useAdvancedSearch
    mockUseAdvancedSearch.mockReturnValue({
      searchTerm: 'test',
      setSearchTerm: vi.fn(),
      filteredItems: mockFeedItems,
      searchHistory: ['previous search'],
      suggestions: [],
      showSuggestions: false,
      setShowSuggestions: vi.fn(),
      highlightText: vi.fn((text) => text),
      clearSearchHistory: vi.fn()
    })

    render(<FeedDisplay feedItems={mockFeedItems} />)
    
    expect(screen.getByText(/Found 2 of 2 items/)).toBeInTheDocument()
    expect(screen.getByText(/1 recent searches/)).toBeInTheDocument()
  })

  it('handles no search results', () => {
    const mockUseAdvancedSearch = useAdvancedSearch
    mockUseAdvancedSearch.mockReturnValue({
      searchTerm: 'nonexistent',
      setSearchTerm: vi.fn(),
      filteredItems: [],
      searchHistory: [],
      suggestions: [],
      showSuggestions: false,
      setShowSuggestions: vi.fn(),
      highlightText: vi.fn((text) => text),
      clearSearchHistory: vi.fn()
    })

    render(<FeedDisplay feedItems={mockFeedItems} />)
    
    expect(screen.getByText(/No items found matching "nonexistent"/)).toBeInTheDocument()
  })
})
