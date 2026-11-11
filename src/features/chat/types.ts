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
  peerId?: string;
  peerEmail?: string;
  avatarUrl?: string | null;
};

export type ChatUser = {
  userId: string;
  email: string;
  displayName: string;
  avatarUrl: string | null;
};

export type Workspace = {
  id: string;
  name: string;
  conversationId: string;
  memberCount: number;
  createdAt: string;
};

export type WorkspaceInvite = {
  id: string;
  workspaceId: string;
  workspaceName: string;
  inviterName: string;
  createdAt: string;
};

export type WorkspaceMember = ChatUser & {
  role: 'owner' | 'admin' | 'member';
  joinedAt: string;
};

export type ChatFilter = 'All' | 'Unread';

export type ChatMessage = {
  id: string;
  sender: 'me' | 'them';
  senderId?: string;
  text: string;
  time: string;
  createdAt?: string;
};
