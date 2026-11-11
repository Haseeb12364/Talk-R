import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Avatar } from '@/components/Avatar';
import { colors } from '@/theme/colors';
import type { Conversation } from '../types';

type ConversationHeaderProps = {
  conversation: Conversation;
  onBack: () => void;
};

export function ConversationHeader({ conversation, onBack }: ConversationHeaderProps) {
  return (
    <View style={styles.header}>
      <Pressable accessibilityRole="button" accessibilityLabel="Back to chats" onPress={onBack} style={styles.backButton}>
        <Text style={styles.backIcon}>‹</Text>
      </Pressable>
      <Avatar person={conversation} size={42} showOnline />
      <View style={styles.contactInfo}>
        <Text numberOfLines={1} style={styles.name}>{conversation.name}</Text>
        <Text style={styles.presence}>{conversation.online ? 'Online now' : 'Tap here for contact info'}</Text>
      </View>
      <Pressable accessibilityRole="button" accessibilityLabel="Start a voice call" style={styles.actionButton}>
        <Text style={styles.actionIcon}>☎</Text>
      </Pressable>
      <Pressable accessibilityRole="button" accessibilityLabel="More conversation options" style={styles.moreButton}>
        <Text style={styles.moreIcon}>···</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { minHeight: 70, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, gap: 10, backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.border },
  backButton: { width: 30, height: 42, alignItems: 'center', justifyContent: 'center' },
  backIcon: { color: '#4E6957', fontSize: 37, fontWeight: '300', lineHeight: 40, marginTop: -3 },
  contactInfo: { flex: 1, justifyContent: 'center', marginLeft: 1 },
  name: { color: colors.text, fontSize: 14, fontWeight: '700', marginBottom: 4 },
  presence: { color: '#8A9B8C', fontSize: 10 },
  actionButton: { width: 35, height: 38, alignItems: 'center', justifyContent: 'center' },
  actionIcon: { color: '#587561', fontSize: 18 },
  moreButton: { width: 32, height: 38, alignItems: 'center', justifyContent: 'center' },
  moreIcon: { color: '#758078', fontSize: 19, fontWeight: '700', letterSpacing: 1 },
});
