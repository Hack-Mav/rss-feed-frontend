import axios from 'axios';

class ApiService {
    constructor() {
        this.baseURL = import.meta.env.VITE_API_URL;
        this.cache = new Map();
        this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
    }

    // Cache management
    getCacheKey(url, params = {}) {
        return `${url}?${JSON.stringify(params)}`;
    }

    isCacheValid(cacheEntry) {
        return Date.now() - cacheEntry.timestamp < this.cacheTimeout;
    }

    getFromCache(key) {
        const entry = this.cache.get(key);
        if (entry && this.isCacheValid(entry)) {
            return entry.data;
        }
        this.cache.delete(key);
        return null;
    }

    setCache(key, data) {
        this.cache.set(key, {
            data,
            timestamp: Date.now()
        });
    }

    clearCache() {
        this.cache.clear();
    }

    // Generic request method with error handling
    async request(url, options = {}) {
        const { method = 'GET', params = {}, data = null, useCache = false } = options;
        
        try {
            // Check cache for GET requests
            if (method === 'GET' && useCache) {
                const cacheKey = this.getCacheKey(url, params);
                const cachedData = this.getFromCache(cacheKey);
                if (cachedData) {
                    return { data: cachedData, cached: true };
                }
            }

            const config = {
                method,
                url: `${this.baseURL}${url}`,
                timeout: 10000, // 10 second timeout
                headers: {
                    'Content-Type': 'application/json',
                }
            };

            if (params && Object.keys(params).length > 0) {
                config.params = params;
            }

            if (data) {
                config.data = data;
            }

            const response = await axios(config);

            // Cache successful GET responses
            if (method === 'GET' && useCache) {
                const cacheKey = this.getCacheKey(url, params);
                this.setCache(cacheKey, response.data);
            }

            return { data: response.data, cached: false };

        } catch (error) {
            console.error(`API Error [${method} ${url}]:`, error);
            
            // Enhanced error handling
            let errorMessage = 'An unexpected error occurred';
            let statusCode = null;

            if (error.response) {
                statusCode = error.response.status;
                errorMessage = this.getErrorMessage(statusCode, error.response.data);
            } else if (error.request) {
                errorMessage = 'Network error. Please check your internet connection.';
            } else {
                errorMessage = error.message || 'Request configuration error';
            }

            return {
                error: {
                    message: errorMessage,
                    status: statusCode,
                    originalError: error
                }
            };
        }
    }

    getErrorMessage(statusCode, responseData) {
        const statusMessages = {
            400: 'Bad request. Please check your input.',
            401: 'Unauthorized. Please check your credentials.',
            403: 'Forbidden. You do not have permission to access this resource.',
            404: 'The requested resource was not found.',
            429: 'Too many requests. Please wait before trying again.',
            500: 'Internal server error. Please try again later.',
            502: 'Bad gateway. The server is temporarily unavailable.',
            503: 'Service unavailable. Please try again later.',
            504: 'Gateway timeout. The request took too long to complete.'
        };

        // Use custom message from response if available
        if (responseData?.message) {
            return responseData.message;
        }

        return statusMessages[statusCode] || `Server error (${statusCode}). Please try again later.`;
    }

    // Specific API methods
    async getFeeds() {
        return this.request('/feeds', { useCache: true });
    }

    async fetchFeed(url) {
        return this.request('/fetch-store', {
            params: { url },
            useCache: false // Don't cache feed fetching as content changes frequently
        });
    }

    // URL validation utility
    validateRSSUrl(url) {
        if (!url || typeof url !== 'string') {
            return { valid: false, error: 'URL is required' };
        }

        const trimmedUrl = url.trim();
        
        try {
            const urlObj = new URL(trimmedUrl);
            
            // Check protocol
            if (!['http:', 'https:'].includes(urlObj.protocol)) {
                return { valid: false, error: 'URL must start with http:// or https://' };
            }
            
            // Check hostname
            if (!urlObj.hostname) {
                return { valid: false, error: 'Invalid URL format' };
            }
            
            // Check for common RSS feed patterns
            const rssPatterns = [
                /\/rss$/i,
                /\/feed$/i,
                /\/atom$/i,
                /\/rss\.xml$/i,
                /\/feed\.xml$/i,
                /\/atom\.xml$/i,
                /\.rss$/i,
                /\.xml$/i
            ];
            
            const hasRssPattern = rssPatterns.some(pattern => pattern.test(urlObj.pathname));
            
            return {
                valid: true,
                url: trimmedUrl,
                isLikelyRss: hasRssPattern
            };
            
        } catch {
            return { valid: false, error: 'Invalid URL format' };
        }
    }

    // Retry mechanism
    async withRetry(requestFn, maxRetries = 3, delay = 1000) {
        let lastError = null;
        
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                const result = await requestFn();
                
                if (result.error && result.error.status >= 500) {
                    // Retry on server errors
                    if (attempt === maxRetries) {
                        return result;
                    }
                    lastError = result.error;
                    await this.delay(delay * attempt); // Exponential backoff
                    continue;
                }
                
                return result;
                
            } catch (error) {
                lastError = error;
                if (attempt === maxRetries) {
                    return {
                        error: {
                            message: `Failed after ${maxRetries} attempts: ${error.message}`,
                            originalError: error
                        }
                    };
                }
                await this.delay(delay * attempt);
            }
        }
        
        return { error: lastError };
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Create singleton instance
const apiService = new ApiService();

export default apiService;
