import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { colors } from '@/utils/theme';

type ConversationSearchProps = {
  value: string;
  onChangeText: (value: string) => void;
};

export function ConversationSearch({ value, onChangeText }: ConversationSearchProps) {
  return (
    <View style={styles.container}>
      <View style={styles.searchGlyph} />
      <TextInput
        accessibilityLabel="Search conversations"
        placeholder="Search conversations"
        placeholderTextColor={colors.placeholder}
        value={value}
        onChangeText={onChangeText}
        style={styles.input}
        returnKeyType="search"
      />
      {value.length > 0 && (
        <Pressable accessibilityRole="button" accessibilityLabel="Clear search" onPress={() => onChangeText('')}>
          <Text style={styles.clear}>×</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { minHeight: 50, marginHorizontal: 24, marginBottom: 27, backgroundColor: colors.surface, borderColor: colors.borderSubtle, borderWidth: 1, borderRadius: 16, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16 },
  searchGlyph: { width: 14, height: 14, borderRadius: 8, borderColor: colors.searchGlyph, borderWidth: 1.6, marginRight: 12 },
  input: { flex: 1, color: colors.textSearch, fontSize: 13, paddingVertical: 12, outlineStyle: 'none' } as any,
  clear: { color: colors.searchClear, fontSize: 22, paddingLeft: 8 },
});
