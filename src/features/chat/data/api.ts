import type { RealtimeChannel } from '@supabase/supabase-js';
import type { ChatMessage, ChatUser, Conversation, Workspace, WorkspaceInvite, WorkspaceMember } from '@/features/chat/types';
import { requireSupabase } from '@/lib/supabase';

type ConversationRow = {
  id: string;
  title: string;
  is_group: boolean;
  peer_id: string | null;
  peer_email: string | null;
  peer_name: string | null;
  peer_avatar_url: string | null;
  last_message: string | null;
  last_message_at: string | null;
};

type MessageRow = {
  id: string;
  sender_id: string;
  body: string;
  created_at: string;
};

function initials(name: string) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase() ?? '').join('') || '?';
}

function formatTime(value: string | null) {
  if (!value) return '';
  const date = new Date(value);
  const now = new Date();
  if (date.toDateString() === now.toDateString()) {
    return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  }
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

export async function listConversations(): Promise<Conversation[]> {
  const { data, error } = await requireSupabase().rpc('get_my_conversations');
  if (error) throw error;
  return ((data ?? []) as ConversationRow[]).map((row) => {
    const name = row.is_group ? row.title : row.peer_name || row.title || 'Conversation';
    return {
      id: row.id,
      name,
      initials: initials(name),
      color: '#9DB8A4',
      message: row.last_message || 'Start a conversation',
      time: formatTime(row.last_message_at),
      peerId: row.peer_id ?? undefined,
      peerEmail: row.peer_email ?? undefined,
      avatarUrl: row.peer_avatar_url,
    };
  });
}

export async function listWorkspaces(): Promise<Workspace[]> {
  const { data, error } = await requireSupabase().rpc('get_my_workspaces');
  if (error) throw error;
  return (data ?? []).map((row: { id: string; name: string; conversation_id: string; member_count: number; created_at: string }) => ({
    id: row.id,
    name: row.name,
    conversationId: row.conversation_id,
    memberCount: Number(row.member_count),
    createdAt: row.created_at,
  }));
}

export async function createWorkspace(name: string): Promise<Workspace> {
  const { data, error } = await requireSupabase().rpc('create_workspace', { workspace_name: name.trim() });
  if (error) throw error;
  const row = data?.[0] as { workspace_id: string; conversation_id: string } | undefined;
  if (!row) throw new Error('Could not create the workspace.');
  return { id: row.workspace_id, name: name.trim(), conversationId: row.conversation_id, memberCount: 1, createdAt: new Date().toISOString() };
}

export async function listWorkspaceInvites(): Promise<WorkspaceInvite[]> {
  const { data, error } = await requireSupabase().rpc('list_workspace_invites');
  if (error) throw error;
  return (data ?? []).map((row: { id: string; workspace_id: string; workspace_name: string; inviter_name: string; created_at: string }) => ({
    id: row.id,
    workspaceId: row.workspace_id,
    workspaceName: row.workspace_name,
    inviterName: row.inviter_name,
    createdAt: row.created_at,
  }));
}

export async function acceptWorkspaceInvite(inviteId: string) {
  const { data, error } = await requireSupabase().rpc('accept_workspace_invite', { target_invite: inviteId });
  if (error) throw error;
  const row = data?.[0] as { workspace_id: string; conversation_id: string } | undefined;
  if (!row) throw new Error('Could not accept this invitation.');
  return { workspaceId: row.workspace_id, conversationId: row.conversation_id };
}

export async function listWorkspaceMembers(workspaceId: string): Promise<WorkspaceMember[]> {
  const { data, error } = await requireSupabase().rpc('get_workspace_members', { target_workspace: workspaceId });
  if (error) throw error;
  return (data ?? []).map((row: { user_id: string; email: string; display_name: string; avatar_url: string | null; role: WorkspaceMember['role']; joined_at: string }) => ({
    userId: row.user_id,
    email: row.email,
    displayName: row.display_name,
    avatarUrl: row.avatar_url,
    role: row.role,
    joinedAt: row.joined_at,
  }));
}

export async function sendWorkspaceInvite(workspaceId: string, email: string) {
  const { data, error } = await requireSupabase().functions.invoke('invite-workspace-member', {
    body: { workspaceId, email: email.trim() },
  });
  if (error) throw error;
  return data as { inviteId: string };
}

export async function searchUsers(searchTerm: string): Promise<ChatUser[]> {
  const normalized = searchTerm.trim();
  if (normalized.length < 2) return [];
  const { data, error } = await requireSupabase().rpc('search_users', { search_term: normalized });
  if (error) throw error;
  return (data ?? []).map((row: { user_id: string; email: string; display_name: string; avatar_url: string | null }) => ({
    userId: row.user_id,
    email: row.email,
    displayName: row.display_name,
    avatarUrl: row.avatar_url,
  }));
}

export async function openDirectConversation(userId: string) {
  const { data, error } = await requireSupabase().rpc('open_direct_conversation', { other_user_id: userId });
  if (error) throw error;
  if (typeof data !== 'string') throw new Error('Could not open this conversation.');
  return data;
}

function mapMessage(row: MessageRow, currentUserId: string): ChatMessage {
  return {
    id: row.id,
    senderId: row.sender_id,
    sender: row.sender_id === currentUserId ? 'me' : 'them',
    text: row.body,
    time: formatTime(row.created_at),
    createdAt: row.created_at,
  };
}

export async function listMessages(conversationId: string, currentUserId: string): Promise<ChatMessage[]> {
  const { data, error } = await requireSupabase()
    .from('messages')
    .select('id,sender_id,body,created_at')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true });
  if (error) throw error;
  return ((data ?? []) as MessageRow[]).map((row) => mapMessage(row, currentUserId));
}

export async function sendMessage(conversationId: string, senderId: string, body: string): Promise<ChatMessage> {
  const { data, error } = await requireSupabase()
    .from('messages')
    .insert({ conversation_id: conversationId, sender_id: senderId, body })
    .select('id,sender_id,body,created_at')
    .single();
  if (error) throw error;
  return mapMessage(data as MessageRow, senderId);
}

export function subscribeToMessages(conversationId: string, onMessage: (message: MessageRow) => void): RealtimeChannel {
  return requireSupabase()
    .channel(`conversation:${conversationId}`)
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'messages',
      filter: `conversation_id=eq.${conversationId}`,
    }, ({ new: row }) => onMessage(row as MessageRow))
    .subscribe();
}

export function subscribeToConversationList(onChange: () => void): RealtimeChannel {
  return requireSupabase()
    .channel('my-conversation-list')
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'messages',
    }, onChange)
    .subscribe();
}

export function parseRealtimeMessage(row: MessageRow, currentUserId: string) {
  return mapMessage(row, currentUserId);
}

