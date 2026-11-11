import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { isSupabaseConfigured } from '@/lib/supabase';
import { useAuth } from '@/auth/AuthProvider';
import { colors } from '@/theme/colors';

export function LoginScreen() {
  const { signInWithGoogle } = useAuth();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const handleGoogleSignIn = async () => {
    setError('');
    setBusy(true);
    try {
      await signInWithGoogle();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Google sign-in failed. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={styles.screen}>
      <View style={styles.brandRow}>
        <Text style={styles.brand}>talk<Text style={styles.brandAccent}>r</Text></Text>
        <View style={styles.brandDot} />
      </View>
      <View style={styles.content}>
        <View style={styles.iconCircle}><MaterialIcons name="forum" size={30} color="#547561" /></View>
        <Text style={styles.eyebrow}>REAL PEOPLE. REAL CONVERSATIONS.</Text>
        <Text style={styles.title}>Say hello<Text style={styles.period}>.</Text></Text>
        <Text style={styles.copy}>Sign in with Google to find people and chat with them in real time.</Text>

        {isSupabaseConfigured ? (
          <>
            <Pressable accessibilityRole="button" disabled={busy} onPress={handleGoogleSignIn} style={[styles.googleButton, busy && styles.disabled]}>
              {busy ? <ActivityIndicator color={colors.text} /> : <>
                <Text style={styles.googleG}>G</Text>
                <Text style={styles.googleLabel}>Continue with Google</Text>
              </>}
            </Pressable>
            {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
          </>
        ) : (
          <View style={styles.setupCard}>
            <Text style={styles.setupTitle}>Connect your Supabase project</Text>
            <Text style={styles.setupCopy}>Add EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY to .env.local, then enable Google under Authentication → Sign In / Providers in Supabase.</Text>
          </View>
        )}
      </View>
      <Text style={styles.footer}>By continuing, you agree to use Talk R respectfully.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background, paddingHorizontal: 26, paddingTop: 28, paddingBottom: 24 },
  brandRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 4 },
  brand: { color: '#242723', fontSize: 26, letterSpacing: -1.3, fontWeight: '800' },
  brandAccent: { color: '#78AA91' },
  brandDot: { width: 5, height: 5, marginTop: 6, borderRadius: 3, backgroundColor: colors.coral },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingBottom: 40 },
  iconCircle: { width: 68, height: 68, borderRadius: 24, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center', marginBottom: 25 },
  eyebrow: { color: '#8B938B', fontSize: 9, fontWeight: '700', letterSpacing: 1.8, textAlign: 'center' },
  title: { color: colors.text, fontSize: 42, fontWeight: '700', letterSpacing: -1.8, marginTop: 9 },
  period: { color: '#8BAE98' },
  copy: { maxWidth: 285, color: colors.textSecondary, fontSize: 14, lineHeight: 21, textAlign: 'center', marginTop: 11, marginBottom: 30 },
  googleButton: { width: '100%', minHeight: 54, borderRadius: 17, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12 },
  disabled: { opacity: 0.65 },
  googleG: { color: '#4285F4', fontSize: 19, fontWeight: '700' },
  googleLabel: { color: colors.text, fontSize: 14, fontWeight: '600' },
  error: { marginTop: 15, color: '#B64F47', fontSize: 12, textAlign: 'center', lineHeight: 18 },
  setupCard: { width: '100%', padding: 18, backgroundColor: colors.surface, borderRadius: 17, borderWidth: 1, borderColor: colors.border },
  setupTitle: { color: colors.text, fontSize: 14, fontWeight: '700', marginBottom: 8 },
  setupCopy: { color: colors.textSecondary, fontSize: 12, lineHeight: 18 },
  footer: { color: '#9A9C96', fontSize: 10, textAlign: 'center' },
});
