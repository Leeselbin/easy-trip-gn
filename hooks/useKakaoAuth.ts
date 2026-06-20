import * as AuthSession from 'expo-auth-session';
import * as Linking from 'expo-linking';
import * as SecureStore from 'expo-secure-store';
import * as WebBrowser from 'expo-web-browser';
import { useCallback, useEffect, useState } from 'react';

import { KAKAO_DISCOVERY, KAKAO_REST_API_KEY, KakaoUser, fetchKakaoUser } from '@/lib/kakaoAuth';

const ACCESS_TOKEN_KEY = 'kakao_access_token';

// Kakao only accepts http(s) redirect URIs, so the login flow bounces through
// this static bridge page, which immediately forwards the auth code into the
// app via its custom URL scheme (see docs/redirect.html).
const BRIDGE_REDIRECT_URI = process.env.EXPO_PUBLIC_KAKAO_BRIDGE_REDIRECT_URI ?? '';
const APP_RETURN_URL = AuthSession.makeRedirectUri({ scheme: 'easytripgn', path: 'redirect' });

// Optional consent items in Kakao Developers must be requested explicitly
// via `scope`, otherwise Kakao won't ask the user for them at all.
const KAKAO_SCOPES = ['profile_nickname', 'profile_image'];

export function useKakaoAuth() {
  const [user, setUser] = useState<KakaoUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const signInWithToken = useCallback(async (accessToken: string) => {
    const kakaoUser = await fetchKakaoUser(accessToken);
    await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, accessToken);
    setUser(kakaoUser);
  }, []);

  useEffect(() => {
    (async () => {
      const storedToken = await SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
      if (storedToken) {
        try {
          await signInWithToken(storedToken);
        } catch {
          await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
        }
      }
      setIsLoading(false);
    })();
  }, [signInWithToken]);

  const signIn = useCallback(async () => {
    const authUrl =
      `${KAKAO_DISCOVERY.authorizationEndpoint}?response_type=code` +
      `&client_id=${encodeURIComponent(KAKAO_REST_API_KEY)}` +
      `&redirect_uri=${encodeURIComponent(BRIDGE_REDIRECT_URI)}` +
      `&scope=${encodeURIComponent(KAKAO_SCOPES.join(','))}`;

    const result = await WebBrowser.openAuthSessionAsync(authUrl, APP_RETURN_URL);
    if (result.type !== 'success' || !result.url) return;

    const { queryParams } = Linking.parse(result.url);
    const code = Array.isArray(queryParams?.code) ? queryParams.code[0] : queryParams?.code;
    if (!code) return;

    const tokenResponse = await AuthSession.exchangeCodeAsync(
      {
        clientId: KAKAO_REST_API_KEY,
        code,
        redirectUri: BRIDGE_REDIRECT_URI,
      },
      KAKAO_DISCOVERY
    );

    await signInWithToken(tokenResponse.accessToken);
  }, [signInWithToken]);

  const signOut = useCallback(async () => {
    await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
    setUser(null);
  }, []);

  return {
    user,
    isLoading,
    canSignIn: !!KAKAO_REST_API_KEY && !!BRIDGE_REDIRECT_URI,
    signIn,
    signOut,
  };
}
