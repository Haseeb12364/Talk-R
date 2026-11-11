import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Avatar } from '@/components/Avatar';
import type { TabName } from '@/components/BottomTabBar';
import { acceptWorkspaceInvite, createWorkspace, listWorkspaceInvites, listWorkspaces, openDirectConversation, searchUsers, sendWorkspaceInvite } from '@/features/chat/data/api';
import type { ChatUser, Workspace, WorkspaceInvite } from '@/features/chat/types';
import { useAuth } from '@/auth/AuthProvider';
import { colors } from '@/theme/colors';

type SecondaryTabScreenProps = {
  tab: Exclude<TabName, 'Chats'>;
  onOpenConversation: (conversationId: string) => void;
};

function getInitials(name: string) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase() ?? '').join('') || '?';
}

export function SecondaryTabScreen({ tab, onOpenConversation }: SecondaryTabScreenProps) {
  const { user, signOut } = useAuth();
  const [query, setQuery] = useState('');
  const [users, setUsers] = useState<ChatUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [openingUserId, setOpeningUserId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [signOutError, setSignOutError] = useState('');
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [invites, setInvites] = useState<WorkspaceInvite[]>([]);
  const [newWorkspaceName, setNewWorkspaceName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [invitingWorkspaceId, setInvitingWorkspaceId] = useState<string | null>(null);
  const [workspaceBusy, setWorkspaceBusy] = useState(false);
  const [acceptingInviteId, setAcceptingInviteId] = useState<string | null>(null);
  const [workspaceMessage, setWorkspaceMessage] = useState('');

  useEffect(() => {
    if (tab !== 'People') return;
    let active = true;
    Promise.all([listWorkspaces(), listWorkspaceInvites()])
      .then(([workspaceRows, inviteRows]) => {
        if (!active) return;
        setWorkspaces(workspaceRows);
        setInvites(inviteRows);
      })
      .catch((cause: unknown) => {
        if (active) setWorkspaceMessage(cause instanceof Error ? cause.message : 'Could not load workspaces.');
      });
    return () => { active = false; };
  }, [tab]);

  useEffect(() => {
    if (tab !== 'People' || query.trim().length < 2) return;

    let active = true;
    const timeout = setTimeout(() => {
      searchUsers(query)
        .then((results) => { if (active) setUsers(results); })
        .catch((cause: unknown) => { if (active) setError(cause instanceof Error ? cause.message : 'Could not search for users.'); })
        .finally(() => { if (active) setLoading(false); });
    }, 250);

    return () => {
      active = false;
      clearTimeout(timeout);
    };
  }, [query, tab]);

  const title = tab === 'Calls' ? 'Calls' : tab === 'People' ? 'People' : 'Settings';
  const subtitle = tab === 'Calls'
    ? 'Stay close, wherever you are.'
    : tab === 'People'
      ? 'Search for someone by name or Gmail address.'
      : 'Make Talk R work for you.';

  const handleOpenUser = async (person: ChatUser) => {
    setOpeningUserId(person.userId);
    setError('');
    try {
      const conversationId = await openDirectConversation(person.userId);
      onOpenConversation(conversationId);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not open this conversation.');
    } finally {
      setOpeningUserId(null);
    }
  };

  const handleSearchChange = (value: string) => {
    setQuery(value);
    setUsers([]);
    setError('');
    setLoading(value.trim().length >= 2);
  };

  const handleCreateWorkspace = async () => {
    setWorkspaceBusy(true);
    setWorkspaceMessage('');
    try {
      const workspace = await createWorkspace(newWorkspaceName);
      setWorkspaces((current) => [workspace, ...current]);
      setNewWorkspaceName('');
      onOpenConversation(workspace.conversationId);
    } catch (cause) {
      setWorkspaceMessage(cause instanceof Error ? cause.message : 'Could not create the workspace.');
    } finally {
      setWorkspaceBusy(false);
    }
  };

  const handleSendWorkspaceInvite = async () => {
    if (!invitingWorkspaceId) return;
    setWorkspaceBusy(true);
    setWorkspaceMessage('');
    try {
      await sendWorkspaceInvite(invitingWorkspaceId, inviteEmail);
      setWorkspaceMessage(`Invitation sent to ${inviteEmail.trim()}.`);
      setInviteEmail('');
      setInvitingWorkspaceId(null);
    } catch (cause) {
      setWorkspaceMessage(cause instanceof Error ? cause.message : 'Could not send the invitation.');
    } finally {
      setWorkspaceBusy(false);
    }
  };

  const handleAcceptInvite = async (invite: WorkspaceInvite) => {
    setAcceptingInviteId(invite.id);
    setWorkspaceMessage('');
    try {
      const accepted = await acceptWorkspaceInvite(invite.id);
      setInvites((current) => current.filter((item) => item.id !== invite.id));
      onOpenConversation(accepted.conversationId);
    } catch (cause) {
      setWorkspaceMessage(cause instanceof Error ? cause.message : 'Could not accept this invitation.');
    } finally {
      setAcceptingInviteId(null);
    }
  };

  const displayName = user?.user_metadata.full_name || user?.user_metadata.name || user?.email?.split('@')[0] || 'Talk R user';
  const avatarUrl = typeof user?.user_metadata.avatar_url === 'string'
    ? user.user_metadata.avatar_url
    : typeof user?.user_metadata.picture === 'string' ? user.user_metadata.picture : undefined;

  return (
    <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
      <View style={styles.heading}>
        <Text style={styles.eyebrow}>TALK R</Text>
        <Text style={styles.title}>{title}<Text style={styles.period}>.</Text></Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>

      {tab === 'People' && (
        <View style={styles.peopleSection}>
          <Text style={styles.sectionTitle}>Workspaces</Text>
          <View style={styles.createWorkspaceRow}>
            <TextInput
              accessibilityLabel="Workspace name"
              maxLength={60}
              onChangeText={setNewWorkspaceName}
              placeholder="New workspace name"
              placeholderTextColor="#9A9A96"
              style={styles.workspaceInput}
              value={newWorkspaceName}
            />
            <Pressable disabled={workspaceBusy || newWorkspaceName.trim().length < 2} onPress={() => { void handleCreateWorkspace(); }} style={[styles.createButton, (workspaceBusy || newWorkspaceName.trim().length < 2) && styles.disabled]}>
              <Text style={styles.createButtonText}>{workspaceBusy ? '…' : 'Create'}</Text>
            </Pressable>
          </View>
          {workspaces.map((workspace) => (
            <View key={workspace.id} style={styles.workspaceCard}>
              <Pressable onPress={() => onOpenConversation(workspace.conversationId)} style={styles.workspaceMain}>
                <View style={styles.workspaceIcon}><Text style={styles.workspaceIconText}>{getInitials(workspace.name).slice(0, 1)}</Text></View>
                <View style={styles.personInfo}>
                  <Text numberOfLines={1} style={styles.personName}>{workspace.name}</Text>
                  <Text style={styles.personStatus}>{workspace.memberCount} {workspace.memberCount === 1 ? 'member' : 'members'}</Text>
                </View>
                <Text style={styles.chevron}>›</Text>
              </Pressable>
              <Pressable onPress={() => { setInvitingWorkspaceId(invitingWorkspaceId === workspace.id ? null : workspace.id); setWorkspaceMessage(''); }} style={styles.inviteLink}>
                <Text style={styles.inviteLinkText}>{invitingWorkspaceId === workspace.id ? 'Close invite' : 'Invite by email'}</Text>
              </Pressable>
              {invitingWorkspaceId === workspace.id && (
                <View style={styles.inviteForm}>
                  <TextInput autoCapitalize="none" autoCorrect={false} keyboardType="email-address" onChangeText={setInviteEmail} placeholder="name@gmail.com" placeholderTextColor="#9A9A96" style={styles.workspaceInput} value={inviteEmail} />
                  <Pressable disabled={workspaceBusy || !inviteEmail.trim()} onPress={() => { void handleSendWorkspaceInvite(); }} style={[styles.createButton, (workspaceBusy || !inviteEmail.trim()) && styles.disabled]}>
                    <Text style={styles.createButtonText}>{workspaceBusy ? '…' : 'Send'}</Text>
                  </Pressable>
                </View>
              )}
            </View>
          ))}
          {invites.length > 0 && <Text style={[styles.sectionTitle, styles.invitesTitle]}>Invitations</Text>}
          {invites.map((invite) => (
            <View key={invite.id} style={styles.inviteCard}>
              <View style={styles.personInfo}>
                <Text style={styles.personName}>{invite.workspaceName}</Text>
                <Text style={styles.personStatus}>Invited by {invite.inviterName}</Text>
              </View>
              <Pressable disabled={acceptingInviteId === invite.id} onPress={() => { void handleAcceptInvite(invite); }} style={styles.acceptButton}>
                <Text style={styles.acceptText}>{acceptingInviteId === invite.id ? '…' : 'Accept'}</Text>
              </Pressable>
            </View>
          ))}
          {workspaceMessage ? <Text style={styles.feedback}>{workspaceMessage}</Text> : null}

          <Text style={[styles.sectionTitle, styles.findPeopleTitle]}>Find people</Text>
          <View style={styles.searchBox}>
            <TextInput
              accessibilityLabel="Search users by name or email"
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              onChangeText={handleSearchChange}
              placeholder="Name or Gmail address"
              placeholderTextColor="#9A9A96"
              style={styles.searchInput}
              value={query}
            />
            {loading && <ActivityIndicator size="small" color="#547561" />}
          </View>
          {error ? <Text style={styles.error}>{error}</Text> : null}
          {query.trim().length < 2 ? (
            <Text style={styles.hint}>Search users who have already signed in to Talk R.</Text>
          ) : !loading && users.length === 0 && !error ? (
            <Text style={styles.hint}>No Talk R users found. Ask them to sign in first.</Text>
          ) : users.map((person) => (
            <Pressable key={person.userId} onPress={() => handleOpenUser(person)} style={styles.personRow}>
              <Avatar person={{ initials: getInitials(person.displayName), color: '#9DB8A4', avatarUrl: person.avatarUrl, online: false }} size={48} />
              <View style={styles.personInfo}>
                <Text style={styles.personName}>{person.displayName}</Text>
                <Text style={styles.personStatus}>{person.email}</Text>
              </View>
              {openingUserId === person.userId
                ? <ActivityIndicator size="small" color="#547561" />
                : <Text style={styles.chevron}>›</Text>}
            </Pressable>
          ))}
        </View>
      )}

      {tab === 'Calls' && (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>No recent calls</Text>
          <Text style={styles.emptyCopy}>Call history will appear here when calling is available.</Text>
        </View>
      )}

      {tab === 'Settings' && (
        <View style={styles.settingsCard}>
          <View style={styles.profileRow}>
            <Avatar person={{ initials: getInitials(displayName), color: '#DEA99A', avatarUrl, online: false }} size={52} />
            <View style={styles.personInfo}>
              <Text style={styles.personName}>{displayName}</Text>
              <Text style={styles.personStatus}>{user?.email}</Text>
            </View>
          </View>
          <Pressable accessibilityRole="button" onPress={() => { setSignOutError(''); void signOut().catch((cause: unknown) => setSignOutError(cause instanceof Error ? cause.message : 'Could not sign out.')); }} style={styles.signOutButton}>
            <Text style={styles.signOutText}>Sign out</Text>
          </Pressable>
          {signOutError ? <Text style={styles.error}>{signOutError}</Text> : null}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { flexGrow: 1, paddingBottom: 24 },
  heading: { paddingHorizontal: 26, paddingTop: 24, paddingBottom: 25 },
  eyebrow: { color: '#999B94', fontSize: 9, fontWeight: '700', letterSpacing: 2.1, marginBottom: 8 },
  title: { color: colors.text, fontSize: 38, fontWeight: '700', letterSpacing: -1.5, lineHeight: 43 },
  period: { color: '#8BAE98' },
  subtitle: { color: colors.textSecondary, fontSize: 13, marginTop: 8 },
  peopleSection: { paddingHorizontal: 22 },
  sectionTitle: { color: colors.text, fontSize: 16, fontWeight: '700', marginBottom: 12 },
  createWorkspaceRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  workspaceInput: { flex: 1, minHeight: 46, paddingHorizontal: 13, borderRadius: 14, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, color: colors.text, fontSize: 12 },
  createButton: { minHeight: 42, minWidth: 68, paddingHorizontal: 12, borderRadius: 13, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primaryDark },
  createButtonText: { color: '#FFFFFF', fontSize: 11, fontWeight: '700' },
  disabled: { opacity: 0.5 },
  workspaceCard: { marginBottom: 10, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 16, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  workspaceMain: { minHeight: 52, flexDirection: 'row', alignItems: 'center', gap: 10 },
  workspaceIcon: { width: 40, height: 40, borderRadius: 14, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  workspaceIconText: { color: '#547561', fontWeight: '700', fontSize: 15 },
  inviteLink: { alignSelf: 'flex-start', paddingVertical: 7, paddingLeft: 50 },
  inviteLinkText: { color: '#547561', fontSize: 11, fontWeight: '600' },
  inviteForm: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
  invitesTitle: { marginTop: 18 },
  inviteCard: { minHeight: 64, flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 12, marginBottom: 8, borderRadius: 16, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  acceptButton: { minHeight: 36, paddingHorizontal: 14, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primarySoft },
  acceptText: { color: '#547561', fontSize: 11, fontWeight: '700' },
  feedback: { color: '#547561', fontSize: 11, lineHeight: 16, paddingVertical: 7 },
  findPeopleTitle: { marginTop: 20 },
  searchBox: { minHeight: 50, marginBottom: 12, paddingHorizontal: 15, borderRadius: 16, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, flexDirection: 'row', alignItems: 'center' },
  searchInput: { flex: 1, color: colors.text, fontSize: 13, paddingVertical: 12 },
  hint: { color: colors.textSecondary, fontSize: 12, lineHeight: 18, paddingHorizontal: 4, paddingVertical: 12 },
  error: { color: '#B64F47', fontSize: 12, lineHeight: 18, paddingVertical: 8 },
  personRow: { minHeight: 70, flexDirection: 'row', alignItems: 'center', gap: 12, borderBottomWidth: 1, borderBottomColor: colors.border },
  personInfo: { flex: 1 },
  personName: { color: colors.text, fontSize: 14, fontWeight: '600' },
  personStatus: { color: colors.textSecondary, fontSize: 11, marginTop: 4 },
  chevron: { color: '#A1A69E', fontSize: 25, paddingHorizontal: 8 },
  emptyCard: { marginHorizontal: 22, marginTop: 16, padding: 28, alignItems: 'center', backgroundColor: colors.surface, borderRadius: 22, borderWidth: 1, borderColor: colors.border },
  emptyTitle: { color: colors.text, fontSize: 16, fontWeight: '700', marginBottom: 8 },
  emptyCopy: { maxWidth: 245, color: colors.textSecondary, fontSize: 12, lineHeight: 18, textAlign: 'center' },
  settingsCard: { marginHorizontal: 22, padding: 16, backgroundColor: colors.surface, borderRadius: 22, borderWidth: 1, borderColor: colors.border },
  profileRow: { minHeight: 70, flexDirection: 'row', alignItems: 'center', gap: 12 },
  signOutButton: { minHeight: 46, justifyContent: 'center', borderTopWidth: 1, borderTopColor: colors.border, marginTop: 12 },
  signOutText: { color: '#A24F48', fontSize: 13, fontWeight: '600' },
});
