export interface FeedItem {
  Title?: string;
  title?: string;
  Description?: string;
  description?: string;
  Link?: string;
  link?: string;
  PubDate?: string;
  pubDate?: string;
  Author?: string;
  author?: string;
}

export interface ValidatedFeedItem {
  title: string;
  description: string;
  link: string;
  pubDate: string | undefined;
  author: string | undefined;
}

export interface FeedState {
  feedItems: FeedItem[];
  loading: boolean;
  error: string | null;
  retryCount: number;
  isInitialLoad: boolean;
}

export type FilterBy = 'all' | 'title' | 'description';

export interface SearchHistory {
  id: string;
  query: string;
  timestamp: number;
}

export interface SearchSuggestion {
  text: string;
  type: 'history' | 'suggestion';
}

export interface SearchOperators {
  AND: boolean;
  OR: boolean;
  NOT: boolean;
}

export interface FeedCategory {
  id: string;
  name: string;
  color: string;
  description?: string;
  createdAt: number;
}

export interface ManagedFeed {
  id: string;
  url: string;
  title: string;
  description?: string;
  categoryId?: string;
  isActive: boolean;
  refreshInterval: number; // in minutes
  lastRefreshed?: number;
  createdAt: number;
  updatedAt: number;
}

export interface FeedSchedule {
  feedId: string;
  interval: number; // in minutes
  lastRun: number;
  nextRun: number;
  isActive: boolean;
}

export interface FeedExportData {
  feeds: ManagedFeed[];
  categories: FeedCategory[];
  exportDate: number;
  version: string;
}
