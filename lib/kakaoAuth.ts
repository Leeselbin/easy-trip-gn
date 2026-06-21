export const KAKAO_REST_API_KEY = process.env.EXPO_PUBLIC_KAKAO_REST_API_KEY ?? '';

export const KAKAO_DISCOVERY = {
  authorizationEndpoint: 'https://kauth.kakao.com/oauth/authorize',
  tokenEndpoint: 'https://kauth.kakao.com/oauth/token',
};

export type KakaoUser = {
  id: number;
  nickname?: string;
  profileImageUrl?: string;
};

export async function fetchKakaoUser(accessToken: string): Promise<KakaoUser> {
  const response = await fetch('https://kapi.kakao.com/v2/user/me', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) {
    throw new Error('카카오 사용자 정보를 가져오지 못했습니다.');
  }

  const data = await response.json();
  const profile = data.kakao_account?.profile;
  return {
    id: data.id,
    nickname: profile?.nickname,
    profileImageUrl: profile?.is_default_image ? undefined : profile?.profile_image_url,
  };
}
