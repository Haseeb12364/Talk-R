import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Avatar } from '@/components/Avatar';
import { colors } from '@/theme/colors';
import type { Conversation } from '../types';

type ChatRowProps = {
  conversation: Conversation;
  onPress: (conversation: Conversation) => void;
};

export function ChatRow({ conversation, onPress }: ChatRowProps) {
  const isUnread = Boolean(conversation.unread);

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
          <Text numberOfLines={1} style={[styles.name, isUnread && styles.nameUnread]}>{conversation.name}</Text>
          <Text style={[styles.time, isUnread && styles.timeUnread]}>{conversation.time}</Text>
        </View>
        <View style={styles.previewLine}>
          <Text numberOfLines={1} style={[styles.preview, isUnread && styles.previewUnread]}>
            {conversation.delivered ? <Text style={styles.checks}>✓✓ </Text> : null}{conversation.message}
          </Text>
          {conversation.unread ? <View style={styles.unreadBadge}><Text style={styles.unreadCount}>{conversation.unread}</Text></View> : null}
          {conversation.muted ? <Text style={styles.mutedIcon}>⌁</Text> : null}
        </View>
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
  nameUnread: { color: colors.text, fontWeight: '700' },
  time: { color: colors.textMuted, fontSize: 10, marginLeft: 8 },
  timeUnread: { color: '#78957E', fontWeight: '600' },
  previewLine: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  preview: { flex: 1, color: '#91938D', fontSize: 11.5, letterSpacing: 0.05 },
  previewUnread: { color: '#646861', fontWeight: '500' },
  checks: { color: '#85A993', fontSize: 10, fontWeight: '700' },
  unreadBadge: { minWidth: 19, height: 19, paddingHorizontal: 5, borderRadius: 10, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', marginLeft: 8 },
  unreadCount: { color: '#FFFFFF', fontSize: 9, fontWeight: '700' },
  mutedIcon: { color: '#A5A79F', marginLeft: 7, fontSize: 15 },
});
