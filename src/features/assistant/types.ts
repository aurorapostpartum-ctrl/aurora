export interface SourceReference {
  id: string;
  label: string;
  snippet: string;
}

export type MessageStatus = 'complete' | 'streaming' | 'error';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
  status: MessageStatus;
  sources?: SourceReference[];
  bookmarked?: boolean;
}

export interface Conversation {
  id: string;
  title: string;
  updatedAt: string;
  messages: ChatMessage[];
}
