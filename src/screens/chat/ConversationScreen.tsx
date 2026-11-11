import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { ConversationHeader } from '@/features/chat/components/ConversationHeader';
import { MessageComposer } from '@/features/chat/components/MessageComposer';
import { MessageList } from '@/features/chat/components/MessageList';
import { listConversations, listMessages, parseRealtimeMessage, sendMessage, subscribeToMessages } from '@/features/chat/data/api';
import type { ChatMessage, Conversation } from '@/features/chat/types';
import { useAuth } from '@/auth/AuthProvider';
import { requireSupabase } from '@/lib/supabase';
import { colors } from '@/theme/colors';

type ConversationScreenProps = {
  conversationId: string;
  onBack: () => void;
};

export function ConversationScreen({ conversationId, onBack }: ConversationScreenProps) {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  const addMessage = useCallback((message: ChatMessage) => {
    setMessages((current) => current.some((item) => item.id === message.id)
      ? current
      : [...current, message].sort((a, b) => (a.createdAt ?? '').localeCompare(b.createdAt ?? '')));
  }, []);

  useEffect(() => {
    if (!user) return;
    let active = true;
    const client = requireSupabase();

    Promise.all([
      listConversations(),
      listMessages(conversationId, user.id),
    ]).then(([conversations, initialMessages]) => {
      if (!active) return;
      setConversation(conversations.find((item) => item.id === conversationId) ?? null);
      setMessages(initialMessages);
    }).catch((cause: unknown) => {
      if (active) setError(cause instanceof Error ? cause.message : 'Could not load this conversation.');
    }).finally(() => {
      if (active) setLoading(false);
    });

    const channel = subscribeToMessages(conversationId, (row) => {
      if (active) addMessage(parseRealtimeMessage(row, user.id));
    });

    return () => {
      active = false;
      void client.removeChannel(channel);
    };
  }, [addMessage, conversationId, user]);

  const handleSend = async () => {
    const text = draft.trim();
    if (!text || !user || sending) return;
    setSending(true);
    setError('');
    try {
      const sent = await sendMessage(conversationId, user.id, text);
      addMessage(sent);
      setDraft('');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Message could not be sent.');
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return <SafeAreaView style={styles.loading}><ActivityIndicator color={colors.primaryDark} /></SafeAreaView>;
  }

  if (!conversation) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right', 'bottom']}>
        <View style={styles.notFound}>
          <Text style={styles.notFoundTitle}>Conversation unavailable</Text>
          <Text style={styles.notFoundCopy}>{error || 'This chat could not be found.'}</Text>
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
        {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
        <MessageList messages={messages} />
        <View style={[styles.composerDock, { paddingBottom: Math.max(8, insets.bottom) }]}>
          <MessageComposer value={draft} onChangeText={setDraft} onSend={() => { void handleSend(); }} />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  screen: { flex: 1, backgroundColor: colors.background },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background },
  composerDock: { backgroundColor: colors.surface },
  error: { backgroundColor: '#FCECEA', color: '#9D3F39', paddingHorizontal: 16, paddingVertical: 9, fontSize: 12 },
  notFound: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 28, backgroundColor: colors.background },
  notFoundTitle: { color: colors.text, fontSize: 19, fontWeight: '700', marginBottom: 8 },
  notFoundCopy: { color: colors.textSecondary, fontSize: 13, marginBottom: 20, textAlign: 'center' },
  backToChatsButton: { backgroundColor: '#315B45', paddingHorizontal: 18, paddingVertical: 11, borderRadius: 13 },
  backToChatsText: { color: '#FFFFFF', fontSize: 12, fontWeight: '700' },
});
