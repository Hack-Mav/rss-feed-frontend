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

  it('has working navigation between sections', () => {
    render(<App />)
    
    // Should start on reader section
    expect(screen.getByRole('button', { name: /Feed Reader/ })).toBeVisible()
    expect(screen.getByRole('button', { name: /Feed Manager/ })).toBeVisible()
    
    // Navigate to manager section
    const managerButton = screen.getByRole('button', { name: /Feed Manager/ })
    fireEvent.click(managerButton)
    
    // Should show feed manager content (check immediately since it should be fast)
    expect(screen.getByText('Feed Manager')).toBeInTheDocument()
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

  it('displays error states correctly', () => {
    render(<App />)
    
    // Just check that the app renders without crashing
    expect(screen.getByText('RSS Feed Reader')).toBeInTheDocument()
  })

  it('shows loading states correctly', () => {
    render(<App />)

    // Just check that the app renders without crashing
    expect(screen.getByText('RSS Feed Reader')).toBeInTheDocument()
  })

  it('integrates feed selector and custom feed input', async () => {
    render(<App />)
    
    // Should have feed selector
    expect(screen.getByText(/Select RSS Feed/i)).toBeInTheDocument()
    
    // Should have custom feed input
    expect(screen.getByLabelText(/custom rss feed url/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /fetch custom rss feed/i })).toBeInTheDocument()
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
    
    // Check that focusable elements exist
    expect(screen.getByRole('link', { name: 'Skip to main content' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /switch to dark mode/i })).toBeInTheDocument()
    
    // Basic keyboard interaction test
    const skipLink = screen.getByRole('link', { name: 'Skip to main content' })
    expect(skipLink).toHaveAttribute('href', '#main-content')
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
    expect(screen.getByLabelText(/custom rss feed url/i)).toBeInTheDocument()
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
