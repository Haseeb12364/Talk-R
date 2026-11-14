import { StyleSheet, Text, View } from 'react-native';
import { colors } from '@/utils/theme';
import type { ChatMessage } from '../types';

type MessageBubbleProps = {
  message: ChatMessage;
};

export function MessageBubble({ message }: MessageBubbleProps) {
  const isOutgoing = message.sender === 'me';

  return (
    <View style={[styles.row, isOutgoing ? styles.outgoingRow : styles.incomingRow]}>
      <View style={[styles.bubble, isOutgoing ? styles.outgoingBubble : styles.incomingBubble]}>
        <Text style={[styles.messageText, isOutgoing && styles.outgoingText]}>{message.text}</Text>
        <View style={styles.metaRow}>
          <Text style={[styles.time, isOutgoing && styles.outgoingMeta]}>{message.time}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { width: '100%', marginVertical: 5 },
  outgoingRow: { alignItems: 'flex-end' },
  incomingRow: { alignItems: 'flex-start' },
  bubble: { maxWidth: '82%', borderRadius: 19, paddingHorizontal: 15, paddingTop: 11, paddingBottom: 8 },
  outgoingBubble: { backgroundColor: colors.primaryDark, borderBottomRightRadius: 6 },
  incomingBubble: { backgroundColor: colors.white, borderBottomLeftRadius: 6, borderWidth: 1, borderColor: colors.borderSubtle },
  messageText: { color: colors.textStrong, fontSize: 14, lineHeight: 20 },
  outgoingText: { color: colors.white },
  metaRow: { flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', gap: 5, marginTop: 5 },
  time: { color: colors.messageTime, fontSize: 9 },
  outgoingMeta: { color: colors.outgoingMeta },
});
