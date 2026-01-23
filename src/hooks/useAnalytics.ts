import { useCallback } from 'react';
import analyticsService from '../services/analytics';

export const useAnalytics = () => {
  // Track page views when component mounts or path changes
  const trackPageView = useCallback((path?: string) => {
    analyticsService.trackPageView(path);
  }, []);

  // Track user actions
  const trackUserAction = useCallback((action: string, properties?: Record<string, any>) => {
    analyticsService.trackUserAction(action, properties);
  }, []);

  // Track feed interactions
  const trackFeedInteraction = useCallback((action: string, feedUrl?: string, properties?: Record<string, any>) => {
    analyticsService.trackFeedInteraction(action, feedUrl, properties);
  }, []);

  // Track article interactions
  const trackArticleInteraction = useCallback((action: string, articleUrl?: string, properties?: Record<string, any>) => {
    analyticsService.trackArticleInteraction(action, articleUrl, properties);
  }, []);

  // Track searches
  const trackSearch = useCallback((query: string, resultCount: number, properties?: Record<string, any>) => {
    analyticsService.trackSearch(query, resultCount, properties);
  }, []);

  // Track bookmarks
  const trackBookmark = useCallback((action: 'add' | 'remove', articleUrl: string, properties?: Record<string, any>) => {
    analyticsService.trackBookmark(action, articleUrl, properties);
  }, []);

  // Track custom events
  const track = useCallback((event: string, properties?: Record<string, any>) => {
    analyticsService.track(event, properties);
  }, []);

  // Set user ID
  const setUserId = useCallback((userId: string) => {
    analyticsService.setUserId(userId);
  }, []);

  // Report errors
  const reportError = useCallback((error: Error | string, context?: Record<string, any>) => {
    if (typeof error === 'string') {
      analyticsService.reportError({
        message: error,
        url: window.location.href,
        timestamp: Date.now(),
        userAgent: navigator.userAgent,
        ...context
      });
    } else {
      analyticsService.reportError({
        message: error.message,
        stack: error.stack,
        url: window.location.href,
        timestamp: Date.now(),
        userAgent: navigator.userAgent,
        ...context
      });
    }
  }, []);

  // Get analytics info
  const getAnalyticsInfo = useCallback(() => ({
    sessionId: analyticsService.getSessionId(),
    userId: analyticsService.getUserId(),
    eventCount: analyticsService.getEventCount(),
    performanceMetrics: analyticsService.getPerformanceMetrics()
  }), []);

  return {
    trackPageView,
    trackUserAction,
    trackFeedInteraction,
    trackArticleInteraction,
    trackSearch,
    trackBookmark,
    track,
    setUserId,
    reportError,
    getAnalyticsInfo
  };
};

export default useAnalytics;
