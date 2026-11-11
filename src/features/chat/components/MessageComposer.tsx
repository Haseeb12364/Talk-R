import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { colors } from '@/theme/colors';

type MessageComposerProps = {
  value: string;
  onChangeText: (value: string) => void;
  onSend: () => void;
};

export function MessageComposer({ value, onChangeText, onSend }: MessageComposerProps) {
  const canSend = value.trim().length > 0;

  return (
    <View style={styles.container}>
      <Pressable accessibilityRole="button" accessibilityLabel="Add attachment" style={styles.attachButton}>
        <Text style={styles.attachIcon}>＋</Text>
      </Pressable>
      <View style={styles.inputWrap}>
        <TextInput
          accessibilityLabel="Write a message"
          placeholder="Write a message..."
          placeholderTextColor="#A1A39D"
          value={value}
          onChangeText={onChangeText}
          style={styles.input}
          multiline
          maxLength={2000}
          returnKeyType="default"
        />
        <Pressable accessibilityRole="button" accessibilityLabel="Add emoji" style={styles.emojiButton}>
          <Text style={styles.emoji}>☺</Text>
        </Pressable>
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Send message"
        accessibilityState={{ disabled: !canSend }}
        disabled={!canSend}
        onPress={onSend}
        style={[styles.sendButton, !canSend && styles.sendButtonDisabled]}
      >
        <Text style={styles.sendIcon}>{canSend ? '↑' : '⌁'}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { minHeight: 72, backgroundColor: colors.surface, borderTopWidth: 1, borderTopColor: colors.border, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 10, gap: 9 },
  attachButton: { width: 32, height: 42, alignItems: 'center', justifyContent: 'center' },
  attachIcon: { color: '#6B8171', fontSize: 25, fontWeight: '300' },
  inputWrap: { minHeight: 44, maxHeight: 110, flex: 1, borderRadius: 22, backgroundColor: '#F5F6F2', borderWidth: 1, borderColor: '#ECEDE8', flexDirection: 'row', alignItems: 'center', paddingLeft: 15, paddingRight: 5 },
  input: { flex: 1, maxHeight: 92, color: '#30352F', fontSize: 13, paddingVertical: 10, outlineStyle: 'none' } as any,
  emojiButton: { width: 34, height: 38, alignItems: 'center', justifyContent: 'center' },
  emoji: { color: '#829486', fontSize: 19 },
  sendButton: { width: 42, height: 42, borderRadius: 15, alignItems: 'center', justifyContent: 'center', backgroundColor: '#315B45' },
  sendButtonDisabled: { backgroundColor: '#E8ECE7' },
  sendIcon: { color: '#FFFFFF', fontSize: 23, lineHeight: 27, fontWeight: '600' },
});
