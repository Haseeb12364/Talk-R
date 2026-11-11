import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { ChatScreen } from '@/screens/chat/ChatScreen';
import { LoginScreen } from '@/screens/auth/LoginScreen';
import { useAuth } from '@/auth/AuthProvider';
import { colors } from '@/theme/colors';

export default function HomeRoute() {
  const { user, loading } = useAuth();
  if (loading) return <View style={styles.loading}><ActivityIndicator color={colors.primaryDark} /></View>;
  return user ? <ChatScreen /> : <LoginScreen />;
}

const styles = StyleSheet.create({ loading: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background } });
