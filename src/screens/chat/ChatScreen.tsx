import { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { BottomTabBar, type TabName } from '@/components/BottomTabBar';
import { ChatList } from '@/features/chat/components/ChatList';
import { ChatScreenHeader } from '@/features/chat/components/ChatScreenHeader';
import { ConversationSearch } from '@/features/chat/components/ConversationSearch';
import { listConversations, subscribeToConversationList } from '@/features/chat/data/api';
import type { Conversation } from '@/features/chat/types';
import { useAuth } from '@/auth/AuthProvider';
import { requireSupabase } from '@/lib/supabase';
import { colors } from '@/theme/colors';
import { SecondaryTabScreen } from './SecondaryTabScreen';

function getInitials(name: string) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase() ?? '').join('') || '?';
}

export function ChatScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState<TabName>('Chats');
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const refreshConversations = useCallback(async () => {
    try {
      const rows = await listConversations();
      setConversations(rows);
      setError('');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not load your conversations.');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => {
    void refreshConversations();
    const channel = subscribeToConversationList(() => { void refreshConversations(); });
    return () => { void requireSupabase().removeChannel(channel); };
  }, [refreshConversations]));

  const visibleConversations = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return conversations;
    return conversations.filter((conversation) =>
      `${conversation.name} ${conversation.peerEmail ?? ''} ${conversation.message}`.toLowerCase().includes(normalizedQuery),
    );
  }, [conversations, query]);

  const displayName = user?.user_metadata.full_name || user?.user_metadata.name || user?.email?.split('@')[0] || 'Talk R user';
  const avatarUrl = typeof user?.user_metadata.avatar_url === 'string'
    ? user.user_metadata.avatar_url
    : typeof user?.user_metadata.picture === 'string' ? user.user_metadata.picture : null;
  const profile = { initials: getInitials(displayName), color: '#DEA99A', online: false, avatarUrl };

  const openConversation = (conversationId: string) => router.push({
    pathname: '/conversation/[id]',
    params: { id: conversationId },
  });

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <View style={styles.screen}>
        {activeTab === 'Chats' ? (
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <ChatScreenHeader profile={profile} conversationCount={conversations.length} />
            <ConversationSearch value={query} onChangeText={setQuery} />
            {loading ? <ActivityIndicator style={styles.loading} color={colors.primaryDark} /> : null}
            {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
            {!loading && !error ? <ChatList conversations={visibleConversations} onOpenConversation={(conversation) => openConversation(conversation.id)} /> : null}
          </ScrollView>
        ) : (
          <SecondaryTabScreen tab={activeTab} onOpenConversation={openConversation} />
        )}
        <BottomTabBar activeTab={activeTab} onTabChange={setActiveTab} bottomInset={insets.bottom} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  screen: { flex: 1, backgroundColor: colors.background },
  scrollContent: { paddingBottom: 16 },
  loading: { marginTop: 28 },
  error: { marginHorizontal: 26, marginTop: 20, color: '#B64F47', fontSize: 12, lineHeight: 18 },
});
