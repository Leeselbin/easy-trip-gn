import * as AuthSession from "expo-auth-session";
import * as Linking from "expo-linking";
import * as SecureStore from "expo-secure-store";
import * as WebBrowser from "expo-web-browser";
import { create } from "zustand";

import {
  KAKAO_DISCOVERY,
  KAKAO_REST_API_KEY,
  type KakaoUser,
  fetchKakaoUser,
} from "@/lib/kakaoAuth";

const ACCESS_TOKEN_KEY = "kakao_access_token";

const BRIDGE_REDIRECT_URI =
  process.env.EXPO_PUBLIC_KAKAO_BRIDGE_REDIRECT_URI ?? "";
const APP_RETURN_URL = AuthSession.makeRedirectUri({
  scheme: "easytripgn",
  path: "redirect",
});

const KAKAO_SCOPES = ["profile_nickname", "profile_image"];

type AuthState = {
  user: KakaoUser | null;
  isLoading: boolean;
  canSignIn: boolean;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  canSignIn: !!KAKAO_REST_API_KEY && !!BRIDGE_REDIRECT_URI,

  signIn: async () => {
    const authUrl =
      `${KAKAO_DISCOVERY.authorizationEndpoint}?response_type=code` +
      `&client_id=${encodeURIComponent(KAKAO_REST_API_KEY)}` +
      `&redirect_uri=${encodeURIComponent(BRIDGE_REDIRECT_URI)}` +
      `&scope=${encodeURIComponent(KAKAO_SCOPES.join(","))}`;

    const result = await WebBrowser.openAuthSessionAsync(
      authUrl,
      APP_RETURN_URL
    );
    if (result.type !== "success" || !result.url) return;

    const { queryParams } = Linking.parse(result.url);
    const code = Array.isArray(queryParams?.code)
      ? queryParams.code[0]
      : queryParams?.code;
    if (!code) return;

    const tokenResponse = await AuthSession.exchangeCodeAsync(
      { clientId: KAKAO_REST_API_KEY, code, redirectUri: BRIDGE_REDIRECT_URI },
      KAKAO_DISCOVERY
    );

    await signInWithToken(tokenResponse.accessToken, set);
  },

  signOut: async () => {
    await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
    set({ user: null });
  },
}));

async function signInWithToken(
  accessToken: string,
  set: (partial: Partial<AuthState>) => void
) {
  const kakaoUser = await fetchKakaoUser(accessToken);
  await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, accessToken);
  set({ user: kakaoUser });
}

// 앱이 처음 로드될 때 한 번, 저장된 토큰으로 자동 로그인을 시도합니다.
(async () => {
  const storedToken = await SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
  if (storedToken) {
    try {
      await signInWithToken(storedToken, useAuthStore.setState);
    } catch {
      await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
    }
  }
  useAuthStore.setState({ isLoading: false });
})();
