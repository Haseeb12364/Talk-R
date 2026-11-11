import { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAuth } from '@/auth/AuthProvider';
import { ConversationScreen } from '@/screens/chat/ConversationScreen';
import { colors } from '@/theme/colors';

export default function ConversationRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) router.replace('/');
  }, [loading, router, user]);

  if (loading) return <View style={styles.loading}><ActivityIndicator color={colors.primaryDark} /></View>;
  if (!user) return null;

  return <ConversationScreen key={id} conversationId={id} onBack={() => router.back()} />;
}

const styles = StyleSheet.create({ loading: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background } });
