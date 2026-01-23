interface AnalyticsEvent {
  event: string;
  properties?: Record<string, any>;
  timestamp: number;
  userId?: string;
  sessionId: string;
}

interface PerformanceMetrics {
  loadTime: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  cumulativeLayoutShift: number;
  firstInputDelay: number;
}

interface ErrorInfo {
  message: string;
  stack?: string;
  url: string;
  line?: number;
  column?: number;
  timestamp: number;
  userAgent: string;
}

class AnalyticsService {
  private sessionId: string;
  private userId: string | null = null;
  private events: AnalyticsEvent[] = [];
  private performanceMetrics: PerformanceMetrics | null = null;
  private isOnline: boolean = navigator.onLine;
  private endpoint: string = import.meta.env.VITE_ANALYTICS_ENDPOINT || '/api/analytics';

  constructor() {
    this.sessionId = this.generateSessionId();
    this.initializeEventListeners();
    this.collectPerformanceMetrics();
  }

  private generateSessionId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  private initializeEventListeners(): void {
    // Track page visibility changes
    document.addEventListener('visibilitychange', () => {
      this.track('page_visibility_change', {
        hidden: document.hidden
      });
    });

    // Track online/offline status
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.track('connection_restored');
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.track('connection_lost');
    });

    // Track page unload
    window.addEventListener('beforeunload', () => {
      this.track('page_unload');
      this.flush();
    });

    // Track errors
    window.addEventListener('error', (event) => {
      this.reportError({
        message: event.message,
        stack: event.error?.stack,
        url: event.filename,
        line: event.lineno,
        column: event.colno,
        timestamp: Date.now(),
        userAgent: navigator.userAgent
      });
    });

    // Track unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.reportError({
        message: `Unhandled Promise Rejection: ${event.reason}`,
        stack: event.reason?.stack,
        url: window.location.href,
        timestamp: Date.now(),
        userAgent: navigator.userAgent
      });
    });
  }

  private collectPerformanceMetrics(): void {
    if ('performance' in window) {
      // Collect basic navigation timing
      setTimeout(() => {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        if (navigation) {
          this.performanceMetrics = {
            loadTime: navigation.loadEventEnd - navigation.fetchStart,
            firstContentfulPaint: 0,
            largestContentfulPaint: 0,
            cumulativeLayoutShift: 0,
            firstInputDelay: 0
          };
        }

        // Collect Web Vitals if available
        this.collectWebVitals();
      }, 0);
    }
  }

  private collectWebVitals(): void {
    // First Contentful Paint
    if ('PerformanceObserver' in window) {
      try {
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.name === 'first-contentful-paint') {
              this.performanceMetrics!.firstContentfulPaint = entry.startTime;
            }
          }
        });
        observer.observe({ type: 'paint', buffered: true });
      } catch (e) {
        console.warn('PerformanceObserver not supported for paint');
      }

      // Largest Contentful Paint
      try {
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.name === 'largest-contentful-paint') {
              this.performanceMetrics!.largestContentfulPaint = entry.startTime;
            }
          }
        });
        observer.observe({ type: 'largest-contentful-paint', buffered: true });
      } catch (e) {
        console.warn('PerformanceObserver not supported for LCP');
      }

      // Cumulative Layout Shift
      try {
        let clsValue = 0;
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (!(entry as any).hadRecentInput) {
              clsValue += (entry as any).value;
            }
          }
          this.performanceMetrics!.cumulativeLayoutShift = clsValue;
        });
        observer.observe({ type: 'layout-shift', buffered: true });
      } catch (e) {
        console.warn('PerformanceObserver not supported for CLS');
      }

      // First Input Delay
      try {
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            this.performanceMetrics!.firstInputDelay = (entry as any).processingStart - entry.startTime;
          }
        });
        observer.observe({ type: 'first-input', buffered: true });
      } catch (e) {
        console.warn('PerformanceObserver not supported for FID');
      }
    }
  }

  // Public methods
  public setUserId(userId: string): void {
    this.userId = userId;
    this.track('user_identified', { userId });
  }

  public track(event: string, properties?: Record<string, any>): void {
    const analyticsEvent: AnalyticsEvent = {
      event,
      properties: {
        ...properties,
        url: window.location.href,
        userAgent: navigator.userAgent,
        referrer: document.referrer,
        screenResolution: `${screen.width}x${screen.height}`,
        viewportSize: `${window.innerWidth}x${window.innerHeight}`,
        isOnline: this.isOnline,
        language: navigator.language
      },
      timestamp: Date.now(),
      userId: this.userId || undefined,
      sessionId: this.sessionId
    };

    this.events.push(analyticsEvent);

    // Flush events if we have too many or if it's a critical event
    if (this.events.length >= 10 || event.includes('error') || event.includes('crash')) {
      this.flush();
    }
  }

  public trackPageView(path?: string): void {
    this.track('page_view', {
      path: path || window.location.pathname,
      title: document.title
    });
  }

  public trackUserAction(action: string, properties?: Record<string, any>): void {
    this.track('user_action', {
      action,
      ...properties
    });
  }

  public trackFeedInteraction(action: string, feedUrl?: string, properties?: Record<string, any>): void {
    this.track('feed_interaction', {
      action,
      feedUrl,
      ...properties
    });
  }

  public trackArticleInteraction(action: string, articleUrl?: string, properties?: Record<string, any>): void {
    this.track('article_interaction', {
      action,
      articleUrl,
      ...properties
    });
  }

  public trackSearch(query: string, resultCount: number, properties?: Record<string, any>): void {
    this.track('search', {
      query,
      resultCount,
      ...properties
    });
  }

  public trackBookmark(action: 'add' | 'remove', articleUrl: string, properties?: Record<string, any>): void {
    this.track('bookmark', {
      action,
      articleUrl,
      ...properties
    });
  }

  public reportError(errorInfo: ErrorInfo): void {
    this.track('error', {
      ...errorInfo
    });
  }

  public reportPerformance(): void {
    if (this.performanceMetrics) {
      this.track('performance_metrics', this.performanceMetrics);
    }
  }

  private async flush(): Promise<void> {
    if (this.events.length === 0) return;

    const eventsToSend = [...this.events];
    this.events = [];

    try {
      await fetch(this.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          events: eventsToSend,
          sessionId: this.sessionId,
          userId: this.userId
        })
      });
    } catch (error) {
      console.error('Failed to send analytics data:', error);
      // Re-add events to queue if send failed
      this.events.unshift(...eventsToSend);
    }
  }

  public async flushAll(): Promise<void> {
    await this.flush();
  }

  public getEventCount(): number {
    return this.events.length;
  }

  public getSessionId(): string {
    return this.sessionId;
  }

  public getUserId(): string | null {
    return this.userId;
  }

  public getPerformanceMetrics(): PerformanceMetrics | null {
    return this.performanceMetrics;
  }
}

// Create singleton instance
const analyticsService = new AnalyticsService();

export default analyticsService;
