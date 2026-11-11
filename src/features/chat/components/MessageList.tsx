import { FlatList, StyleSheet, Text, View } from 'react-native';
import { colors } from '@/theme/colors';
import type { ChatMessage } from '../types';
import { MessageBubble } from './MessageBubble';

type MessageListProps = {
  messages: ChatMessage[];
};

export function MessageList({ messages }: MessageListProps) {
  const newestFirst = [...messages].reverse();

  return (
    <FlatList
      inverted
      data={newestFirst}
      keyExtractor={(message) => message.id}
      renderItem={({ item }) => <MessageBubble message={item} />}
      contentContainerStyle={styles.content}
      style={styles.list}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      ListEmptyComponent={(
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>Say hello 👋</Text>
          <Text style={styles.emptyCopy}>Start the conversation with a message.</Text>
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  list: { flex: 1 },
  content: { flexGrow: 1, justifyContent: 'flex-end', paddingHorizontal: 18, paddingVertical: 16 },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', transform: [{ scaleY: -1 }] },
  emptyTitle: { color: colors.text, fontSize: 15, fontWeight: '700', marginBottom: 7 },
  emptyCopy: { color: colors.textSecondary, fontSize: 12 },
});
