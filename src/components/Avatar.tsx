import { StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import type { Conversation } from '@/features/chat/types';
import { colors } from '@/theme/colors';

type AvatarProps = {
  person: Pick<Conversation, 'initials' | 'color' | 'online'> & { avatarUrl?: string | null };
  size?: number;
  showOnline?: boolean;
};

export function Avatar({ person, size = 54, showOnline = false }: AvatarProps) {
  return (
    <View style={[styles.wrap, { width: size, height: size }]}>
      <View style={[styles.avatar, { width: size, height: size, borderRadius: size / 2, backgroundColor: person.color }]}>
        {person.avatarUrl ? (
          <Image source={{ uri: person.avatarUrl }} style={StyleSheet.absoluteFill} contentFit="cover" />
        ) : (
          <Text style={[styles.initials, { fontSize: size * 0.27 }]}>{person.initials}</Text>
        )}
      </View>
      {showOnline && person.online && (
        <View style={[styles.onlineDot, { right: size < 50 ? 0 : 1, bottom: size < 50 ? 0 : 1 }]} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center' },
  avatar: { alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  initials: { color: '#FFFFFF', fontWeight: '700', letterSpacing: 0.3 },
  onlineDot: { position: 'absolute', width: 13, height: 13, borderRadius: 7, backgroundColor: '#7EB69A', borderWidth: 2, borderColor: colors.background },
});
