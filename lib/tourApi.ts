const TOUR_API_URL = process.env.EXPO_PUBLIC_TOUR_API_URL ?? "http://122.43.226.4:6445";

const MIN_RADIUS_METERS = 500;
const MAX_RADIUS_METERS = 20000;
const METERS_PER_LATITUDE_DEGREE = 111320;

// 지도에 보이는 영역(latitudeDelta)만큼만 반경을 잡아서, 화면 비율에 맞게 마커를 불러옵니다.
export function radiusFromLatitudeDelta(latitudeDelta: number): number {
  const radius = Math.round((latitudeDelta * METERS_PER_LATITUDE_DEGREE) / 2);
  return Math.min(MAX_RADIUS_METERS, Math.max(MIN_RADIUS_METERS, radius));
}

export type TourContentTypeId = "12" | "39"; // 12: 관광지, 39: 음식점

export type TourPlace = {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  address?: string;
  imageUrl?: string;
  tel?: string;
};

type TourSearchItem = {
  contentid: string;
  title: string;
  mapx: string;
  mapy: string;
  addr1?: string;
  firstimage?: string;
  tel?: string;
};

export async function searchTourPlaces(params: {
  mapX: number;
  mapY: number;
  contentTypeId: TourContentTypeId;
  radius: number;
  numOfRows?: number;
}): Promise<TourPlace[]> {
  const response = await fetch(`${TOUR_API_URL}/api/Tour/Search`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      pageNo: 1,
      numOfRows: params.numOfRows ?? 20,
      mapX: String(params.mapX),
      mapY: String(params.mapY),
      contentTypeId: params.contentTypeId,
      radius: String(params.radius),
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to search tour places: ${response.status}`);
  }

  const json = await response.json();
  const items: TourSearchItem | TourSearchItem[] | undefined =
    json?.data?.response?.body?.items?.item;

  if (!items) {
    return [];
  }

  const list = Array.isArray(items) ? items : [items];

  return list.map((item) => ({
    id: item.contentid,
    name: item.title,
    latitude: parseFloat(item.mapy),
    longitude: parseFloat(item.mapx),
    address: item.addr1 || undefined,
    imageUrl: item.firstimage || undefined,
    tel: item.tel || undefined,
  }));
}
