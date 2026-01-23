declare global {
  interface Window {
    analytics?: {
      track: (event: string, properties?: Record<string, any>) => void;
      getAnalyticsInfo?: () => any;
      getPerformanceMetrics?: () => any;
      getSessionId?: () => string;
      getUserId?: () => string | null;
      getEventCount?: () => number;
    };
  }
}

export {};
