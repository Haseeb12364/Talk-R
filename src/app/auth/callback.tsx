import { useEffect, useState } from 'react';
import { ActivityIndicator, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { exchangeOAuthCode } from '@/auth/AuthProvider';
import { colors } from '@/utils/theme';

type CallbackParams = {
  code?: string | string[];
  error?: string | string[];
  error_code?: string | string[];
  error_description?: string | string[];
};

function firstParam(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

export default function AuthCallbackRoute() {
  const { code, error, error_code, error_description } = useLocalSearchParams<CallbackParams>();
  const [exchangeFailed, setExchangeFailed] = useState(false);

  useEffect(() => {
    let active = true;
    const providerError = firstParam(error);
    const authorizationCode = firstParam(code);

    if (providerError || !authorizationCode) {
      if (providerError) {
        console.error('[Google OAuth callback] Provider returned an error', {
          error: providerError,
          errorCode: firstParam(error_code),
          errorDescription: firstParam(error_description),
        });
      }
      return () => { active = false; };
    }

    exchangeOAuthCode(authorizationCode)
      .then(() => {
        if (active) router.replace('/');
      })
      .catch((cause: unknown) => {
        const authError = cause instanceof Error ? cause as Error & { code?: string; status?: number } : null;
        console.error('[Google OAuth callback] Code exchange failed', {
          name: authError?.name,
          message: authError?.message ?? String(cause),
          code: authError?.code,
          status: authError?.status,
        });
        if (active) setExchangeFailed(true);
      });

    return () => { active = false; };
  }, [code, error, error_code, error_description]);

  const failed = Boolean(firstParam(error) || !firstParam(code) || exchangeFailed);
  const message = firstParam(error)
    ? 'Google sign-in could not be completed. Check the Google provider credentials in your Supabase dashboard, then try again.'
    : !firstParam(code)
      ? 'No sign-in code was returned. Please try again.'
      : exchangeFailed
        ? 'Google sign-in could not be completed. Please try again.'
        : 'Finishing sign-in…';

  return (
    <View style={styles.screen}>
      <Image accessibilityLabel="Talk R logo" source={require('../../../assets/images/talk-r-app-icon.png')} style={styles.logo} />
      {failed ? null : <ActivityIndicator color={colors.primaryDark} size="large" />}
      <Text style={styles.title}>{failed ? 'Sign-in issue' : 'Signing you in'}</Text>
      <Text style={styles.message}>{message}</Text>
      {failed ? (
        <Pressable accessibilityRole="button" onPress={() => router.replace('/')} style={styles.button}>
          <Text style={styles.buttonText}>Back to Talk R</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 28, backgroundColor: colors.background },
  logo: { width: 72, height: 72, marginBottom: 8, borderRadius: 20 },
  title: { marginTop: 20, color: colors.text, fontSize: 24, fontWeight: '700' },
  message: { maxWidth: 340, marginTop: 10, color: colors.textSecondary, fontSize: 15, lineHeight: 22, textAlign: 'center' },
  button: { minHeight: 50, marginTop: 24, paddingHorizontal: 24, borderRadius: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primaryDark },
  buttonText: { color: colors.surface, fontSize: 15, fontWeight: '600' },
});
