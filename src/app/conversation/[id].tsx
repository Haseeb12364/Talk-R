import { useLocalSearchParams, useRouter } from 'expo-router';
import { ConversationScreen } from '@/screens/chat/ConversationScreen';

export default function ConversationRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  return <ConversationScreen key={id} conversationId={id} onBack={() => router.back()} />;
}
