import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Avatar } from '@/components/Avatar';
import { colors } from '@/theme/colors';
import { currentUser, onlineContacts, storyContacts } from '@/features/chat/data/conversations';

export function OnlineContacts() {
  return (
    <>
      <View style={styles.sectionHeading}>
        <Text style={styles.sectionTitle}>Around you</Text>
        <Text style={styles.onlineCaption}>{onlineContacts.length + 1} ONLINE</Text>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.storiesRow}>
        <Pressable accessibilityRole="button" style={styles.story}>
          <View style={styles.addStoryWrap}>
            <Avatar person={currentUser} size={60} />
            <View style={styles.addStoryBadge}><Text style={styles.addStoryPlus}>+</Text></View>
          </View>
          <Text style={styles.storyName}>Your note</Text>
        </Pressable>
        {storyContacts.map((person) => (
          <Pressable accessibilityRole="button" style={styles.story} key={person.id}>
            <View style={[styles.storyRing, !person.online && styles.storyRingQuiet]}>
              <Avatar person={person} size={54} />
            </View>
            <Text numberOfLines={1} style={styles.storyName}>{person.name.split(' ')[0]}</Text>
          </Pressable>
        ))}
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  sectionHeading: { paddingHorizontal: 26, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
  sectionTitle: { color: '#282B26', fontSize: 17, fontWeight: '700', letterSpacing: -0.3 },
  onlineCaption: { color: '#8A9B8C', fontSize: 9, letterSpacing: 1.4, fontWeight: '700' },
  storiesRow: { paddingHorizontal: 22, paddingBottom: 28, gap: 14 },
  story: { width: 66, alignItems: 'center', gap: 7 },
  addStoryWrap: { width: 64, height: 64, alignItems: 'center', justifyContent: 'center' },
  addStoryBadge: { position: 'absolute', right: 0, bottom: 0, width: 21, height: 21, borderRadius: 11, backgroundColor: colors.primaryDark, borderWidth: 2, borderColor: colors.background, alignItems: 'center', justifyContent: 'center' },
  addStoryPlus: { color: '#FFFFFF', fontSize: 16, lineHeight: 18, fontWeight: '500' },
  storyRing: { width: 64, height: 64, borderRadius: 32, borderWidth: 1.5, borderColor: '#94BCA2', alignItems: 'center', justifyContent: 'center' },
  storyRingQuiet: { borderColor: '#E3E5DF' },
  storyName: { color: colors.textSecondary, fontSize: 10, fontWeight: '500', maxWidth: 64, textAlign: 'center' },
});
