import { StyleSheet, Text, View } from 'react-native';
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
  outgoingBubble: { backgroundColor: '#315B45', borderBottomRightRadius: 6 },
  incomingBubble: { backgroundColor: '#FFFFFF', borderBottomLeftRadius: 6, borderWidth: 1, borderColor: '#ECEDE8' },
  messageText: { color: '#30352F', fontSize: 14, lineHeight: 20 },
  outgoingText: { color: '#FFFFFF' },
  metaRow: { flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', gap: 5, marginTop: 5 },
  time: { color: '#A2A59D', fontSize: 9 },
  outgoingMeta: { color: '#BED1C3' },
});
