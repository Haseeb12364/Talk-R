import { StyleSheet, Text, View } from 'react-native';
import type { Conversation } from '@/features/chat/types';
import { ChatRow } from './ChatRow';

type ChatListProps = {
  conversations: Conversation[];
  onOpenConversation: (conversation: Conversation) => void;
};

export function ChatList({ conversations, onOpenConversation }: ChatListProps) {
  return (
    <>
      <View style={styles.sectionHeading}>
        <Text style={styles.sectionTitle}>Recent chats</Text>
      </View>
      <View style={styles.list}>
        {conversations.length > 0 ? conversations.map((conversation) => (
          <ChatRow key={conversation.id} conversation={conversation} onPress={onOpenConversation} />
        )) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No conversations yet</Text>
            <Text style={styles.emptyCopy}>Open People and search for someone by name or email to start a chat.</Text>
          </View>
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  sectionHeading: { paddingHorizontal: 26, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
  sectionTitle: { color: '#282B26', fontSize: 17, fontWeight: '700', letterSpacing: -0.3 },
  list: { paddingHorizontal: 22 },
  emptyState: { alignItems: 'center', paddingVertical: 36 },
  emptyTitle: { color: '#3B4039', fontSize: 14, fontWeight: '700', marginBottom: 6 },
  emptyCopy: { color: '#8D9089', fontSize: 11, textAlign: 'center', lineHeight: 17, maxWidth: 270 },
});
