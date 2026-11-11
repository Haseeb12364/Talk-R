export type Conversation = {
  id: string;
  name: string;
  initials: string;
  color: string;
  message: string;
  time: string;
  unread?: number;
  online?: boolean;
  delivered?: boolean;
  muted?: boolean;
};

export type ChatFilter = 'All' | 'Unread';

export type ChatMessage = {
  id: string;
  sender: 'me' | 'them';
  text: string;
  time: string;
};
