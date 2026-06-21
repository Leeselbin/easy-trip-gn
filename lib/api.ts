import type { BusStop } from "@/constants/busStops";
import type { Restaurant, TouristSpot } from "@/constants/places";
import type { KakaoUser } from "@/lib/kakaoAuth";

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:4000";

export async function fetchBusStops(): Promise<BusStop[]> {
  const response = await fetch(`${API_BASE_URL}/api/bus-stops`);
  if (!response.ok) {
    throw new Error(`Failed to fetch bus stops: ${response.status}`);
  }
  return response.json();
}

export async function fetchRestaurants(): Promise<Restaurant[]> {
  const response = await fetch(`${API_BASE_URL}/api/restaurants`);
  if (!response.ok) {
    throw new Error(`Failed to fetch restaurants: ${response.status}`);
  }
  return response.json();
}

export async function fetchTouristSpots(): Promise<TouristSpot[]> {
  const response = await fetch(`${API_BASE_URL}/api/tourist-spots`);
  if (!response.ok) {
    throw new Error(`Failed to fetch tourist spots: ${response.status}`);
  }
  return response.json();
}

export async function upsertKakaoUser(kakaoUser: KakaoUser): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/users/kakao`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      kakaoId: kakaoUser.id,
      nickname: kakaoUser.nickname,
      profileImageUrl: kakaoUser.profileImageUrl,
    }),
  });
  if (!response.ok) {
    throw new Error(`Failed to save user: ${response.status}`);
  }
}
