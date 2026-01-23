import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import App from '../../App'
import * as apiService from '../../services/api'

// Mock the API service
vi.mock('../../services/api')

// Mock the hooks
vi.mock('../../hooks/useFeedState', () => ({
  useFeedState: () => ({
    feedItems: [],
    loading: false,
    error: null,
    retryCount: 0,
    isInitialLoad: false,
    clearError: vi.fn(),
    handleRetry: vi.fn(),
    fetchFeedWithStorage: vi.fn()
  })
}))

describe('App Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  it('renders the main application structure', () => {
    render(<App />)
    
    expect(screen.getByRole('banner')).toBeInTheDocument()
    expect(screen.getByRole('main')).toBeInTheDocument()
    expect(screen.getByRole('navigation')).toBeInTheDocument()
    expect(screen.getByText('RSS Feed Reader')).toBeInTheDocument()
  })

  it('has working navigation between sections', async () => {
    render(<App />)
    
    // Should start on reader section
    expect(screen.getByRole('button', { name: /Feed Reader/ })).toBeVisible()
    expect(screen.getByRole('button', { name: /Feed Manager/ })).toBeVisible()
    
    // Navigate to manager section
    const managerButton = screen.getByRole('button', { name: /Feed Manager/ })
    fireEvent.click(managerButton)
    
    // Should show feed manager content
    await waitFor(() => {
      expect(screen.getByText(/Feed Manager/i)).toBeInTheDocument()
    })
  })

  it('integrates theme toggle functionality', async () => {
    render(<App />)
    
    const themeToggle = screen.getByRole('button', { name: /switch to dark mode/i })
    expect(themeToggle).toBeInTheDocument()
    
    fireEvent.click(themeToggle)
    
    // Should update theme button text
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /switch to light mode/i })).toBeInTheDocument()
    })
  })

  it('displays error states correctly', async () => {
    // Mock useFeedState to return an error
    vi.doMock('../../hooks/useFeedState', () => ({
      useFeedState: () => ({
        feedItems: [],
        loading: false,
        error: 'Network error occurred',
        retryCount: 1,
        isInitialLoad: false,
        clearError: vi.fn(),
        handleRetry: vi.fn(),
        fetchFeedWithStorage: vi.fn()
      })
    }))

    render(<App />)
    
    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument()
      expect(screen.getByText(/Network error occurred/)).toBeInTheDocument()
    })
  })

  it('shows loading states correctly', async () => {
    // Mock useFeedState to show loading
    vi.doMock('../../hooks/useFeedState', () => ({
      useFeedState: () => ({
        feedItems: [],
        loading: true,
        error: null,
        retryCount: 0,
        isInitialLoad: true,
        clearError: vi.fn(),
        handleRetry: vi.fn(),
        fetchFeedWithStorage: vi.fn()
      })
    }))

    render(<App />)
    
    await waitFor(() => {
      expect(screen.getByText(/Fetching RSS feed/)).toBeInTheDocument()
    })
  })

  it('integrates feed selector and custom feed input', async () => {
    render(<App />)
    
    // Should have feed selector
    expect(screen.getByText(/Select RSS Feed/i)).toBeInTheDocument()
    
    // Should have custom feed input
    expect(screen.getByLabelText(/custom rss feed/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /add feed/i })).toBeInTheDocument()
  })

  it('has proper accessibility structure', () => {
    render(<App />)
    
    // Check for skip link
    expect(screen.getByRole('link', { name: 'Skip to main content' })).toBeInTheDocument()
    
    // Check for proper heading structure
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
    
    // Check for landmark roles
    expect(screen.getByRole('banner')).toBeInTheDocument()
    expect(screen.getByRole('main')).toBeInTheDocument()
    expect(screen.getByRole('navigation')).toBeInTheDocument()
  })

  it('handles keyboard navigation', () => {
    render(<App />)
    
    // Tab through elements
    fireEvent.tab()
    expect(screen.getByRole('link', { name: 'Skip to main content' })).toBeFocused()
    
    fireEvent.tab()
    expect(screen.getByRole('button', { name: /switch to dark mode/i })).toBeFocused()
  })

  it('integrates bookmarks section', () => {
    render(<App />)
    
    // Should have bookmarks section
    expect(screen.getByRole('heading', { name: /bookmarks/i })).toBeInTheDocument()
  })

  it('handles offline status', () => {
    render(<App />)
    
    // Should have offline status component
    expect(screen.getByRole('status')).toBeInTheDocument()
  })

  it('has error boundaries for components', () => {
    render(<App />)
    
    // All major components should be wrapped in error boundaries
    // This is tested by ensuring they render without throwing
    expect(screen.getByText(/Select RSS Feed/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/custom rss feed/i)).toBeInTheDocument()
  })

  it('responsive design elements are present', () => {
    render(<App />)
    
    // Should have responsive elements
    const nav = screen.getByRole('navigation')
    expect(nav).toHaveStyle({ display: 'flex' })
    
    // Should have mobile-friendly controls
    expect(screen.getByRole('button', { name: /Feed Reader/ })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Feed Manager/ })).toBeInTheDocument()
  })
})
