export interface RecentSearch {
  id: string;
  query: string;
  searchedAt: string;
}

export interface SavedCode {
  id: string;
  code: string;
  title: string;
  trade: string;
}

export interface PinnedDocument {
  id: string;
  name: string;
  kind: 'pdf' | 'doc' | 'sheet';
}

export interface NotificationItem {
  id: string;
  title: string;
  body: string;
  read: boolean;
  created_at: string;
}
