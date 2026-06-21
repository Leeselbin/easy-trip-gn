import { useQuery } from "@tanstack/react-query";

import { fetchTouristSpots } from "@/lib/api";

export function useTouristSpots() {
  return useQuery({
    queryKey: ["touristSpots"],
    queryFn: fetchTouristSpots,
  });
}
