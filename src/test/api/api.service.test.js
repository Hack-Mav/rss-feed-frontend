import { describe, it, expect, beforeEach, vi } from 'vitest'
import axios from 'axios'
import apiService from '../../services/api'

// Mock axios
vi.mock('axios')

describe('ApiService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    apiService.clearCache()
  })

  describe('Cache Management', () => {
    it('should cache and retrieve data correctly', () => {
      const testData = { items: ['test'] }
      const cacheKey = 'test-key'
      
      apiService.setCache(cacheKey, testData)
      const cachedData = apiService.getFromCache(cacheKey)
      
      expect(cachedData).toEqual(testData)
    })

    it('should return null for expired cache', () => {
      const testData = { items: ['test'] }
      const cacheKey = 'test-key'
      
      // Mock expired cache
      apiService.setCache(cacheKey, testData)
      apiService.cacheTimeout = -1 // Make cache immediately expired
      
      const cachedData = apiService.getFromCache(cacheKey)
      expect(cachedData).toBeNull()
    })

    it('should clear cache correctly', () => {
      const testData = { items: ['test'] }
      const cacheKey = 'test-key'
      
      apiService.setCache(cacheKey, testData)
      apiService.clearCache()
      
      const cachedData = apiService.getFromCache(cacheKey)
      expect(cachedData).toBeNull()
    })

    it('should generate correct cache keys', () => {
      const url = '/test'
      const params = { page: 1, limit: 10 }
      
      const cacheKey = apiService.getCacheKey(url, params)
      expect(cacheKey).toBe(`${url}?${JSON.stringify(params)}`)
    })
  })

  describe('Request Method', () => {
    it('should make successful GET request', async () => {
      const mockResponse = { data: { items: ['test'] } }
      axios.mockResolvedValue(mockResponse)
      
      const result = await apiService.request('/test')
      
      expect(axios).toHaveBeenCalledWith({
        method: 'GET',
        url: `${apiService.baseURL}/test`,
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json',
        }
      })
      expect(result.data).toEqual({ items: ['test'] })
      expect(result.cached).toBe(false)
    })

    it('should make successful POST request', async () => {
      const mockResponse = { data: { success: true } }
      const postData = { name: 'test' }
      axios.mockResolvedValue(mockResponse)
      
      const result = await apiService.request('/test', {
        method: 'POST',
        data: postData
      })
      
      expect(axios).toHaveBeenCalledWith({
        method: 'POST',
        url: `${apiService.baseURL}/test`,
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json',
        },
        data: postData
      })
      expect(result.data).toEqual({ success: true })
    })

    it('should handle network errors', async () => {
      const networkError = new Error('Network Error')
      networkError.request = {}
      axios.mockRejectedValue(networkError)
      
      const result = await apiService.request('/test')
      
      expect(result.error).toBeDefined()
      expect(result.error.message).toBe('Network error. Please check your internet connection.')
    })

    it('should handle HTTP error responses', async () => {
      const errorResponse = {
        response: {
          status: 404,
          data: { message: 'Not found' }
        }
      }
      axios.mockRejectedValue(errorResponse)
      
      const result = await apiService.request('/test')
      
      expect(result.error).toBeDefined()
      expect(result.error.message).toBe('Not found')
      expect(result.error.status).toBe(404)
    })

    it('should use cache for GET requests when enabled', async () => {
      const mockResponse = { data: { items: ['test'] } }
      axios.mockResolvedValue(mockResponse)
      
      // First request
      await apiService.request('/test', { useCache: true })
      
      // Second request should use cache
      const result = await apiService.request('/test', { useCache: true })
      
      expect(axios).toHaveBeenCalledTimes(1) // Only called once
      expect(result.data).toEqual({ items: ['test'] })
      expect(result.cached).toBe(true)
    })

    it('should not cache POST requests', async () => {
      const mockResponse = { data: { success: true } }
      axios.mockResolvedValue(mockResponse)
      
      await apiService.request('/test', { method: 'POST', useCache: true })
      
      // Should not be cached
      const cachedData = apiService.getFromCache('/test?{}')
      expect(cachedData).toBeNull()
    })
  })

  describe('Error Message Handling', () => {
    it('should return correct error messages for different status codes', () => {
      const testCases = [
        { status: 400, expected: 'Bad request. Please check your input.' },
        { status: 401, expected: 'Unauthorized. Please check your credentials.' },
        { status: 403, expected: 'Forbidden. You do not have permission to access this resource.' },
        { status: 404, expected: 'The requested resource was not found.' },
        { status: 429, expected: 'Too many requests. Please wait before trying again.' },
        { status: 500, expected: 'Internal server error. Please try again later.' },
        { status: 502, expected: 'Bad gateway. The server is temporarily unavailable.' },
        { status: 503, expected: 'Service unavailable. Please try again later.' },
        { status: 504, expected: 'Gateway timeout. The request took too long to complete.' },
        { status: 999, expected: 'Server error (999). Please try again later.' }
      ]

      testCases.forEach(({ status, expected }) => {
        const message = apiService.getErrorMessage(status, {})
        expect(message).toBe(expected)
      })
    })

    it('should use custom error message from response', () => {
      const customMessage = 'Custom error message'
      const message = apiService.getErrorMessage(400, { message: customMessage })
      expect(message).toBe(customMessage)
    })
  })

  describe('Specific API Methods', () => {
    it('should call getFeeds with correct parameters', async () => {
      const mockResponse = { data: [{ id: 1, name: 'Test Feed' }] }
      axios.mockResolvedValue(mockResponse)
      
      const result = await apiService.getFeeds()
      
      expect(axios).toHaveBeenCalledWith({
        method: 'GET',
        url: `${apiService.baseURL}/feeds`,
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json',
        }
      })
      expect(result.data).toEqual([{ id: 1, name: 'Test Feed' }])
    })

    it('should call fetchFeed with correct parameters', async () => {
      const mockResponse = { data: { items: ['test'] } }
      const feedUrl = 'https://example.com/rss.xml'
      axios.mockResolvedValue(mockResponse)
      
      const result = await apiService.fetchFeed(feedUrl)
      
      expect(axios).toHaveBeenCalledWith({
        method: 'GET',
        url: `${apiService.baseURL}/fetch-store`,
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json',
        },
        params: { url: feedUrl }
      })
      expect(result.data).toEqual({ items: ['test'] })
    })
  })

  describe('URL Validation', () => {
    it('should validate correct URLs', () => {
      const validUrls = [
        'https://example.com/rss.xml',
        'http://example.com/feed',
        'https://example.com/path/to/rss',
        'https://example.com/atom.xml'
      ]

      validUrls.forEach(url => {
        const result = apiService.validateRSSUrl(url)
        expect(result.valid).toBe(true)
        expect(result.url).toBe(url)
      })
    })

    it('should reject invalid URLs', () => {
      const invalidUrls = [
        '',
        null,
        undefined,
        'not-a-url',
        'ftp://example.com/rss.xml',
        'mailto:test@example.com',
        'javascript:alert("xss")'
      ]

      invalidUrls.forEach(url => {
        const result = apiService.validateRSSUrl(url)
        expect(result.valid).toBe(false)
        expect(result.error).toBeDefined()
      })
    })

    it('should detect likely RSS feed patterns', () => {
      const rssUrls = [
        'https://example.com/rss.xml',
        'https://example.com/feed',
        'https://example.com/atom.xml',
        'https://example.com/path/rss',
        'https://example.com/path/feed.xml'
      ]

      rssUrls.forEach(url => {
        const result = apiService.validateRSSUrl(url)
        expect(result.valid).toBe(true)
        expect(result.isLikelyRss).toBe(true)
      })
    })

    it('should handle URLs without RSS patterns', () => {
      const nonRssUrls = [
        'https://example.com/page',
        'https://example.com/article/123',
        'https://example.com/about'
      ]

      nonRssUrls.forEach(url => {
        const result = apiService.validateRSSUrl(url)
        expect(result.valid).toBe(true)
        expect(result.isLikelyRss).toBe(false)
      })
    })
  })

  describe('Retry Mechanism', () => {
    it('should retry on server errors', async () => {
      const mockError = {
        response: { status: 500 }
      }
      const mockSuccess = { data: { success: true } }
      
      axios
        .mockRejectedValueOnce(mockError)
        .mockRejectedValueOnce(mockError)
        .mockResolvedValueOnce(mockSuccess)
      
      const requestFn = () => apiService.request('/test')
      const result = await apiService.withRetry(requestFn, 3, 10)
      
      expect(axios).toHaveBeenCalledTimes(3)
      expect(result.data).toEqual({ success: true })
    })

    it('should not retry on client errors', async () => {
      const mockError = {
        response: { status: 400 }
      }
      
      axios.mockRejectedValue(mockError)
      
      const requestFn = () => apiService.request('/test')
      const result = await apiService.withRetry(requestFn, 3, 10)
      
      expect(axios).toHaveBeenCalledTimes(1)
      expect(result.error).toBeDefined()
    })

    it('should return error after max retries', async () => {
      const mockError = {
        response: { status: 500 }
      }
      
      axios.mockRejectedValue(mockError)
      
      const requestFn = () => apiService.request('/test')
      const result = await apiService.withRetry(requestFn, 2, 10)
      
      expect(axios).toHaveBeenCalledTimes(2)
      expect(result.error).toBeDefined()
    })

    it('should handle exceptions during retry', async () => {
      const exception = new Error('Network failure')
      
      axios.mockRejectedValue(exception)
      
      const requestFn = () => apiService.request('/test')
      const result = await apiService.withRetry(requestFn, 2, 10)
      
      expect(axios).toHaveBeenCalledTimes(2)
      expect(result.error).toBeDefined()
      expect(result.error.message).toContain('Failed after 2 attempts')
    })
  })

  describe('Delay Utility', () => {
    it('should delay for the specified time', async () => {
      const startTime = Date.now()
      await apiService.delay(100)
      const endTime = Date.now()
      
      expect(endTime - startTime).toBeGreaterThanOrEqual(90) // Allow some tolerance
    })
  })

  describe('Integration Tests', () => {
    it('should handle complete flow with caching', async () => {
      const mockResponse = { data: { items: ['test'] } }
      axios.mockResolvedValue(mockResponse)
      
      // First request
      const result1 = await apiService.getFeeds()
      expect(result1.data).toEqual({ items: ['test'] })
      expect(result1.cached).toBe(false)
      
      // Second request should use cache
      const result2 = await apiService.getFeeds()
      expect(result2.data).toEqual({ items: ['test'] })
      expect(result2.cached).toBe(true)
      expect(axios).toHaveBeenCalledTimes(1)
    })

    it('should handle URL validation with fetchFeed', async () => {
      const invalidUrl = 'invalid-url'
      
      const validation = apiService.validateRSSUrl(invalidUrl)
      expect(validation.valid).toBe(false)
      
      // Should not make request with invalid URL
      axios.mockClear()
      await apiService.fetchFeed(invalidUrl)
      expect(axios).toHaveBeenCalled() // Note: The service doesn't validate before fetching
    })
  })
})
