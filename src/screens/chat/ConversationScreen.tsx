import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { ConversationHeader } from '@/features/chat/components/ConversationHeader';
import { MessageComposer } from '@/features/chat/components/MessageComposer';
import { MessageList } from '@/features/chat/components/MessageList';
import { conversations } from '@/features/chat/data/conversations';
import { messagesByConversation } from '@/features/chat/data/messages';
import type { ChatMessage } from '@/features/chat/types';
import { colors } from '@/theme/colors';

type ConversationScreenProps = {
  conversationId: string;
  onBack: () => void;
};

export function ConversationScreen({ conversationId, onBack }: ConversationScreenProps) {
  const insets = useSafeAreaInsets();
  const conversation = conversations.find((item) => item.id === conversationId);
  const [messages, setMessages] = useState<ChatMessage[]>(() => messagesByConversation[conversationId] ?? []);
  const [draft, setDraft] = useState('');

  const handleSend = () => {
    const text = draft.trim();
    if (!text) return;

    const now = new Date();
    const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setMessages((current) => [...current, {
      id: `local-${now.getTime()}`,
      sender: 'me',
      text,
      time,
    }]);
    setDraft('');
  };

  if (!conversation) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right', 'bottom']}>
        <View style={styles.notFound}>
          <Text style={styles.notFoundTitle}>Conversation unavailable</Text>
          <Text style={styles.notFoundCopy}>This chat could not be found.</Text>
          <Pressable accessibilityRole="button" onPress={onBack} style={styles.backToChatsButton}>
            <Text style={styles.backToChatsText}>Back to chats</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <KeyboardAvoidingView
        style={styles.screen}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
      >
        <ConversationHeader conversation={conversation} onBack={onBack} />
        <View style={styles.dayMarker}><Text style={styles.dayText}>TODAY</Text></View>
        <MessageList messages={messages} />
        <View style={[styles.composerDock, { paddingBottom: Math.max(8, insets.bottom) }]}>
          <MessageComposer value={draft} onChangeText={setDraft} onSend={handleSend} />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  screen: { flex: 1, backgroundColor: colors.background },
  dayMarker: { alignSelf: 'center', marginTop: 16, marginBottom: 6, backgroundColor: '#EDF0EB', paddingHorizontal: 11, paddingVertical: 5, borderRadius: 10 },
  dayText: { color: '#8A958B', fontSize: 8, fontWeight: '700', letterSpacing: 1.1 },
  composerDock: { backgroundColor: colors.surface },
  notFound: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 28, backgroundColor: colors.background },
  notFoundTitle: { color: colors.text, fontSize: 19, fontWeight: '700', marginBottom: 8 },
  notFoundCopy: { color: colors.textSecondary, fontSize: 13, marginBottom: 20 },
  backToChatsButton: { backgroundColor: '#315B45', paddingHorizontal: 18, paddingVertical: 11, borderRadius: 13 },
  backToChatsText: { color: '#FFFFFF', fontSize: 12, fontWeight: '700' },
});
