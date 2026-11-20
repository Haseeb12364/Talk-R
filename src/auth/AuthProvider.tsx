import { isSupabaseConfigured, requireSupabase } from '@/lib/supabase';
import type { Session, User } from '@supabase/supabase-js';
import { makeRedirectUri } from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

WebBrowser.maybeCompleteAuthSession();

type AuthContextValue = {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

const oauthCodeExchanges = new Map<string, Promise<void>>();


export function exchangeOAuthCode(code: string) {
  const existingExchange = oauthCodeExchanges.get(code);
  if (existingExchange) return existingExchange;

  const exchange = requireSupabase()
    .auth.exchangeCodeForSession(code)
    .then(({ error }) => {
      if (error) throw error;
    })
    .catch((e) => {
      oauthCodeExchanges.delete(code);
      throw e;
    });

  oauthCodeExchanges.set(code, exchange);
  return exchange;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(isSupabaseConfigured);

  useEffect(() => {
    let mounted = true;
    let supabaseClient;
    try {
      supabaseClient = requireSupabase();
    } catch {
      return;
    }

    supabaseClient.auth.getSession().then(({ data }) => {
      if (mounted) {
        setSession(data.session);
        setLoading(false);
      }
    }).catch(() => {
      if (mounted) setLoading(false);
    });

    const { data: { subscription } } = supabaseClient.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signInWithGoogle = useCallback(async () => {
    const client = requireSupabase();

    const redirectTo = makeRedirectUri({ scheme: 'talkr', path: 'auth/callback', isTripleSlashed: true });
    const { data, error } = await client.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo,
        skipBrowserRedirect: true,
        queryParams: { prompt: 'select_account' },
      },
    });

    if (error) throw error;
    if (!data.url) throw new Error('Google sign-in did not return an authorization URL.');

    const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
    if (result.type !== 'success') return;

    const callbackUrl = new URL(result.url);
    const callbackError = callbackUrl.searchParams.get('error_description');
    if (callbackError) throw new Error(callbackError);

    const code = callbackUrl.searchParams.get('code');
    if (!code) throw new Error('Google sign-in returned no authorization code. Check the redirect URL settings.');

    await exchangeOAuthCode(code);
  }, []);

  const signOut = useCallback(async () => {
    const { error } = await requireSupabase().auth.signOut();
    if (error) throw error;
  }, []);

  const value = useMemo(() => ({ session, user: session?.user ?? null, loading, signInWithGoogle, signOut }), [session, loading, signInWithGoogle, signOut]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth must be used inside AuthProvider.');
  return value;
}
