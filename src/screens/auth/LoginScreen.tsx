import { useAuth } from '@/auth/AuthProvider';
import { isSupabaseConfigured } from '@/lib/supabase';
import { MaterialIcons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Easing,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

// Brand palette. Consider moving these into '@/theme/colors' so the whole app shares them.
const brand = {
  red: '#E21E27',
  redSoft: 'rgba(226, 30, 39, 0.16)',
  redBorder: 'rgba(226, 30, 39, 0.45)',
  redLight: '#FF8D93',
  purple: '#301249',
  purpleDeep: '#220C35',
  purpleLight: '#4A2270',
  white: '#FFFFFF',
  textMuted: 'rgba(255, 255, 255, 0.72)',
  textFaint: 'rgba(255, 255, 255, 0.5)',
  glass: 'rgba(255, 255, 255, 0.08)',
  glassBorder: 'rgba(255, 255, 255, 0.16)',
  errorBg: 'rgba(226, 30, 39, 0.18)',
  errorText: '#FFB4B8',
};

/* ---------- Small animation helpers (built-in Animated API, no extra packages) ---------- */

function useFadeUp(delay: number) {
  const value = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(value, {
      toValue: 1,
      duration: 650,
      delay,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [delay, value]);
  return {
    opacity: value,
    transform: [{ translateY: value.interpolate({ inputRange: [0, 1], outputRange: [24, 0] }) }],
  };
}

function useLoop(duration: number, delay = 0) {
  const value = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(value, { toValue: 1, duration, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(value, { toValue: 0, duration, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [delay, duration, value]);
  return value;
}

function TypingDots() {
  const dots = useRef([0, 1, 2].map(() => new Animated.Value(0))).current;
  useEffect(() => {
    const loops = dots.map((dot, index) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(index * 160),
          Animated.timing(dot, { toValue: 1, duration: 320, easing: Easing.out(Easing.quad), useNativeDriver: true }),
          Animated.timing(dot, { toValue: 0, duration: 320, easing: Easing.in(Easing.quad), useNativeDriver: true }),
          Animated.delay((2 - index) * 160 + 400),
        ]),
      ),
    );
    loops.forEach((loop) => loop.start());
    return () => loops.forEach((loop) => loop.stop());
  }, [dots]);

  return (
    <View style={styles.dotsRow}>
      {dots.map((dot, index) => (
        <Animated.View
          key={index}
          style={[
            styles.typingDot,
            {
              opacity: dot.interpolate({ inputRange: [0, 1], outputRange: [0.35, 1] }),
              transform: [{ translateY: dot.interpolate({ inputRange: [0, 1], outputRange: [0, -4] }) }],
            },
          ]}
        />
      ))}
    </View>
  );
}

/* ---------- Screen ---------- */

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
      const authError = cause instanceof Error ? cause as Error & { code?: string; status?: number } : null;
      const message = authError?.message ?? 'Google sign-in failed. Please try again.';
      console.error('[Google sign-in] Failed', {
        name: authError?.name,
        message,
        code: authError?.code,
        status: authError?.status,
      });
      setError(message);
    } finally {
      setBusy(false);
    }
  };

  // Entrance sequence
  const brandIn = useFadeUp(0);
  const heroIn = useFadeUp(150);
  const pillIn = useFadeUp(320);
  const titleIn = useFadeUp(420);
  const copyIn = useFadeUp(500);
  const actionIn = useFadeUp(600);
  const noteIn = useFadeUp(720);
  const footerIn = useFadeUp(820);

  // Ambient motion
  const driftA = useLoop(5200);
  const driftB = useLoop(6400, 600);
  const floatA = useLoop(2600);
  const floatB = useLoop(3200, 400);
  const floatC = useLoop(2900, 800);
  const pulse = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(pulse, { toValue: 1, duration: 2200, easing: Easing.out(Easing.quad), useNativeDriver: true }),
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  // Button press feel
  const press = useRef(new Animated.Value(1)).current;
  const pressTo = (toValue: number) =>
    Animated.spring(press, { toValue, speed: 40, bounciness: 6, useNativeDriver: true }).start();

  const bob = (value: Animated.Value, distance: number) => ({
    transform: [{ translateY: value.interpolate({ inputRange: [0, 1], outputRange: [0, distance] }) }],
  });

  return (
    <View style={styles.screen}>
      <StatusBar style="light" />

      {/* Ambient background */}
      <Animated.View
        pointerEvents="none"
        style={[
          styles.blobTop,
          {
            transform: [
              { translateX: driftA.interpolate({ inputRange: [0, 1], outputRange: [0, -24] }) },
              { translateY: driftA.interpolate({ inputRange: [0, 1], outputRange: [0, 18] }) },
            ]
          },
        ]}
      />
      <Animated.View
        pointerEvents="none"
        style={[
          styles.blobBottom,
          {
            transform: [
              { translateX: driftB.interpolate({ inputRange: [0, 1], outputRange: [0, 28] }) },
              { translateY: driftB.interpolate({ inputRange: [0, 1], outputRange: [0, -22] }) },
            ]
          },
        ]}
      />
      <View pointerEvents="none" style={styles.ringLarge} />
      <View pointerEvents="none" style={styles.ringSmall} />

      <Animated.View style={[styles.brandRow, brandIn]}>
        <Image accessibilityLabel="Talk R logo" source={require('../../../assets/images/talk-r-app-icon.png')} style={styles.logo} />
        <Text style={styles.brand}>talk<Text style={styles.brandAccent}>r</Text></Text>
        <View style={styles.brandDot} />
      </Animated.View>

      <ScrollView
        bounces={false}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        {/* Hero: animated chat preview */}
        <Animated.View style={[styles.hero, heroIn]}>
          <View style={styles.pulseWrap}>
            <Animated.View
              pointerEvents="none"
              style={[
                styles.pulseRing,
                {
                  opacity: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.5, 0] }),
                  transform: [{ scale: pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.9] }) }],
                },
              ]}
            />
            <View style={styles.iconCircle}>
              <MaterialIcons name="forum" size={30} color={brand.white} />
            </View>
          </View>

          <Animated.View style={[styles.bubbleIn, bob(floatA, -6)]}>
            <Text style={styles.bubbleText}>Hey, you&apos;re new here!</Text>
          </Animated.View>
          <Animated.View style={[styles.bubbleOut, bob(floatB, 6)]}>
            <Text style={styles.bubbleOutText}>Just joined. Say hi!</Text>
          </Animated.View>
          <Animated.View style={[styles.bubbleIn, styles.bubbleTyping, bob(floatC, -5)]}>
            <TypingDots />
          </Animated.View>
        </Animated.View>

        <Animated.View style={[styles.eyebrowPill, pillIn]}>
          <View style={styles.liveDot} />
          <Text style={styles.eyebrow}>REAL PEOPLE. REAL CONVERSATIONS.</Text>
        </Animated.View>

        <Animated.Text style={[styles.title, titleIn]}>Say hello<Text style={styles.period}>.</Text></Animated.Text>
        <Animated.Text style={[styles.copy, copyIn]}>Sign in with Google to find people and chat with them in real time.</Animated.Text>

        <Animated.View style={[styles.action, actionIn]}>
          {isSupabaseConfigured ? (
            <>
              <Animated.View style={[styles.buttonWrap, { transform: [{ scale: press }] }]}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Continue with Google"
                  disabled={busy}
                  onPress={handleGoogleSignIn}
                  onPressIn={() => pressTo(0.97)}
                  onPressOut={() => pressTo(1)}
                  style={[styles.googleButton, busy && styles.disabled]}
                >
                  {busy ? <ActivityIndicator color={brand.purple} /> : <>
                    <View style={styles.googleBadge}><Text style={styles.googleG}>G</Text></View>
                    <Text style={styles.googleLabel}>Continue with Google</Text>
                    <MaterialIcons name="arrow-forward" size={20} color={brand.red} />
                  </>}
                </Pressable>
              </Animated.View>
              {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
            </>
          ) : (
            <View style={styles.setupCard}>
              <Text style={styles.setupTitle}>Connect your Supabase project</Text>
              <Text style={styles.setupCopy}>Add EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY to .env.local, then enable Google under Authentication → Sign In / Providers in Supabase.</Text>
            </View>
          )}
        </Animated.View>

        <Animated.View style={[styles.secureRow, noteIn]}>
          <MaterialIcons name="lock-outline" size={14} color={brand.textFaint} />
          <Text style={styles.secureText}>Secure sign-in with your Google account</Text>
        </Animated.View>
      </ScrollView>

      <Animated.Text style={[styles.footer, footerIn]}>By continuing, you agree to use Talk R respectfully.</Animated.Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: brand.purple, paddingHorizontal: 26, paddingTop: 28, paddingBottom: 24, overflow: 'hidden' },

  // Background
  blobTop: { position: 'absolute', top: -100, right: -90, width: 290, height: 290, borderRadius: 145, backgroundColor: brand.purpleLight, opacity: 0.55 },
  blobBottom: { position: 'absolute', bottom: -120, left: -100, width: 300, height: 300, borderRadius: 150, backgroundColor: brand.red, opacity: 0.2 },
  ringLarge: { position: 'absolute', top: 120, left: -140, width: 280, height: 280, borderRadius: 140, borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)' },
  ringSmall: { position: 'absolute', bottom: 170, right: -60, width: 150, height: 150, borderRadius: 75, borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)' },

  // Brand row
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  logo: { width: 38, height: 38, borderRadius: 11 },
  brand: { color: brand.white, fontSize: 26, letterSpacing: -1.3, fontWeight: '800' },
  brandAccent: { color: brand.red },
  brandDot: { width: 6, height: 6, marginTop: 6, borderRadius: 3, backgroundColor: brand.red },

  content: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 20 },

  // Hero
  hero: { width: '100%', maxWidth: 320, marginBottom: 26 },
  pulseWrap: { alignSelf: 'center', width: 76, height: 76, alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  pulseRing: { position: 'absolute', width: 76, height: 76, borderRadius: 26, backgroundColor: brand.red },
  iconCircle: {
    width: 76, height: 76, borderRadius: 26, backgroundColor: brand.red, alignItems: 'center', justifyContent: 'center',
    shadowColor: brand.red, shadowOpacity: 0.55, shadowRadius: 22, shadowOffset: { width: 0, height: 10 }, elevation: 10,
  },
  bubbleIn: {
    alignSelf: 'flex-start', backgroundColor: brand.glass, borderWidth: 1, borderColor: brand.glassBorder,
    paddingHorizontal: 16, paddingVertical: 11, borderRadius: 20, borderBottomLeftRadius: 6, marginBottom: 10,
  },
  bubbleOut: {
    alignSelf: 'flex-end', backgroundColor: brand.red, paddingHorizontal: 16, paddingVertical: 11,
    borderRadius: 20, borderBottomRightRadius: 6, marginBottom: 10,
    shadowColor: brand.red, shadowOpacity: 0.4, shadowRadius: 12, shadowOffset: { width: 0, height: 6 }, elevation: 6,
  },
  bubbleTyping: { paddingVertical: 14, marginBottom: 0 },
  bubbleText: { color: brand.white, fontSize: 13, fontWeight: '500' },
  bubbleOutText: { color: brand.white, fontSize: 13, fontWeight: '600' },
  dotsRow: { flexDirection: 'row', alignItems: 'center', gap: 5, height: 8 },
  typingDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: brand.white },

  // Copy
  eyebrowPill: {
    flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: brand.redSoft,
    borderWidth: 1, borderColor: brand.redBorder, borderRadius: 999, paddingHorizontal: 14, paddingVertical: 6,
  },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: brand.red },
  eyebrow: { color: brand.redLight, fontSize: 9, fontWeight: '700', letterSpacing: 1.8, textAlign: 'center' },
  title: { color: brand.white, fontSize: 46, fontWeight: '800', letterSpacing: -2, marginTop: 16 },
  period: { color: brand.red },
  copy: { maxWidth: 290, color: brand.textMuted, fontSize: 14, lineHeight: 21, textAlign: 'center', marginTop: 10, marginBottom: 30 },

  // Action
  action: { width: '100%', alignItems: 'center' },
  buttonWrap: { width: '100%' },
  googleButton: {
    width: '100%', minHeight: 58, borderRadius: 19, backgroundColor: brand.white, paddingHorizontal: 18,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12,
    shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 16, shadowOffset: { width: 0, height: 10 }, elevation: 8,
  },
  disabled: { opacity: 0.7 },
  googleBadge: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#F4F1F7', alignItems: 'center', justifyContent: 'center' },
  googleG: { color: '#4285F4', fontSize: 17, fontWeight: '800' },
  googleLabel: { color: brand.purple, fontSize: 15, fontWeight: '700' },

  error: {
    marginTop: 16, color: brand.errorText, backgroundColor: brand.errorBg, borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 10, fontSize: 12, textAlign: 'center', lineHeight: 18, overflow: 'hidden',
  },

  setupCard: { width: '100%', padding: 18, backgroundColor: brand.glass, borderRadius: 18, borderWidth: 1, borderColor: brand.glassBorder },
  setupTitle: { color: brand.white, fontSize: 14, fontWeight: '700', marginBottom: 8 },
  setupCopy: { color: brand.textMuted, fontSize: 12, lineHeight: 18 },

  secureRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 18 },
  secureText: { color: brand.textFaint, fontSize: 11 },

  footer: { color: brand.textFaint, fontSize: 10, textAlign: 'center' },
});
