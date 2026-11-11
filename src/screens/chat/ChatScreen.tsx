import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { BottomTabBar } from '@/components/BottomTabBar';
import { ChatList } from '@/features/chat/components/ChatList';
import { ChatScreenHeader } from '@/features/chat/components/ChatScreenHeader';
import { ConversationSearch } from '@/features/chat/components/ConversationSearch';
import { OnlineContacts } from '@/features/chat/components/OnlineContacts';
import { conversations } from '@/features/chat/data/conversations';
import type { ChatFilter } from '@/features/chat/types';
import { colors } from '@/theme/colors';

export function ChatScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState('Chats');
  const [filter, setFilter] = useState<ChatFilter>('All');

  const visibleConversations = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return conversations.filter((conversation) => {
      const matchesQuery = `${conversation.name} ${conversation.message}`
        .toLowerCase()
        .includes(normalizedQuery);
      const matchesFilter = filter === 'All' || Boolean(conversation.unread);

      return matchesQuery && matchesFilter;
    });
  }, [filter, query]);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <View style={styles.screen}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <ChatScreenHeader />
          <ConversationSearch value={query} onChangeText={setQuery} />
          <OnlineContacts />
          <ChatList
            conversations={visibleConversations}
            filter={filter}
            onFilterChange={setFilter}
            onOpenConversation={(conversation) => router.push({
              pathname: '/conversation/[id]',
              params: { id: conversation.id },
            })}
          />
        </ScrollView>
        <BottomTabBar activeTab={activeTab} onTabChange={setActiveTab} bottomInset={insets.bottom} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  screen: { flex: 1, backgroundColor: colors.background },
  scrollContent: { paddingBottom: 16 },
});
