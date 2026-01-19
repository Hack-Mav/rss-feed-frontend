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
