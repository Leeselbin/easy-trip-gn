import { useQuery } from "@tanstack/react-query";

import { searchTourPlaces, type TourContentTypeId } from "@/lib/tourApi";

export function useTourPlaces(
  contentTypeId: TourContentTypeId,
  center: { latitude: number; longitude: number } | null,
  radius: number,
  enabled: boolean = true
) {
  return useQuery({
    queryKey: [
      "tourPlaces",
      contentTypeId,
      center?.latitude.toFixed(3),
      center?.longitude.toFixed(3),
      radius,
    ],
    queryFn: () =>
      searchTourPlaces({
        mapX: center!.longitude,
        mapY: center!.latitude,
        contentTypeId,
        radius,
      }),
    enabled: !!center && enabled,
  });
}
