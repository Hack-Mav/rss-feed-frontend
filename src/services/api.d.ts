export interface ApiResponse<T = any> {
  data?: T;
  error?: {
    message: string;
  };
}

export interface ApiService {
  fetchFeed(url: string): Promise<ApiResponse<any[]>>;
  getFeeds(): Promise<ApiResponse<any[]>>;
  withRetry<T>(fn: () => Promise<T>, maxRetries: number): Promise<T>;
  validateRSSUrl(url: string): { valid: boolean; error: string; url: string; isLikelyRss?: boolean };
}

declare const apiService: ApiService;
export default apiService;
