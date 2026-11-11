import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { ChatFilter, Conversation } from '@/features/chat/types';
import { ChatRow } from './ChatRow';

type ChatListProps = {
  conversations: Conversation[];
  filter: ChatFilter;
  onFilterChange: (filter: ChatFilter) => void;
  onOpenConversation: (conversation: Conversation) => void;
};

export function ChatList({ conversations, filter, onFilterChange, onOpenConversation }: ChatListProps) {
  const nextFilter: ChatFilter = filter === 'All' ? 'Unread' : 'All';

  return (
    <>
      <View style={styles.sectionHeading}>
        <Text style={styles.sectionTitle}>Recent chats</Text>
        <Pressable accessibilityRole="button" onPress={() => onFilterChange(nextFilter)}>
          <Text style={styles.filterLabel}>{filter === 'All' ? 'UNREAD  ↗' : 'SHOW ALL  ↗'}</Text>
        </Pressable>
      </View>

      <View style={styles.list}>
        {conversations.length > 0 ? conversations.map((conversation) => (
          <ChatRow key={conversation.id} conversation={conversation} onPress={onOpenConversation} />
        )) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No conversations found</Text>
            <Text style={styles.emptyCopy}>Try another name or switch back to all chats.</Text>
          </View>
        )}
      </View>
      <Text style={styles.endNote}>THAT’S EVERYONE FOR NOW · SAY HI 👋</Text>
    </>
  );
}

const styles = StyleSheet.create({
  sectionHeading: { paddingHorizontal: 26, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
  sectionTitle: { color: '#282B26', fontSize: 17, fontWeight: '700', letterSpacing: -0.3 },
  filterLabel: { color: '#829486', fontSize: 9, fontWeight: '700', letterSpacing: 1.1 },
  list: { paddingHorizontal: 22 },
  emptyState: { alignItems: 'center', paddingVertical: 36 },
  emptyTitle: { color: '#3B4039', fontSize: 14, fontWeight: '700', marginBottom: 6 },
  emptyCopy: { color: '#8D9089', fontSize: 11, textAlign: 'center' },
  endNote: { textAlign: 'center', color: '#B0B2AC', fontSize: 8, fontWeight: '700', letterSpacing: 1.5, marginTop: 21, marginBottom: 12 },
});

