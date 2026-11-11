import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Avatar } from '@/components/Avatar';
import { colors } from '@/theme/colors';
import { currentUser } from '@/features/chat/data/conversations';

export function ChatScreenHeader() {
  return (
    <>
      <View style={styles.topBar}>
        <Pressable accessibilityRole="button" accessibilityLabel="Your profile" style={styles.profileButton}>
          <Avatar person={currentUser} size={42} />
          <View style={styles.profilePresence} />
        </Pressable>
        <View style={styles.brandLockup}>
          <Text style={styles.brand}>talk<Text style={styles.brandAccent}>r</Text></Text>
          <View style={styles.brandDot} />
        </View>
        <Pressable accessibilityRole="button" accessibilityLabel="New message" style={styles.composeButton}>
          <Text style={styles.composePlus}>＋</Text>
        </Pressable>
      </View>

      <View style={styles.headingRow}>
        <View>
          <Text style={styles.eyebrow}>YOUR PEOPLE, RIGHT HERE</Text>
          <Text style={styles.heading}>Messages<Text style={styles.headingPeriod}>.</Text></Text>
        </View>
        <View style={styles.inboxCount}><Text style={styles.inboxCountText}>12</Text></View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  topBar: { height: 62, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 24 },
  profileButton: { width: 46, height: 46, alignItems: 'center', justifyContent: 'center' },
  profilePresence: { position: 'absolute', width: 12, height: 12, right: 0, bottom: 0, borderRadius: 6, backgroundColor: '#79B79C', borderWidth: 2, borderColor: colors.background },
  brandLockup: { flexDirection: 'row', alignItems: 'flex-start', gap: 4 },
  brand: { color: '#242723', fontSize: 24, letterSpacing: -1.3, fontWeight: '800' },
  brandAccent: { color: '#78AA91' },
  brandDot: { width: 5, height: 5, marginTop: 5, borderRadius: 3, backgroundColor: colors.coral },
  composeButton: { width: 42, height: 42, backgroundColor: colors.primaryDark, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  composePlus: { color: '#FFFFFF', fontSize: 26, lineHeight: 29, fontWeight: '300' },
  headingRow: { paddingHorizontal: 26, paddingTop: 22, paddingBottom: 19, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' },
  eyebrow: { color: '#999B94', fontSize: 9, fontWeight: '700', letterSpacing: 2.1, marginBottom: 8 },
  heading: { color: colors.text, fontSize: 38, fontWeight: '700', letterSpacing: -1.5, lineHeight: 43 },
  headingPeriod: { color: '#8BAE98' },
  inboxCount: { backgroundColor: colors.primarySoft, height: 29, minWidth: 35, paddingHorizontal: 9, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginBottom: 5 },
  inboxCountText: { color: '#52715D', fontSize: 12, fontWeight: '700' },
});
