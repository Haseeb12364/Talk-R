import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Avatar } from '@/components/Avatar';
import { colors } from '@/theme/colors';
import type { Conversation } from '../types';

type ChatRowProps = {
  conversation: Conversation;
  onPress: (conversation: Conversation) => void;
};

export function ChatRow({ conversation, onPress }: ChatRowProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Open conversation with ${conversation.name}`}
      onPress={() => onPress(conversation)}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
    >
      <Avatar person={conversation} size={56} showOnline />
      <View style={styles.copy}>
        <View style={styles.titleLine}>
          <Text numberOfLines={1} style={styles.name}>{conversation.name}</Text>
          <Text style={styles.time}>{conversation.time}</Text>
        </View>
        <Text numberOfLines={1} style={styles.preview}>{conversation.message}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { height: 78, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 4 },
  pressed: { opacity: 0.7 },
  copy: { flex: 1, height: '100%', marginLeft: 14, justifyContent: 'center', borderBottomWidth: 1, borderBottomColor: colors.border },
  titleLine: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 },
  name: { flex: 1, color: '#363A34', fontSize: 14, fontWeight: '600', letterSpacing: -0.15 },
  time: { color: colors.textMuted, fontSize: 10, marginLeft: 8 },
  preview: { color: '#91938D', fontSize: 11.5, letterSpacing: 0.05 },
});
